var test = require('unit.js');
// just for example of tested value
var example = 'hello';

//Sample User Object for test purposes
var user = {
  "id": "58ea0db1bb942719589a46ef",
  "facebook": {
    "email": "jas.semrl@hotmail.com",
    "name": "Jaš Šemrl",
    "token": "EAAEHQff8GQwBAOLzceZBCODTSAbNeteZCe3s9gp6vYw5aDx7BLg3JJM7ZC8GPzy0Yw3jLAXQ0hFY5ESu2w2PocQfBbBTviRiA13vPAYM6KXgjuhUWedNkSxqTGax758bHCZAu6gdPgNKfVhNnze3qAj8fJZAL1jMOixejsHt6pQZDZD",
    "$id": "1238932319535454"
  },
  "publishers": {
    "googleFit": {
      "$id": "116753772301077426835",
      "refreshToken": "1/n6tyMTkMCxNkBNXu1a-JUjwfSZjkz6FwzPja4uI5RjM",
      "token": "ya29.GlsoBBNW2iqMmYt77I93erCD-Tb6MBgCh5D7n-btpKu6USVEHoD3TfYegHqEPd2SjpBs-3187tlbPyBPSSKHOrJa3bZ3dTWXtInjUlzOu9OyV1h0fBECPDVjLIv7"
    },
    "nuffield": "B3DF2B047B20AF14055A9A9486D0071519779DB9B3699BB68E8E25430CA1A6FA",
    "startDate": new Date(1483228800000)
  },
  "subscribers": {
    "openMRS": true,
    "msHealth": true
  },
  "userData": {
    "nickname": "Jas",
    "email": "jas.semrl@abc.com",
    "address": "123 Road",
    "city": "London",
    "country": "UK",
    "postcode": "WC1 ABC",
    "aboutMe": "I like Data Sharing!"
  },
  "goals": {
    "gym": 2,
    "steps": 4000
  }
};

//===================================
//====== CALLBACKS ==================
//===================================
describe('Callbacks When Connecting to DB/APIs', function(){
  //Data Sources Functions
  var dataSources = require('../config/dataSources.js')
  it('Gym Activity', function(){
    var callback = function(data, req, res){
      test.assert(data != {})
    }
    dataSources.activity(user, callback, null, null);
  });

  it('Steps Activity', function(){
    var callback = function(data, req, res){
      test.assert(data != {})
    }
    dataSources.steps24(user, callback, null, null);
  });

  it('Gym Distribution', function(){
    var callback = function(data, req, res){
      test.assert(data != {})
    }
    dataSources.gymDist(user, callback, null, null);
  });

  it('Steps Distribution', function(){
    var callback = function(data, req, res){
      test.assert(data != {});
    }
    dataSources.stepDist(user, callback, null, null);
  });

  //Bookings function
  var getBookings = require('../config/getBookings.js');
  it('Get Bookings', function(){
    var callback = function(data, req, res){
      test.assert(data != {})
    }
    getBookings(user, callback);
  });
  //Notifications function
  var notifications = require('../config/getBookings.js');
  it('Get Notifications', function(){
    var callback = function(data){
      test.assert(data != [])
    }
    notifications(user, callback);
  });
});
