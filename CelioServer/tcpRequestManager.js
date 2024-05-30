var StringHelper = require('./pokeString.js');

const WELCOME_MESSAGE = "Celio: Shinx of black quartz, judge\\my preview.";
var SERVER_NAME = "Celio's Server"

// Connection Requests
const SERVER_NAME_REQUEST        = StringHelper.asciiToByteArray("NR");
const WELCOME_MESSAGE_REQUEST    = StringHelper.asciiToByteArray("WR");
const PLAYER_DATA                = StringHelper.asciiToByteArray("PD");
// Ereader battle
const BATTLE_REQUEST             = StringHelper.asciiToByteArray("BA");
// Mart
const MART_REQUEST               = StringHelper.asciiToByteArray("MA");
// Gift Egg
const GIFT_EGG_REQUEST           = StringHelper.asciiToByteArray("GE");
// Mail
const SEND_MAIL_REQUEST          = StringHelper.asciiToByteArray("SM"); // Not yet implimented
const RECEIVE_MAIL_REQUEST       = StringHelper.asciiToByteArray("RM"); // Not yet implimented
// Wonder Trade
const TRADE_REQUEST              = StringHelper.asciiToByteArray("TR");

const TRADING_STATE_NONE     = 0;
const TRADING_STATE_OFFERING = 2;
const TRADING_STATE_ACCEPTED = 3;

class TcpRequestHelper {

    static createRequestHandler(trainerHelper, marketHelper, giftEggHelper)
    {
        const requestHandler = new RequestHandler();

        requestHandler.registerHandler(SERVER_NAME_REQUEST, (conn, data, clientList) => {
            console.log('CELIO SERVER: Sending message %s', SERVER_NAME);  
            conn.write("SN_" + SERVER_NAME);
        });
          
        requestHandler.registerHandler(WELCOME_MESSAGE_REQUEST, (conn, data, clientList) => {
            let playersConnectedMsg = ""; 
            
            if (clientList.size < 1) {
                playersConnectedMsg = "No one else is online yet.";
            } else if (clientList.size == 1) {
                playersConnectedMsg = "1 other player is online.";
            } else {
                playersConnectedMsg = clientList.size + " other players are online.";
            }
            
            let welcomeMessage = new Message(0xF0, 0x30, StringHelper.convertMessageToHex("Welcome #!\\" + playersConnectedMsg));
            console.log('CELIO SERVER: Sending message %s', welcomeMessage.byteArray());
            sendMessage(conn, welcomeMessage);
        });
          
        requestHandler.registerHandler(PLAYER_DATA, (conn, data, clientList) => {
            let dataArray = new Uint8Array(data.length);
            dataArray.set(data);
          
            conn.playerName = [...dataArray.subarray(0, 8)].map(c => String.fromCharCode(c) == "\x00" ? "" : String.fromCharCode(c)).join("");
            conn.trainerId  = (((dataArray[8] & 0xff) << 8) | (dataArray[8 + 1] & 0xff));
            conn.gender     = dataArray[8 + 2] == 1 ? "GIRL" : "BOY";
            conn.game       = [...dataArray.subarray(8 + 2 + 1, data.length)].map(c => String.fromCharCode(c) == "\x00" ? "" : String.fromCharCode(c)).join("");
          
            conn.lastSentMail = "";
            conn.unreadMail = [];

            // TODO: add a hash of client list and remote address to the client list with the value being the conn and set all the right values on the conn
            requestHandler.clientList.set(conn.trainerId, {"name"         : conn.playerName, 
                                                           "id"           : conn.trainerId,
                                                           "gender"       : conn.gender,
                                                           "game"         : conn.game, 
                                                           "lastSentMail" : conn.lastSentMail,
                                                           "unreadMail"   : conn.unreadMail,
                                                           "tradeState"   : TRADING_STATE_NONE});
          
            console.log('GAME: %s | PLAYER: %s | GENDER: %s | TRAINER_ID %s', conn.game, conn.playerName, conn.gender, conn.trainerId);
        });
          
          
        var battleMessage = new Message(0xF0, 0x10 * 3, trainerHelper.getTrainer().get3MonTeam());
        requestHandler.registerHandler(BATTLE_REQUEST, (conn, data, clientList) => {
            battleMessage = new Message(0xF0, 0x10 * 3, trainerHelper.getTrainer().get3MonTeam());
            console.log('CELIO SERVER: Sending Battle Data');  // TODO make this array longer
            console.log("RAW HEX: " + Array.apply([], battleMessage.content).map(x => "0x" +  x.toString(16)).join(","));
            sendMessage(conn, battleMessage);
        });
          
        var martMessage = new Message(0xF0, 0x10, marketHelper.createDefault().getDataArray());
        requestHandler.registerHandler(MART_REQUEST, (conn, data, clientList) => {
            martMessage = new Message(0xF0, 0x10, marketHelper.getMart().getDataArray());
            console.log('CELIO SERVER: Sending Mart Data');
            console.log("RAW HEX: " + Array.apply([], martMessage.content).map(x => "0x" +  x.toString(16)).join(","));
            sendMessage(conn, martMessage);
        });
          
        var giftEggMessage = new Message(0xF0, 0x4, giftEggHelper.createDefault().getDataArray());
        requestHandler.registerHandler(GIFT_EGG_REQUEST, (conn, data, clientList) => {
            giftEggMessage = new Message(0xF0, 0x4, giftEggHelper.getGiftEgg().getDataArray(conn.trainerId));
            console.log('CELIO SERVER: Sending Gift Egg Data');
            console.log("RAW HEX: " + Array.apply([], giftEggMessage.content).map(x => "0x" +  x.toString(16)).join(","));
            //sendMessage(conn, giftEggMessage);
        });   
    
        requestHandler.registerHandler(SEND_MAIL_REQUEST, (conn, data, clientList) => {
            // Get all the other players connected in client list and push a value into their mail buffer
            console.log("Not yet implimented");
        });
        requestHandler.registerHandler(RECEIVE_MAIL_REQUEST, (conn, data, clientList) => {
            // If another player cant be found trading return the error stuff
            // if a parter can be found switch the data and download
            console.log("Not yet implimented");
        });

        requestHandler.registerHandler(TRADE_REQUEST, (conn, data, clientList) => {
            console.log("Trade request");

            let friendKey = new Uint8Array(4);
            if (data[0] == "1".charCodeAt(0)) {
                console.log("Using Friend link code: " + data[1] + data[2] + data[3] + data[4]);
                friendKey[0] = data[1];
                friendKey[1] = data[2];
                friendKey[2] = data[3];
                friendKey[3] = data[4];
            }

            // 100 bytes is the size of a mon
            // The server was sent 16 bytes + the mon. By now it has trimmed 3 bytes off the start
            let dataArray = new Uint8Array(100 + 16);
            dataArray.set(new Uint8Array(StringHelper.convertMessageToHex(conn.playerName)), 0);
            dataArray.set(data.slice(13, data.length), 16);

            let candidateTrade = [...clientList.values()].filter(client => client.tradeState == TRADING_STATE_OFFERING && JSON.stringify(client.friendKey) == JSON.stringify(friendKey))[0];
            if (candidateTrade) {
                // Someone else already offering
                if (clientList.get(candidateTrade.id))
                    clientList.get(candidateTrade.id).tradeState = TRADING_STATE_ACCEPTED;

                // Switch our data and return    
                candidateTrade.tradeResponse = new Message(0xF0, 100 + 16, dataArray);
                sendMessage(conn, candidateTrade.tradeOffer);

                if (clientList.get(candidateTrade.id))
                    clientList.get(candidateTrade.id).tradeState = TRADING_STATE_NONE;

            } else {
                // We are the first, offer ourselves
                clientList.get(conn.trainerId).tradeOffer = new Message(0xF0, 100 + 16, dataArray);
                clientList.get(conn.trainerId).tradeResponse = new Message(0xF0, 100 + 16, new Uint8Array(100 + 16));
                clientList.get(conn.trainerId).friendKey = friendKey;
                clientList.get(conn.trainerId).tradeState = TRADING_STATE_OFFERING;
                new Promise(resolve => setTimeout(resolve, 3000)).then(() => {

                    if (clientList.get(conn.trainerId).tradeState == TRADING_STATE_OFFERING) {

                        // The offer was not accepted. Wait another 100 ms just incase
                        clientList.get(conn.trainerId).tradeState = TRADING_STATE_NONE;
                        new Promise(resolve => setTimeout(resolve, 100)).then(() => {

                            sendMessage(conn, clientList.get(conn.trainerId).tradeResponse);

                        });

                    } else {

                        // Offer was accepted we can return right away
                        sendMessage(conn, clientList.get(conn.trainerId).tradeResponse);

                    }

                });

            }

            console.log("Mon from %s: %s", conn.trainerId, dataArray);
        });

        return requestHandler;
    }


}

