const azure      = require('azure-storage');
const config     = require('./config.js');

module.exports = function(model, content, keys){
  var queueSvc = azure.createQueueService(account_name=config.mq_acc.acc_name, account_key=config.mq_acc.key);
  var msg = {
    'model'   : model,
    'content' : content
  };

  for (k in keys){
    queueSvc.createMessage(config.mq_keys[keys[k]],JSON.stringify(msg), function(err){
      if(err){
        console.log(err);
        return;
      }
    });
  }
}
