/**
 * Test designed to run against a freshly restarted server. Running against a server where players have already connected will fail
 */
var net = require('net');

var serverAddr = '127.0.0.1';
var serverPort = 9000;

const FAST_FAIL = true; // Stop tests on the first failure
const BETWEEN_TEST_DELAY = 100; // ms

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

    let testsRun = 0;
    await sleep(BETWEEN_TEST_DELAY); 

    // Test server name
    console.log("Test server name");
    testsRun++;
    player1Validatior.updateValidationFunction(verifyServerNameResponse);
    player1.write(new Uint8Array([as("N"), as("R"), as("_")]));
    await sleep(BETWEEN_TEST_DELAY); 

    // Test Welcome message player 1
    console.log("Test Welcome message player 1");
    testsRun++;
    player1Validatior.updateValidationFunction(verifyFirstWelcomeMessageResponse);
    player1.write(new Uint8Array([as("W"), as("R"), as("_")]));
    await sleep(BETWEEN_TEST_DELAY); 
    
    // TEST - Setup player 1 data //
    console.log("Test setup player 1 data");
    testsRun++;
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
    await sleep(BETWEEN_TEST_DELAY); 

    // Test Welcome message player 2
    console.log("Test Welcome message player 2");
    testsRun++;
    player2Validatior.updateValidationFunction(verifySecondWelcomeMessageResponse);
    player2.write(new Uint8Array([as("W"), as("R"), as("_")]));
    await sleep(BETWEEN_TEST_DELAY); 

    // Test setup player 2 data
    console.log("Test setup player 2 data");
    testsRun++;
    player2Validatior.updateValidationFunction(verifyIgnoreResponse);
    //                                           
    player2.write(new Uint8Array([
    // PD_
       as("P"), as("D"), as("_"), 
    // May                                              
       as("M"), as("a"), as("y"), as("\0"), as("\0"), as("\0"), as("\0"), 
    // NULL  [ 4 BYTE TRAINER ID  ]  GIRL 
       0xFF, 0x05, 0x00, 0x00, 0x05, 0x01, 
    // Emerald Net 0.1.2  
       as("E"), as("m"), as("e"), as("r"), as("a"), as("l"), as("d"), as(" "), as("N"), as("e"), as("t"), as(" "), as("0"), as("."), as("1"), as("."), as("2"), as(" "), as(" "), as(" ")
    ]));
    await sleep(BETWEEN_TEST_DELAY); 

    // Test Mart Request
    console.log("Test Mart Request");
    testsRun++;
    player1Validatior.updateValidationFunction(verifyMartResponse);
    player1.write(new Uint8Array([as("M"), as("A"), as("_"), as("1")]));
    await sleep(BETWEEN_TEST_DELAY); 

    // Test Gift Egg
    console.log("Test Gift Egg");
    testsRun++;
    player1Validatior.updateValidationFunction(verifyEggResponse);
    player1.write(new Uint8Array([as("G"), as("E"), as("_"), as("1")]));
    await sleep(BETWEEN_TEST_DELAY); 

    // TODO: EASY_CHAT word bytes are probably wrong an need checking

    // Test Post message without friend key
    console.log("Test Post message without friend key");
    testsRun++;
    player1Validatior.updateValidationFunction(verifyPostMessageNoFriendKeyResponse);
    player1.write(new Uint8Array([as("P"), as("M"), as("_"), as("0"),
    // Blank Friend code 
       0x00, 0x00, 0x00, 0x00,
    // [ EC_RED  ] [EC_GREEN ] [ EC_GOLD ] [ EC_LEAF]
       0x13, 0x02, 0x14, 0x02, 0x17, 0x02, 0x18, 0x02  
    ]));
    await sleep(BETWEEN_TEST_DELAY); 

    // Test read message without friend key
    console.log("Test read message without friend key");
    testsRun++;
    player2Validatior.updateValidationFunction(verifyReadMessageNoFriendKeyResponse);
    player2.write(new Uint8Array([as("R"), as("M"), as("_"), as("0")]));
    await sleep(BETWEEN_TEST_DELAY); 

    // Test Read message no new messages
    console.log("Test read message when no new messages");
    testsRun++;
    player2Validatior.updateValidationFunction(verifyReadMessageNoNewMessage);
    player2.write(new Uint8Array([as("R"), as("M"), as("_"), as("0")]));
    await sleep(BETWEEN_TEST_DELAY); 

    // Test Post message with friend key
    console.log("Test Post message with friend key");
    testsRun++;
    player1Validatior.updateValidationFunction(verifyPostMessageFriendKeyResponse);
    player1.write(new Uint8Array([as("P"), as("M"), as("_"), as("1"),
    // 50,0,50,0 Friend code 
       0x50, 0x00, 0x50, 0x00,
    // [ EC_RED  ] [EC_GREEN ] [ EC_GOLD ] [ EC_LEAF]
       0x13, 0x02, 0x14, 0x02, 0x17, 0x02, 0x18, 0x02  
    ]));
    await sleep(500); 

    // Test read message with friend key
    console.log("Test read message with friend key");
    testsRun++;
    player2Validatior.updateValidationFunction(verifyReadMessageFriendKeyResponse);
    player2.write(new Uint8Array([as("R"), as("M"), as("_"), as("1"),
    // 50,0,50,0 Friend code 
       0x50, 0x00, 0x50, 0x00,
    ]));
    await sleep(500); 

    // Test Download Battle
    // console.log("UNIMPLEMENTED: Test Download Battle");
    // testsRun++;
    // TODO: implement me
    // await sleep(500); 

    // Test trade without friend key
    // console.log("UNIMPLEMENTED: Test trade without friend key");
    // testsRun++;
    // TODO: implement me
    // await sleep(500); 

    // Test trade with friend key
    // console.log("UNIMPLEMENTED: Test trade with friend key");
    // testsRun++;
    // TODO: implement me
    // await sleep(500); 

    console.log("\n");
    console.log("=====================================");
    console.log("=== RESULTS                       ===");
    console.log("=====================================");
    console.log("Pass Count:" + (player1Validatior.passCount + player2Validatior.passCount));
    console.log("Fail Count:" + (player1Validatior.failCount + player2Validatior.failCount));

    if (testsRun - (player1Validatior.passCount + player2Validatior.passCount + player1Validatior.failCount + player2Validatior.failCount) > 0) {
        console.log("\nWARNING - Some tests did not finish");   
    } else {
        console.log("\nAll tests have finished");
    }

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
    let expected = [
        //  MESSAGE_TYPE, MESSAGE_OFFSET, MESSAGE_LENGTH_BYTE_1, MESSAGE_LENGTH_BYTE_2, ASCII_UNDERSCORE 
            0x25, 0xf0, 0x00, 0x10, 0x5f,
        //  [B JUICE ]  [ENIGMA   ] [MYSTIC T ]  [EON T   ]  [AURORA T]  [OLDSEA MP]  
            0x2C, 0x00, 0xAF, 0x00, 0x72, 0x01,  0x13, 0x01, 0x73, 0x01, 0x78, 0x01];
    return assertTrue(() => compHex(data, expected),
    'Mart Message Correct Response',
    'Mart Message Response Failed \n Expected: ' + toHexString(expected) + "\n Actual: " + toHexString(data)); 
}

