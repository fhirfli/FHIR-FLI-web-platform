//Observation model
//app/models/observation.js

//load the relevant frameworks
var mongoose = require('mongoose');

//Schema for observation model
var swipeSchema = mongoose.Schema({
		memberId        : String,
		gender					: String,
		homePostcode	  : String,
		visitingGym     : String,
		homeGym         : String,
		region          : String,
		segment         : String,
		dateOfBirth 	  : Date,
		date				    : Date,
		timeOfDay			  : String,
		weekDay         : Boolean,
		startDate 			: Date
});

// create the model for observations and expose it to our app
var swipe = mongoose.model("swipe", swipeSchema);
module.exports = swipe;
