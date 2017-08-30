var Swipe = require('../app/models/swipe.js');
var FHIR_model = require('../app/models/fhir');
var http = require('request');
var refreshTokens = require('./refreshTokens.js');
var fhir_converter = require('fhir-converter');

exports.activity = function(user, callback, req, res){
	Swipe.find({'memberId' : user.publishers.nuffield}).exec(function(err, swipes){
		if (err){
			console.log(err);
			return callback({}, req, res);
		}
		var now = new Date();
		var startDate = user.publishers.startDate;

		var diff = parseInt((now - startDate)/86400000) + 1;

		var labels = [];
		var data = [];
		var goals = [];

		for (var i = 1; i <= diff/7; i++){
			labels.push("Week " + i);
			data.push(0);
			goals.push(0);
		}


		for (var s in swipes) {
			console.log(s);
			var tempSwipe = swipes[s].date;
			console.log(tempSwipe);
			if(tempSwipe > startDate){
				var tempDiff = parseInt((tempSwipe - startDate)/86400000) + 1;
				console.log(tempDiff);
				tempDiff = parseInt(tempDiff/7)
				data[tempDiff]++;
				goals[tempDiff]++;
			}
		}

		if(user.goals.gym){
			goals.pop();
			goals.push(user.goals.gym);
		}

		chartData = {
		    type: 'line',
		    data: {
		        labels: labels,
		        datasets: [{
		            label: 'Visits',
		            backgroundColor: '#ADD8E6',
		            borderColor: '#4682B4',
		            borderWidth: 2,
		            data: data
		        },{
		            label: 'Goal',
		            backgroundColor: '#9368E9',
		            borderColor: '#6B49AF',
		            borderWidth: 2,
		            data: goals
		        }]
		    }
		};


		return callback(chartData, req, res);
	});
}


// GET STEPS FOR TODAY
exports.steps24 = function(user, callback, req, res){
	today = new Date();
	goal = 0;
	if (user.goals.steps) goal = user.goals.steps;
	var chartData = {
		type: 'bar',
		data: {
			labels: ['Today'],
			datasets: [{
				label: 'Steps',
				backgroundColor: '#FFFACD',
				borderColor: '#FFDAB9',
				borderWidth: 2,
				data: [-1]
			},{
				label: 'Goal',
				backgroundColor: '#9368E9',
				borderColor: '#6B49AF',
				borderWidth: 2,
				data: [goal]
			}]
		}
	};
	FHIR_model.FHIR.findOne({'subject.reference' : user.local.email, 'id' : "daily-steps", 'issued' : today.toISOString().substring(0, 10)}, function(err, fhir) {
		if (err){
			console.log(err);
			return callback({}, req, res);
		}
		if (fhir) {
			chartData["data"]["datasets"][0]["data"] = [fhir.valueQuantity.value];
			return callback(chartData,req,res);
		}
		else {
			var afterTokenRefresh = function(accessToken){
				if (accessToken == ''){
					console.log('Could Not Refresh Google Token');
					return callback({}, req, res);
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
							    "dataTypeName": "com.google.step_count.delta"
							    //"dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
							  },
							  {
							    "dataTypeName": "com.google.distance.delta"
							  }
							  ],
							  "bucketByTime": { "durationMillis": 86400000 },
							  "startTimeMillis": midnight,
							  "endTimeMillis": now
							}
						},
						function(err, resdata, stepsdata){
							if (err){
								console.log(err);
								return callback({}, req, res);
							}
							if(resdata.statusCode != 200){
								console.log(resdata);
								return callback({}, req, res);
							}
							if(stepsdata.error){
								console.log(stepsdata);
								return callback({}, req, res);
							}

							try {
								var steps = stepsdata.bucket[0].dataset[0].point[0].value[0].intVal;
								//var stepsAVG = stepsdata.bucket[0].dataset[1].point[0].value[0].fpVal;
							} catch(err) {
								console.log(err);
								return callback({}, req, res);
							}

							var stepJson = {
								steps: steps,
								reference: user.local.email
								};
							var converter = new fhir_converter("googlefit_step");

							var stepFHIR = converter.convert(stepJson);

							console.log(stepFHIR);

							var newFhirSchema = new FHIR_model.FHIR(stepFHIR);

							// save the user
							newFhirSchema.save(function(err) {
								if (err) {
									console.log(err);
									return callback({}, req, res);
								}
							});

							chartData["data"]["datasets"][0]["data"] = [steps];
							return callback(chartData, req, res);
						});
			}
			refreshTokens.refreshGoogleToken(user._id, afterTokenRefresh);
		}
	});

}


