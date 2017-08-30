var Swipe = require('../app/models/swipe.js');
var http = require('request');
var refreshTokens = require('./refreshTokens.js');
var azureML = require('./azureml.js')

module.exports = function(user, ret){
  var asyncTasks = 0;
  var notifications = [];

  //add Step Goal notifications
  if(!user.goals.steps){
    notifications.push("Add Steps Goals!");
  } else {
    asyncTasks++;
    var callback = function(steps){
      asyncTasks--;
      if(steps >= user.goals.steps) notifications.push("You have reached your daily step goal!");
      if(asyncTasks == 0) return ret(notifications);
    };

    var afterTokenRefresh = function(accessToken){
  		if (accessToken == ''){
  			console.log('Could Not Refresh Google Token');
        return callback(0);
  		}
  		var now = new Date();
  		var midnight = new Date();
  		midnight.setHours(0,0,0,0);
  		now = now.getTime();
  		midnight = midnight.getTime();
  		http.post({
  					url: "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
  					headers: {
  						'Content-Type': "application/json;encoding=utf-8",
  						'Authorization': "Bearer " + accessToken
  					},
  					json: {
  					  "aggregateBy": [{
  					    "dataTypeName": "com.google.step_count.delta",
  					    "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
  					  }],
  					  "bucketByTime": { "durationMillis": 86400000 },
  					  "startTimeMillis": midnight,
  					  "endTimeMillis": now
  					}
  				},
  				function(err, resdata, stepsdata){
  					if (err){
  						console.log(err);
  						return callback(0);
  					}
  					if(resdata.statusCode != 200){
  						console.log(resdata);
  						return callback(0);
  					}
  					if(stepsdata.error){
  						console.log(stepsdata);
  						return callback(0);
  					}

  					try {
  						var steps = stepsdata.bucket[0].dataset[0].point[0].value[0].intVal;
  					} catch(err) {
  						console.log(err);
  						return callback(0);
  					}

  					return callback(steps);
  				});
  	}
  	refreshTokens.refreshGoogleToken(user._id, afterTokenRefresh);
  }

  //add Gym Goal notifications
  if(!user.goals.gym){
    notifications.push("Add Gym Attendance Goals!");
  } else if (user.goals.gym > 2){
    notifications.push("This is an ambitious gym attendance goal! Don't forget to follow through!");
  } else {
    asyncTasks++;
    var callback1 = function(notification){
      asyncTasks--;
      if(notification != "") notifications.push(notification);
      if(asyncTasks == 0) return ret(notifications);
    };
    Swipe.find({'memberId' : user.publishers.nuffield }).exec(function(err, swipes) {
  		if (err) {
  			console.log(err);
  			return callback1("");
  		}
      if(swipes.length == 0) return callback1("");
      gender = swipes[0].gender;
      segment = swipes[0].segment;
      region = swipes[0].region;

  		var now = new Date();
      var thisWeek = 0;
      var periods = [0,0];

  		for (var s in swipes) {
  			var tempSwipe = swipes[s].date;
        var diff = now - tempSwipe;
        if(diff <= 604800) thisWeek++;
        diff /= 1296000;

  			if(diff == 0 && diff == 1) periods[1-diff]++;

  		}

      if(thisWeek >= user.goals.gym) return callback1("You have reached your weekly gym attendance goal!");

      http.post({
        url     : azureML.url,
        headers : {
          'Content-Type': "application/json;encoding=utf-8",
          'Authorization': "Bearer " + azureML.key
        },
        json : {
          "Inputs": {
            "input1": {
              "ColumnNames": [
                "gender",
                "period1",
                "period2",
                "period3",
                "region",
                "segment"
              ],
              "Values": [
                [
                  gender,
                  periods[0],
                  periods[1],
                  true,
                  region,
                  segment
                ]
              ]
            }
          }
        }
      }, function(err, resdata, mldata){
        if (err){
          console.log(err);
          return callback1("");
        }
        if(resdata.statusCode != 200){
          console.log(resdata.body.error.details);
          return callback1("");
        }

        try {
          var value = mldata.Results.output1.value.Values[0][7];
        } catch (err) {
          console.log(err);
          return callback1("");
        }

        console.log("Value", value)
        if(value < 0.5 || value == undefined) return callback1("Don't forget to go to the gym this week!");
        return callback1("You're well on your way to achieving your gym attendance goal!");
      });
  	});

  }

  //add Booking notifications

  //return if no async tasks are to be completed
  if(asyncTasks == 0) return ret(notifications);
}