function verifyEggResponse(data) {
    let expected = [
        //  MESSAGE_TYPE, MESSAGE_OFFSET, MESSAGE_LENGTH_BYTE_1, MESSAGE_LENGTH_BYTE_2, ASCII_UNDERSCORE 
            0x25, 0xf0, 0x00, 0x04, 0x5f,
        //  [ PICHU   ] [ SURF    ]
            0xAC, 0x00, 0x39, 0x00];
    return assertTrue(() => compHex(data, expected),
    'Egg Message Correct Response',
    'Egg Message Response Failed \n Expected: ' + toHexString(expected) + "\n Actual: " + toHexString(data)); 
}

function verifyPostMessageNoFriendKeyResponse(data) {
    let expected = [
        //  MESSAGE_TYPE, MESSAGE_OFFSET, MESSAGE_LENGTH_BYTE_1, MESSAGE_LENGTH_BYTE_2, ASCII_UNDERSCORE 
            0x25, 0xf0, 0x00, 0x02, 0x5f,
        //  200  [No FC]
            0xC8, 0x00];
    return assertTrue(() => compHex(data, expected),
    'Post Mail No FC Message Correct Response',
    'Post Mail No FC Message Response Failed \n Expected: ' + toHexString(expected) + "\n Actual: " + toHexString(data)); 
}

