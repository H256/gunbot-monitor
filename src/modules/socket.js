const webSocket = require('ws');
const settings = require('./settings');

const wss = new webSocket.Server({port: settings.serverPort || 3088});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === webSocket.OPEN) {
        client.send(data);
      }
    });
  };


module.exports = wss;
