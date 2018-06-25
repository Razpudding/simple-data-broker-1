const express = require('express')
const moment = require('moment')
const jsonfile = require('jsonfile')
const Json2csvParser = require('json2csv').Parser;
const pretty = require('prettysize');
var passport = require('passport');
const auth = require('./auth');

require('./config/passport')(passport);

const config = require('./config')

const router = express.Router();

const DataPoint = require('./models/dataPoint')

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

router.use('/auth', auth);

router.get('/', async (req, res) => {
  res.send('API here!');
  
  const data = await DataPoint.find({});
});

router.get('/stats', passport.authenticate('jwt', { session: false}), async (req, res) => {
  var token = getToken(req.headers);
  if (token) {
    //Get stats of DataPoint collection
    DataPoint.collection.stats()
      .then(result => {
        const storageSize = result.storageSize / (1024 * 1024);
        const maxGB = config.maxDatabaseSize;
        const usedStorage = storageSize / (maxGB * 1000);
        let status;

        
        if (usedStorage > 0.8) {
          status = 2;
        } else if (usedStorage > 0.5) {
          status = 1;
        } else {
          status = 0;
        }

        res.send({
          current: pretty(result.storageSize),
          max: `${maxGB} GB`,
          status
        })
      })
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/months', passport.authenticate('jwt', { session: false}), async (req, res) => {
  var token = getToken(req.headers);
  if (token) {
    const { year } = req.query
    
    if (!year) {
      res.status(422);
      res.send("Missing parameter 'year'");
    }

    const startDate = new Date(year, 0, 2);

    const endDate = new Date(startDate.getFullYear() + 1, 0, 1)
    
    const data = await DataPoint.find({
      date: {
        $gte: startDate,
        $lt: endDate
      }
    })

    const groups = data
    //Sort data by month
    .reduce((collection, dataPoint) => {
      const date = new Date(dataPoint.date)
      const m = date.getMonth()
      const monthName = moment(m + 1, 'M').format('MMMM')

      const month = collection.find(month => month.name === monthName);

      month ? month.data.push(dataPoint) : collection.push({ name: monthName, data: [dataPoint]})

      return collection;
    }, [])
    //Get start and enddate of the month
    .map(month => {
      const monthNumber = months.indexOf(month.name)

      const startDate = new Date(year, monthNumber, 1)
      const endDate = new Date(year, monthNumber + 1, 1)

      month.startDate = startDate
      month.endDate = endDate

      return month
    })
    //Sort months in the right order
    .sort((a, b) => {
      return months.indexOf(a.name) - months.indexOf(b.name);
    })
    //Calculate the amount of weeks per month
    .map(month => {
      //Sort data by week
      const weeks = month.data.reduce((collection, dataPoint) => {
        const w = Math.ceil((new Date(dataPoint.date).getDate()) / 7);

        collection[w] ? collection[w].data.push(dataPoint) : collection[w] = { name: w, data: [dataPoint]};

        return collection;
      }, {})

      for (key in weeks) {
        weeks[key].startDate = weeks[key].data[0].date
        weeks[key].endDate = weeks[key].data[weeks[key].data.length - 1].date
      }

      month.weeks = weeks

      return month
    })
    //Remove all datapoints because they don't have to be sent to the client
    .map(month => {
      //Remove unused data
      delete month.data;

      for (var key in month.weeks) {
        delete month.weeks[key].data;
      }

      return month
    })

    res.send(groups)
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

router.get('/dump', async (req, res) => {
  const { startdate, enddate } = req.query

  const startDate = new Date(startdate.replace(' ', '+'))
  
  const endDate = new Date(enddate.replace(' ', '+'))

  const data = await DataPoint.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  })
  
  var mkdirp = require('mkdirp');
  
  const dirName = './data'
  const fileName = `data_${data[0].date}_${data[data.length - 1].date}.csv`
    
  mkdirp(dirName, function (err) {
    if (err) console.error(err)

    else {
      const parser = new Json2csvParser({
        fields: [ ...Object.keys(DataPoint.schema.obj) ],
      })

      const csv = parser.parse(data)

      if (err) {
        console.log(err);
      }

      res.set({
        'Content-Disposition': `attachment; filename=${fileName}`,
        'Content-Type': 'text/csv'
      })

      res.send(csv);
    }
  });
})

router.get('/delete', passport.authenticate('jwt', { session: false}), async (req, res) => {
  var token = getToken(req.headers);
  if (token) {
    const { startdate, enddate } = req.query

    const startDate = new Date(startdate.replace(' ', '+'))
    
    const endDate = new Date(enddate.replace(' ', '+'))

    res.send(await DataPoint.remove({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }))
  } else {
    return res.status(403).send({success: false, msg: 'Unauthorized.'});
  }
});

module.exports = router;