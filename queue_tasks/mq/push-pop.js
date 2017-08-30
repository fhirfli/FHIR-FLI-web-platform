const azure      = require('azure-storage');
const config     = require('./config.js');

exports.popMessages = function(queue, callback){
  var queueSvc = azure.createQueueService(account_name=config.mq_acc.acc_name, account_key=config.mq_acc.key);
  queueSvc.getMessages(config.mq_keys[queue], function(err, result, response){
    if(err){
      console.log(err);
      return callback({});
    }
    for(i in result){
      queueSvc.deleteMessage(config.mq_keys[queue], result[i].messageId, result[i].popReceipt, function(error, response){
        if(error) {
          console.log(error);
          return callback({});
        }
      });
    }
    return callback(result);
  });
};

exports.pushMessage = function(queues, m, callback){

  var toGo = queues.length;
  var queueSvc = azure.createQueueService(account_name=config.mq_acc.acc_name, account_key=config.mq_acc.key);

  for(q in queues){
    var queue = queues[q];
    queueSvc.createMessage(config.mq_keys[queue], JSON.stringify(m), function(err){
      if(err){
        console.log(err);
        return callback(false);
      }
      toGo --;
      if(toGo == 0) return callback(true);
    });
  }
};