function verifyReadMessageNoFriendKeyResponse(data) {
    let expected = [
        //  MESSAGE_TYPE, MESSAGE_OFFSET, MESSAGE_LENGTH_BYTE_1, MESSAGE_LENGTH_BYTE_2, ASCII_UNDERSCORE 
            0x25, 0xf0, 0x00, 0x10, 0x5f,
        // B     r     a     n     d     o     n     END
           0xBC, 0xE6, 0xD5, 0xE2, 0xD8, 0xE3, 0xE2, 0xFF,
        // [ EC_RED  ] [EC_GREEN ] [ EC_GOLD ] [ EC_LEAF ]
           0x13, 0x02, 0x14, 0x02, 0x17, 0x02, 0x18, 0x02];
    return assertTrue(() => compHex(data, expected),
    'Read Mail No FC Message Correct Response',
    'Read Mail No FC Message Response Failed \n Expected: ' + toHexString(expected) + "\n Actual: " + toHexString(data)); 
}

function verifyReadMessageNoNewMessage(data) {
    let expected = [
        //  MESSAGE_TYPE, MESSAGE_OFFSET, MESSAGE_LENGTH_BYTE_1, MESSAGE_LENGTH_BYTE_2, ASCII_UNDERSCORE, NULL, NULL 
            0x25, 0xf0, 0x00, 0x02, 0x5f, 0xFF, 0xFF];
    return assertTrue(() => compHex(data, expected),
    'Read Mail No New Message Correct Response',
    'Read Mail No New Message Response Failed \n Expected: ' + toHexString(expected) + "\n Actual: " + toHexString(data)); 
}

function verifyPostMessageFriendKeyResponse(data) {
    let expected = [
        //  MESSAGE_TYPE, MESSAGE_OFFSET, MESSAGE_LENGTH_BYTE_1, MESSAGE_LENGTH_BYTE_2, ASCII_UNDERSCORE 
            0x25, 0xf0, 0x00, 0x02, 0x5f,
        //  200  [With FC]
            0xC8, 0x01];
    return assertTrue(() => compHex(data, expected),
    'Post Mail With FC Message Correct Response',
    'Post Mail With FC Message Response Failed \n Expected: ' + toHexString(expected) + "\n Actual: " + toHexString(data)); 
}

function verifyReadMessageFriendKeyResponse(data) {
    let expected = [
        //  MESSAGE_TYPE, MESSAGE_OFFSET, MESSAGE_LENGTH_BYTE_1, MESSAGE_LENGTH_BYTE_2, ASCII_UNDERSCORE 
            0x25, 0xf0, 0x00, 0x10, 0x5f,
        // B     r     a     n     d     o     n     END
           0xBC, 0xE6, 0xD5, 0xE2, 0xD8, 0xE3, 0xE2, 0xFF,
        // [ EC_RED  ] [EC_GREEN ] [ EC_GOLD ] [ EC_LEAF ]
           0x13, 0x02, 0x14, 0x02, 0x17, 0x02, 0x18, 0x02];
    return assertTrue(() => compHex(data, expected),
    'Read Mail With FC Message Correct Response',
    'Read Mail With FC Message Response Failed \n Expected: ' + toHexString(expected) + "\n Actual: " + toHexString(data)); 
}

function verifyDownloadBattleResponse(data) {
    throw new Error("unimplemented method");
}

function verifyTradeNoFriendKeyPlayer1Response(data) {
    throw new Error("unimplemented method");
}

function verifyTradeNoFriendKeyPlayer2Response(data) {
    throw new Error("unimplemented method");
}

function verifyTradeFriendKeyPlayer1Response(data) {
    throw new Error("unimplemented method");
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