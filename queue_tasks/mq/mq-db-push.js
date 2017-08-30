const azure      = require('azure-storage');
const config     = require('./config.js');
const Msg        = require('./msg-prototype.js')

module.exports = function(){

  var queueSvc = azure.createQueueService(account_name=config.mq_acc.acc_name, account_key=config.mq_acc.key);
  queueSvc.getMessages(config.mq_keys['main'], function(err, result, response){
  if(err){
    console.log(err);
    return;
  }
  console.log(result)
  for (i in result){
    try{
      temp = Msg.createFromMessage(result[i]);
      temp.pushToDB();
    } catch(err) {
      console.log(err);
    }

    queueSvc.deleteMessage(config.mq_keys['main'], result[i].messageId, result[i].popReceipt, function(error, response){
      if(error)console.log(error);
    });
  }

});
}
