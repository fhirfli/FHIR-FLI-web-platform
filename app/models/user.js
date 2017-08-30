//Our user model

// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    azureAdb2c       : {
      oid           : String,
      token        : String,
      email        : String,
      name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    userData         : {
        nickname     : String,
        email        : String,
        address      : String,
        city         : String,
        country      : String,
        postcode     : String,
        aboutMe      : String
    },
    publishers       : {
      startDate      : Date,
      googleFit      : {
        id           : String,
        token        : String,
        refreshToken : String
      },
      nuffield       : String, //This is the Nuffield Member ID, which is authenticated by the Nuffield Servers
      healthKit      : String,
      fitbit         : {
        id           : String,
        token        : String,
        refreshToken : String
    },
      },
    subscribers      : {
        openMRS      : Boolean,
        msHealth     : Boolean
    },
    goals            : {
        gym          : Number,
        steps        : Number
    }
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
