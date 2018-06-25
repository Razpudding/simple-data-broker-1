# simple-data-broker
This Node server is a simple data broker which accepts POST requests and stores data in a database.

## Usage
1. Set up a mongodb, provide its MongoDB URI in a .env file
2. Run the server using `npm start`
3. Test if it runs correctly by sending a correct POST message (see below)

## Features

Feature #1 is a work in progress. Currently I'm trying to figure out how to send larger amounts of data in one post request.
The server accepts two requests:

1. `POST /` If a message is posted to the root of the server following this format: {deviceId:String, status:Number, [additional optional params]} the server will store the message in a database table as is. Both the `deviceId` and the `status` are required. The request should be a valid POST request with all data values provided as query parameters. After testing I found out the following content types will work (application/x-www-form-urlencoded, multipart/form-data, no content-type provided) although i'm not 100% sure on that last one. If the post request does not meet the requirements, a message will be sent back explaining why it was rejected alongside  4xx HTTP STATUS

2. `GET /` If the root of the server is requested, all available data is dumped back to the requester. Note: I have no idea how stable that is or how long the data is allowed to be for this to work. This is purely a test feature and should prob be protected.

### Environment

Make sure you make a `.env` file, containing:

```
MONGO_DB_URL= url to mongodb database
AUTH_SECRET= secret used for auth
```

### API

```GET /months```
 
| Parameter | Description | Type |
|---|---|---|
| year | The range of the data as year | String |

```GET /dump```

| Parameter | Description | Type |
|---|---|---|
| startdate | The startdate of the range of the data in the response | Date |
| enddate | The enddate of the range of the data in the response | Date |


```GET /delete```

| Parameter | Description | Type |
|---|---|---|
| startdate | The startdate of the range of the data in that has to be deleted | Date |
| enddate | The enddate of the range of the data in that has to be deleted | Date |

#### Auth

```POST /login```

| Parameter | Description | Type |
|---|---|---|
| username | The username of the user trying to login | String |
| password | The password of the user trying to login | String |

```POST /register```

| Parameter | Description | Type |
|---|---|---|
| username | The username of the user trying to login | String |
| password | The password of the user trying to login | String |

## Dashboard

The dashboard gives a structured overview of the data saved in the database. From here data can be downloaded as CSV in the range of a month or a year.

### Vue

The dashboard is build using the framework Vue and the [vue-cli](https://github.com/vuejs/vue-cli). To read more about Vue check their [documentation](https://vuejs.org/v2/guide/).

To start the Vue app for development run:

```npm run serve```

The api requests are proxied to port `:3000`, so make sure to run the backe end app on that port.

To build for production (do this on the server) run:

```npm run build```

If this task runs successful, the front-end app is served by de back end app.


### Vuetify

For the layout of the dashboard is build using [Vuetify](https://vuetifyjs.com/en/), a component library made to use with Vue. Using Vuetify the layout can be easily extended using it's pre-made components.

### Authentication

For authentication the dashboard is using [JWT tokens](https://jwt.io/). This way the requests get checked in the back-end by sending the user's token with every request. If the token doesn't work anymore, the user has to log in again and a new token is generated.

[This](https://www.djamware.com/post/5ac8338780aca714d19d5b9e/securing-mevn-stack-vuejs-2-web-application-using-passport) guide was used to set up the authentication process.