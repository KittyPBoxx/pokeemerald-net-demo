/**
 * Test designed to run against a freshly restarted server. Running against a server where players have already connected will fail
 */
var net = require('net');

var serverAddr = '127.0.0.1';
var serverPort = 9000;

var FAST_FAIL = true; // Stop tests on the first failure

let player1Connected = false;
let player2Connected = false;

// Create a connection with on client 
var player1 = new net.Socket();
var player2 = new net.Socket();

class Validator {

    constructor(validationFunction) {
        this.validationFunction = validationFunction;
        this.passCount = 0;
        this.failCount = 0;
    }

    validate(data) {
        console.log(data);

        if (this.validationFunction(data)) {
            this.passCount++;
        } else {
            this.failCount++;
        }
    }

    updateValidationFunction(newValidationFunction) {
        console.log("Updating validation function " + newValidationFunction.name);
        this.validationFunction = newValidationFunction;
    }

}

var player1Validatior = new Validator(verifyInitialResponse);
var player2Validatior = new Validator(verifyInitialResponse);

player1.on('data', (data) => player1Validatior.validate(data));
player1.on('error', () => console.log("Failed to connect to server"));
player1.connect(serverPort, serverAddr, function() {
	console.log('Player 1 Connected');
    if (player2Connected) {
        runTests(player1, player2);
    } else {
        player1Connected = true;
    }
});

player2.on('data', (data) => player2Validatior.validate(data));
player2.on('error', () => console.log("Failed to connect to server"));
player2.connect(serverPort, serverAddr, function() {
	console.log('Player 2 Connected');
    if (player1Connected) {
        runTests(player1, player2);
    } else {
        player2Connected = true;
    }
});

async function runTests() {

    await sleep(500); 

    // Test server name
    console.log("Test server name");
    player1Validatior.updateValidationFunction(verifyServerNameResponse);
    player1.write(new Uint8Array([as("N"), as("R"), as("_")]));
    await sleep(500); 

    // Test Welcome message player 1
    console.log("Test Welcome message player 1");
    player1Validatior.updateValidationFunction(verifyFirstWelcomeMessageResponse);
    player1.write(new Uint8Array([as("W"), as("R"), as("_")]));
    await sleep(500); 
    
    // TEST - Setup player 1 data //
    console.log("Test setup player 1 data");
    player1Validatior.updateValidationFunction(verifyIgnoreResponse);                                                      
    player1.write(new Uint8Array([
    // PD_
       as("P"), as("D"), as("_"), 
    // Brandon                                              
       as("B"), as("r"), as("a"), as("n"), as("d"), as("o"), as("n"), 
    // NULL  [ 4 BYTE TRAINER ID  ]  BOY  
       0xFF, 0x01, 0x00, 0x00, 0x01, 0x00, 
    // Emerald Net 0.1.2  
       as("E"), as("m"), as("e"), as("r"), as("a"), as("l"), as("d"), as(" "), as("N"), as("e"), as("t"), as(" "), as("0"), as("."), as("1"), as("."), as("2"), as(" "), as(" "), as(" ")
    ]));
    await sleep(500); 

    // Test Welcome message player 2
    console.log("Test Welcome message player 2");
    player2Validatior.updateValidationFunction(verifySecondWelcomeMessageResponse);
    player2.write(new Uint8Array([as("W"), as("R"), as("_")]));
    await sleep(500); 

    // Test setup player 2 data
    console.log("Test setup player 2 data");
    player2Validatior.updateValidationFunction(verifyIgnoreResponse);
    //                                           
    player1.write(new Uint8Array([
    // PD_
       as("P"), as("D"), as("_"), 
    // May                                              
       as("M"), as("a"), as("y"), as("\0"), as("\0"), as("\0"), as("\0"), 
    // NULL  [ 4 BYTE TRAINER ID  ]  GIRL 
       0xFF, 0x05, 0x00, 0x00, 0x05, 0x01, 
    // Emerald Net 0.1.2  
       as("E"), as("m"), as("e"), as("r"), as("a"), as("l"), as("d"), as(" "), as("N"), as("e"), as("t"), as(" "), as("0"), as("."), as("1"), as("."), as("2"), as(" "), as(" "), as(" ")
    ]));
    await sleep(500); 

    // Test Mart Request
    // console.log("Test Mart Request");
    // player1Validatior.updateValidationFunction(verifyMartResponse);
    // player1.write(new Uint8Array(["M", "A", "_", "1"]));
    // await sleep(500); 

    // Test Gift Egg
    // console.log("Test Gift Egg");
    // player1Validatior.updateValidationFunction(verifyEggResponse);
    // player1.write(new Uint8Array(["G", "E", "_", "1"]));
    // await sleep(500); 

    // Test Post message without friend key
    // console.log("Test Post message without friend key");
    // player1Validatior.updateValidationFunction(verifyPostMessageNoFriendKeyResponse);
    // player1.write(new Uint8Array(["P", "M", "_", "0"]));
    // await sleep(500); 

    // Test read message without friend key
    // console.log("Test read message without friend key");
    // player2Validatior.updateValidationFunction(verifyReadMessageNoFriendKeyResponse);
    // player2.write(new Uint8Array(["R", "M", "_", "0"]));
    // await sleep(500); 

    // Test Post message with friend key
    // console.log("Test Post message with friend key");
    // player1Validatior.updateValidationFunction(verifyPostMessageFriendKeyResponse);
    // player1.write(new Uint8Array(["P", "M", "_", "1"]));
    // await sleep(500); 

    // Test read message with friend key
    // console.log("Test read message with friend key");
    // player2Validatior.updateValidationFunction(verifyReadMessageFriendKeyResponse);
    // player2.write(new Uint8Array(["R", "M", "_", "1"]));
    // await sleep(500); 

    // Test Download Battle
    // console.log("UNIMPLEMENTED: Test Download Battle");
    // TODO: implement me
    // await sleep(500); 

    // Test trade without friend key
    // console.log("UNIMPLEMENTED: Test trade without friend key");
    // TODO: implement me
    // await sleep(500); 

    // Test trade with friend key
    // console.log("UNIMPLEMENTED: Test trade with friend key");
    // TODO: implement me
    // await sleep(500); 

    console.log("\n");
    console.log("=====================================");
    console.log("=== RESULTS                       ===");
    console.log("=====================================");
    console.log("Pass Count:" + (player1Validatior.passCount + player2Validatior.passCount));
    console.log("Fail Count:" + (player1Validatior.failCount + player2Validatior.failCount));
    console.log("\n");

    player1.destroy();
    player2.destroy();
}

