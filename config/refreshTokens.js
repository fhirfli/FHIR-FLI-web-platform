const User = require('../app/models/user.js');
const credentials = require('./auth.js');
const http = require('request');

exports.refreshGoogleToken = function(userID, callback){
  User.findOne({'_id':userID}, function(err, u){
      if(err){
        console.log(err);
        return callback('');
      }

      if(u.publishers.googleFit.refreshToken){
        http.post({
          url : 'https://www.googleapis.com/oauth2/v4/token',
          headers : {
            "Content-Type" : "application/x-www-form-urlencoded"
          },
          form : {
            "client_id"      : credentials.googleFitAPI.clientID,
            "client_secret"  : credentials.googleFitAPI.clientSecret,
            "refresh_token"  : u.publishers.googleFit.refreshToken,
            "grant_type"     : 'refresh_token'
          }
        }, function(err, resdata, tokendata) {
          tokendata = JSON.parse(tokendata);
          if(err){
            console.log(err);
            return callback('');
          }
          if(resdata.statusCode != 200){
            // console.log(tokendata);
            return callback('');
          }
          if(tokendata.error){
            console.log(tokendata.console.error);
            return callback('');
          }
          if(tokendata.access_token){
            return callback(tokendata.access_token);
          }
          console.log('Uncaught Error While Refreshing Google Access Token');
          return callback('');
        })
      } else {
        console.log('Can\'t Refresh User Token!');
        return callback('');
      }
  })

}
