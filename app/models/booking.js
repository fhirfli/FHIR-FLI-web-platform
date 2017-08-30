const crypto = require('crypto')

//Observation model
//app/models/observation.js

//load the relevant frameworks
var mongoose = require('mongoose');

//Schema for observation model
var bookingSchema = mongoose.Schema({
  date : Date,
  time : String,
  name : String,
  userID : String
});


// create the model for observations and expose it to our app
var step = mongoose.model("booking", bookingSchema);
module.exports = step;
