const express = require('express');
const bodyParser = require('body-parser');
// const basicAuth = require('express-basic-auth');
const app = express();
const baseDirectory = "web-src";

/**
 * Rather than adding a bad security, I've not added any. 
 * If you want one look up a recent tutorial and make sure you also handle the POST requests
 */
// app.use(basicAuth({
//     users: { rocketadmin: 'slowpoketail' },
//     challenge: true 
// }));

const jsonParser = bodyParser.json()
app.use(bodyParser.urlencoded({ extended: true }));

class WebServerHelper {

    static createWebServer(port, trainerHelper, marketHelper, giftEggHelper, tcpRequestHandler) {

        app.get('/', function (req, res) {
            res.sendFile( __dirname + "/" + baseDirectory + "/" + "index.html" );
        });

        app.get('/styles.css', function (req, res) {
            res.sendFile( __dirname + "/" + baseDirectory + "/" + "styles.css" );
        });

        app.get('/ui.js', function (req, res) {
            res.sendFile( __dirname + "/" + baseDirectory + "/" + "ui.js" );
        });

        app.get('/client-list', function (req, res) {
            res.json(Object.fromEntries(tcpRequestHandler.clientList));
        });

        app.get('/refresh-trainer', function (req, res) {
            console.log('GET to refresh trainer');
            res.json(trainerHelper.getTrainer());
        });

        app.post('/update-trainer', jsonParser, function(request, response) {
            console.log('POST to update trainer');
            console.log(request.body);
            response.writeHead(200, {'Content-Type': 'text/html'})
            trainerHelper.updateTrainer1Pokemon(request.body);
            console.log("New Trainer Data " + JSON.stringify(trainerHelper.getBattle1Pokemon()))
            response.end(JSON.stringify({'result': 'Data Updated'}));
        });

        app.get('/refresh-gift-egg', function (req, res) {
            console.log('GET to refresh gift egg');
            res.json(giftEggHelper.getGiftEgg());
        });


        app.post('/update-gift-egg', jsonParser, function(request, response) {
            console.log('POST to update gift egg');
            console.log(request.body);
            response.writeHead(200, {'Content-Type': 'text/html'})
            giftEggHelper.updateGiftEgg(request.body);
            console.log("New Gift Egg Data " + JSON.stringify(giftEggHelper.getGiftEgg()))
            response.end(JSON.stringify({'result': 'Data Updated'}));
        });

        app.get('/refresh-mart', function (req, res) {
            console.log('GET to refresh mart');
            res.json(marketHelper.getMart());
        });

        app.post('/update-mart', jsonParser, function(request, response) {
            console.log('POST to update mart');
            console.log(request.body);
            response.writeHead(200, {'Content-Type': 'text/html'})
            marketHelper.updateMart(request.body);
            console.log("New Mart Data " + JSON.stringify(marketHelper.getMart()))
            response.end(JSON.stringify({'result': 'Data Updated'}));
        });

        app.post('/send-message', jsonParser, function(request, response) {
            console.log('POST to send message');
            console.log(request.body);
            response.writeHead(200, {'Content-Type': 'text/html'})

            let clientId = request.body.clientId;
            let message = request.body.message;
            tcpRequestHandler.clientList.get(clientId).messages.push(message);
            
            console.log("Send message" + JSON.stringify(trainerHelper.getBattle1Pokemon()))
            response.end(JSON.stringify({'result': 'Message Sent'}));
        });

        app.use(express.static(baseDirectory));
        
        var server = app.listen(port, function () {
           var host = server.address().address
           var port = server.address().port
           
           console.log("\nWebserver Control UI listening at http://%s:%s", host, port)
        })
        
    }

}

module.exports = WebServerHelper;