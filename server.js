/*
* Created by: Laurens (github.com/razpudding)
* After running, test by using postman or httpie( http -v POST :3000 hello=='World')
*/

/*
* Try node-inspector for server side debugging
* Use something like this to render the data on get client-side / https://github.com/caldwell/renderjson
*/

const express = require('express')        //used to create a webserver
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const moment = require('moment')
const schedule = require('node-schedule')

const generateMockData = require('./generateMockData')
const config = require('./config')

const User = require("./models/user");

//Route modules
const api = require('./api')

require('dotenv').config()   //Secret info
mongoose.Promise = global.Promise //Use the built in ES6 Promise

//Set the right URL and connection options for Mongoose
const mongooseURL = process.env.MONGO_DB_URL
const mongooseOptions = {auto_reconnect: true, reconnectInterval: 10000, connectTimeoutMS: 30000}

//Connect to the database as per url provided in the .env file
//The application will wait for 30s before attempting this to allow the server to boot up mongodb
//I tried doing this through the mongoose options but it doesn't seem to work correctly.
setTimeout(() =>{
  mongoose.connect(mongooseURL, mongooseOptions)
  .then(
    () => {},
    err => console.log(err))}, 30000)

//Store the connection to the db so we can reference it
const db = mongoose.connection
let dbConnected = false
// Import all data models
const DataPoint = require('./models/dataPoint')

//This sets up our webserver using the express package
const app = express()

app.use(express.static('front-end/dist'))  //Used to serve static files like webpages

app.use(bodyParser.urlencoded({extended: true})) //parse requests

//Routes
app.use('/api', api);

//Check data size everyday at midnight
schedule.scheduleJob({hour: 00, minute: 00}, function(){
  checkDataSize();
});

//Check if database is nearly full
//If so, delete data that can be deleted
function checkDataSize () {
  DataPoint.collection.stats()
    .then(result => {
      // calculate percentage of used disk space
      const storageSize = result.storageSize / (1024 * 1024);
      const maxGB = config.maxDatabaseSize;

      const usedStorage = storageSize / (maxGB * 1000);
      
      if (usedStorage > 0.8) {
        // Remove the last 2000000 documents
        DataPoint.find({}).sort({date: 'ascending'}).limit(2000000)
          .then(docs => {
            var ids = docs.map(function(doc) { return doc._id; });

            DataPoint.remove({_id: {$in: ids}})
              .then(docs => {
                console.log(`removed ${docs.length} docs`)
              })
              .catch(err => console.log(err))
          })
          .catch(err => console.log(err))
      }
    })
}

if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
  //Create admin login when server boots up
  //First remove existing user
  User.remove({})
    .catch(err => console.log(err))
  
  //Then create a new one
  var newUser = new User({
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
  });
  
  //Save the admin user
  newUser.save(function(err) {
    if (err) {
      console.log('Something went wrong when creating user');
    }
  });
} else {
  console.log('No username and password were provided in .env')
}

db.once('open', function() {
  dbConnected = true
})

app.listen(process.env.PORT || 3100) //Listen for communication on this port