class Message {
    constructor(virtualBufferNo, size, content) {
        this.virtualBufferNo = virtualBufferNo; 
        this.size = size;
        this.content = content;
        this.identifier = 0x25;
        this.utf8UnderScore = 0x5F;
    }
  
    byteArray() {
      let metaDataBuffer = new Uint8Array(5);
      let contentBuffer = new Uint8Array(this.content);
  
      metaDataBuffer[0] = this.identifier;
      metaDataBuffer[1] = this.virtualBufferNo; 
      metaDataBuffer[2] = this.size >> 8;
      metaDataBuffer[3] = this.size & 0xff;
      metaDataBuffer[4] = this.utf8UnderScore;
  
      var mergedArray = new Uint8Array(metaDataBuffer.length + contentBuffer.length);
      mergedArray.set(metaDataBuffer);
      mergedArray.set(contentBuffer, metaDataBuffer.length);
  
      return mergedArray;
    }
}

class RequestHandler {
    constructor() {
      this.handlers = new Map();
      this.clientList = new Map();
    }
  
    /**
     * When message come in they are split on the first instance of ascii '_' i.e the first byte that is 0x5F
     * Any bytes before that are treated as the message identifier
     * @param identifier and array of 8-bit values
     * @param handlerFunction a function to handle incomming data with args: 
     *    conn - the current connection
     *    data - the incomming data
     *    clientList - map of all the other connected clients
     */
    registerHandler(identifier, handlerFunction) {
      this.handlers.set(identifier.join(""), handlerFunction);
    }
  
    handleRequest(conn, data) {
      let dataString = StringHelper.byteArrayToAscii(data);
      let delimiterIndex = dataString.indexOf('_');
      let messageKey = StringHelper.asciiToByteArray(dataString.substring(0,delimiterIndex)).join("");
      let handler = this.handlers.get(messageKey);
  
      if (handler) {
        handler(conn, data.slice(delimiterIndex + 1, data.length), this.clientList);
      } else {
        conn.write(new Uint8Array(1));
        console.log("UNKNOWN MSG KEY (length %s):\nASCII:%s", data.length, StringHelper.asciiToByteArray(dataString.substring(0,delimiterIndex)).join(","));
        console.log("RAW HEX: " + Array.apply([], data).map(x => "0x" +  x.toString(16)).join(","));
      }
    }

    closeConnection(conn) {
        this.clientList.delete(conn.trainerId);
    }

}

function sendMessage(conn, message) {
    conn.write(message.byteArray());
}

module.exports = TcpRequestHelper;