function verifyIgnoreResponse(data) {
    // Do nothing
}

function verifyInitialResponse(data) {
    let expected  = 'For the link to work, the Machine needs a special gemstone.';
	return assertTrue(() => data == expected,
               'Initial Response Correct',
               'Initial Response Failed \n Expected: ' + expected + "\n Actual: " + data); 
}

function verifyServerNameResponse(data) {
    let expected = "SN_Celio's Server";
	return assertTrue(() => data == expected,
               'Server Name Response Correct',
               'Server Name Response Failed \n Expected: ' + expected + "\n Actual: " + data); 
}

function verifyFirstWelcomeMessageResponse(data) {
    
    let expected = 
    [// MESSAGE_TYPE, MESSAGE_OFFSET, MESSAGE_LENGTH_BYTE_1, MESSAGE_LENGTH_BYTE_2, ASCII_UNDERSCORE 
        0x25, 0xf0, 0x00, 0x30, 0x5f,
    //  W     e     l     c     o     m     e     ' '   [ PLAYER ]  !     \n    
        0xd1, 0xd9, 0xe0, 0xd7, 0xe3, 0xe1, 0xd9, 0x00, 0xFD, 0x01, 0xAB, 0xFA, 
    //  N     o     ' '   o     n     e     ' '   e     l     s     e     ' '   i     s     ' '   o     n     l     i     n     e     ' '   y     e     t     .     NULL  
        0xc8, 0xe3, 0x00, 0xe3, 0xe2, 0xd9, 0x00, 0xd9, 0xe0, 0xe7, 0xd9, 0x00, 0xdd, 0xe7, 0x00, 0xe3, 0xe2, 0xe0, 0xdd, 0xe2, 0xd9, 0x00, 0xed, 0xd9, 0xe8, 0xb0, 0xff];
    return assertTrue(() => compHex(data, expected),
               'First Welcome Message Correct Response',
               'First Welcome Message Response Failed \n Expected: ' + toHexString(expected) + "\n Actual: " + toHexString(data)); 
}

function verifySecondWelcomeMessageResponse(data) {
    let expected = [
    //  MESSAGE_TYPE, MESSAGE_OFFSET, MESSAGE_LENGTH_BYTE_1, MESSAGE_LENGTH_BYTE_2, ASCII_UNDERSCORE 
        0x25, 0xf0, 0x00, 0x30, 0x5f,
    //  W     e     l     c     o     m     e     ' '   [ PLAYER ]  !     \n
        0xd1, 0xd9, 0xe0, 0xd7, 0xe3, 0xe1, 0xd9, 0x00, 0xFD, 0x01, 0xAB, 0xFA, 
    //  1     ' '   o     t     h     e     r     ' '   p     l     a     y     e     r     ' '   i     s     ' '   o     n     l     i     n     e     .     NULL  
        0xa2, 0x00, 0xe3, 0xe8, 0xdc, 0xd9, 0xe6, 0x00, 0xe4, 0xe0, 0xd5, 0xed, 0xd9, 0xe6, 0x00, 0xdd, 0xe7, 0x00, 0xe3, 0xe2, 0xe0, 0xdd, 0xe2, 0xd9, 0xb0, 0xff];
	return assertTrue(() => compHex(data, expected),
               'First Welcome Message Correct Response',
               'First Welcome Message Response Failed \n Expected: ' + toHexString(expected) + "\n Actual: " + toHexString(data)); 
}

function verifyMartResponse(data) {
}

function verifyEggResponse(data) {
}

function verifyPostMessageNoFriendKeyResponse(data) {
}

function verifyReadMessageNoFriendKeyResponse(data) {
}


function verifyPostMessageFriendKeyResponse(data) {
}

function verifyReadMessageFriendKeyResponse(data) {
}

function verifyDownloadBattleResponse(data) {
}

function verifyTradeNoFriendKeyPlayer1Response(data) {
}

function verifyTradeNoFriendKeyPlayer2Response(data) {
}

function verifyTradeFriendKeyPlayer1Response(data) {
}

function assertTrue(predicate, successMessage, failMessage) {
    if (!predicate()) {
        if (FAST_FAIL) {
            throw Error(failMessage);
        } else {
            console.log(failMessage);
        }
        return false;
    } else {
        console.log(successMessage);
        return true;
    }
}

function compHex(val1, val2) {
    return JSON.stringify(toHexString(val1)) == JSON.stringify(toHexString(val2));
}

function toHexString(val) {
    return [...val].map(i => "0x" + i.toString(16));
}

function as(char) {
    return char.charCodeAt(0);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}