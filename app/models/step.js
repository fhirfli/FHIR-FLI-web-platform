const crypto = require('crypto')

//Observation model
//app/models/observation.js

//load the relevant frameworks
var mongoose = require('mongoose');

//Schema for observation model
var stepSchema = mongoose.Schema({
  timeOfDay : String,
  steps : String,
  userID : String
});


// create the model for observations and expose it to our app
var step = mongoose.model("step", stepSchema);
module.exports = step;
