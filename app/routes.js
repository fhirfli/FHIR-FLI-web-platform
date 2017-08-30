//all the routes for our application
//load the relevant frameworks
var FHIR_model = require('../app/models/fhir');

var http = require('request');

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================

    app.get('/', function(req, res) {
        //whitelist of all acceptable next parameters to prevent unauthorised redirects
        var whitelist = ['/dashboard', '/user', '/maps', '/data', '/skype/identify'];

        //check and verify for the next parameter in URL to redirect in case of API calls or failed requests
        if (typeof(req.query.next) != 'undefined' && whitelist.indexOf(req.query.next) != -1) {
            passport.session.next = req.query.next;
        } else {
          passport.session.next = '/dashboard';
        }
        if (typeof(req.query.skypeSession) != 'undefined') {
            passport.session.skypeSession = req.query.skypeSession;
        }
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN REDIRECT HANDLERS =============
    // =====================================

    app.get('/next', function(req, res) {
      passport.session.userID = req.user.id;
      var next = passport.session.next;
      if(JSON.stringify(req.user.userData) == JSON.stringify({})) {
        res.redirect('/finalise-setup')
      } else if(typeof(next) != 'undefined'){
        res.redirect(next);
      } else {
        res.redirect('/dashboard')
      }
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/next', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.post('/loginIOS', passport.authenticate('ios-login'), function(req, res) {
      res.json({"loginStatus": "Success"});
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/next', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash    : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    app.get('/dashboard', isLoggedIn, function(req, res) {
        res.render('dashboard-wrapper.ejs', {
            user   : req.user, // get the user out of session and pass to template
            path   : 'dashboard.ejs',
            title  : 'Dashboard'
        });
    });

    app.get('/data', isLoggedIn, function(req, res) {
        res.render('dashboard-wrapper.ejs', {
            user   : req.user, // get the user out of session and pass to template
            path   : 'data.ejs',
            title  : 'Data'
        });
    });


    app.get('/user', isLoggedIn, function(req, res) {
        res.render('dashboard-wrapper.ejs',{
            user : req.user,
            path : 'user.ejs',
            title: 'Profile'
        }); // load the user.ejs file
    });

    app.get('/maps', isLoggedIn, function(req, res) {
        res.render('dashboard-wrapper.ejs',{
            user : req.user,
            path : 'maps.ejs',
            title: 'Maps'
        }); // load the user.ejs file
    });

    // =====================================
    // FITBIT ROUTES =====================
    // =====================================
        app.get('/auth/fitbit',
        passport.authenticate('fitbit', { scope: ['activity','heartrate','location','profile'] }
        ));

        app.get( '/auth/fitbit/callback', passport.authenticate( 'fitbit', {
        successRedirect: '/auth/fitbit/success',
        failureRedirect: '/auth/fitbit/failure'
}));
         app.get('/auth/fitbit/success', function(req, res){
      res.render('success.ejs', {})
    });

    app.get('/auth/fitbit/failure', function(req, res){
      res.render('fail.ejs', {})
    });
    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================

    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback', passport.authenticate('facebook',
        {
            successRedirect : '/next',
            failureRedirect : '/'
        }));

    // =====================================
    // AZURE ADB2C ROUTES ==================
    // =====================================

    // route for azure adb2c authentication and login
