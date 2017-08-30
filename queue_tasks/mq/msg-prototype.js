const models = {
  user       : require('../../app/models/user.js'),
  swipe      : require('../../app/models/swipe.js'),
  step       : require('../../app/models/step.js'),
  booking    : require('../../app/models/booking.js')
}

// Contructor
function Msg(model, content){
//                        ^           ^ the object to be added to the DB
//                        |collection to which the message should be added

  this.model   = model;
  this.content = new models[model](content);

  this.pushToDB = function(){
    this.content.save();
  }
}

// Static Method That Parses Messages
Msg.createFromMessage = function(msg){
  var mText = msg.messageText;
  mText = JSON.parse(mText);
  return new Msg(mText.model, mText.content);
}


module.exports = Msg;
