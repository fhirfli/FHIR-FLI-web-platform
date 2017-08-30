var Booking = require('../app/models/booking.js');

module.exports = function(user_id, callback){
  Booking.find({'userID':user_id}).exec(function(err, bookings){
    var today = new Date();
    today.setHours(0,0,0,1);
    if(err){
      console.log(err);
      return callback({})
    }
    var upcoming = [];
    for (b in bookings){
      if(today < bookings[b].date) upcoming.push(bookings[b]);
    }
    return callback(upcoming);
  });
};
