var User = require('../app/models/user');

exports.update = function(type, number, user){
  user.goals[type] = number;
  user.save();
}