//GET SESSIONS
exports.sessions = function (user, callback, req, res) {
	var afterTokenRefresh = function(accessToken){
		var now = (new Date).getTime();
		var begining = now - 86400000*7;
		http.get({
					url: "https://www.googleapis.com/fitness/v1/users/me/sessions?startTimeMillis="+ago24+"&endTimeMillis="+now,
					headers: {
						'Content-Type': "application/json;encoding=utf-8",
						'Authorization': "Bearer " + accessToken
					}
				},
				function(err, resdata, sessionData){
					if (err){
						console.log(err);
						return callback({}, req, res);
					}
					if(resdata.statusCode != 200){
						console.log(resdata);
						return callback({}, req, res);
					}
					if(sessionData.error){
						console.log(stepsdata);
						return callback({}, req, res);
					}
					return callback(sessionData, req, res);
				});

	}
	refreshTokens.refreshGoogleToken(req.user._id, afterTokenRefresh);
}

exports.gymDist = function (user, callback, req, res) {
	Swipe.find({'memberId' : user.publishers.nuffield}).exec(function(err, swipes){
		if (err){
			console.log(err);
			return callback({}, req, res);
		}
		data = [0,0,0];
		var s = 0;
		for (s in swipes){
			switch (swipes[s].timeOfDay) {
				case 'Morning':
					data[0]++;
					break;
				case 'Lunch':
					data[1]++;
					break;
				case 'Evening':
					data[2]++;

			}
		}
		for (var i in data){
			data[i] *= 100;
			console.log(data[i])
			data[i] /= parseInt(s)+1;
			data[i] = parseInt(data[i]);
		}

			graphData = {
			    type: 'bar',
			    data: {
			        labels: ['Morning','Lunchtime', 'Evening'],
			        datasets: [
			        {
			            backgroundColor: '#ADD8E6',
			            borderColor: '#4682B4',
			            borderWidth: 2,
			            data: data
			        }]
			    },
					options : {
						legend: {
							    display: false,
							}
					}
				};

			return callback(graphData, req, res)

	});
};

//GET SESSIONS
exports.stepDist = function (user, callback, req, res) {
	var afterTokenRefresh = function(accessToken){
		console.log('here');
		var now = (new Date).getTime();
		var begining = new Date();
		begining.setHours(6);
		begining = begining.getTime();
		begining -= 86400000*7;
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
					  "startTimeMillis": begining,
					  "endTimeMillis": now
					}
				},
				function(err, resdata, stepsdata){
					if (err){
						console.log(err);
						return callback({}, req, res);
					}
					if(resdata.statusCode != 200){
						console.log(resdata);
						return callback({}, req, res);
					}
					if(stepsdata.error){
						console.log(stepsdata);
						return callback({}, req, res);
					}

					var data = [0,0,0,0];
					var allSteps = 0;

					for (var b in stepsdata.bucket){
						var steps;
						try{
							steps = stepsdata.bucket[b].dataset[0].point[0].value[0].intVal;
						}
						catch(e){
							console.log(e);
							steps = 0;
						}
						finally{
							data[parseInt(b)%4] += steps;
							allSteps += steps;
						}
					}

					for (i in data){
						data[i] *= 100;
						data[i] /= allSteps;
						data[i] = parseInt(data[i])
					}

					graphData = {

					    type: 'bar',
					    data: {
					        labels: ['Morning','Lunchtime', 'Evening', 'Night'],
					        datasets: [
					        {
					            backgroundColor: '#FFFACD',
					            borderColor: '#FFDAB9',
					            borderWidth: 2,
					            data: data
					        }]
					    },
							options : {
								legend: {
									    display: false,
									}
							}
						};

					return callback(graphData, req, res)
				});

	}
	refreshTokens.refreshGoogleToken(user._id, afterTokenRefresh);
}
