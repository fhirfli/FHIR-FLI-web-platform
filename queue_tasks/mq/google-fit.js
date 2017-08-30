var User = require('../../app/models/user.js');
var http = require('request');
var refreshTokens = require('../../config/refreshTokens.js');
var push = require('./google-queue-push.js')

function addSteps(start, end, timeOfDay){
  User.find({}).exec(function (err, users){
    if(err){
      console.log(err);
      return;
    }
    for (u in users){
      var user = users[u];
      if(typeof user.publishers.googleFit.refreshToken == undefined) continue;
      console.log(user.publishers.googleFit.refreshToken)
      var afterTokenRefresh = function(accessToken){
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
    					  "bucketByTime": { "durationMillis": 86400000/4 },
    					  "startTimeMillis": start,
    					  "endTimeMillis": end
    					}
    				},
    				function(err, resdata, stepsdata){
    					if (err){
    						console.log(err);
    						return;
    					}
    					if(resdata.statusCode != 200){
    						console.log(resdata);
    						return;
    					}
    					if(stepsdata.error){
    						console.log(stepsdata);
    						return;
    					}
              try {
                var steps = [stepsdata.bucket[0].dataset[0].point[0].value[0].intVal];
                msg = {
                  'userID'    : user._id,
                  'steps'     : steps,
                  'timeOfDay' : timeOfDay
                }
                var keys = ['main'];
                for (s in user.subscribers) {
                  if(user.subscribers[s]){
                    keys.push(s);
                  }
                }
                push('step', msg, keys);
                return;
              }
              catch(err){
                console.log(err);
                return;
              }
    				});
    	};
    	refreshTokens.refreshGoogleToken(user._id, afterTokenRefresh);
    }
  });
}

function calculateTime(timeOfDay, hours){
  var now = new Date();
  now.setHours(hours,0,0,0);
  now = now.getTime();
  var start = now - 86400000/4;
  addSteps(start, now, timeOfDay);
}

exports.morning = function(){
  calculateTime('morning', 12);
}

exports.lunch = function(){
  calculateTime('lunch', 18);
}

exports.evening = function(){
  calculateTime('evening', 0);
}

exports.night = function(){
  calculateTime('night', 6);
}
