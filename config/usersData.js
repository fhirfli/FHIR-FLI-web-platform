var User = require('../app/models/user');

exports.updateUserData = function(data, user) {
	user.userData = data;
	user.save();
}

exports.updateSubscribersData = function(data, user) {
	user.subscribers = data;
	user.save();
}

exports.updatePublishersData = function(data, user) {
	user.publishers.nuffield  = data.nuffield;
	user.publishers.startDate = data.startDate;
	user.save();
}

exports.updateNuffieldData = function(data, user) {
	user.publishers.nuffield  = data.nuffield;
	console.log("!!!!!!!! userData.js");
	user.save();
}
