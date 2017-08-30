var express  = require('express');
var app      = express();
var mq       = require('./mq/mq-db-push.js');
var schedule = require('node-schedule');
var google   = require('./mq/google-fit.js');
var mongoose = require('mongoose')
var configDB = require('../config/database.js');
var bodyParser   = require('body-parser');
var morgan = require('morgan')
exports.db = mongoose.connect(configDB.url); // connect to our database

app.use(morgan('dev')); // log every request to the console
app.use(express.static('public'))
app.use(bodyParser()); // get information from html forms
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//=================================
//== PUSH DATA FROM QUEUES TO DB ==
//=================================
setInterval(mq, 30000);
//              ^ amount of miliseconds to wait before pushing again

//=================================
//== RESTFUL API CALLS ============
//=================================

//++ GOOGLE FIT +++++++++++++++++++
schedule.scheduleJob({hour: 0, minute: 0}, google.evening);
schedule.scheduleJob({hour: 6, minute: 0}, google.night);
schedule.scheduleJob({hour: 12, minute: 0}, google.morning);
schedule.scheduleJob({hour: 18, minute: 0}, google.lunch);


//=================================
//== MQ API =======================
//=================================
const keys     = require('./mq/api-access-keys.js')
const pushPop = require('./mq/push-pop.js')

app.post('/pop', function(req, res){
  var key = req.body.key;
  var k = keys[key];
  if(k != undefined && k.type == 'subscriber'){
    var callback = function(data){
      if(data != {}){
        res.writeHead(200);
        res.write(JSON.stringify(data));
        res.end();
      } else {
        res.writeHead(400);
        res.write("Error: Cannot Pop the Messages");
        res.end();
      }
    }
    pushPop.popMessages(k.queue, callback);
  } else {
    res.writeHead(401);
    res.write("Error, Not Authorised");
    res.end();
  }
});

app.post('/push', function(req, res){
  var key = req.body.key;
  var queues = JSON.parse(req.body.subscribers);
  queues.push("main");
  var m = JSON.parse(req.body.m);
  var k = keys[key];
  if(k != undefined && k.type == 'publisher'){
    var callback = function(success){
      if(success){
        res.writeHead(200);
        res.write('Success!');
        res.end();
      } else {
        res.writeHead(400);
        res.write("Error: Cannot Push the Message");
        res.end();
      }
    }
    pushPop.pushMessage(queues, m, callback);
  } else {
    res.writeHead(401);
    res.write("Error, Not Authorised");
    res.end();
  }
});

app.listen(3000);
console.log('The magic happens on port 3000');
