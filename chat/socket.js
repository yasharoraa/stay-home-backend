function sockets(server) {
  const { Server } = require('ws');
  const wss = new Server({ server });
  var jwt = require('jsonwebtoken');
  var secret = require('../config').secret;
  var mongoose = require('mongoose');
  var Message = mongoose.model('Message');
  var lastMessages = require('../routes/helpers/lastmessage');
  clients = {};
  refs = {};


  function getToken(authorization) {
    if (authorization && authorization.split(' ')[0] === 'Token' ||
      authorization && authorization.split(' ')[0] === 'Bearer') {
      return authorization.split(' ')[1];
    }
  }


  function toEvent(message) {
    try {
      var event = JSON.parse(message);
      this.emit(event.type, event.payload);
    } catch (err) {
      console.log('not an event', err);
    }
  }

  wss.on('connection', function (ws) {
    console.log("connection started");
    var user_id;
    ws.on('message', toEvent)
      .on('authenticate', function (data) {
        jwt.verify(getToken(data.token), secret, function (err, user) {
          console.log('authenticated');
          if (!user || !user.id) {
            return ws.close(401);
          }
          user_id = user.id;
          refs[user_id] = Number(data.type);
          clients[user_id] = ws;

          return lastMessages(user.id, 0, 10, Number(data.type)).
            then(function (result,err) {
              if (err) {
                ws.send(JSON.stringify(err));
              }
              if (result) {
                msg = {
                  type: "chat",
                  payload: result
                }
                ws.send(JSON.stringify(msg));
              }
            }).catch(next);
        });
      })
      .on('chat', function (data) {
        console.log(" recieved from " + user_id + ' : ' + data.message);
        var message = new Message()
        message.text = data.message;
        message.from = user_id;
        message.to = data.receiver;
        message.fromModel = (refs[user_id] == 0 ? 'User' : 'Store');
        message.toModel = (refs[user_id] == 0 ? 'Store' : 'User')
        message.save().catch((error) => {
          console.log(error);
        });
        var receiver = clients[data.receiver];
        console.log("receiver:" + data.receiver);
        var ref = refs[data.receiver];
        var msg = {
          type: "message",
          payload: message
        }
        if (receiver) {
          return receiver.send(JSON.stringify(msg));
        } else {
          //send firebase notification
          console.log("receiver not connected");
        }
      })
      .on('close', function () {
        delete clients[user_id];
        delete refs[user_id];
        console.log('deleted: ' + user_id);
      });
  });
}

module.exports = sockets;