//    app.get('/auth/adb2c', passport.authenticate('azuread-openidconnect'));
    app.get('/auth/adb2c', function(req, res, next) {
      passport.authenticate('azuread-openidconnect',
        {
          response: res
        }
      )(req, res, next);
    },
    function(req, res) {
      res.redirect('/dashboard');
    });

    // handle the callback after azure adb2c has authenticated the user
    app.get('/auth/adb2c/callback', passport.authenticate('azuread-openidconnect',
      {
        successRedirect : '/next',
        failureRedirect : '/'
      }));

      app.post('/auth/adb2c/callback', passport.authenticate('azuread-openidconnect',
        {

          successRedirect : '/next',
          failureRedirect : '/'
        }));

    // =====================================
    // NUFFIELD MIDDLE SERVER ROUTES =======
    // =====================================

    //handle the callback after the result is returned
    app.get('/auth/nuffield/callback', function(req,res) {
//      res.redirect('https://localhost:3000/auth?code=req.code');

      http.post({
        url: "http://localhost:3000/auth/",
        headers: {
          'Content-Type': "application/json;encoding=utf-8",
          'Authorization': "Bearer " /*+ accessToken*/
        },
        json: {
          "code" : req.query.code
        }
      }, function(error, resData, json){

        var subscriberData = require('../config/usersData.js');
        var data = {
          nuffield  : resData.body.member_id
        };
        console.log("nuffield_id : " + data.nuffield);
        console.log("!!!! before updateNuffieldData");
        subscriberData.updateNuffieldData(data, req.user);

//        http.post({
//          url: "http://localhost:8080/setNuffieldID",
//          headers: {
//            'Content-Type': "application/json;encoding=utf-8",
//            'Authorization': "Bearer " /*+ accessToken*/
//          },
//          json: {
//            "code" : resData.body.member_id
//          }
//        });
      });
    });

    app.post('/setNuffieldID', function(req,res){
        var subscriberData = require('../config/usersData.js');
        var data = {
          nuffield  : req.body.code, //THIS SHOULD BE THE SAME AS
        };
        console.log("!!!! routes setNuffieldID");
        subscriberData.updateNuffieldData(data, req.user);
        //if the response was successfully completed
        res.writeHead(200);
        res.end();
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =====================================
    // USER DATA ===========================
    // =====================================

    app.post('/set-goals', isLoggedIn, function(req, res) {
      var setGoals = require('../config/setGoals.js');
      setGoals.update(req.body.type, req.body.number, req.user);
      res.writeHead(200);
      res.end();
    });

    app.post('/update-user-data', isLoggedIn, function(req, res){
        var userData = require('../config/usersData.js');
        var data = {
            nickname   : req.body.nickname,
            email      : req.body.email,
            address    : req.body.address,
            city       : req.body.city,
            country    : req.body.country,
            postcode   : req.body.postcode,
            aboutMe    : req.body.aboutMe
        };
        userData.updateUserData(data, req.user);
        //if the response was successfully completed
        res.writeHead(200);
        res.end();
    });

    app.get('/finalise-setup', isLoggedIn, function(req, res){
      res.render('finalise-setup.ejs', { user : req.user});
    })

    app.get('/user-remove', isLoggedIn, function(req, res){
      req.user.remove();
      res.redirect('/');
    })

    app.post('/finalise-setup-submit', isLoggedIn, function(req, res){
      var userData = require('../config/usersData.js');
      var data = {
          openMRS   : (req.body.openMRS != undefined),
          msHealth  : (req.body.msHealth != undefined)
      };
      userData.updateSubscribersData(data, req.user);
      var data = {
          nickname   : req.body.nickname,
          email      : req.body.email,
          address    : req.body.address,
          city       : req.body.city,
          country    : req.body.country,
          postcode   : req.body.postcode,
          aboutMe    : req.body.aboutMe
      };
      userData.updateUserData(data, req.user);
      var data = {
          nuffield   : req.body.nuffield,
          startDate  : req.body.startDate
      };
      userData.updatePublishersData(data, req.user);
      res.redirect('/next')
    })

    app.post('/update-data', isLoggedIn, function(req, res){
        var subscriberData = require('../config/usersData.js');
        var data = {
            openMRS   : req.body.openMRS,
            msHealth  : req.body.msHealth
        };
        console.log(data)
        subscriberData.updateSubscribersData(data, req.user);
        var data = {
          nuffield  : req.body.nuffield,
          startDate : req.body.startDate
        };
        console.log(data)
        subscriberData.updatePublishersData(data, req.user);
        //if the response was successfully completed
        res.writeHead(200);
        res.end();
    });

    app.get('/notifications', isLoggedIn, function(req, res){
      var getNotifications = require('../config/notifications.js');
      var ret = function(notifications){
        var resp = { 'notifications': notifications };
        res.writeHead(200);
        res.write(JSON.stringify(resp));
        res.end();
      }
      getNotifications(req.user,ret);
    });

    app.get('/bookings', isLoggedIn, function(req, res){
      var callback = function(bookings){
        res.writeHead(200);
        res.write(JSON.stringify(bookings));
        res.end();
      }
      var getBookings = require('../config/getBookings.js');
      getBookings(req.user.id, callback);
    });

    // =====================================
    // SKYPE BOT API =======================
    // =====================================

    app.get('/skype/identify', isLoggedIn, function(req, res){
      if(!passport.session.skypeSession) res.render('fail.ejs', {});
      var http = require('request');
      http.post({
        url : "http://nuffieldhealth.azurewebsites.net/login",
        headers: {
          'Content-Type': "application/json;encoding=utf-8"
        },
        json : {
          "user_id": "'"+req.user.id+"'",
          "user_session" : "'"+passport.session.skypeSession+"'"
        }
      }, function(err, resp){
        if(err){
          console.log(err)
          res.render('fail.ejs', {});
        }
        if(resp.statusCode != 200) {
          console.log(resp.statusCode);
          console.log(resp.body);
          res.render('fail.ejs', {});
        }
        res.render('success.ejs', {});
      });
    });

    app.post('/skype/subscribers',function(req, res){
      var User = require('../app/models/user.js')
      var key = require('../config/skype-key.js');
      if (req.body.key == key){
        User.findOne({'_id':req.body.id}).exec(function(err, user) {
          if(err){
            res.writeHead(400);
            res.write("Error: Cannot verify User ID!")
            res.end();
          }
          res.writeHead(200);
          res.write(JSON.stringify({subscribers : user.subscribers}));
          res.end();
        });
      } else {
        res.writeHead(401);
        res.write("Error, Not Authorised");
        res.end();
      }
    });

    app.post('/skype/nuffieldID', function(req, res){
      var User = require('../app/models/user.js')
      var key = require('../config/skype-key.js');
      if (req.body.key == key){
        User.findOne({'_id':req.body.id}).exec(function(err, user) {
          if(err){
            res.writeHead(400);
            res.write("Error: Cannot verify User ID!")
            res.end();
          }
          res.writeHead(200);
          res.write(JSON.stringify({nuffieldID : user.publishers.nuffield}));
          res.end();
        });
      } else {
        res.writeHead(401);
        res.write("Error, Not Authorised");
        res.end();
      }
    });

    app.get('/migrate', function(req, res){

    })

    // =====================================
    // DATA SOURCE LOGINS ==================
    // =====================================

    // Google Fit
    app.get('/source/google-fit', isLoggedIn, passport.authenticate('google', {
        scope : [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/fitness.activity.read',
          'https://www.googleapis.com/auth/fitness.location.read'],
        accessType : 'offline',
        prompt : 'consent'
      }));

    app.get('/source/google-fit/callback', isLoggedIn, passport.authenticate('google', {
      successRedirect : '/source/success',
      failureRedirect : '/source/fail'
    }));

    app.get('/source/success', function(req, res){
      res.render('success.ejs', {})
    });

    app.get('/source/fail', function(req, res){
      res.render('fail.ejs', {})
    });
    
    // HealthKit
    app.post('/sendmessage', function(request, response) {
        console.log("[Nuffield_Debugger]: Now enter healthkit sendmessage method");
        if(response.statusCode == 200) {
            console.log("[Nuffield_Debugger]: Sendmessage seems working");
            console.log(request.body);
            response.end();
        }
        else {
            console.log("[Nuffield_Debugger]:  healthkit Sendmessage seems not working");
            response.send("Error code: " + response.statusCode);
        }
    });

    app.post("/deleteObs", function(request, response) {
        console.log("[Nuffield_Debugger]: Now enter deleteObs method");
        if(response.statusCode == 200) {
            console.log(request.body);
            response.end();
        }
        else {
            response.send("Error code: " + response.statusCode);
        }
    });

    // =====================================
    // DATA FOR GRAPHS =====================
    // =====================================
    app.get('/graph/gymByMonth', isLoggedIn, function(req, res){
      var dataSources = require('../config/dataSources.js');
      dataSources.activity(req.user, callback, req, res);
    });

    app.get('/graph/steps24', isLoggedIn, function(req, res){
      var dataSources = require('../config/dataSources.js');
      dataSources.steps24(req.user, callback, req, res);
    });

    app.get('/graph/sessions', isLoggedIn, function(req, res){
      var dataSources = require('../config/dataSources.js');
      dataSources.sessions(req.user, callback, req, res);
    })

    app.get('/graph/gymDist', isLoggedIn, function(req, res){
      var dataSources = require('../config/dataSources.js');
      dataSources.gymDist(req.user, callback, req, res);
    })

    app.get('/graph/stepDist', isLoggedIn, function(req, res){
      var dataSources = require('../config/dataSources.js');
      dataSources.stepDist(req.user, callback, req, res);
    })

    // =====================================
    // Get data from IOS ===================
    // =====================================
    // Get the fhir json (currently just steps) from Health Kit
    app.post('/healthKit', function(request, response) {
        if(response.statusCode == 200) {
            console.log("From healthKit we get: ");
            console.log(request.body);
            var newFhirSchema = new FHIR_model.FHIR(request.body);
            newFhirSchema.save();
        }
        else {
            console.log("healthKit seems not working");
            response.send("Error code: " + response.statusCode);
        }
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/?next='+req.url);
}

// used for asynchronous mongoose requests
var callback = function(data, req, res){
  res.writeHead(200);
  res.write(JSON.stringify(data));
  res.end();
};
