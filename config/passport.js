//configuring the strategies for passport
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

// load up the user model
var User            = require('../app/models/user');

//load the auth variables
var configAuth = require('./auth');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        //console.log("Hi buddy");
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });

        });

    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

    // =========================================================================
    // IOS LOGIN =============================================================
    // =========================================================================
    // This is for user using our IOS app, which can add Healkit data to his/her data source.

    passport.use('ios-login', new LocalStrategy({
        // User should use the same information as his Transpire account.
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) {
        User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err)
                return done(err);
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, record the user with HealthKit and return successful user
            user.publishers.healthKit = "Connected";
            user.save(function(err) {
                if (err)
                    throw err;
                // if successful, return the new user
                return done(null, user);
            });
        });

    }));

       // =========================================================================
    // FITBIT LOGIN =============================================================
    // =========================================================================
    // This is for user using Fitbit app, which can add fitbit data to his/her data source.


passport.use(new FitbitStrategy({
    clientID:     configAuth.fitbitAuth.clientID,
    clientSecret: configAuth.fitbitAuth.clientSecret,
    callbackURL: configAuth.fitbitAuth.callbackURL,
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
    User.findOne({ '_id':  passport.session.userID }, function (err, user) {
     // return done(err, user);
     // if there is an error, stop everything and return that
              // ie an error connecting to the database
              if (err)
                  return done(err);

              // if the user is found, then log them in
              if (user) {
                user.publishers.fitbit.id           = profile.id; // set the users google id
                //user.publishers.fitbit.token        = token; // we will save the token that google provides to the user
                user.publishers.fitbit.refreshToken = refreshToken;
                console.log(refreshToken);
                user.save(function(err) {
                    if (err)
                        throw err;

                    // if successful, return the new user
                    return done(null, user);
                  });

              } else {
                    return done(null, user);
              }
    });
});
  }
));


    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        profileFields   : ['emails', 'displayName'] //check quotation marks, replace with single ones, change it in auth.js and test if it makes a differece
    },

    // google will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();

                    // set all of the facebook information in our user model
                    newUser.facebook.id    = profile.id; // set the users facebook id
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user
                    newUser.facebook.name  = profile.displayName; // look at the passport user profile to see how names are returned
                    //Email for some reason sometimes causes errors, when commented it logs you in fine
                    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

        //done(null, profile);

    }));

    // =========================================================================
    // AZURE ADB2C LOGIN =======================================================
    // =========================================================================
    // This is for authenticating the user using Microsoft Azure ADB2C
    passport.use(new OIDCStrategy({
      redirectUrl: configAuth.azureAdb2c.redirectUrl, //*
//      realm: configAuth.azureAdb2c.realm,
      clientID: configAuth.azureAdb2c.clientID, //*
//      oidcIssuer: configAuth.azureAdb2c.issuer,
      identityMetadata: configAuth.azureAdb2c.identityMetadata, //*
//      skipUserProfile: configAuth.azureAdb2c.skipUserProfile,
      responseType: configAuth.azureAdb2c.responseType, //*
      responseMode: configAuth.azureAdb2c.responseMode, //*
      tenantName: configAuth.azureAdb2c.tenantName,
      passReqToCallback : configAuth.azureAdb2c.passReqToCallback,
      allowHttpForRedirectUrl: configAuth.azureAdb2c.allowHttpForRedirectUrl,
      clientSecret : configAuth.azureAdb2c.clientSecret,
//      isB2C : configAuth.azureAdb2c.isB2C,
//      policyName : configAuth.azureAdb2c.policyName,
//      validateIssuer: configAuth.azureAdb2c.validateIssuer,
//      issuer: configAuth.azureAdb2c.issuer
//      useCookieInsteadOfSession : configAuth.azureAdb2c.useCookieInsteadOfSession
    },
    function(iss, sub, profile, accessToken, refreshToken, done) { console.log("ERROR0");
      // asynchronous verification, for effect...
      process.nextTick(function () {
        User.findOne({ 'azureAdb2c.oid' : profile.oid }, function(err, user) {

          // if there is an error, stop everything and return that
          // ie an error connecting to the database
          if (err) {
              console.log("ERROR1");
              return done(err);
          }

          // if the user is found, then log them in
          if (user) {
              console.log("ERROR2");
              console.log(user);
              return done(null, user); // user found, return that user
              console.log("ERROR22");
          } else {
              console.log("ERROR3");
              // if there is no user found with that azureAdb2c id, create them
              var newUser            = new User();
              // set all of the azureAdb2c information in our user model
              newUser.azureAdb2c.oid    = profile.oid; // set the users oid
              newUser.azureAdb2c.token = accessToken; // we will save the token that azureAdb2c provides to the user
              // save our user to the database
              newUser.save(function(err) {
                  if (err){
                        console.log("ERROR4");
                        throw err;
                  }
                  // if successful, return the new user
                  return done(null, newUser);
              });
          }
        });
      });
    }
  ));


    passport.use(new GoogleStrategy ({

        // pull in our app id and secret from our auth.js file
        clientID      : configAuth.googleFitAPI.clientID,
        clientSecret    : configAuth.googleFitAPI.clientSecret,
        callbackURL     : configAuth.googleFitAPI.callbackURL
    },
    function (token, refreshToken, profile, done) {
      // asynchronous
      process.nextTick(function() {

          // find the user in the database based on their google id
          User.findOne({'_id':passport.session.userID}, function(err, user) {
              // if there is an error, stop everything and return that
              // ie an error connecting to the database
              if (err)
                  return done(err);

              // if the user is found, then log them in
              if (user) {
                user.publishers.googleFit.id           = profile.id; // set the users google id
                user.publishers.googleFit.token        = token; // we will save the token that google provides to the user
                user.publishers.googleFit.refreshToken = refreshToken;
                console.log(refreshToken);
                user.save(function(err) {
                    if (err)
                        throw err;

                    // if successful, return the new user
                    return done(null, user);
                  });

              } else {
                    return done(null, user);
              }

          });
        });
    }));


};
