var StringHelper = require('./pokeString.js');
var trainerHelper = require('./trainer.js');
var marketHelper = require('./market.js');
var giftEggHelper = require('./giftEgg.js');
var tcpRequestHelper = require('./tcpRequestManager.js');
var webServerHelper = require('./webserver.js');
var net = require('net');
var os = require('os');
var LOG = require('./log.js');

const WEB_SERVER_PORT = 8081;
const TCP_SERVER_PORT = 9000;

process.on('uncaughtException', (err) => {
  LOG.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  LOG.error('Unhandled Rejection:', reason);
});

const serverBanner = `
 ██████╗███████╗██╗     ██╗ ██████╗      ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗ 
██╔════╝██╔════╝██║     ██║██╔═══██╗     ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
██║     █████╗  ██║     ██║██║   ██║     ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
██║     ██╔══╝  ██║     ██║██║   ██║     ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
╚██████╗███████╗███████╗██║╚██████╔╝     ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
 ╚═════╝╚══════╝╚══════╝╚═╝ ╚═════╝      ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝`
 LOG.raw(serverBanner + "\n\n");    

const tcpRequestHandler = tcpRequestHelper.createRequestHandler(trainerHelper, marketHelper, giftEggHelper);
const webServer         = webServerHelper.createWebServer(WEB_SERVER_PORT, trainerHelper, marketHelper, giftEggHelper, tcpRequestHandler);

var tcpServer = net.createServer();    
tcpServer.on('connection', handleConnection);
tcpServer.listen(TCP_SERVER_PORT, function() {
    LOG.raw('TCP Game Server started with local address: %s:%j', getIPv4(), tcpServer.address().port);
    LOG.raw('Current Trainer: ' + trainerHelper.getTrainer().toString());
    LOG.raw('Current Market: ' + marketHelper.getMart().toString());
    LOG.raw('Current Gift Egg: ' + giftEggHelper.getGiftEgg().toString());
});

function handleConnection(conn) {    
    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;  
    LOG.log('CELIO SERVER: New client from %s. Waiting for name request.', remoteAddress);
    
    conn.on('data', onConnData);  
    conn.once('close', onConnClose);  
    conn.on('error', onConnError);
  
    function onConnData(d) {  
      let dataString = StringHelper.byteArrayToAscii(d);
      LOG.log('LANETTE CLIENT: %s', remoteAddress, dataString.substring(0,16));  
      tcpRequestHandler.handleRequest(conn, d);
    }
  
    function onConnClose() {  
      LOG.log('Connection from %s closed', remoteAddress);  
      tcpRequestHandler.closeConnection(conn);
    }
  
    function onConnError(err) {  
      LOG.log('Connection %s error: %s', remoteAddress, err.message);  
    }  

    conn.write('For the link to work, the Machine needs a special gemstone.');
}

function getIPv4() {

  var networkInterfaces = os.networkInterfaces();
  const results = []; 
  for (const name of Object.keys(networkInterfaces)) {
      for (const net of networkInterfaces[name]) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
          if (net.family === familyV4Value && !net.internal) {
              if (!results[name]) {
                  results[name] = [];
              }
              results.push(net.address);
          }
      }
  }

  return results.length == 0 ? "localhost" : results[0].replace(/['"]+/g, '');
}


