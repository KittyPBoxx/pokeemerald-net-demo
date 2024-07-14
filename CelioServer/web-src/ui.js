
var gtargetPlayerId;

function setupPage() {

    document.querySelectorAll('[data-autofill]').forEach( e => {

        let autofillConent = e.getAttribute("data-autofill");

        if (autofillConent == 'species') {
            e.innerHTML = speciesList;
        } else if (autofillConent == 'moves') {
            e.innerHTML = movesList;
        } else if (autofillConent == 'battleItems') {
            e.innerHTML = battleItemsList;
        } else if (autofillConent == 'items') {
            e.innerHTML = itemsList;
        }

    });

    $('.ui.dropdown').dropdown();

    $('.ui.dropdown.mail-words').dropdown({
        clearable: true,
        maxSelections: 9,
        allowReselection: true,
        values: createEasyFChatWordSelectionListWithDuplicates()
    });

    refreshClientList();
    refreshTrainer();
    refreshMart();
    refreshGiftEgg();

    setInterval(refreshClientList, 1000 * 15)
}

// It seems we need to call this each time the value is changed otherwise the value dosn't get restricted correctly
function limitMailSelections() {
    $('.ui.dropdown.mail-words').dropdown({
        maxSelections: 9,
    });
}

// The ui library only allows dropdown values to be selected once so we have to duplicate the values to allow a word to be selected multiple times
// Max out at 3 instances of a word otherwise the dropdown list gets very laggy
function createEasyFChatWordSelectionListWithDuplicates() {
    return [...words.entries()].map(a => { return { 'name': a[1], 'value': a[0]} })
    .concat([...words.entries()].map(a => { return { 'name': a[1], 'value': a[0] + "-2"} }))
    .concat([...words.entries()].map(a => { return { 'name': a[1], 'value': a[0] + "-3"} }))
}

function refreshDropdowns() {
    [...document.querySelectorAll('.ui.dropdown')].forEach(e => { $(e).dropdown('set selected', e.querySelector("input[type='hidden']") && e.querySelector("input[type='hidden']").value) })
}

function updateSprite(element, imageId) {
    document.getElementById(imageId).src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + speciesToNationalDex(parseInt(element.value)) + ".png";
}

function updateItemSprite(element, imageId) {
    let src = '';

    let itemString = itemStrings.get(parseInt(element.value));
    if (parseInt(element.value) == 0) {
        src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
    } else if (itemString.includes("tm") && itemString.length == 4) {
        src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png"
    } else {
        src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/" + itemString + ".png"
    }

    document.getElementById(imageId).src = src;
}

function refreshClientList() {
    (async () => {
        try {
            const rawResponse = await fetch('/client-list', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            });

            const content = await rawResponse.json();
            //console.log("Refreshing Client List " + JSON.stringify(content));
            const clientMap = new Map(Object.entries(content));
    
            let titleElement = document.getElementById("connectedPlayersTitle");
            titleElement.innerHTML = titleElement.innerHTML.split("-")[0] + " - " + clientMap.size + " Connected";
    
            let bodyElement = document.getElementById("connectedPlayersBody");
            bodyElement.innerHTML = "";
            let finalBody = "";
            clientMap.forEach(c => {
                let row = document.createElement("tr");
                row.innerHTML  = "<td>" + c.name                                                           + "</td>";
                row.innerHTML += "<td>" + c.trainerId                                                      + "</td>";
                row.innerHTML += "<td>" + c.game                                                           + "</td>";
                row.innerHTML += "<td>" + c.gender                                                         + "</td>";
                row.innerHTML += "<td>" + (c.mail ? easyChatToText(c.mail.message.data.slice(2)) : "N/A")  + "</td>";
                row.innerHTML += "<td><button class='ui secondary button' onClick='sendMailPopup(\"" + c.id + "\")'>Send Mail</button></td>";
                finalBody +=  row.outerHTML;
            });
            bodyElement.innerHTML = finalBody;
        } catch (error) {
            console.warn("Could not refresh clients");
        }
    })();
}

function sendMailPopup(trainerId) {
    gtargetPlayerId = trainerId;
    $('#mail-modal').modal('show');
}

function postModMail() {
    var mailWordsBytes = [12, 8, 12, 8, 12, 8, 12, 8, 12, 8, 12, 8, 12, 8, 12, 8, 12, 8]; // Empty easychat words
    var mailWords = [... $('.ui.dropdown.mail-words').find(":selected")].map(i => i.getAttribute("value").split("-")[0]);

    for (i = 0; i < mailWords.length; i++) {
        mailWordsBytes[2 * i] = (mailWords[i] >> 8);
        mailWordsBytes[(2 * i) + 1] = (mailWords[i] & 0xFF);
    }

    (async () => {
        const rawResponse = await fetch('/post-mod-mail', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "id": gtargetPlayerId, "mail" : mailWordsBytes})
        });
        const content = await rawResponse.json();
      
        console.log(content);
    })();
}

function refreshTrainer() {
    (async () => {
        const rawResponse = await fetch('/refresh-trainer', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        const trainer = await rawResponse.json();
        
        document.getElementById("mon1-species").value   = trainer.party.slot1.species || 0;
        document.getElementById("mon1-nickname").value  = trainer.party.slot1.nickname;
        document.getElementById("mon1-level").value     = trainer.party.slot1.level || 1;
        document.getElementById("mon1-item").value      = trainer.party.slot1.heldItem || 0;
        document.getElementById("mon1-move1").value     = trainer.party.slot1.moves.slot1 || 0;
        document.getElementById("mon1-move2").value     = trainer.party.slot1.moves.slot2 || 0;
        document.getElementById("mon1-move3").value     = trainer.party.slot1.moves.slot3 || 0;
        document.getElementById("mon1-move4").value     = trainer.party.slot1.moves.slot4 || 0;
    
        document.getElementById("mon2-species").value   = trainer.party.slot2.species || 0;
        document.getElementById("mon2-nickname").value  = trainer.party.slot2.nickname;
        document.getElementById("mon2-level").value     = trainer.party.slot2.level || 1;
        document.getElementById("mon2-item").value      = trainer.party.slot2.heldItem || 0;
        document.getElementById("mon2-move1").value     = trainer.party.slot2.moves.slot1 || 0;
        document.getElementById("mon2-move2").value     = trainer.party.slot2.moves.slot2 || 0;
        document.getElementById("mon2-move3").value     = trainer.party.slot2.moves.slot3 || 0;
        document.getElementById("mon2-move4").value     = trainer.party.slot2.moves.slot4 || 0;
    
        document.getElementById("mon3-species").value   = trainer.party.slot3.species || 0;
        document.getElementById("mon3-nickname").value  = trainer.party.slot3.nickname;
        document.getElementById("mon3-level").value     = trainer.party.slot3.level || 1;
        document.getElementById("mon3-item").value      = trainer.party.slot3.heldItem || 0;
        document.getElementById("mon3-move1").value     = trainer.party.slot3.moves.slot1 || 0;
        document.getElementById("mon3-move2").value     = trainer.party.slot3.moves.slot2 || 0;
        document.getElementById("mon3-move3").value     = trainer.party.slot3.moves.slot3 || 0;
        document.getElementById("mon3-move4").value     = trainer.party.slot3.moves.slot4 || 0;

        $('.ui.dropdown').dropdown();
        document.getElementById("mon1-species").dispatchEvent(new Event("change"));
        document.getElementById("mon2-species").dispatchEvent(new Event("change"));
        document.getElementById("mon3-species").dispatchEvent(new Event("change"));
        document.getElementById("mon1-item").dispatchEvent(new Event("change"));
        document.getElementById("mon2-item").dispatchEvent(new Event("change"));
        document.getElementById("mon3-item").dispatchEvent(new Event("change"));
        refreshDropdowns();
    })();
}


function refreshMart() {

    (async () => {
        const rawResponse = await fetch('/refresh-mart', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        const mart = await rawResponse.json();
        
        document.getElementById("mart1-item").value = '' + (mart.item1 || 0);
        document.getElementById("mart2-item").value = '' + (mart.item2 || 0);
        document.getElementById("mart3-item").value = '' + (mart.item3 || 0);
        document.getElementById("mart4-item").value = '' + (mart.item4 || 0);
        document.getElementById("mart5-item").value = '' + (mart.item5 || 0);
        document.getElementById("mart6-item").value = '' + (mart.item6 || 0);

        $('.ui.dropdown').dropdown();
        document.getElementById("mart1-item").dispatchEvent(new Event("change"));
        document.getElementById("mart2-item").dispatchEvent(new Event("change"));
        document.getElementById("mart3-item").dispatchEvent(new Event("change"));
        document.getElementById("mart4-item").dispatchEvent(new Event("change"));
        document.getElementById("mart5-item").dispatchEvent(new Event("change"));
        document.getElementById("mart6-item").dispatchEvent(new Event("change"));
        refreshDropdowns();

    })();

}

function refreshGiftEgg() {

    (async () => {
        const rawResponse = await fetch('/refresh-gift-egg', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        const egg = await rawResponse.json();
        
        document.getElementById("egg-species").value = egg.species || 0;
        document.getElementById("egg-move").value = egg.specialMove || 0;

        $('.ui.dropdown').dropdown();
        document.getElementById("egg-species").dispatchEvent(new Event("change"));
        refreshDropdowns();

    })();

}

function updateTrainer() {

    let party = {};

    let mon1Data = {};
    mon1Data.species  = parseInt(document.getElementById("mon1-species").value);
    mon1Data.nickname = document.getElementById("mon1-nickname").value;
    mon1Data.level    = parseInt(document.getElementById("mon1-level").value);
    mon1Data.item     = parseInt(document.getElementById("mon1-item").value);
    mon1Data.move1    = parseInt(document.getElementById("mon1-move1").value);
    mon1Data.move2    = parseInt(document.getElementById("mon1-move2").value);
    mon1Data.move3    = parseInt(document.getElementById("mon1-move3").value);
    mon1Data.move4    = parseInt(document.getElementById("mon1-move4").value);

    let mon2Data = {};
    mon2Data.species  = parseInt(document.getElementById("mon2-species").value);
    mon2Data.nickname = document.getElementById("mon2-nickname").value;
    mon2Data.level    = parseInt(document.getElementById("mon2-level").value);
    mon2Data.item     = parseInt(document.getElementById("mon2-item").value);
    mon2Data.move1    = parseInt(document.getElementById("mon2-move1").value);
    mon2Data.move2    = parseInt(document.getElementById("mon2-move2").value);
    mon2Data.move3    = parseInt(document.getElementById("mon2-move3").value);
    mon2Data.move4    = parseInt(document.getElementById("mon2-move4").value);

    let mon3Data = {};
    mon3Data.species  = parseInt(document.getElementById("mon3-species").value);
    mon3Data.nickname = document.getElementById("mon3-nickname").value;
    mon3Data.level    = parseInt(document.getElementById("mon3-level").value);
    mon3Data.item     = parseInt(document.getElementById("mon3-item").value);
    mon3Data.move1    = parseInt(document.getElementById("mon3-move1").value);
    mon3Data.move2    = parseInt(document.getElementById("mon3-move2").value);
    mon3Data.move3    = parseInt(document.getElementById("mon3-move3").value);
    mon3Data.move4    = parseInt(document.getElementById("mon3-move4").value);


    party.mon1Data = mon1Data;
    party.mon2Data = mon2Data;
    party.mon3Data = mon3Data;

    console.log(JSON.stringify(party));

    (async () => {
        const rawResponse = await fetch('/update-trainer', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(party)
        });
        const content = await rawResponse.json();
      
        console.log(content);
    })();
}

function updateMart() {

    let mart = {};

    mart.item1 = parseInt(document.getElementById("mart1-item").value);
    mart.item2 = parseInt(document.getElementById("mart2-item").value);
    mart.item3 = parseInt(document.getElementById("mart3-item").value);
    mart.item4 = parseInt(document.getElementById("mart4-item").value);
    mart.item5 = parseInt(document.getElementById("mart5-item").value);
    mart.item6 = parseInt(document.getElementById("mart6-item").value);

    (async () => {
        const rawResponse = await fetch('/update-mart', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mart)
        });
        const content = await rawResponse.json();
      
        console.log(content);
    })();

}

function updateGiftEgg() {

    let egg = {};

    egg.species = parseInt(document.getElementById("egg-species").value);
    egg.specialMove = parseInt(document.getElementById("egg-move").value);

    (async () => {
        const rawResponse = await fetch('/update-gift-egg', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(egg)
        });
        const content = await rawResponse.json();
      
        console.log(content);
    })();

}

function easyChatToText(arr) {
    let uint8Array = new Uint8Array([...arr]);
    let uint16Array = new Uint16Array(uint8Array.buffer)
    return [...uint16Array].map(c => words.get(swap16(c))).join(" ");
}

function swap16(val) {
    return ((val & 0xFF) << 8)
           | ((val >> 8) & 0xFF);
}

function speciesToNationalDex(species) {
    if (species <= 251) {
        return species;
    } else if (species <= 276) {
        return 201; // unown forms
    } else if (species <= 300) {
        return species - 25;
    } else {
        // After SHIFTRY NatDex -> species numbers no longer line up
        switch(species)
        {
            case 301: return 290;
            case 302: return 291;
            case 303: return 292;
            case 304: return 276;
            case 305: return 277;
            case 306: return 285;
            case 307: return 286;
            case 308: return 327;
            case 309: return 278;
            case 310: return 279;
            case 311: return 283;
            case 312: return 284;
            case 313: return 320;
            case 314: return 321;
            case 315: return 300;
            case 316: return 301;
            case 317: return 352;
            case 318: return 343;
            case 319: return 344;
            case 320: return 299;
            case 321: return 324;
            case 322: return 302;
            case 323: return 339;
            case 324: return 340;
            case 325: return 370;
            case 326: return 341;
            case 327: return 342;
            case 328: return 349;
            case 329: return 350;
            case 330: return 318;
            case 331: return 319;
            case 332: return 328;
            case 333: return 329;
            case 334: return 330;
            case 335: return 296;
            case 336: return 297;
            case 337: return 309;
            case 338: return 310;
            case 339: return 322;
            case 340: return 323;
            case 341: return 363;
            case 342: return 364;
            case 343: return 365;
            case 344: return 331;
            case 345: return 332;
            case 346: return 361;
            case 347: return 362;
            case 348: return 337;
            case 349: return 338;
            case 350: return 298;
            case 351: return 325;
            case 352: return 326;
            case 353: return 311;
            case 354: return 312;
            case 355: return 303;
            case 356: return 307;
            case 357: return 308;
            case 358: return 333;
            case 359: return 334;
            case 360: return 360;
            case 361: return 355;
            case 362: return 356;
            case 363: return 315;
            case 364: return 287;
            case 365: return 288;
            case 366: return 289;
            case 367: return 316;
            case 368: return 317;
            case 369: return 357;
            case 370: return 293;
            case 371: return 294;
            case 372: return 295;
            case 373: return 366;
            case 374: return 367;
            case 375: return 368;
            case 376: return 359;
            case 377: return 353;
            case 378: return 354;
            case 379: return 336;
            case 380: return 335;
            case 381: return 369;
            case 382: return 304;
            case 383: return 305;
            case 384: return 306;
            case 385: return 351;
            case 386: return 313;
            case 387: return 314;
            case 388: return 345;
            case 389: return 346;
            case 390: return 347;
            case 391: return 348;
            case 392: return 280;
            case 393: return 281;
            case 394: return 282;
            case 395: return 371;
            case 396: return 372;
            case 397: return 373;
            case 398: return 374;
            case 399: return 375;
            case 400: return 376;
            case 401: return 377;
            case 402: return 378;
            case 403: return 379;
            case 404: return 382;
            case 405: return 383;
            case 406: return 384;
            case 407: return 380;
            case 408: return 381;
            case 409: return 385;
            case 410: return 386;
            case 411: return 358;
            default: return 0;
        }
    }
}

var itemStrings = new Map();
itemStrings.set( 0,   'none');
itemStrings.set( 1,   'master-ball');
itemStrings.set( 2,   'ultra-ball');
itemStrings.set( 3,   'great-ball');
itemStrings.set( 4,   'poke-ball');
itemStrings.set( 6,   'net-ball');
itemStrings.set( 7,   'dive-ball');
itemStrings.set( 8,   'nest-ball');
itemStrings.set( 9,   'repeat-ball');
itemStrings.set( 10,  'timer-ball');
itemStrings.set( 11,  'luxury-ball');
itemStrings.set( 12,  'premier-ball');
itemStrings.set( 13,  'potion');
itemStrings.set( 14,  'antidote');
itemStrings.set( 15,  'burn-heal');
itemStrings.set( 16,  'ice-heal');
itemStrings.set( 17,  'awakening');
itemStrings.set( 18,  'paralyze-heal');
itemStrings.set( 19,  'full-restore');
itemStrings.set( 20,  'max-potion');
itemStrings.set( 21,  'hyper-potion');
itemStrings.set( 22,  'super-potion');
itemStrings.set( 23,  'full-heal');
itemStrings.set( 24,  'revive');
itemStrings.set( 25,  'max-revive');
itemStrings.set( 26,  'fresh-water');
itemStrings.set( 27,  'soda-pop');
itemStrings.set( 28,  'lemonade');
itemStrings.set( 29,  'moomoo-milk');
itemStrings.set( 30,  'energy-powder');
itemStrings.set( 31,  'energy-root');
itemStrings.set( 32,  'heal-powder');
itemStrings.set( 33,  'revival-herb');
itemStrings.set( 34,  'ether');
itemStrings.set( 35,  'max-ether');
itemStrings.set( 36,  'elixir');
itemStrings.set( 37,  'max-elixir');
itemStrings.set( 38,  'lava-cookie');
itemStrings.set( 39,  'blue-flute');
itemStrings.set( 40,  'yellow-flute');
itemStrings.set( 41,  'red-flute');
itemStrings.set( 42,  'black-flute');
itemStrings.set( 43,  'white-flute');
itemStrings.set( 44,  'berry-juice');
itemStrings.set( 45,  'sacred-ash');
itemStrings.set( 46,  'shoal-salt');
itemStrings.set( 47,  'shoal-shell');
itemStrings.set( 48,  'red-shard');
itemStrings.set( 49,  'blue-shard');
itemStrings.set( 50,  'yellow-shard');
itemStrings.set( 51,  'green-shard');
itemStrings.set( 63,  'hp-up');
itemStrings.set( 64,  'protein');
itemStrings.set( 65,  'iron');
itemStrings.set( 66,  'carbos');
itemStrings.set( 67,  'calcium');
itemStrings.set( 68,  'rare-candy');
itemStrings.set( 69,  'pp-up');
itemStrings.set( 70,  'zinc');
itemStrings.set( 71,  'pp-max');
itemStrings.set( 73,  'guard-spec');
itemStrings.set( 74,  'dire-hit');
itemStrings.set( 75,  'x-attack');
itemStrings.set( 76,  'x-defend');
itemStrings.set( 77,  'x-speed');
itemStrings.set( 78,  'x-accuracy');
itemStrings.set( 79,  'x-special');
itemStrings.set( 80,  'poke-doll');
itemStrings.set( 81,  'fluffy-tail');
itemStrings.set( 82,  '052');
itemStrings.set( 83,  'super-repel');
itemStrings.set( 84,  'max-repel');
itemStrings.set( 85,  'escape-rope');
itemStrings.set( 86,  'repel');
itemStrings.set( 93,  'sun-stone');
itemStrings.set( 94,  'moon-stone');
itemStrings.set( 95,  'fire-stone');
itemStrings.set( 96,  'thunder-stone');
itemStrings.set( 97,  'water-stone');
itemStrings.set( 98,  'leaf-stone');
itemStrings.set( 103, 'tiny-mushroom');
itemStrings.set( 104, 'big-mushroom');
itemStrings.set( 106, 'pearl');
itemStrings.set( 107, 'big-pearl');
itemStrings.set( 108, 'stardust');
itemStrings.set( 109, 'star-piece');
itemStrings.set( 110, 'nugget');
itemStrings.set( 111, 'heart-scale');
itemStrings.set( 121, 'orange-mail');
itemStrings.set( 122, 'harbor-mail');
itemStrings.set( 123, 'glitter-mail');
itemStrings.set( 124, 'mech-mail');
itemStrings.set( 125, 'wood-mail');
itemStrings.set( 126, 'wave-mail');
itemStrings.set( 127, 'bead-mail');
itemStrings.set( 128, 'shadow-mail');
itemStrings.set( 129, 'tropic-mail');
itemStrings.set( 130, 'dream-mail');
itemStrings.set( 131, 'fab-mail');
itemStrings.set( 132, 'retro-mail');
itemStrings.set( 133, 'cheri-berry');
itemStrings.set( 134, 'chesto-berry');
itemStrings.set( 135, 'pecha-berry');
itemStrings.set( 136, 'rawst-berry');
itemStrings.set( 137, 'aspear-berry');
itemStrings.set( 138, 'leppa-berry');
itemStrings.set( 139, 'oran-berry');
itemStrings.set( 140, 'persim-berry');
itemStrings.set( 141, 'lum-berry');
itemStrings.set( 142, 'sitrus-berry');
itemStrings.set( 143, 'figy-berry');
itemStrings.set( 144, 'wiki-berry');
itemStrings.set( 145, 'mago-berry');
itemStrings.set( 146, 'aguav-berry');
itemStrings.set( 147, 'iapapa-berry');
itemStrings.set( 148, 'razz-berry');
itemStrings.set( 149, 'bluk-berry');
itemStrings.set( 150, 'nanab-berry');
itemStrings.set( 151, 'wepear-berry');
itemStrings.set( 152, 'pinap-berry');
itemStrings.set( 153, 'pomeg-berry');
itemStrings.set( 154, 'kelpsy-berry');
itemStrings.set( 155, 'qualot-berry');
itemStrings.set( 156, 'hondew-berry');
itemStrings.set( 157, 'grepa-berry');
itemStrings.set( 158, 'tamato-berry');
itemStrings.set( 159, 'cornn-berry');
itemStrings.set( 160, 'magost-berry');
itemStrings.set( 161, 'rabuta-berry');
itemStrings.set( 162, 'nomel-berry');
itemStrings.set( 163, 'spelon-berry');
itemStrings.set( 164, 'pamtre-berry');
itemStrings.set( 165, 'watmel-berry');
itemStrings.set( 166, 'durin-berry');
itemStrings.set( 167, 'belue-berry');
itemStrings.set( 168, 'liechi-berry');
itemStrings.set( 169, 'ganlon-berry');
itemStrings.set( 170, 'salac-berry');
itemStrings.set( 171, 'petaya-berry');
itemStrings.set( 172, 'apicot-berry');
itemStrings.set( 173, 'lansat-berry');
itemStrings.set( 174, 'starf-berry');
itemStrings.set( 175, 'enigma-berry');
itemStrings.set(179, 'bright-powder');
itemStrings.set(180, 'white-herb');
itemStrings.set(181, 'macho-brace');
itemStrings.set(182, 'exp-share');
itemStrings.set(183, 'quick-claw');
itemStrings.set(184, 'soothe-bell');
itemStrings.set(185, 'mental-herb');
itemStrings.set(186, 'choice-band');
itemStrings.set(187, 'kings-rock');
itemStrings.set(188, 'silver-powder');
itemStrings.set(189, 'amulet-coin');
itemStrings.set(190, 'cleanse-tag');
itemStrings.set(191, 'soul-dew');
itemStrings.set(192, 'deep-sea-tooth');
itemStrings.set(193, 'deep-sea-scale');
itemStrings.set(194, 'smoke-ball');
itemStrings.set(195, 'everstone');
itemStrings.set(196, 'focus-band');
itemStrings.set(197, 'lucky-egg');
itemStrings.set(198, 'scope-lens');
itemStrings.set(199, 'metal-coat');
itemStrings.set(200, 'leftovers');
itemStrings.set(201, 'dragon-scale');
itemStrings.set(202, 'light-ball');
itemStrings.set(203, 'soft-sand');
itemStrings.set(204, 'hard-stone');
itemStrings.set(205, 'miracle-seed');
itemStrings.set(206, 'black-glasses');
itemStrings.set(207, 'black-belt');
itemStrings.set(208, 'magnet');
itemStrings.set(209, 'mystic-water');
itemStrings.set(210, 'sharp-beak');
itemStrings.set(211, 'poison-barb');
itemStrings.set(212, 'never-melt-ice');
itemStrings.set(213, 'spell-tag');
itemStrings.set(214, 'twisted-spoon');
itemStrings.set(215, 'charcoal');
itemStrings.set(216, 'dragon-fang');
itemStrings.set(217, 'silk-scarf');
itemStrings.set(218, 'up-grade');
itemStrings.set(219, 'shell-bell');
itemStrings.set(220, 'sea-incense');
itemStrings.set(221, 'lax-incense');
itemStrings.set(222, 'lucky-punch');
itemStrings.set(223, 'metal-powder');
itemStrings.set(224, 'thick-club');
itemStrings.set(225, 'stick');
itemStrings.set(254, 'red-scarf');
itemStrings.set(255, 'blue-scarf');
itemStrings.set(256, 'pink-scarf');
itemStrings.set(257, 'green-scarf');
itemStrings.set(258, 'yellow-scarf');
itemStrings.set(289, 'tm01');
itemStrings.set(290, 'tm02');
itemStrings.set(291, 'tm03');
itemStrings.set(292, 'tm04');
itemStrings.set(293, 'tm05');
itemStrings.set(294, 'tm06');
itemStrings.set(295, 'tm07');
itemStrings.set(296, 'tm08');
itemStrings.set(297, 'tm09');
itemStrings.set(298, 'tm10');
itemStrings.set(299, 'tm11');
itemStrings.set(300, 'tm12');
itemStrings.set(301, 'tm13');
itemStrings.set(302, 'tm14');
itemStrings.set(303, 'tm15');
itemStrings.set(304, 'tm16');
itemStrings.set(305, 'tm17');
itemStrings.set(306, 'tm18');
itemStrings.set(307, 'tm19');
itemStrings.set(308, 'tm20');
itemStrings.set(309, 'tm21');
itemStrings.set(310, 'tm22');
itemStrings.set(311, 'tm23');
itemStrings.set(312, 'tm24');
itemStrings.set(313, 'tm25');
itemStrings.set(314, 'tm26');
itemStrings.set(315, 'tm27');
itemStrings.set(316, 'tm28');
itemStrings.set(317, 'tm29');
itemStrings.set(318, 'tm30');
itemStrings.set(319, 'tm31');
itemStrings.set(320, 'tm32');
itemStrings.set(321, 'tm33');
itemStrings.set(322, 'tm34');
itemStrings.set(323, 'tm35');
itemStrings.set(324, 'tm36');
itemStrings.set(325, 'tm37');
itemStrings.set(326, 'tm38');
itemStrings.set(327, 'tm39');
itemStrings.set(328, 'tm40');
itemStrings.set(329, 'tm41');
itemStrings.set(330, 'tm42');
itemStrings.set(331, 'tm43');
itemStrings.set(332, 'tm44');
itemStrings.set(333, 'tm45');
itemStrings.set(334, 'tm46');
itemStrings.set(335, 'tm47');
itemStrings.set(336, 'tm48');
itemStrings.set(337, 'tm49');
itemStrings.set(338, 'tm50');
itemStrings.set(259, 'mach-bike');
itemStrings.set(260, 'coin-case');
itemStrings.set(261, 'itemfinder');
itemStrings.set(262, 'old-rod');
itemStrings.set(263, 'good-rod');
itemStrings.set(264, 'super-rod');
itemStrings.set(265, 'ss-ticket');
itemStrings.set(266, 'contest-pass');
itemStrings.set(268, 'wailmer-pail');
itemStrings.set(269, 'devon-goods');
itemStrings.set(270, 'soot-sack');
itemStrings.set(271, 'basement-key');
itemStrings.set(272, 'acro-bike');
itemStrings.set(273, 'pokeblock-case');
itemStrings.set(274, 'letter');
itemStrings.set(275, 'eon-ticket');
itemStrings.set(276, 'red-orb');
itemStrings.set(277, 'blue-orb');
itemStrings.set(278, 'scanner');
itemStrings.set(279, 'go-goggles');
itemStrings.set(280, 'meteorite');
itemStrings.set(281, 'room-1-key');
itemStrings.set(282, 'room-2-key');
itemStrings.set(283, 'room-4-key');
itemStrings.set(284, 'room-6-key');
itemStrings.set(285, 'storage-key');
itemStrings.set(286, 'root-fossil');
itemStrings.set(287, 'claw-fossil');
itemStrings.set(288, 'devon-scope');
itemStrings.set(349, 'oaks-parcel');
itemStrings.set(350, 'poke-flute');
itemStrings.set(351, 'secret-key');
itemStrings.set(352, 'bike-voucher');
itemStrings.set(353, 'gold-teeth');
itemStrings.set(354, 'old-amber');
itemStrings.set(355, 'card-key');
itemStrings.set(356, 'lift-key');
itemStrings.set(357, 'helix-fossil');
itemStrings.set(358, 'dome-fossil');
itemStrings.set(359, 'silph-scope');
itemStrings.set(360, 'bicycle');
itemStrings.set(361, 'town-map');
itemStrings.set(362, 'vs-seeker');
itemStrings.set(363, 'fame-checker');
itemStrings.set(364, 'tm-case');
itemStrings.set(365, 'berry-pouch');
itemStrings.set(366, 'teachy-tv');
itemStrings.set(367, 'tri-pass');
itemStrings.set(368, 'rainbow-pass');
itemStrings.set(369, 'tea');
itemStrings.set(370, 'mysticticket');
itemStrings.set(371, 'auroraticket');
itemStrings.set(372, 'powder-jar');
itemStrings.set(373, 'ruby');
itemStrings.set(374, 'sapphire');
itemStrings.set(375, 'magma-emblem');
itemStrings.set(376, 'old-sea-map');

const speciesList = `
<div class="item" data-value="0">  NONE</div>
<div class="item" data-value="1">  BULBASAUR</div>
<div class="item" data-value="2">  IVYSAUR  </div>
<div class="item" data-value="3">  VENUSAUR </div>
<div class="item" data-value="4">  CHARMANDE</div>
<div class="item" data-value="5">  CHARMELEO</div>
<div class="item" data-value="6">  CHARIZARD</div>
<div class="item" data-value="7">  SQUIRTLE </div>
<div class="item" data-value="8">  WARTORTLE</div>
<div class="item" data-value="9">  BLASTOISE</div>
<div class="item" data-value="10"> CATERPIE </div>
<div class="item" data-value="11"> METAPOD  </div>
<div class="item" data-value="12"> BUTTERFRE</div>
<div class="item" data-value="13"> WEEDLE   </div>
<div class="item" data-value="14"> KAKUNA   </div>
<div class="item" data-value="15"> BEEDRILL </div>
<div class="item" data-value="16"> PIDGEY   </div>
<div class="item" data-value="17"> PIDGEOTTO</div>
<div class="item" data-value="18"> PIDGEOT  </div>
<div class="item" data-value="19"> RATTATA  </div>
<div class="item" data-value="20"> RATICATE </div>
<div class="item" data-value="21"> SPEAROW  </div>
<div class="item" data-value="22"> FEAROW   </div>
<div class="item" data-value="23"> EKANS    </div>
<div class="item" data-value="24"> ARBOK    </div>
<div class="item" data-value="25"> PIKACHU  </div>
<div class="item" data-value="26"> RAICHU   </div>
<div class="item" data-value="27"> SANDSHREW</div>
<div class="item" data-value="28"> SANDSLASH</div>
<div class="item" data-value="29"> NIDORAN_F</div>
<div class="item" data-value="30"> NIDORINA </div>
<div class="item" data-value="31"> NIDOQUEEN</div>
<div class="item" data-value="32"> NIDORAN_M</div>
<div class="item" data-value="33"> NIDORINO </div>
<div class="item" data-value="34"> NIDOKING </div>
<div class="item" data-value="35"> CLEFAIRY </div>
<div class="item" data-value="36"> CLEFABLE </div>
<div class="item" data-value="37"> VULPIX   </div>
<div class="item" data-value="38"> NINETALES</div>
<div class="item" data-value="39"> JIGGLYPUF</div>
<div class="item" data-value="40"> WIGGLYTUF</div>
<div class="item" data-value="41"> ZUBAT    </div>
<div class="item" data-value="42"> GOLBAT   </div>
<div class="item" data-value="43"> ODDISH   </div>
<div class="item" data-value="44"> GLOOM    </div>
<div class="item" data-value="45"> VILEPLUME</div>
<div class="item" data-value="46"> PARAS    </div>
<div class="item" data-value="47"> PARASECT </div>
<div class="item" data-value="48"> VENONAT  </div>
<div class="item" data-value="49"> VENOMOTH </div>
<div class="item" data-value="50"> DIGLETT  </div>
<div class="item" data-value="51"> DUGTRIO  </div>
<div class="item" data-value="52"> MEOWTH   </div>
<div class="item" data-value="53"> PERSIAN  </div>
<div class="item" data-value="54"> PSYDUCK  </div>
<div class="item" data-value="55"> GOLDUCK  </div>
<div class="item" data-value="56"> MANKEY   </div>
<div class="item" data-value="57"> PRIMEAPE </div>
<div class="item" data-value="58"> GROWLITHE</div>
<div class="item" data-value="59"> ARCANINE </div>
<div class="item" data-value="60"> POLIWAG  </div>
<div class="item" data-value="61"> POLIWHIRL</div>
<div class="item" data-value="62"> POLIWRATH</div>
<div class="item" data-value="63"> ABRA     </div>
<div class="item" data-value="64"> KADABRA  </div>
<div class="item" data-value="65"> ALAKAZAM </div>
<div class="item" data-value="66"> MACHOP   </div>
<div class="item" data-value="67"> MACHOKE  </div>
<div class="item" data-value="68"> MACHAMP  </div>
<div class="item" data-value="69"> BELLSPROU</div>
<div class="item" data-value="70"> WEEPINBEL</div>
<div class="item" data-value="71"> VICTREEBE</div>
<div class="item" data-value="72"> TENTACOOL</div>
<div class="item" data-value="73"> TENTACRUE</div>
<div class="item" data-value="74"> GEODUDE  </div>
<div class="item" data-value="75"> GRAVELER </div>
<div class="item" data-value="76"> GOLEM    </div>
<div class="item" data-value="77"> PONYTA   </div>
<div class="item" data-value="78"> RAPIDASH </div>
<div class="item" data-value="79"> SLOWPOKE </div>
<div class="item" data-value="80"> SLOWBRO  </div>
<div class="item" data-value="81"> MAGNEMITE</div>
<div class="item" data-value="82"> MAGNETON </div>
<div class="item" data-value="83"> FARFETCHD</div>
<div class="item" data-value="84"> DODUO    </div>
<div class="item" data-value="85"> DODRIO   </div>
<div class="item" data-value="86"> SEEL     </div>
<div class="item" data-value="87"> DEWGONG  </div>
<div class="item" data-value="88"> GRIMER   </div>
<div class="item" data-value="89"> MUK      </div>
<div class="item" data-value="90"> SHELLDER </div>
<div class="item" data-value="91"> CLOYSTER </div>
<div class="item" data-value="92"> GASTLY   </div>
<div class="item" data-value="93"> HAUNTER  </div>
<div class="item" data-value="94"> GENGAR   </div>
<div class="item" data-value="95"> ONIX     </div>
<div class="item" data-value="96"> DROWZEE  </div>
<div class="item" data-value="97"> HYPNO    </div>
<div class="item" data-value="98"> KRABBY   </div>
<div class="item" data-value="99"> KINGLER  </div>
<div class="item" data-value="100">VOLTORB  </div>
<div class="item" data-value="101">ELECTRODE</div>
<div class="item" data-value="102">EXEGGCUTE</div>
<div class="item" data-value="103">EXEGGUTOR</div>
<div class="item" data-value="104">CUBONE   </div>
<div class="item" data-value="105">MAROWAK  </div>
<div class="item" data-value="106">HITMONLEE</div>
<div class="item" data-value="107">HITMONCHA</div>
<div class="item" data-value="108">LICKITUNG</div>
<div class="item" data-value="109">KOFFING  </div>
<div class="item" data-value="110">WEEZING  </div>
<div class="item" data-value="111">RHYHORN  </div>
<div class="item" data-value="112">RHYDON   </div>
<div class="item" data-value="113">CHANSEY  </div>
<div class="item" data-value="114">TANGELA  </div>
<div class="item" data-value="115">KANGASKHA</div>
<div class="item" data-value="116">HORSEA   </div>
<div class="item" data-value="117">SEADRA   </div>
<div class="item" data-value="118">GOLDEEN  </div>
<div class="item" data-value="119">SEAKING  </div>
<div class="item" data-value="120">STARYU   </div>
<div class="item" data-value="121">STARMIE  </div>
<div class="item" data-value="122">MR_MIME  </div>
<div class="item" data-value="123">SCYTHER  </div>
<div class="item" data-value="124">JYNX     </div>
<div class="item" data-value="125">ELECTABUZ</div>
<div class="item" data-value="126">MAGMAR   </div>
<div class="item" data-value="127">PINSIR   </div>
<div class="item" data-value="128">TAUROS   </div>
<div class="item" data-value="129">MAGIKARP </div>
<div class="item" data-value="130">GYARADOS </div>
<div class="item" data-value="131">LAPRAS   </div>
<div class="item" data-value="132">DITTO    </div>
<div class="item" data-value="133">EEVEE    </div>
<div class="item" data-value="134">VAPOREON </div>
<div class="item" data-value="135">JOLTEON  </div>
<div class="item" data-value="136">FLAREON  </div>
<div class="item" data-value="137">PORYGON  </div>
<div class="item" data-value="138">OMANYTE  </div>
<div class="item" data-value="139">OMASTAR  </div>
<div class="item" data-value="140">KABUTO   </div>
<div class="item" data-value="141">KABUTOPS </div>
<div class="item" data-value="142">AERODACTY</div>
<div class="item" data-value="143">SNORLAX  </div>
<div class="item" data-value="144">ARTICUNO </div>
<div class="item" data-value="145">ZAPDOS   </div>
<div class="item" data-value="146">MOLTRES  </div>
<div class="item" data-value="147">DRATINI  </div>
<div class="item" data-value="148">DRAGONAIR</div>
<div class="item" data-value="149">DRAGONITE</div>
<div class="item" data-value="150">MEWTWO   </div>
<div class="item" data-value="151">MEW      </div>
<div class="item" data-value="152">CHIKORITA</div>
<div class="item" data-value="153">BAYLEEF  </div>
<div class="item" data-value="154">MEGANIUM </div>
<div class="item" data-value="155">CYNDAQUIL</div>
<div class="item" data-value="156">QUILAVA  </div>
<div class="item" data-value="157">TYPHLOSIO</div>
<div class="item" data-value="158">TOTODILE </div>
<div class="item" data-value="159">CROCONAW </div>
<div class="item" data-value="160">FERALIGAT</div>
<div class="item" data-value="161">SENTRET  </div>
<div class="item" data-value="162">FURRET   </div>
<div class="item" data-value="163">HOOTHOOT </div>
<div class="item" data-value="164">NOCTOWL  </div>
<div class="item" data-value="165">LEDYBA   </div>
<div class="item" data-value="166">LEDIAN   </div>
<div class="item" data-value="167">SPINARAK </div>
<div class="item" data-value="168">ARIADOS  </div>
<div class="item" data-value="169">CROBAT   </div>
<div class="item" data-value="170">CHINCHOU </div>
<div class="item" data-value="171">LANTURN  </div>
<div class="item" data-value="172">PICHU    </div>
<div class="item" data-value="173">CLEFFA   </div>
<div class="item" data-value="174">IGGLYBUFF</div>
<div class="item" data-value="175">TOGEPI   </div>
<div class="item" data-value="176">TOGETIC  </div>
<div class="item" data-value="177">NATU     </div>
<div class="item" data-value="178">XATU     </div>
<div class="item" data-value="179">MAREEP   </div>
<div class="item" data-value="180">FLAAFFY  </div>
<div class="item" data-value="181">AMPHAROS </div>
<div class="item" data-value="182">BELLOSSOM</div>
<div class="item" data-value="183">MARILL   </div>
<div class="item" data-value="184">AZUMARILL</div>
<div class="item" data-value="185">SUDOWOODO</div>
<div class="item" data-value="186">POLITOED </div>
<div class="item" data-value="187">HOPPIP   </div>
<div class="item" data-value="188">SKIPLOOM </div>
<div class="item" data-value="189">JUMPLUFF </div>
<div class="item" data-value="190">AIPOM    </div>
<div class="item" data-value="191">SUNKERN  </div>
<div class="item" data-value="192">SUNFLORA </div>
<div class="item" data-value="193">YANMA    </div>
<div class="item" data-value="194">WOOPER   </div>
<div class="item" data-value="195">QUAGSIRE </div>
<div class="item" data-value="196">ESPEON   </div>
<div class="item" data-value="197">UMBREON  </div>
<div class="item" data-value="198">MURKROW  </div>
<div class="item" data-value="199">SLOWKING </div>
<div class="item" data-value="200">MISDREAVU</div>
<div class="item" data-value="201">UNOWN    </div>
<div class="item" data-value="202">WOBBUFFET</div>
<div class="item" data-value="203">GIRAFARIG</div>
<div class="item" data-value="204">PINECO   </div>
<div class="item" data-value="205">FORRETRES</div>
<div class="item" data-value="206">DUNSPARCE</div>
<div class="item" data-value="207">GLIGAR   </div>
<div class="item" data-value="208">STEELIX  </div>
<div class="item" data-value="209">SNUBBULL </div>
<div class="item" data-value="210">GRANBULL </div>
<div class="item" data-value="211">QWILFISH </div>
<div class="item" data-value="212">SCIZOR   </div>
<div class="item" data-value="213">SHUCKLE  </div>
<div class="item" data-value="214">HERACROSS</div>
<div class="item" data-value="215">SNEASEL  </div>
<div class="item" data-value="216">TEDDIURSA</div>
<div class="item" data-value="217">URSARING </div>
<div class="item" data-value="218">SLUGMA   </div>
<div class="item" data-value="219">MAGCARGO </div>
<div class="item" data-value="220">SWINUB   </div>
<div class="item" data-value="221">PILOSWINE</div>
<div class="item" data-value="222">CORSOLA  </div>
<div class="item" data-value="223">REMORAID </div>
<div class="item" data-value="224">OCTILLERY</div>
<div class="item" data-value="225">DELIBIRD </div>
<div class="item" data-value="226">MANTINE  </div>
<div class="item" data-value="227">SKARMORY </div>
<div class="item" data-value="228">HOUNDOUR </div>
<div class="item" data-value="229">HOUNDOOM </div>
<div class="item" data-value="230">KINGDRA  </div>
<div class="item" data-value="231">PHANPY   </div>
<div class="item" data-value="232">DONPHAN  </div>
<div class="item" data-value="233">PORYGON2 </div>
<div class="item" data-value="234">STANTLER </div>
<div class="item" data-value="235">SMEARGLE </div>
<div class="item" data-value="236">TYROGUE  </div>
<div class="item" data-value="237">HITMONTOP</div>
<div class="item" data-value="238">SMOOCHUM </div>
<div class="item" data-value="239">ELEKID   </div>
<div class="item" data-value="240">MAGBY    </div>
<div class="item" data-value="241">MILTANK  </div>
<div class="item" data-value="242">BLISSEY  </div>
<div class="item" data-value="243">RAIKOU   </div>
<div class="item" data-value="244">ENTEI    </div>
<div class="item" data-value="245">SUICUNE  </div>
<div class="item" data-value="246">LARVITAR </div>
<div class="item" data-value="247">PUPITAR  </div>
<div class="item" data-value="248">TYRANITAR</div>
<div class="item" data-value="249">LUGIA    </div>
<div class="item" data-value="250">HO_OH    </div>
<div class="item" data-value="251">CELEBI   </div>
<div class="item" data-value="252">UNOWN B  </div>
<div class="item" data-value="253">UNOWN C  </div>
<div class="item" data-value="254">UNOWN D  </div>
<div class="item" data-value="255">UNOWN E  </div>
<div class="item" data-value="256">UNOWN F  </div>
<div class="item" data-value="257">UNOWN G  </div>
<div class="item" data-value="258">UNOWN H  </div>
<div class="item" data-value="259">UNOWN I  </div>
<div class="item" data-value="260">UNOWN J  </div>
<div class="item" data-value="261">UNOWN K  </div>
<div class="item" data-value="262">UNOWN L  </div>
<div class="item" data-value="263">UNOWN M  </div>
<div class="item" data-value="264">UNOWN N  </div>
<div class="item" data-value="265">UNOWN O  </div>
<div class="item" data-value="266">UNOWN P  </div>
<div class="item" data-value="267">UNOWN Q  </div>
<div class="item" data-value="268">UNOWN R  </div>
<div class="item" data-value="269">UNOWN S  </div>
<div class="item" data-value="270">UNOWN T  </div>
<div class="item" data-value="271">UNOWN U  </div>
<div class="item" data-value="272">UNOWN V  </div>
<div class="item" data-value="273">UNOWN W  </div>
<div class="item" data-value="274">UNOWN X  </div>
<div class="item" data-value="275">UNOWN Y  </div>
<div class="item" data-value="276">UNOWN Z  </div>
<div class="item" data-value="277">TREECKO  </div>
<div class="item" data-value="278">GROVYLE  </div>
<div class="item" data-value="279">SCEPTILE </div>
<div class="item" data-value="280">TORCHIC  </div>
<div class="item" data-value="281">COMBUSKEN</div>
<div class="item" data-value="282">BLAZIKEN </div>
<div class="item" data-value="283">MUDKIP   </div>
<div class="item" data-value="284">MARSHTOMP</div>
<div class="item" data-value="285">SWAMPERT </div>
<div class="item" data-value="286">POOCHYENA</div>
<div class="item" data-value="287">MIGHTYENA</div>
<div class="item" data-value="288">ZIGZAGOON</div>
<div class="item" data-value="289">LINOONE  </div>
<div class="item" data-value="290">WURMPLE  </div>
<div class="item" data-value="291">SILCOON  </div>
<div class="item" data-value="292">BEAUTIFLY</div>
<div class="item" data-value="293">CASCOON  </div>
<div class="item" data-value="294">DUSTOX   </div>
<div class="item" data-value="295">LOTAD    </div>
<div class="item" data-value="296">LOMBRE   </div>
<div class="item" data-value="297">LUDICOLO </div>
<div class="item" data-value="298">SEEDOT   </div>
<div class="item" data-value="299">NUZLEAF  </div>
<div class="item" data-value="300">SHIFTRY  </div>
<div class="item" data-value="301">NINCADA  </div>
<div class="item" data-value="302">NINJASK  </div>
<div class="item" data-value="303">SHEDINJA </div>
<div class="item" data-value="304">TAILLOW  </div>
<div class="item" data-value="305">SWELLOW  </div>
<div class="item" data-value="306">SHROOMISH</div>
<div class="item" data-value="307">BRELOOM  </div>
<div class="item" data-value="308">SPINDA   </div>
<div class="item" data-value="309">WINGULL  </div>
<div class="item" data-value="310">PELIPPER </div>
<div class="item" data-value="311">SURSKIT  </div>
<div class="item" data-value="312">MASQUERAI</div>
<div class="item" data-value="313">WAILMER  </div>
<div class="item" data-value="314">WAILORD  </div>
<div class="item" data-value="315">SKITTY   </div>
<div class="item" data-value="316">DELCATTY </div>
<div class="item" data-value="317">KECLEON  </div>
<div class="item" data-value="318">BALTOY   </div>
<div class="item" data-value="319">CLAYDOL  </div>
<div class="item" data-value="320">NOSEPASS </div>
<div class="item" data-value="321">TORKOAL  </div>
<div class="item" data-value="322">SABLEYE  </div>
<div class="item" data-value="323">BARBOACH </div>
<div class="item" data-value="324">WHISCASH </div>
<div class="item" data-value="325">LUVDISC  </div>
<div class="item" data-value="326">CORPHISH </div>
<div class="item" data-value="327">CRAWDAUNT</div>
<div class="item" data-value="328">FEEBAS   </div>
<div class="item" data-value="329">MILOTIC  </div>
<div class="item" data-value="330">CARVANHA </div>
<div class="item" data-value="331">SHARPEDO </div>
<div class="item" data-value="332">TRAPINCH </div>
<div class="item" data-value="333">VIBRAVA  </div>
<div class="item" data-value="334">FLYGON   </div>
<div class="item" data-value="335">MAKUHITA </div>
<div class="item" data-value="336">HARIYAMA </div>
<div class="item" data-value="337">ELECTRIKE</div>
<div class="item" data-value="338">MANECTRIC</div>
<div class="item" data-value="339">NUMEL    </div>
<div class="item" data-value="340">CAMERUPT </div>
<div class="item" data-value="341">SPHEAL   </div>
<div class="item" data-value="342">SEALEO   </div>
<div class="item" data-value="343">WALREIN  </div>
<div class="item" data-value="344">CACNEA   </div>
<div class="item" data-value="345">CACTURNE </div>
<div class="item" data-value="346">SNORUNT  </div>
<div class="item" data-value="347">GLALIE   </div>
<div class="item" data-value="348">LUNATONE </div>
<div class="item" data-value="349">SOLROCK  </div>
<div class="item" data-value="350">AZURILL  </div>
<div class="item" data-value="351">SPOINK   </div>
<div class="item" data-value="352">GRUMPIG  </div>
<div class="item" data-value="353">PLUSLE   </div>
<div class="item" data-value="354">MINUN    </div>
<div class="item" data-value="355">MAWILE   </div>
<div class="item" data-value="356">MEDITITE </div>
<div class="item" data-value="357">MEDICHAM </div>
<div class="item" data-value="358">SWABLU   </div>
<div class="item" data-value="359">ALTARIA  </div>
<div class="item" data-value="360">WYNAUT   </div>
<div class="item" data-value="361">DUSKULL  </div>
<div class="item" data-value="362">DUSCLOPS </div>
<div class="item" data-value="363">ROSELIA  </div>
<div class="item" data-value="364">SLAKOTH  </div>
<div class="item" data-value="365">VIGOROTH </div>
<div class="item" data-value="366">SLAKING  </div>
<div class="item" data-value="367">GULPIN   </div>
<div class="item" data-value="368">SWALOT   </div>
<div class="item" data-value="369">TROPIUS  </div>
<div class="item" data-value="370">WHISMUR  </div>
<div class="item" data-value="371">LOUDRED  </div>
<div class="item" data-value="372">EXPLOUD  </div>
<div class="item" data-value="373">CLAMPERL </div>
<div class="item" data-value="374">HUNTAIL  </div>
<div class="item" data-value="375">GOREBYSS </div>
<div class="item" data-value="376">ABSOL    </div>
<div class="item" data-value="377">SHUPPET  </div>
<div class="item" data-value="378">BANETTE  </div>
<div class="item" data-value="379">SEVIPER  </div>
<div class="item" data-value="380">ZANGOOSE </div>
<div class="item" data-value="381">RELICANTH</div>
<div class="item" data-value="382">ARON     </div>
<div class="item" data-value="383">LAIRON   </div>
<div class="item" data-value="384">AGGRON   </div>
<div class="item" data-value="385">CASTFORM </div>
<div class="item" data-value="386">VOLBEAT  </div>
<div class="item" data-value="387">ILLUMISE </div>
<div class="item" data-value="388">LILEEP   </div>
<div class="item" data-value="389">CRADILY  </div>
<div class="item" data-value="390">ANORITH  </div>
<div class="item" data-value="391">ARMALDO  </div>
<div class="item" data-value="392">RALTS    </div>
<div class="item" data-value="393">KIRLIA   </div>
<div class="item" data-value="394">GARDEVOIR</div>
<div class="item" data-value="395">BAGON    </div>
<div class="item" data-value="396">SHELGON  </div>
<div class="item" data-value="397">SALAMENCE</div>
<div class="item" data-value="398">BELDUM   </div>
<div class="item" data-value="399">METANG   </div>
<div class="item" data-value="400">METAGROSS</div>
<div class="item" data-value="401">REGIROCK </div>
<div class="item" data-value="402">REGICE   </div>
<div class="item" data-value="403">REGISTEEL</div>
<div class="item" data-value="404">KYOGRE   </div>
<div class="item" data-value="405">GROUDON  </div>
<div class="item" data-value="406">RAYQUAZA </div>
<div class="item" data-value="407">LATIAS   </div>
<div class="item" data-value="408">LATIOS   </div>
<div class="item" data-value="409">JIRACHI  </div>
<div class="item" data-value="410">DEOXYS   </div>
<div class="item" data-value="411">CHIMECHO </div>`

const battleItemsList = `
<div class="item" data-value="000">NONE           </div>
<div class="item" data-value="133">CHERI BERRY    </div>                   
<div class="item" data-value="134">CHESTO BERRY   </div>                   
<div class="item" data-value="135">PECHA BERRY    </div>                   
<div class="item" data-value="136">RAWST BERRY    </div>                   
<div class="item" data-value="137">ASPEAR BERRY   </div>                   
<div class="item" data-value="138">LEPPA BERRY    </div>                   
<div class="item" data-value="139">ORAN BERRY     </div>                   
<div class="item" data-value="140">PERSIM BERRY   </div>                   
<div class="item" data-value="141">LUM BERRY      </div>                   
<div class="item" data-value="142">SITRUS BERRY   </div>                   
<div class="item" data-value="143">FIGY BERRY     </div>                   
<div class="item" data-value="144">WIKI BERRY     </div>                   
<div class="item" data-value="145">MAGO BERRY     </div>                   
<div class="item" data-value="146">AGUAV BERRY    </div>                   
<div class="item" data-value="147">IAPAPA BERRY   </div>                   
<div class="item" data-value="148">RAZZ BERRY     </div>                   
<div class="item" data-value="149">BLUK BERRY     </div>                   
<div class="item" data-value="150">NANAB BERRY    </div>                   
<div class="item" data-value="151">WEPEAR BERRY   </div>                   
<div class="item" data-value="152">PINAP BERRY    </div>                   
<div class="item" data-value="153">POMEG BERRY    </div>                   
<div class="item" data-value="154">KELPSY BERRY   </div>                   
<div class="item" data-value="155">QUALOT BERRY   </div>                   
<div class="item" data-value="156">HONDEW BERRY   </div>                   
<div class="item" data-value="157">GREPA BERRY    </div>                   
<div class="item" data-value="158">TAMATO BERRY   </div>                   
<div class="item" data-value="159">CORNN BERRY    </div>                   
<div class="item" data-value="160">MAGOST BERRY   </div>                   
<div class="item" data-value="161">RABUTA BERRY   </div>                   
<div class="item" data-value="162">NOMEL BERRY    </div>                   
<div class="item" data-value="163">SPELON BERRY   </div>                   
<div class="item" data-value="164">PAMTRE BERRY   </div>                   
<div class="item" data-value="165">WATMEL BERRY   </div>                   
<div class="item" data-value="166">DURIN BERRY    </div>                   
<div class="item" data-value="167">BELUE BERRY    </div>                   
<div class="item" data-value="168">LIECHI BERRY   </div>                   
<div class="item" data-value="169">GANLON BERRY   </div>                   
<div class="item" data-value="170">SALAC BERRY    </div>                   
<div class="item" data-value="171">PETAYA BERRY   </div>                   
<div class="item" data-value="172">APICOT BERRY   </div>                   
<div class="item" data-value="173">LANSAT BERRY   </div>                   
<div class="item" data-value="174">STARF BERRY    </div>                   
<div class="item" data-value="175">ENIGMA BERRY   </div>                   
<div class="item" data-value="179">BRIGHT POWDER  </div>                     
<div class="item" data-value="180">WHITE HERB     </div>                     
<div class="item" data-value="181">MACHO BRACE    </div>                     
<div class="item" data-value="182">EXP SHARE      </div>                     
<div class="item" data-value="183">QUICK CLAW     </div>                     
<div class="item" data-value="184">SOOTHE BELL    </div>                     
<div class="item" data-value="185">MENTAL HERB    </div>                     
<div class="item" data-value="186">CHOICE BAND    </div>                     
<div class="item" data-value="187">KINGS ROCK     </div>                     
<div class="item" data-value="188">SILVER POWDER  </div>                     
<div class="item" data-value="189">AMULET COIN    </div>                     
<div class="item" data-value="190">CLEANSE TAG    </div>                     
<div class="item" data-value="191">SOUL DEW       </div>                     
<div class="item" data-value="192">DEEP SEA TOOTH </div>                     
<div class="item" data-value="193">DEEP SEA SCALE </div>                     
<div class="item" data-value="194">SMOKE BALL     </div>                     
<div class="item" data-value="195">EVERSTONE      </div>                     
<div class="item" data-value="196">FOCUS BAND     </div>                     
<div class="item" data-value="197">LUCKY EGG      </div>                     
<div class="item" data-value="198">SCOPE LENS     </div>                     
<div class="item" data-value="199">METAL COAT     </div>                     
<div class="item" data-value="200">LEFTOVERS      </div>                     
<div class="item" data-value="201">DRAGON SCALE   </div>                     
<div class="item" data-value="202">LIGHT BALL     </div>                     
<div class="item" data-value="203">SOFT SAND      </div>                     
<div class="item" data-value="204">HARD STONE     </div>                     
<div class="item" data-value="205">MIRACLE SEED   </div>                     
<div class="item" data-value="206">BLACK GLASSES  </div>                     
<div class="item" data-value="207">BLACK BELT     </div>                     
<div class="item" data-value="208">MAGNET         </div>                     
<div class="item" data-value="209">MYSTIC WATER   </div>                     
<div class="item" data-value="210">SHARP BEAK     </div>                     
<div class="item" data-value="211">POISON BARB    </div>                     
<div class="item" data-value="212">NEVER MELT ICE </div>                     
<div class="item" data-value="213">SPELL TAG      </div>                     
<div class="item" data-value="214">TWISTED SPOON  </div>                     
<div class="item" data-value="215">CHARCOAL       </div>                     
<div class="item" data-value="216">DRAGON FANG    </div>                     
<div class="item" data-value="217">SILK SCARF     </div>                     
<div class="item" data-value="218">UP GRADE       </div>                     
<div class="item" data-value="219">SHELL BELL     </div>                     
<div class="item" data-value="220">SEA INCENSE    </div>                     
<div class="item" data-value="221">LAX INCENSE    </div>                     
<div class="item" data-value="222">LUCKY PUNCH    </div>                     
<div class="item" data-value="223">METAL POWDER   </div>                     
<div class="item" data-value="224">THICK CLUB     </div>                     
<div class="item" data-value="225">STICK          </div>`

const movesList = `
<div class="item" data-value="0">  NONE            </div>
<div class="item" data-value="1">  POUND           </div>
<div class="item" data-value="2">  KARATE_CHOP     </div>
<div class="item" data-value="3">  DOUBLE_SLAP     </div>
<div class="item" data-value="4">  COMET_PUNCH     </div>
<div class="item" data-value="5">  MEGA_PUNCH      </div>
<div class="item" data-value="6">  PAY_DAY         </div>
<div class="item" data-value="7">  FIRE_PUNCH      </div>
<div class="item" data-value="8">  ICE_PUNCH       </div>
<div class="item" data-value="9">  THUNDER_PUNCH   </div>
<div class="item" data-value="10"> SCRATCH         </div>
<div class="item" data-value="11"> VICE_GRIP       </div>
<div class="item" data-value="12"> GUILLOTINE      </div>
<div class="item" data-value="13"> RAZOR_WIND      </div>
<div class="item" data-value="14"> SWORDS_DANCE    </div>
<div class="item" data-value="15"> CUT             </div>
<div class="item" data-value="16"> GUST            </div>
<div class="item" data-value="17"> WING_ATTACK     </div>
<div class="item" data-value="18"> WHIRLWIND       </div>
<div class="item" data-value="19"> FLY             </div>
<div class="item" data-value="20"> BIND            </div>
<div class="item" data-value="21"> SLAM            </div>
<div class="item" data-value="22"> VINE_WHIP       </div>
<div class="item" data-value="23"> STOMP           </div>
<div class="item" data-value="24"> DOUBLE_KICK     </div>
<div class="item" data-value="25"> MEGA_KICK       </div>
<div class="item" data-value="26"> JUMP_KICK       </div>
<div class="item" data-value="27"> ROLLING_KICK    </div>
<div class="item" data-value="28"> SAND_ATTACK     </div>
<div class="item" data-value="29"> HEADBUTT        </div>
<div class="item" data-value="30"> HORN_ATTACK     </div>
<div class="item" data-value="31"> FURY_ATTACK     </div>
<div class="item" data-value="32"> HORN_DRILL      </div>
<div class="item" data-value="33"> TACKLE          </div>
<div class="item" data-value="34"> BODY_SLAM       </div>
<div class="item" data-value="35"> WRAP            </div>
<div class="item" data-value="36"> TAKE_DOWN       </div>
<div class="item" data-value="37"> THRASH          </div>
<div class="item" data-value="38"> DOUBLE_EDGE     </div>
<div class="item" data-value="39"> TAIL_WHIP       </div>
<div class="item" data-value="40"> POISON_STING    </div>
<div class="item" data-value="41"> TWINEEDLE       </div>
<div class="item" data-value="42"> PIN_MISSILE     </div>
<div class="item" data-value="43"> LEER            </div>
<div class="item" data-value="44"> BITE            </div>
<div class="item" data-value="45"> GROWL           </div>
<div class="item" data-value="46"> ROAR            </div>
<div class="item" data-value="47"> SING            </div>
<div class="item" data-value="48"> SUPERSONIC      </div>
<div class="item" data-value="49"> SONIC_BOOM      </div>
<div class="item" data-value="50"> DISABLE         </div>
<div class="item" data-value="51"> ACID            </div>
<div class="item" data-value="52"> EMBER           </div>
<div class="item" data-value="53"> FLAMETHROWER    </div>
<div class="item" data-value="54"> MIST            </div>
<div class="item" data-value="55"> WATER_GUN       </div>
<div class="item" data-value="56"> HYDRO_PUMP      </div>
<div class="item" data-value="57"> SURF            </div>
<div class="item" data-value="58"> ICE_BEAM        </div>
<div class="item" data-value="59"> BLIZZARD        </div>
<div class="item" data-value="60"> PSYBEAM         </div>
<div class="item" data-value="61"> BUBBLE_BEAM     </div>
<div class="item" data-value="62"> AURORA_BEAM     </div>
<div class="item" data-value="63"> HYPER_BEAM      </div>
<div class="item" data-value="64"> PECK            </div>
<div class="item" data-value="65"> DRILL_PECK      </div>
<div class="item" data-value="66"> SUBMISSION      </div>
<div class="item" data-value="67"> LOW_KICK        </div>
<div class="item" data-value="68"> COUNTER         </div>
<div class="item" data-value="69"> SEISMIC_TOSS    </div>
<div class="item" data-value="70"> STRENGTH        </div>
<div class="item" data-value="71"> ABSORB          </div>
<div class="item" data-value="72"> MEGA_DRAIN      </div>
<div class="item" data-value="73"> LEECH_SEED      </div>
<div class="item" data-value="74"> GROWTH          </div>
<div class="item" data-value="75"> RAZOR_LEAF      </div>
<div class="item" data-value="76"> SOLAR_BEAM      </div>
<div class="item" data-value="77"> POISON_POWDER   </div>
<div class="item" data-value="78"> STUN_SPORE      </div>
<div class="item" data-value="79"> SLEEP_POWDER    </div>
<div class="item" data-value="80"> PETAL_DANCE     </div>
<div class="item" data-value="81"> STRING_SHOT     </div>
<div class="item" data-value="82"> DRAGON_RAGE     </div>
<div class="item" data-value="83"> FIRE_SPIN       </div>
<div class="item" data-value="84"> THUNDER_SHOCK   </div>
<div class="item" data-value="85"> THUNDERBOLT     </div>
<div class="item" data-value="86"> THUNDER_WAVE    </div>
<div class="item" data-value="87"> THUNDER         </div>
<div class="item" data-value="88"> ROCK_THROW      </div>
<div class="item" data-value="89"> EARTHQUAKE      </div>
<div class="item" data-value="90"> FISSURE         </div>
<div class="item" data-value="91"> DIG             </div>
<div class="item" data-value="92"> TOXIC           </div>
<div class="item" data-value="93"> CONFUSION       </div>
<div class="item" data-value="94"> PSYCHIC         </div>
<div class="item" data-value="95"> HYPNOSIS        </div>
<div class="item" data-value="96"> MEDITATE        </div>
<div class="item" data-value="97"> AGILITY         </div>
<div class="item" data-value="098">QUICK_ATTACK    </div>
<div class="item" data-value="099">RAGE            </div>
<div class="item" data-value="100">TELEPORT        </div>
<div class="item" data-value="101">NIGHT_SHADE     </div>
<div class="item" data-value="102">MIMIC           </div>
<div class="item" data-value="103">SCREECH         </div>
<div class="item" data-value="104">DOUBLE_TEAM     </div>
<div class="item" data-value="105">RECOVER         </div>
<div class="item" data-value="106">HARDEN          </div>
<div class="item" data-value="107">MINIMIZE        </div>
<div class="item" data-value="108">SMOKESCREEN     </div>
<div class="item" data-value="109">CONFUSE_RAY     </div>
<div class="item" data-value="110">WITHDRAW        </div>
<div class="item" data-value="111">DEFENSE_CURL    </div>
<div class="item" data-value="112">BARRIER         </div>
<div class="item" data-value="113">LIGHT_SCREEN    </div>
<div class="item" data-value="114">HAZE            </div>
<div class="item" data-value="115">REFLECT         </div>
<div class="item" data-value="116">FOCUS_ENERGY    </div>
<div class="item" data-value="117">BIDE            </div>
<div class="item" data-value="118">METRONOME       </div>
<div class="item" data-value="119">MIRROR_MOVE     </div>
<div class="item" data-value="120">SELF_DESTRUCT   </div>
<div class="item" data-value="121">EGG_BOMB        </div>
<div class="item" data-value="122">LICK            </div>
<div class="item" data-value="123">SMOG            </div>
<div class="item" data-value="124">SLUDGE          </div>
<div class="item" data-value="125">BONE_CLUB       </div>
<div class="item" data-value="126">FIRE_BLAST      </div>
<div class="item" data-value="127">WATERFALL       </div>
<div class="item" data-value="128">CLAMP           </div>
<div class="item" data-value="129">SWIFT           </div>
<div class="item" data-value="130">SKULL_BASH      </div>
<div class="item" data-value="131">SPIKE_CANNON    </div>
<div class="item" data-value="132">CONSTRICT       </div>
<div class="item" data-value="133">AMNESIA         </div>
<div class="item" data-value="134">KINESIS         </div>
<div class="item" data-value="135">SOFT_BOILED     </div>
<div class="item" data-value="136">HI_JUMP_KICK    </div>
<div class="item" data-value="137">GLARE           </div>
<div class="item" data-value="138">DREAM_EATER     </div>
<div class="item" data-value="139">POISON_GAS      </div>
<div class="item" data-value="140">BARRAGE         </div>
<div class="item" data-value="141">LEECH_LIFE      </div>
<div class="item" data-value="142">LOVELY_KISS     </div>
<div class="item" data-value="143">SKY_ATTACK      </div>
<div class="item" data-value="144">TRANSFORM       </div>
<div class="item" data-value="145">BUBBLE          </div>
<div class="item" data-value="146">DIZZY_PUNCH     </div>
<div class="item" data-value="147">SPORE           </div>
<div class="item" data-value="148">FLASH           </div>
<div class="item" data-value="149">PSYWAVE         </div>
<div class="item" data-value="150">SPLASH          </div>
<div class="item" data-value="151">ACID_ARMOR      </div>
<div class="item" data-value="152">CRABHAMMER      </div>
<div class="item" data-value="153">EXPLOSION       </div>
<div class="item" data-value="154">FURY_SWIPES     </div>
<div class="item" data-value="155">BONEMERANG      </div>
<div class="item" data-value="156">REST            </div>
<div class="item" data-value="157">ROCK_SLIDE      </div>
<div class="item" data-value="158">HYPER_FANG      </div>
<div class="item" data-value="159">SHARPEN         </div>
<div class="item" data-value="160">CONVERSION      </div>
<div class="item" data-value="161">TRI_ATTACK      </div>
<div class="item" data-value="162">SUPER_FANG      </div>
<div class="item" data-value="163">SLASH           </div>
<div class="item" data-value="164">SUBSTITUTE      </div>
<div class="item" data-value="165">STRUGGLE        </div>
<div class="item" data-value="166">SKETCH          </div>
<div class="item" data-value="167">TRIPLE_KICK     </div>
<div class="item" data-value="168">THIEF           </div>
<div class="item" data-value="169">SPIDER_WEB      </div>
<div class="item" data-value="170">MIND_READER     </div>
<div class="item" data-value="171">NIGHTMARE       </div>
<div class="item" data-value="172">FLAME_WHEEL     </div>
<div class="item" data-value="173">SNORE           </div>
<div class="item" data-value="174">CURSE           </div>
<div class="item" data-value="175">FLAIL           </div>
<div class="item" data-value="176">CONVERSION_2    </div>
<div class="item" data-value="177">AEROBLAST       </div>
<div class="item" data-value="178">COTTON_SPORE    </div>
<div class="item" data-value="179">REVERSAL        </div>
<div class="item" data-value="180">SPITE           </div>
<div class="item" data-value="181">POWDER_SNOW     </div>
<div class="item" data-value="182">PROTECT         </div>
<div class="item" data-value="183">MACH_PUNCH      </div>
<div class="item" data-value="184">SCARY_FACE      </div>
<div class="item" data-value="185">FAINT_ATTACK    </div>
<div class="item" data-value="186">SWEET_KISS      </div>
<div class="item" data-value="187">BELLY_DRUM      </div>
<div class="item" data-value="188">SLUDGE_BOMB     </div>
<div class="item" data-value="189">MUD_SLAP        </div>
<div class="item" data-value="190">OCTAZOOKA       </div>
<div class="item" data-value="191">SPIKES          </div>
<div class="item" data-value="192">ZAP_CANNON      </div>
<div class="item" data-value="193">FORESIGHT       </div>
<div class="item" data-value="194">DESTINY_BOND    </div>
<div class="item" data-value="195">PERISH_SONG     </div>
<div class="item" data-value="196">ICY_WIND        </div>
<div class="item" data-value="197">DETECT          </div>
<div class="item" data-value="198">BONE_RUSH       </div>
<div class="item" data-value="199">LOCK_ON         </div>
<div class="item" data-value="200">OUTRAGE         </div>
<div class="item" data-value="201">SANDSTORM       </div>
<div class="item" data-value="202">GIGA_DRAIN      </div>
<div class="item" data-value="203">ENDURE          </div>
<div class="item" data-value="204">CHARM           </div>
<div class="item" data-value="205">ROLLOUT         </div>
<div class="item" data-value="206">FALSE_SWIPE     </div>
<div class="item" data-value="207">SWAGGER         </div>
<div class="item" data-value="208">MILK_DRINK      </div>
<div class="item" data-value="209">SPARK           </div>
<div class="item" data-value="210">FURY_CUTTER     </div>
<div class="item" data-value="211">STEEL_WING      </div>
<div class="item" data-value="212">MEAN_LOOK       </div>
<div class="item" data-value="213">ATTRACT         </div>
<div class="item" data-value="214">SLEEP_TALK      </div>
<div class="item" data-value="215">HEAL_BELL       </div>
<div class="item" data-value="216">RETURN          </div>
<div class="item" data-value="217">PRESENT         </div>
<div class="item" data-value="218">FRUSTRATION     </div>
<div class="item" data-value="219">SAFEGUARD       </div>
<div class="item" data-value="220">PAIN_SPLIT      </div>
<div class="item" data-value="221">SACRED_FIRE     </div>
<div class="item" data-value="222">MAGNITUDE       </div>
<div class="item" data-value="223">DYNAMIC_PUNCH   </div>
<div class="item" data-value="224">MEGAHORN        </div>
<div class="item" data-value="225">DRAGON_BREATH   </div>
<div class="item" data-value="226">BATON_PASS      </div>
<div class="item" data-value="227">ENCORE          </div>
<div class="item" data-value="228">PURSUIT         </div>
<div class="item" data-value="229">RAPID_SPIN      </div>
<div class="item" data-value="230">SWEET_SCENT     </div>
<div class="item" data-value="231">IRON_TAIL       </div>
<div class="item" data-value="232">METAL_CLAW      </div>
<div class="item" data-value="233">VITAL_THROW     </div>
<div class="item" data-value="234">MORNING_SUN     </div>
<div class="item" data-value="235">SYNTHESIS       </div>
<div class="item" data-value="236">MOONLIGHT       </div>
<div class="item" data-value="237">HIDDEN_POWER    </div>
<div class="item" data-value="238">CROSS_CHOP      </div>
<div class="item" data-value="239">TWISTER         </div>
<div class="item" data-value="240">RAIN_DANCE      </div>
<div class="item" data-value="241">SUNNY_DAY       </div>
<div class="item" data-value="242">CRUNCH          </div>
<div class="item" data-value="243">MIRROR_COAT     </div>
<div class="item" data-value="244">PSYCH_UP        </div>
<div class="item" data-value="245">EXTREME_SPEED   </div>
<div class="item" data-value="246">ANCIENT_POWER   </div>
<div class="item" data-value="247">SHADOW_BALL     </div>
<div class="item" data-value="248">FUTURE_SIGHT    </div>
<div class="item" data-value="249">ROCK_SMASH      </div>
<div class="item" data-value="250">WHIRLPOOL       </div>
<div class="item" data-value="251">BEAT_UP         </div>
<div class="item" data-value="252">FAKE_OUT        </div>
<div class="item" data-value="253">UPROAR          </div>
<div class="item" data-value="254">STOCKPILE       </div>
<div class="item" data-value="255">SPIT_UP         </div>
<div class="item" data-value="256">SWALLOW         </div>
<div class="item" data-value="257">HEAT_WAVE       </div>
<div class="item" data-value="258">HAIL            </div>
<div class="item" data-value="259">TORMENT         </div>
<div class="item" data-value="260">FLATTER         </div>
<div class="item" data-value="261">WILL_O_WISP     </div>
<div class="item" data-value="262">MEMENTO         </div>
<div class="item" data-value="263">FACADE          </div>
<div class="item" data-value="264">FOCUS_PUNCH     </div>
<div class="item" data-value="265">SMELLING_SALT   </div>
<div class="item" data-value="266">FOLLOW_ME       </div>
<div class="item" data-value="267">NATURE_POWER    </div>
<div class="item" data-value="268">CHARGE          </div>
<div class="item" data-value="269">TAUNT           </div>
<div class="item" data-value="270">HELPING_HAND    </div>
<div class="item" data-value="271">TRICK           </div>
<div class="item" data-value="272">ROLE_PLAY       </div>
<div class="item" data-value="273">WISH            </div>
<div class="item" data-value="274">ASSIST          </div>
<div class="item" data-value="275">INGRAIN         </div>
<div class="item" data-value="276">SUPERPOWER      </div>
<div class="item" data-value="277">MAGIC_COAT      </div>
<div class="item" data-value="278">RECYCLE         </div>
<div class="item" data-value="279">REVENGE         </div>
<div class="item" data-value="280">BRICK_BREAK     </div>
<div class="item" data-value="281">YAWN            </div>
<div class="item" data-value="282">KNOCK_OFF       </div>
<div class="item" data-value="283">ENDEAVOR        </div>
<div class="item" data-value="284">ERUPTION        </div>
<div class="item" data-value="285">SKILL_SWAP      </div>
<div class="item" data-value="286">IMPRISON        </div>
<div class="item" data-value="287">REFRESH         </div>
<div class="item" data-value="288">GRUDGE          </div>
<div class="item" data-value="289">SNATCH          </div>
<div class="item" data-value="290">SECRET_POWER    </div>
<div class="item" data-value="291">DIVE            </div>
<div class="item" data-value="292">ARM_THRUST      </div>
<div class="item" data-value="293">CAMOUFLAGE      </div>
<div class="item" data-value="294">TAIL_GLOW       </div>
<div class="item" data-value="295">LUSTER_PURGE    </div>
<div class="item" data-value="296">MIST_BALL       </div>
<div class="item" data-value="297">FEATHER_DANCE   </div>
<div class="item" data-value="298">TEETER_DANCE    </div>
<div class="item" data-value="299">BLAZE_KICK      </div>
<div class="item" data-value="300">MUD_SPORT       </div>
<div class="item" data-value="301">ICE_BALL        </div>
<div class="item" data-value="302">NEEDLE_ARM      </div>
<div class="item" data-value="303">SLACK_OFF       </div>
<div class="item" data-value="304">HYPER_VOICE     </div>
<div class="item" data-value="305">POISON_FANG     </div>
<div class="item" data-value="306">CRUSH_CLAW      </div>
<div class="item" data-value="307">BLAST_BURN      </div>
<div class="item" data-value="308">HYDRO_CANNON    </div>
<div class="item" data-value="309">METEOR_MASH     </div>
<div class="item" data-value="310">ASTONISH        </div>
<div class="item" data-value="311">WEATHER_BALL    </div>
<div class="item" data-value="312">AROMATHERAPY    </div>
<div class="item" data-value="313">FAKE_TEARS      </div>
<div class="item" data-value="314">AIR_CUTTER      </div>
<div class="item" data-value="315">OVERHEAT        </div>
<div class="item" data-value="316">ODOR_SLEUTH     </div>
<div class="item" data-value="317">ROCK_TOMB       </div>
<div class="item" data-value="318">SILVER_WIND     </div>
<div class="item" data-value="319">METAL_SOUND     </div>
<div class="item" data-value="320">GRASS_WHISTLE   </div>
<div class="item" data-value="321">TICKLE          </div>
<div class="item" data-value="322">COSMIC_POWER    </div>
<div class="item" data-value="323">WATER_SPOUT     </div>
<div class="item" data-value="324">SIGNAL_BEAM     </div>
<div class="item" data-value="325">SHADOW_PUNCH    </div>
<div class="item" data-value="326">EXTRASENSORY    </div>
<div class="item" data-value="327">SKY_UPPERCUT    </div>
<div class="item" data-value="328">SAND_TOMB       </div>
<div class="item" data-value="329">SHEER_COLD      </div>
<div class="item" data-value="330">MUDDY_WATER     </div>
<div class="item" data-value="331">BULLET_SEED     </div>
<div class="item" data-value="332">AERIAL_ACE      </div>
<div class="item" data-value="333">ICICLE_SPEAR    </div>
<div class="item" data-value="334">IRON_DEFENSE    </div>
<div class="item" data-value="335">BLOCK           </div>
<div class="item" data-value="336">HOWL            </div>
<div class="item" data-value="337">DRAGON_CLAW     </div>
<div class="item" data-value="338">FRENZY_PLANT    </div>
<div class="item" data-value="339">BULK_UP         </div>
<div class="item" data-value="340">BOUNCE          </div>
<div class="item" data-value="341">MUD_SHOT        </div>
<div class="item" data-value="342">POISON_TAIL     </div>
<div class="item" data-value="343">COVET           </div>
<div class="item" data-value="344">VOLT_TACKLE     </div>
<div class="item" data-value="345">MAGICAL_LEAF    </div>
<div class="item" data-value="346">WATER_SPORT     </div>
<div class="item" data-value="347">CALM_MIND       </div>
<div class="item" data-value="348">LEAF_BLADE      </div>
<div class="item" data-value="349">DRAGON_DANCE    </div>
<div class="item" data-value="350">ROCK_BLAST      </div>
<div class="item" data-value="351">SHOCK_WAVE      </div>
<div class="item" data-value="352">WATER_PULSE     </div>
<div class="item" data-value="353">DOOM_DESIRE     </div>
<div class="item" data-value="354">PSYCHO_BOOST    </div>`

const itemsList = `
<div class="item" data-value="0">NONE              </div>
<div class="item" data-value="1">MASTER BALL       </div>
<div class="item" data-value="2">ULTRA BALL        </div>
<div class="item" data-value="3">GREAT BALL        </div>
<div class="item" data-value="4">POKE BALL         </div>
<div class="item" data-value="6">NET BALL          </div>
<div class="item" data-value="7">DIVE BALL         </div>
<div class="item" data-value="8">NEST BALL         </div>
<div class="item" data-value="9">REPEAT BALL       </div>
<div class="item" data-value="10">TIMER BALL       </div>
<div class="item" data-value="11">LUXURY BALL      </div>
<div class="item" data-value="12">PREMIER BALL     </div>
<div class="item" data-value="13">POTION           </div>
<div class="item" data-value="14">ANTIDOTE         </div>
<div class="item" data-value="15">BURN HEAL        </div>
<div class="item" data-value="16">ICE HEAL         </div>
<div class="item" data-value="17">AWAKENING        </div>
<div class="item" data-value="18">PARALYZE HEAL    </div>
<div class="item" data-value="19">FULL RESTORE     </div>
<div class="item" data-value="20">MAX POTION       </div>
<div class="item" data-value="21">HYPER POTION     </div>
<div class="item" data-value="22">SUPER POTION     </div>
<div class="item" data-value="23">FULL HEAL        </div>
<div class="item" data-value="24">REVIVE           </div>
<div class="item" data-value="25">MAX REVIVE       </div>
<div class="item" data-value="26">FRESH WATER      </div>
<div class="item" data-value="27">SODA POP         </div>
<div class="item" data-value="28">LEMONADE         </div>
<div class="item" data-value="29">MOOMOO MILK      </div>
<div class="item" data-value="30">ENERGY POWDER    </div>
<div class="item" data-value="31">ENERGY ROOT      </div>
<div class="item" data-value="32">HEAL POWDER      </div>
<div class="item" data-value="33">REVIVAL HERB     </div>
<div class="item" data-value="34">ETHER            </div>
<div class="item" data-value="35">MAX ETHER        </div>
<div class="item" data-value="36">ELIXIR           </div>
<div class="item" data-value="37">MAX ELIXIR       </div>
<div class="item" data-value="38">LAVA COOKIE      </div>
<div class="item" data-value="39">BLUE FLUTE       </div>
<div class="item" data-value="40">YELLOW FLUTE     </div>
<div class="item" data-value="41">RED FLUTE        </div>
<div class="item" data-value="42">BLACK FLUTE      </div>
<div class="item" data-value="43">WHITE FLUTE      </div>
<div class="item" data-value="44">BERRY JUICE      </div>
<div class="item" data-value="45">SACRED ASH       </div>
<div class="item" data-value="46">SHOAL SALT       </div>
<div class="item" data-value="47">SHOAL SHELL      </div>
<div class="item" data-value="48">RED SHARD        </div>
<div class="item" data-value="49">BLUE SHARD       </div>
<div class="item" data-value="50">YELLOW SHARD     </div>
<div class="item" data-value="51">GREEN SHARD      </div>
<div class="item" data-value="63">HP UP            </div>
<div class="item" data-value="64">PROTEIN          </div>
<div class="item" data-value="65">IRON             </div>
<div class="item" data-value="66">CARBOS           </div>
<div class="item" data-value="67">CALCIUM          </div>
<div class="item" data-value="68">RARE CANDY       </div>
<div class="item" data-value="69">PP UP            </div>
<div class="item" data-value="70">ZINC             </div>
<div class="item" data-value="71">PP MAX           </div>
<div class="item" data-value="73">GUARD SPEC       </div>
<div class="item" data-value="74">DIRE HIT         </div>
<div class="item" data-value="75">X ATTACK         </div>
<div class="item" data-value="76">X DEFEND         </div>
<div class="item" data-value="77">X SPEED          </div>
<div class="item" data-value="78">X ACCURACY       </div>
<div class="item" data-value="79">X SPECIAL        </div>
<div class="item" data-value="80">POKE DOLL        </div>
<div class="item" data-value="81">FLUFFY TAIL      </div>
<div class="item" data-value="82">052              </div>
<div class="item" data-value="83">SUPER REPEL      </div>
<div class="item" data-value="84">MAX REPEL        </div>
<div class="item" data-value="85">ESCAPE ROPE      </div>
<div class="item" data-value="86">REPEL            </div>
<div class="item" data-value="93">SUN STONE        </div>
<div class="item" data-value="94">MOON STONE       </div>
<div class="item" data-value="95">FIRE STONE       </div>
<div class="item" data-value="96">THUNDER STONE    </div>
<div class="item" data-value="97">WATER STONE      </div>
<div class="item" data-value="98">LEAF STONE       </div>
<div class="item" data-value="103"> TINY MUSHROOM  </div>
<div class="item" data-value="104"> BIG MUSHROOM   </div>
<div class="item" data-value="106"> PEARL          </div>
<div class="item" data-value="107"> BIG PEARL      </div>
<div class="item" data-value="108"> STARDUST       </div>
<div class="item" data-value="109"> STAR PIECE     </div>
<div class="item" data-value="110"> NUGGET         </div>
<div class="item" data-value="111"> HEART SCALE    </div>
<div class="item" data-value="121"> ORANGE MAIL    </div>
<div class="item" data-value="122"> HARBOR MAIL    </div>
<div class="item" data-value="123"> GLITTER MAIL   </div>
<div class="item" data-value="124"> MECH MAIL      </div>
<div class="item" data-value="125"> WOOD MAIL      </div>
<div class="item" data-value="126"> WAVE MAIL      </div>
<div class="item" data-value="127"> BEAD MAIL      </div>
<div class="item" data-value="128"> SHADOW MAIL    </div>
<div class="item" data-value="129"> TROPIC MAIL    </div>
<div class="item" data-value="130"> DREAM MAIL     </div>
<div class="item" data-value="131"> FAB MAIL       </div>
<div class="item" data-value="132"> RETRO MAIL     </div>
<div class="item" data-value="133"> CHERI BERRY    </div>
<div class="item" data-value="134"> CHESTO BERRY   </div>
<div class="item" data-value="135"> PECHA BERRY    </div>
<div class="item" data-value="136"> RAWST BERRY    </div>
<div class="item" data-value="137"> ASPEAR BERRY   </div>
<div class="item" data-value="138"> LEPPA BERRY    </div>
<div class="item" data-value="139"> ORAN BERRY     </div>
<div class="item" data-value="140"> PERSIM BERRY   </div>
<div class="item" data-value="141"> LUM BERRY      </div>
<div class="item" data-value="142"> SITRUS BERRY   </div>
<div class="item" data-value="143"> FIGY BERRY     </div>
<div class="item" data-value="144"> WIKI BERRY     </div>
<div class="item" data-value="145"> MAGO BERRY     </div>
<div class="item" data-value="146"> AGUAV BERRY    </div>
<div class="item" data-value="147"> IAPAPA BERRY   </div>
<div class="item" data-value="148"> RAZZ BERRY     </div>
<div class="item" data-value="149"> BLUK BERRY     </div>
<div class="item" data-value="150"> NANAB BERRY    </div>
<div class="item" data-value="151"> WEPEAR BERRY   </div>
<div class="item" data-value="152"> PINAP BERRY    </div>
<div class="item" data-value="153"> POMEG BERRY    </div>
<div class="item" data-value="154"> KELPSY BERRY   </div>
<div class="item" data-value="155"> QUALOT BERRY   </div>
<div class="item" data-value="156"> HONDEW BERRY   </div>
<div class="item" data-value="157"> GREPA BERRY    </div>
<div class="item" data-value="158"> TAMATO BERRY   </div>
<div class="item" data-value="159"> CORNN BERRY    </div>
<div class="item" data-value="160"> MAGOST BERRY   </div>
<div class="item" data-value="161"> RABUTA BERRY   </div>
<div class="item" data-value="162"> NOMEL BERRY    </div>
<div class="item" data-value="163"> SPELON BERRY   </div>
<div class="item" data-value="164"> PAMTRE BERRY   </div>
<div class="item" data-value="165"> WATMEL BERRY   </div>
<div class="item" data-value="166"> DURIN BERRY    </div>
<div class="item" data-value="167"> BELUE BERRY    </div>
<div class="item" data-value="168"> LIECHI BERRY   </div>
<div class="item" data-value="169"> GANLON BERRY   </div>
<div class="item" data-value="170"> SALAC BERRY    </div>
<div class="item" data-value="171"> PETAYA BERRY   </div>
<div class="item" data-value="172"> APICOT BERRY   </div>
<div class="item" data-value="173"> LANSAT BERRY   </div>
<div class="item" data-value="174"> STARF BERRY    </div>
<div class="item" data-value="175"> ENIGMA BERRY   </div>
<div class="item" data-value="179"> BRIGHT POWDER  </div>
<div class="item" data-value="180"> WHITE HERB     </div>
<div class="item" data-value="181"> MACHO BRACE    </div>
<div class="item" data-value="182"> EXP SHARE      </div>
<div class="item" data-value="183"> QUICK CLAW     </div>
<div class="item" data-value="184"> SOOTHE BELL    </div>
<div class="item" data-value="185"> MENTAL HERB    </div>
<div class="item" data-value="186"> CHOICE BAND    </div>
<div class="item" data-value="187"> KINGS ROCK     </div>
<div class="item" data-value="188"> SILVER POWDER  </div>
<div class="item" data-value="189"> AMULET COIN    </div>
<div class="item" data-value="190"> CLEANSE TAG    </div>
<div class="item" data-value="191"> SOUL DEW       </div>
<div class="item" data-value="192"> DEEP SEA TOOTH </div>
<div class="item" data-value="193"> DEEP SEA SCALE </div>
<div class="item" data-value="194"> SMOKE BALL     </div>
<div class="item" data-value="195"> EVERSTONE      </div>
<div class="item" data-value="196"> FOCUS BAND     </div>
<div class="item" data-value="197"> LUCKY EGG      </div>
<div class="item" data-value="198"> SCOPE LENS     </div>
<div class="item" data-value="199"> METAL COAT     </div>
<div class="item" data-value="200"> LEFTOVERS      </div>
<div class="item" data-value="201"> DRAGON SCALE   </div>
<div class="item" data-value="202"> LIGHT BALL     </div>
<div class="item" data-value="203"> SOFT SAND      </div>
<div class="item" data-value="204"> HARD STONE     </div>
<div class="item" data-value="205"> MIRACLE SEED   </div>
<div class="item" data-value="206"> BLACK GLASSES  </div>
<div class="item" data-value="207"> BLACK BELT     </div>
<div class="item" data-value="208"> MAGNET         </div>
<div class="item" data-value="209"> MYSTIC WATER   </div>
<div class="item" data-value="210"> SHARP BEAK     </div>
<div class="item" data-value="211"> POISON BARB    </div>
<div class="item" data-value="212"> NEVER MELT ICE </div>
<div class="item" data-value="213"> SPELL TAG      </div>
<div class="item" data-value="214"> TWISTED SPOON  </div>
<div class="item" data-value="215"> CHARCOAL       </div>
<div class="item" data-value="216"> DRAGON FANG    </div>
<div class="item" data-value="217"> SILK SCARF     </div>
<div class="item" data-value="218"> UP GRADE       </div>
<div class="item" data-value="219"> SHELL BELL     </div>
<div class="item" data-value="220"> SEA INCENSE    </div>
<div class="item" data-value="221"> LAX INCENSE    </div>
<div class="item" data-value="222"> LUCKY PUNCH    </div>
<div class="item" data-value="223"> METAL POWDER   </div>
<div class="item" data-value="224"> THICK CLUB     </div>
<div class="item" data-value="225"> STICK          </div>
<div class="item" data-value="254"> RED SCARF      </div>
<div class="item" data-value="255"> BLUE SCARF     </div>
<div class="item" data-value="256"> PINK SCARF     </div>
<div class="item" data-value="257"> GREEN SCARF    </div>
<div class="item" data-value="258"> YELLOW SCARF   </div>
<div class="item" data-value="289"> TM01           </div>
<div class="item" data-value="290"> TM02           </div>
<div class="item" data-value="291"> TM03           </div>
<div class="item" data-value="292"> TM04           </div>
<div class="item" data-value="293"> TM05           </div>
<div class="item" data-value="294"> TM06           </div>
<div class="item" data-value="295"> TM07           </div>
<div class="item" data-value="296"> TM08           </div>
<div class="item" data-value="297"> TM09           </div>
<div class="item" data-value="298"> TM10           </div>
<div class="item" data-value="299"> TM11           </div>
<div class="item" data-value="300"> TM12           </div>
<div class="item" data-value="301"> TM13           </div>
<div class="item" data-value="302"> TM14           </div>
<div class="item" data-value="303"> TM15           </div>
<div class="item" data-value="304"> TM16           </div>
<div class="item" data-value="305"> TM17           </div>
<div class="item" data-value="306"> TM18           </div>
<div class="item" data-value="307"> TM19           </div>
<div class="item" data-value="308"> TM20           </div>
<div class="item" data-value="309"> TM21           </div>
<div class="item" data-value="310"> TM22           </div>
<div class="item" data-value="311"> TM23           </div>
<div class="item" data-value="312"> TM24           </div>
<div class="item" data-value="313"> TM25           </div>
<div class="item" data-value="314"> TM26           </div>
<div class="item" data-value="315"> TM27           </div>
<div class="item" data-value="316"> TM28           </div>
<div class="item" data-value="317"> TM29           </div>
<div class="item" data-value="318"> TM30           </div>
<div class="item" data-value="319"> TM31           </div>
<div class="item" data-value="320"> TM32           </div>
<div class="item" data-value="321"> TM33           </div>
<div class="item" data-value="322"> TM34           </div>
<div class="item" data-value="323"> TM35           </div>
<div class="item" data-value="324"> TM36           </div>
<div class="item" data-value="325"> TM37           </div>
<div class="item" data-value="326"> TM38           </div>
<div class="item" data-value="327"> TM39           </div>
<div class="item" data-value="328"> TM40           </div>
<div class="item" data-value="329"> TM41           </div>
<div class="item" data-value="330"> TM42           </div>
<div class="item" data-value="331"> TM43           </div>
<div class="item" data-value="332"> TM44           </div>
<div class="item" data-value="333"> TM45           </div>
<div class="item" data-value="334"> TM46           </div>
<div class="item" data-value="335"> TM47           </div>
<div class="item" data-value="336"> TM48           </div>
<div class="item" data-value="337"> TM49           </div>
<div class="item" data-value="338"> TM50           </div>
<div class="item" data-value="259"> MACH BIKE      </div>
<div class="item" data-value="260"> COIN CASE      </div>
<div class="item" data-value="261"> ITEMFINDER     </div>
<div class="item" data-value="262"> OLD ROD        </div>
<div class="item" data-value="263"> GOOD ROD       </div>
<div class="item" data-value="264"> SUPER ROD      </div>
<div class="item" data-value="265"> SS TICKET      </div>
<div class="item" data-value="266"> CONTEST PASS   </div>
<div class="item" data-value="268"> WAILMER PAIL   </div>
<div class="item" data-value="269"> DEVON GOODS    </div>
<div class="item" data-value="270"> SOOT SACK      </div>
<div class="item" data-value="271"> BASEMENT KEY   </div>
<div class="item" data-value="272"> ACRO BIKE      </div>
<div class="item" data-value="273"> POKEBLOCK CASE </div>
<div class="item" data-value="274"> LETTER         </div>
<div class="item" data-value="275"> EON TICKET     </div>
<div class="item" data-value="276"> RED ORB        </div>
<div class="item" data-value="277"> BLUE ORB       </div>
<div class="item" data-value="278"> SCANNER        </div>
<div class="item" data-value="279"> GO GOGGLES     </div>
<div class="item" data-value="280"> METEORITE      </div>
<div class="item" data-value="281"> ROOM 1 KEY     </div>
<div class="item" data-value="282"> ROOM 2 KEY     </div>
<div class="item" data-value="283"> ROOM 4 KEY     </div>
<div class="item" data-value="284"> ROOM 6 KEY     </div>
<div class="item" data-value="285"> STORAGE KEY    </div>
<div class="item" data-value="286"> ROOT FOSSIL    </div>
<div class="item" data-value="287"> CLAW FOSSIL    </div>
<div class="item" data-value="288"> DEVON SCOPE    </div>
<div class="item" data-value="349"> OAKS PARCEL    </div>
<div class="item" data-value="350"> POKE FLUTE     </div>
<div class="item" data-value="351"> SECRET KEY     </div>
<div class="item" data-value="352"> BIKE VOUCHER   </div>
<div class="item" data-value="353"> GOLD TEETH     </div>
<div class="item" data-value="354"> OLD AMBER      </div>
<div class="item" data-value="355"> CARD KEY       </div>
<div class="item" data-value="356"> LIFT KEY       </div>
<div class="item" data-value="357"> HELIX FOSSIL   </div>
<div class="item" data-value="358"> DOME FOSSIL    </div>
<div class="item" data-value="359"> SILPH SCOPE    </div>
<div class="item" data-value="360"> BICYCLE        </div>
<div class="item" data-value="361"> TOWN MAP       </div>
<div class="item" data-value="362"> VS SEEKER      </div>
<div class="item" data-value="363"> FAME CHECKER   </div>
<div class="item" data-value="364"> TM CASE        </div>
<div class="item" data-value="365"> BERRY POUCH    </div>
<div class="item" data-value="366"> TEACHY TV      </div>
<div class="item" data-value="367"> TRI PASS       </div>
<div class="item" data-value="368"> RAINBOW PASS   </div>
<div class="item" data-value="369"> TEA            </div>
<div class="item" data-value="370"> MYSTIC TICKET  </div>
<div class="item" data-value="371"> AURORA TICKET  </div>
<div class="item" data-value="372"> POWDER JAR     </div>
<div class="item" data-value="373"> RUBY           </div>
<div class="item" data-value="374"> SAPPHIRE       </div>
<div class="item" data-value="375"> MAGMA EMBLEM   </div>
<div class="item" data-value="376"> OLD SEA MAP    </div>`

const EC_MASK_BITS = 9;

const EC_GROUP_POKEMON          = 0;
const EC_GROUP_TRAINER          = 1;
const EC_GROUP_STATUS           = 2;
const EC_GROUP_BATTLE           = 3;
const EC_GROUP_GREETINGS        = 4;
const EC_GROUP_PEOPLE           = 5;
const EC_GROUP_VOICES           = 6;
const EC_GROUP_SPEECH           = 7;
const EC_GROUP_ENDINGS          = 8;
const EC_GROUP_FEELINGS         = 9;
const EC_GROUP_CONDITIONS       = 10;
const EC_GROUP_ACTIONS          = 11;
const EC_GROUP_LIFESTYLE        = 12;
const EC_GROUP_HOBBIES          = 13;
const EC_GROUP_TIME             = 14;
const EC_GROUP_MISC             = 15;
const EC_GROUP_ADJECTIVES       = 16;
const EC_GROUP_EVENTS           = 17;
const EC_GROUP_MOVE_1           = 18;
const EC_GROUP_MOVE_2           = 19;
const EC_GROUP_TRENDY_SAYING    = 20;
const EC_GROUP_POKEMON_NATIONAL = 21;

var words = new Map();

// TRAINER
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 0),"I CHOOSE YOU");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 1),"GOTCHA");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 2),"TRADE");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 3),"SAPPHIRE");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 4),"EVOLVE");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 5),"ENCYCLOPEDIA");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 6),"NATURE");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 7),"CENTER");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 8),"EGG");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 9),"LINK");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 10),"SP. ABILITY");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 11),"TRAINER");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 12),"VERSION");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 13),"POKéNAV");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 14),"POKéMON");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 15),"GET");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 16),"POKéDEX");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 17),"RUBY");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 18),"LEVEL");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 19),"RED");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 20),"GREEN");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 21),"BAG");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 22),"FLAME");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 23),"GOLD");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 24),"LEAF");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 25),"SILVER");
words.set(((EC_GROUP_TRAINER << EC_MASK_BITS) | 26),"EMERALD");

// STATUS
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 0),"DARK");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 1),"STENCH");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 2),"THICK FAT");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 3),"RAIN DISH");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 4),"DRIZZLE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 5),"ARENA TRAP");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 6),"INTIMIDATE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 7),"ROCK HEAD");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 8),"COLOR");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 9),"ALT. COLOR");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 10),"ROCK");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 11),"BEAUTIFUL");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 12),"BEAUTY");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 13),"AIR LOCK");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 14),"PSYCHIC");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 15),"HYPER CUTTER");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 16),"FIGHTING");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 17),"SHADOW TAG");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 18),"SMART");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 19),"SMARTNESS");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 20),"SPEED BOOST");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 21),"COOL");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 22),"COOLNESS");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 23),"BATTLE ARMOR");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 24),"CUTE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 25),"CUTENESS");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 26),"STURDY");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 27),"SUCTION CUPS");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 28),"GRASS");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 29),"CLEAR BODY");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 30),"TORRENT");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 31),"GHOST");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 32),"ICE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 33),"GUTS");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 34),"ROUGH SKIN");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 35),"SHELL ARMOR");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 36),"NATURAL CURE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 37),"DAMP");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 38),"GROUND");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 39),"LIMBER");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 40),"MAGNET PULL");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 41),"WHITE SMOKE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 42),"SYNCHRONIZE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 43),"OVERGROW");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 44),"SWIFT SWIM");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 45),"SAND STREAM");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 46),"SAND VEIL");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 47),"KEEN EYE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 48),"INNER FOCUS");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 49),"STATIC");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 50),"TYPE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 51),"TOUGH");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 52),"TOUGHNESS");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 53),"SHED SKIN");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 54),"HUGE POWER");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 55),"VOLT ABSORB");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 56),"WATER ABSORB");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 57),"ELECTRIC");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 58),"FORECAST");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 59),"SERENE GRACE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 60),"POISON");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 61),"POISON POINT");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 62),"DRAGON");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 63),"TRACE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 64),"OBLIVIOUS");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 65),"TRUANT");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 66),"RUN AWAY");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 67),"STICKY HOLD");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 68),"CLOUD NINE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 69),"NORMAL");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 70),"STEEL");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 71),"ILLUMINATE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 72),"EARLY BIRD");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 73),"HUSTLE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 74),"SHINE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 75),"FLYING");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 76),"DROUGHT");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 77),"LIGHTNINGROD");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 78),"COMPOUNDEYES");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 79),"MARVEL SCALE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 80),"WONDER GUARD");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 81),"INSOMNIA");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 82),"LEVITATE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 83),"PLUS");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 84),"PRESSURE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 85),"LIQUID OOZE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 86),"COLOR CHANGE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 87),"SOUNDPROOF");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 88),"EFFECT SPORE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 89),"PKRS");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 90),"FIRE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 91),"FLAME BODY");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 92),"MINUS");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 93),"OWN TEMPO");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 94),"MAGMA ARMOR");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 95),"WATER");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 96),"WATER VEIL");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 97),"BUG");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 98),"SWARM");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 99),"CUTE CHARM");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 100),"IMMUNITY");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 101),"BLAZE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 102),"PICKUP");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 103),"PATTERN");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 104),"FLASH FIRE");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 105),"VITAL SPIRIT");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 106),"CHLOROPHYLL");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 107),"PURE POWER");
words.set(((EC_GROUP_STATUS << EC_MASK_BITS) | 108),"SHIELD DUST");

// BATTLE
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 0),"MATCH UP");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 1),"GO");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 2),"NO. 1");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 3),"DECIDE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 4),"LET ME WIN");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 5),"WINS");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 6),"WIN");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 7),"WON");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 8),"IF I WIN");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 9),"WHEN I WIN");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 10),"CAN'T WIN");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 11),"CAN WIN");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 12),"NO MATCH");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 13),"SPIRIT");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 14),"DECIDED");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 15),"TRUMP CARD");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 16),"TAKE THAT");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 17),"COME ON");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 18),"ATTACK");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 19),"SURRENDER");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 20),"GUTSY");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 21),"TALENT");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 22),"STRATEGY");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 23),"SMITE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 24),"MATCH");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 25),"VICTORY");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 26),"OFFENSIVE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 27),"SENSE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 28),"VERSUS");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 29),"FIGHTS");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 30),"POWER");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 31),"CHALLENGE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 32),"STRONG");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 33),"TOO STRONG");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 34),"GO EASY");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 35),"FOE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 36),"GENIUS");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 37),"LEGEND");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 38),"ESCAPE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 39),"AIM");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 40),"BATTLE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 41),"FIGHT");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 42),"RESUSCITATE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 43),"POINTS");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 44),"SERIOUS");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 45),"GIVE UP");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 46),"LOSS");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 47),"IF I LOSE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 48),"LOST");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 49),"LOSE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 50),"GUARD");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 51),"PARTNER");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 52),"REJECT");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 53),"ACCEPT");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 54),"INVINCIBLE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 55),"RECEIVED");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 56),"EASY");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 57),"WEAK");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 58),"TOO WEAK");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 59),"PUSHOVER");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 60),"LEADER");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 61),"RULE");
words.set(((EC_GROUP_BATTLE << EC_MASK_BITS) | 62),"MOVE");

// GREETINGS
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 0),"THANKS");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 1),"YES");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 2),"HERE GOES");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 3),"HERE I COME");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 4),"HERE IT IS");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 5),"YEAH");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 6),"WELCOME");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 7),"OI");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 8),"HOW DO");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 9),"CONGRATS");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 10),"GIVE ME");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 11),"SORRY");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 12),"APOLOGIZE");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 13),"FORGIVE");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 14),"HEY, THERE");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 15),"HELLO");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 16),"GOOD-BYE");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 17),"THANK YOU");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 18),"I'VE ARRIVED");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 19),"PARDON");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 20),"EXCUSE");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 21),"SEE YA");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 22),"EXCUSE ME");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 23),"WELL, THEN");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 24),"GO AHEAD");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 25),"APPRECIATE");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 26),"HEY?");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 27),"WHAT'S UP?");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 28),"HUH?");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 29),"NO");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 30),"HI");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 31),"YEAH, YEAH");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 32),"BYE-BYE");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 33),"MEET YOU");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 34),"HEY");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 35),"SMELL");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 36),"LISTENING");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 37),"HOO-HAH");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 38),"YAHOO");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 39),"YO");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 40),"COME OVER");
words.set(((EC_GROUP_GREETINGS << EC_MASK_BITS) | 41),"COUNT ON");

// PEOPLE
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 0),"OPPONENT");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 1),"I");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 2),"YOU");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 3),"YOURS");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 4),"SON");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 5),"YOUR");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 6),"YOU'RE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 7),"YOU'VE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 8),"MOTHER");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 9),"GRANDFATHER");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 10),"UNCLE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 11),"FATHER");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 12),"BOY");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 13),"ADULT");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 14),"BROTHER");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 15),"SISTER");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 16),"GRANDMOTHER");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 17),"AUNT");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 18),"PARENT");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 19),"MAN");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 20),"ME");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 21),"GIRL");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 22),"BABE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 23),"FAMILY");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 24),"HER");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 25),"HIM");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 26),"HE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 27),"PLACE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 28),"DAUGHTER");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 29),"HIS");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 30),"HE'S");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 31),"AREN'T");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 32),"SIBLINGS");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 33),"KID");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 34),"CHILDREN");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 35),"MR.");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 36),"MRS.");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 37),"MYSELF");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 38),"I WAS");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 39),"TO ME");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 40),"MY");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 41),"I AM");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 42),"I'VE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 43),"WHO");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 44),"SOMEONE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 45),"WHO WAS");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 46),"TO WHOM");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 47),"WHOSE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 48),"WHO IS");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 49),"IT'S");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 50),"LADY");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 51),"FRIEND");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 52),"ALLY");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 53),"PERSON");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 54),"DUDE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 55),"THEY");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 56),"THEY WERE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 57),"TO THEM");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 58),"THEIR");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 59),"THEY'RE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 60),"THEY'VE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 61),"WE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 62),"BEEN");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 63),"TO US");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 64),"OUR");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 65),"WE'RE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 66),"RIVAL");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 67),"WE'VE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 68),"WOMAN");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 69),"SHE");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 70),"SHE WAS");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 71),"TO HER");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 72),"HER'S");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 73),"SHE IS");
words.set(((EC_GROUP_PEOPLE << EC_MASK_BITS) | 74),"SOME");

// VOICES
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 0),"!");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 1),"!!");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 2),"?!");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 3),"?");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 4),"‥.");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 5),"‥!");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 6),"‥‥‥");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 7),"-");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 8),"- - -");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 9),"UH-OH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 10),"WAAAH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 11),"AHAHA");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 12),"OH?");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 13),"NOPE");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 14),"URGH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 15),"HMM");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 16),"WHOAH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 17),"WROOOAAR!");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 18),"WOW");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 19),"GIGGLE");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 20),"SIGH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 21),"UNBELIEVABLE");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 22),"CRIES");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 23),"AGREE");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 24),"EH?");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 25),"CRY");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 26),"EHEHE");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 27),"OI, OI, OI");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 28),"OH, YEAH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 29),"OH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 30),"OOPS");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 31),"SHOCKED");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 32),"EEK");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 33),"GRAAAH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 34),"GWAHAHAHA");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 35),"WAY");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 36),"TCH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 37),"HEHE");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 38),"HAH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 39),"YUP");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 40),"HAHAHA");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 41),"AIYEEH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 42),"HIYAH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 43),"FUFUFU");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 44),"LOL");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 45),"SNORT");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 46),"HUMPH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 47),"HEHEHE");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 48),"HEH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 49),"HOHOHO");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 50),"UH-HUH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 51),"OH, DEAR");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 52),"ARRGH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 53),"MUFUFU");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 54),"MMM");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 55),"OH-KAY");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 56),"OKAY");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 57),"LALALA");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 58),"YAY");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 59),"AWW");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 60),"WOWEE");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 61),"GWAH");
words.set(((EC_GROUP_VOICES << EC_MASK_BITS) | 62),"WAHAHAHA");

// SPEECH
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 0),"LISTEN");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 1),"NOT VERY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 2),"MEAN");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 3),"LIE");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 4),"LAY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 5),"RECOMMEND");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 6),"NITWIT");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 7),"QUITE");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 8),"FROM");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 9),"FEELING");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 10),"BUT");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 11),"HOWEVER");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 12),"CASE");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 13),"THE");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 14),"MISS");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 15),"HOW");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 16),"HIT");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 17),"ENOUGH");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 18),"A LOT");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 19),"A LITTLE");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 20),"ABSOLUTELY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 21),"AND");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 22),"ONLY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 23),"AROUND");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 24),"PROBABLY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 25),"IF");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 26),"VERY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 27),"A TINY BIT");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 28),"WILD");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 29),"THAT'S");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 30),"JUST");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 31),"EVEN SO,");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 32),"MUST BE");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 33),"NATURALLY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 34),"FOR NOW,");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 35),"UNDERSTOOD");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 36),"JOKING");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 37),"READY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 38),"SOMETHING");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 39),"SOMEHOW");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 40),"ALTHOUGH");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 41),"ALSO");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 42),"PERFECT");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 43),"AS MUCH AS");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 44),"REALLY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 45),"TRULY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 46),"SERIOUSLY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 47),"TOTALLY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 48),"UNTIL");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 49),"AS IF");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 50),"MOOD");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 51),"RATHER");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 52),"AWFULLY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 53),"MODE");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 54),"MORE");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 55),"TOO LATE");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 56),"FINALLY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 57),"ANY");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 58),"INSTEAD");
words.set(((EC_GROUP_SPEECH << EC_MASK_BITS) | 59),"FANTASTIC");

// ENDINGS
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 0),"WILL");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 1),"WILL BE HERE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 2),"OR");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 3),"TIMES");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 4),"WONDER");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 5),"IS IT?");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 6),"BE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 7),"GIMME");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 8),"COULD");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 9),"LIKELY TO");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 10),"WOULD");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 11),"IS");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 12),"ISN'T IT?");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 13),"LET'S");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 14),"OTHER");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 15),"ARE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 16),"WAS");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 17),"WERE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 18),"THOSE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 19),"ISN'T");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 20),"WON'T");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 21),"CAN'T");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 22),"CAN");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 23),"DON'T");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 24),"DO");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 25),"DOES");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 26),"WHOM");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 27),"WHICH");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 28),"WASN'T");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 29),"WEREN'T");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 30),"HAVE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 31),"HAVEN'T");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 32),"A");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 33),"AN");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 34),"NOT");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 35),"THERE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 36),"OK?");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 37),"SO");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 38),"MAYBE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 39),"ABOUT");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 40),"OVER");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 41),"IT");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 42),"ALL");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 43),"FOR");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 44),"ON");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 45),"OFF");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 46),"AS");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 47),"TO");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 48),"WITH");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 49),"BETTER");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 50),"EVER");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 51),"SINCE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 52),"OF");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 53),"BELONGS TO");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 54),"AT");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 55),"IN");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 56),"OUT");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 57),"TOO");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 58),"LIKE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 59),"DID");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 60),"DIDN'T");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 61),"DOESN'T");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 62),"WITHOUT");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 63),"AFTER");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 64),"BEFORE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 65),"WHILE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 66),"THAN");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 67),"ONCE");
words.set(((EC_GROUP_ENDINGS << EC_MASK_BITS) | 68),"ANYWHERE");

// FEELINGS
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 0),"MEET");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 1),"PLAY");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 2),"HURRIED");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 3),"GOES");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 4),"GIDDY");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 5),"HAPPY");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 6),"HAPPINESS");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 7),"EXCITE");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 8),"IMPORTANT");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 9),"FUNNY");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 10),"GOT");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 11),"GO HOME");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 12),"DISAPPOINTED");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 13),"DISAPPOINTS");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 14),"SAD");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 15),"TRY");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 16),"TRIES");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 17),"HEARS");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 18),"THINK");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 19),"HEAR");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 20),"WANTS");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 21),"MISHEARD");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 22),"DISLIKE");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 23),"ANGRY");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 24),"ANGER");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 25),"SCARY");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 26),"LONESOME");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 27),"DISAPPOINT");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 28),"JOY");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 29),"GETS");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 30),"NEVER");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 31),"DARN");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 32),"DOWNCAST");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 33),"INCREDIBLE");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 34),"LIKES");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 35),"DISLIKES");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 36),"BORING");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 37),"CARE");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 38),"CARES");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 39),"ALL RIGHT");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 40),"ADORE");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 41),"DISASTER");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 42),"ENJOY");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 43),"ENJOYS");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 44),"EAT");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 45),"LACKING");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 46),"BAD");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 47),"HARD");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 48),"TERRIBLE");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 49),"SHOULD");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 50),"NICE");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 51),"DRINK");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 52),"SURPRISE");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 53),"FEAR");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 54),"WANT");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 55),"WAIT");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 56),"SATISFIED");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 57),"SEE");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 58),"RARE");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 59),"NEGATIVE");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 60),"DONE");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 61),"DANGER");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 62),"DEFEATED");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 63),"BEAT");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 64),"GREAT");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 65),"ROMANTIC");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 66),"QUESTION");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 67),"UNDERSTAND");
words.set(((EC_GROUP_FEELINGS << EC_MASK_BITS) | 68),"UNDERSTANDS");

// CONDITIONS
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 0),"HOT");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 1),"EXISTS");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 2),"EXCESS");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 3),"APPROVED");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 4),"HAS");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 5),"GOOD");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 6),"LESS");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 7),"MOMENTUM");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 8),"GOING");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 9),"WEIRD");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 10),"BUSY");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 11),"TOGETHER");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 12),"FULL");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 13),"ABSENT");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 14),"BEING");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 15),"NEED");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 16),"TASTY");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 17),"SKILLED");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 18),"NOISY");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 19),"BIG");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 20),"LATE");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 21),"CLOSE");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 22),"DOCILE");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 23),"AMUSING");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 24),"ENTERTAINING");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 25),"PERFECTION");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 26),"PRETTY");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 27),"HEALTHY");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 28),"EXCELLENT");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 29),"UPSIDE DOWN");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 30),"COLD");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 31),"REFRESHING");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 32),"UNAVOIDABLE");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 33),"MUCH");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 34),"OVERWHELMING");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 35),"FABULOUS");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 36),"ELSE");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 37),"EXPENSIVE");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 38),"CORRECT");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 39),"IMPOSSIBLE");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 40),"SMALL");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 41),"DIFFERENT");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 42),"TIRED");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 43),"SKILL");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 44),"TOP");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 45),"NON-STOP");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 46),"PREPOSTEROUS");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 47),"NONE");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 48),"NOTHING");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 49),"NATURAL");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 50),"BECOMES");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 51),"LUKEWARM");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 52),"FAST");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 53),"LOW");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 54),"AWFUL");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 55),"ALONE");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 56),"BORED");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 57),"SECRET");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 58),"MYSTERY");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 59),"LACKS");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 60),"BEST");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 61),"LOUSY");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 62),"MISTAKE");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 63),"KIND");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 64),"WELL");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 65),"WEAKENED");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 66),"SIMPLE");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 67),"SEEMS");
words.set(((EC_GROUP_CONDITIONS << EC_MASK_BITS) | 68),"BADLY");

// ACTIONS
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 0),"MEETS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 1),"CONCEDE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 2),"GIVE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 3),"GIVES");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 4),"PLAYED");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 5),"PLAYS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 6),"COLLECT");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 7),"WALKING");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 8),"WALKS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 9),"SAYS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 10),"WENT");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 11),"SAID");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 12),"WAKE UP");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 13),"WAKES UP");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 14),"ANGERS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 15),"TEACH");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 16),"TEACHES");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 17),"PLEASE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 18),"LEARN");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 19),"CHANGE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 20),"STORY");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 21),"TRUST");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 22),"LAVISH");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 23),"LISTENS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 24),"HEARING");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 25),"TRAINS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 26),"CHOOSE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 27),"COME");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 28),"CAME");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 29),"SEARCH");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 30),"MAKE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 31),"CAUSE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 32),"KNOW");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 33),"KNOWS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 34),"REFUSE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 35),"STORES");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 36),"BRAG");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 37),"IGNORANT");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 38),"THINKS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 39),"BELIEVE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 40),"SLIDE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 41),"EATS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 42),"USE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 43),"USES");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 44),"USING");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 45),"COULDN'T");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 46),"CAPABLE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 47),"DISAPPEAR");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 48),"APPEAR");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 49),"THROW");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 50),"WORRY");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 51),"SLEPT");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 52),"SLEEP");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 53),"RELEASE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 54),"DRINKS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 55),"RUNS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 56),"RUN");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 57),"WORKS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 58),"WORKING");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 59),"TALKING");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 60),"TALK");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 61),"SINK");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 62),"SMACK");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 63),"PRETEND");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 64),"PRAISE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 65),"OVERDO");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 66),"SHOW");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 67),"LOOKS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 68),"SEES");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 69),"SEEK");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 70),"OWN");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 71),"TAKE");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 72),"ALLOW");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 73),"FORGET");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 74),"FORGETS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 75),"APPEARS");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 76),"FAINT");
words.set(((EC_GROUP_ACTIONS << EC_MASK_BITS) | 77),"FAINTED");

// LIFESTYLE
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 0),"CHORES");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 1),"HOME");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 2),"MONEY");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 3),"ALLOWANCE");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 4),"BATH");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 5),"CONVERSATION");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 6),"SCHOOL");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 7),"COMMEMORATE");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 8),"HABIT");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 9),"GROUP");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 10),"WORD");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 11),"STORE");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 12),"SERVICE");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 13),"WORK");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 14),"SYSTEM");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 15),"TRAIN");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 16),"CLASS");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 17),"LESSONS");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 18),"INFORMATION");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 19),"LIVING");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 20),"TEACHER");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 21),"TOURNAMENT");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 22),"LETTER");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 23),"EVENT");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 24),"DIGITAL");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 25),"TEST");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 26),"DEPT. STORE");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 27),"TELEVISION");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 28),"PHONE");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 29),"ITEM");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 30),"NAME");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 31),"NEWS");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 32),"POPULAR");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 33),"PARTY");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 34),"STUDY");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 35),"MACHINE");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 36),"MAIL");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 37),"MESSAGE");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 38),"PROMISE");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 39),"DREAM");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 40),"KINDERGARTEN");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 41),"LIFE");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 42),"RADIO");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 43),"RENTAL");
words.set(((EC_GROUP_LIFESTYLE << EC_MASK_BITS) | 44),"WORLD");

// HOBBIES
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 0),"IDOL");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 1),"ANIME");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 2),"SONG");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 3),"MOVIE");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 4),"SWEETS");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 5),"CHAT");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 6),"CHILD'S PLAY");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 7),"TOYS");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 8),"MUSIC");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 9),"CARDS");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 10),"SHOPPING");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 11),"CAMERA");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 12),"VIEWING");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 13),"SPECTATOR");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 14),"GOURMET");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 15),"GAME");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 16),"RPG");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 17),"COLLECTION");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 18),"COMPLETE");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 19),"MAGAZINE");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 20),"WALK");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 21),"BIKE");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 22),"HOBBY");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 23),"SPORTS");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 24),"SOFTWARE");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 25),"SONGS");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 26),"DIET");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 27),"TREASURE");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 28),"TRAVEL");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 29),"DANCE");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 30),"CHANNEL");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 31),"MAKING");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 32),"FISHING");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 33),"DATE");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 34),"DESIGN");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 35),"LOCOMOTIVE");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 36),"PLUSH DOLL");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 37),"PC");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 38),"FLOWERS");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 39),"HERO");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 40),"NAP");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 41),"HEROINE");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 42),"FASHION");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 43),"ADVENTURE");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 44),"BOARD");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 45),"BALL");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 46),"BOOK");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 47),"FESTIVAL");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 48),"COMICS");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 49),"HOLIDAY");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 50),"PLANS");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 51),"TRENDY");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 52),"VACATION");
words.set(((EC_GROUP_HOBBIES << EC_MASK_BITS) | 53),"LOOK");

// TIME
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 0),"FALL");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 1),"MORNING");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 2),"TOMORROW");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 3),"LAST");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 4),"DAY");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 5),"SOMETIME");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 6),"ALWAYS");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 7),"CURRENT");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 8),"FOREVER");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 9),"DAYS");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 10),"END");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 11),"TUESDAY");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 12),"YESTERDAY");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 13),"TODAY");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 14),"FRIDAY");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 15),"MONDAY");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 16),"LATER");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 17),"EARLIER");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 18),"ANOTHER");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 19),"TIME");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 20),"FINISH");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 21),"WEDNESDAY");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 22),"SOON");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 23),"START");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 24),"MONTH");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 25),"STOP");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 26),"NOW");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 27),"FINAL");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 28),"NEXT");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 29),"AGE");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 30),"SATURDAY");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 31),"SUMMER");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 32),"SUNDAY");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 33),"BEGINNING");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 34),"SPRING");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 35),"DAYTIME");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 36),"WINTER");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 37),"DAILY");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 38),"OLDEN");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 39),"ALMOST");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 40),"NEARLY");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 41),"THURSDAY");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 42),"NIGHTTIME");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 43),"NIGHT");
words.set(((EC_GROUP_TIME << EC_MASK_BITS) | 44),"WEEK");

// MISC
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 0),"HIGHS");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 1),"LOWS");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 2),"UM");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 3),"REAR");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 4),"THINGS");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 5),"THING");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 6),"BELOW");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 7),"ABOVE");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 8),"BACK");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 9),"HIGH");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 10),"HERE");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 11),"INSIDE");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 12),"OUTSIDE");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 13),"BESIDE");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 14),"THIS IS IT!");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 15),"THIS");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 16),"EVERY");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 17),"THESE");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 18),"THESE WERE");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 19),"DOWN");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 20),"THAT");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 21),"THOSE ARE");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 22),"THOSE WERE");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 23),"THAT'S IT!");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 24),"AM");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 25),"THAT WAS");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 26),"FRONT");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 27),"UP");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 28),"CHOICE");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 29),"FAR");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 30),"AWAY");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 31),"NEAR");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 32),"WHERE");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 33),"WHEN");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 34),"WHAT");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 35),"DEEP");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 36),"SHALLOW");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 37),"WHY");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 38),"CONFUSED");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 39),"OPPOSITE");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 40),"LEFT");
words.set(((EC_GROUP_MISC << EC_MASK_BITS) | 41),"RIGHT");

// ADJECTIVES
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 0),"WANDERING");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 1),"RICKETY");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 2),"ROCK-SOLID");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 3),"HUNGRY");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 4),"TIGHT");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 5),"TICKLISH");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 6),"TWIRLING");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 7),"SPIRALING");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 8),"THIRSTY");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 9),"LOLLING");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 10),"SILKY");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 11),"SADLY");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 12),"HOPELESS");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 13),"USELESS");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 14),"DROOLING");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 15),"EXCITING");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 16),"THICK");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 17),"SMOOTH");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 18),"SLIMY");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 19),"THIN");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 20),"BREAK");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 21),"VORACIOUS");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 22),"SCATTER");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 23),"AWESOME");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 24),"WIMPY");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 25),"WOBBLY");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 26),"SHAKY");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 27),"RIPPED");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 28),"SHREDDED");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 29),"INCREASING");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 30),"YET");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 31),"DESTROYED");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 32),"FIERY");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 33),"LOVEY-DOVEY");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 34),"HAPPILY");
words.set(((EC_GROUP_ADJECTIVES << EC_MASK_BITS) | 35),"ANTICIPATION");

// EVENTS
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 0),"APPEAL");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 1),"EVENTS");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 2),"STAY-AT-HOME");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 3),"BERRY");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 4),"CONTEST");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 5),"MC");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 6),"JUDGE");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 7),"SUPER");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 8),"STAGE");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 9),"HALL OF FAME");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 10),"EVOLUTION");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 11),"HYPER");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 12),"BATTLE TOWER");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 13),"LEADERS");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 14),"BATTLE ROOM");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 15),"HIDDEN");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 16),"SECRET BASE");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 17),"BLEND");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 18),"POKéBLOCK");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 19),"MASTER");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 20),"RANK");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 21),"RIBBON");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 22),"CRUSH");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 23),"DIRECT");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 24),"TOWER");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 25),"UNION");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 26),"ROOM");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 27),"WIRELESS");
words.set(((EC_GROUP_EVENTS << EC_MASK_BITS) | 28),"FRONTIER");

// TRENDY_SAYING
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 0),"KTHX, BYE.");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 1),"YES, SIR!");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 2),"AVANT GARDE");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 3),"COUPLE");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 4),"MUCH OBLIGED");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 5),"YEEHAW!");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 6),"MEGA");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 7),"1-HIT KO!");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 8),"DESTINY");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 9),"CANCEL");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 10),"NEW");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 11),"FLATTEN");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 12),"KIDDING");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 13),"LOSER");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 14),"LOSING");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 15),"HAPPENING");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 16),"HIP AND");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 17),"SHAKE");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 18),"SHADY");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 19),"UPBEAT");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 20),"MODERN");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 21),"SMELL YA");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 22),"BANG");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 23),"KNOCKOUT");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 24),"HASSLE");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 25),"WINNER");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 26),"FEVER");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 27),"WANNABE");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 28),"BABY");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 29),"HEART");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 30),"OLD");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 31),"YOUNG");
words.set(((EC_GROUP_TRENDY_SAYING << EC_MASK_BITS) | 32),"UGLY");

// Pokemon 1
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 63) ,"ABRA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 359),"ABSOL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 306),"AGGRON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 65) ,"ALAKAZAM");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 334),"ALTARIA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 347),"ANORITH");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 348),"ARMALDO");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 304),"ARON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 184),"AZUMARILL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 298),"AZURILL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 371),"BAGON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 343),"BALTOY");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 354),"BANETTE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 339),"BARBOACH");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 267),"BEAUTIFLY");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 374),"BELDUM");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 182),"BELLOSSOM");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 257),"BLAZIKEN");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 286),"BRELOOM");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 331),"CACNEA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 332),"CACTURNE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 323),"CAMERUPT");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 318),"CARVANHA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 268),"CASCOON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 351),"CASTFORM");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 358),"CHIMECHO");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 170),"CHINCHOU");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 366),"CLAMPERL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 344),"CLAYDOL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 256),"COMBUSKEN");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 341),"CORPHISH");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 222),"CORSOLA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 346),"CRADILY");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 342),"CRAWDAUNT");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 169),"CROBAT");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 301),"DELCATTY");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 386),"DEOXYS");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 85) ,"DODRIO");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 84) ,"DODUO");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 232),"DONPHAN");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 356),"DUSCLOPS");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 355),"DUSKULL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 269),"DUSTOX");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 309),"ELECTRIKE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 101),"ELECTRODE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 295),"EXPLOUD");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 349),"FEEBAS");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 330),"FLYGON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 282),"GARDEVOIR");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 74) ,"GEODUDE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 203),"GIRAFARIG");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 362),"GLALIE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 44) ,"GLOOM");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 42) ,"GOLBAT");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 118),"GOLDEEN");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 55) ,"GOLDUCK");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 76) ,"GOLEM");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 368),"GOREBYSS");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 75) ,"GRAVELER");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 88) ,"GRIMER");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 383),"GROUDON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 253),"GROVYLE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 326),"GRUMPIG");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 316),"GULPIN");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 130),"GYARADOS");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 297),"HARIYAMA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 214),"HERACROSS");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 116),"HORSEA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 367),"HUNTAIL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 174),"IGGLYBUFF");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 314),"ILLUMISE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 39) ,"JIGGLYPUFF");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 385),"JIRACHI");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 64) ,"KADABRA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 352),"KECLEON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 230),"KINGDRA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 281),"KIRLIA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 109),"KOFFING");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 382),"KYOGRE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 305),"LAIRON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 171),"LANTURN");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 380),"LATIAS");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 381),"LATIOS");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 345),"LILEEP");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 264),"LINOONE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 271),"LOMBRE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 270),"LOTAD");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 294),"LOUDRED");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 272),"LUDICOLO");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 337),"LUNATONE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 370),"LUVDISC");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 68) ,"MACHAMP");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 67) ,"MACHOKE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 66) ,"MACHOP");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 219),"MAGCARGO");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 129),"MAGIKARP");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 81) ,"MAGNEMITE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 82) ,"MAGNETON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 296),"MAKUHITA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 310),"MANECTRIC");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 182),"MARILL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 259),"MARSHTOMP");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 284),"MASQUERAIN");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 303),"MAWILE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 308),"MEDICHAM");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 307),"MEDITITE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 376),"METAGROSS");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 375),"METANG");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 262),"MIGHTYENA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 350),"MILOTIC");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 312),"MINUN");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 258),"MUDKIP");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 89) ,"MUK");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 177),"NATU");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 290),"NINCADA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 38) ,"NINETALES");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 291),"NINJASK");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 299),"NOSEPASS");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 322),"NUMEL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 274),"NUZLEAF");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 43) ,"ODDISH");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 279),"PELIPPER");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 231),"PHANPY");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 172),"PICHU");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 24) ,"PIKACHU");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 127),"PINSIR");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 311),"PLUSLE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 261),"POOCHYENA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 54) ,"PSYDUCK");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 26) ,"RAICHU");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 280),"RALTS");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 384),"RAYQUAZA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 378),"REGICE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 377),"REGIROCK");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 379),"REGISTEEL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 369),"RELICANTH");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 112),"RHYDON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 111),"RHYHORN");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 315),"ROSELIA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 302),"SABLEYE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 373),"SALAMENCE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 27) ,"SANDSHREW");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 28) ,"SANDSLASH");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 254),"SCEPTILE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 117),"SEADRA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 119),"SEAKING");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 364),"SEALEO");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 273),"SEEDOT");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 336),"SEVIPER");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 319),"SHARPEDO");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 292),"SHEDINJA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 372),"SHELGON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 275),"SHIFTRY");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 285),"SHROOMISH");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 353),"SHUPPET");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 266),"SILCOON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 227),"SKARMORY");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 300),"SKITTY");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 289),"SLAKING");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 287),"SLAKOTH");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 218),"SLUGMA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 361),"SNORUNT");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 338),"SOLROCK");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 363),"SPHEAL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 327),"SPINDA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 325),"SPOINK");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 121),"STARMIE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 120),"STARYU");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 283),"SURSKIT");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 333),"SWABLU");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 317),"SWALOT");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 260),"SWAMPERT");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 277),"SWELLOW");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 276),"TAILLOW");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 72) ,"TENTACOOL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 73) ,"TENTACRUEL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 255),"TORCHIC");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 324),"TORKOAL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 328),"TRAPINCH");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 252),"TREECKO");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 357),"TROPIUS");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 329),"VIBRAVA");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 288),"VIGOROTH");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 45) ,"VILEPLUME");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 313),"VOLBEAT");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 100),"VOLTORB");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 37) ,"VULPIX");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 320),"WAILMER");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 321),"WAILORD");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 365),"WALREIN");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 110),"WEEZING");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 340),"WHISCASH");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 293),"WHISMUR");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 40) ,"WIGGLYTUFF");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 278),"WINGULL");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 202),"WOBBUFFET");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 265),"WURMPLE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 360),"WYNAUT");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 178),"XATU");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 335),"ZANGOOSE");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 263),"ZIGZAGOON");
words.set(((EC_GROUP_POKEMON << EC_MASK_BITS) | 41) ,"ZUBAT");

// Pokemon 2
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  63) ,"ABRA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  142),"AERODACTYL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  190),"AIPOM");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  65) ,"ALAKAZAM");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  181),"AMPHAROS");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  24) ,"ARBOK");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  59) ,"ARCANINE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  168),"ARIADOS");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  144),"ARTICUNO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  184),"AZUMARILL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  153),"BAYLEEF");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  15) ,"BEEDRILL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  182),"BELLOSSOM");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  69) ,"BELLSPROUT");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  9)  ,"BLASTOISE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  242),"BLISSEY");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  1)  ,"BULBASAUR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  12) ,"BUTTERFREE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  10) ,"CATERPIE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  251),"CELEBI");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  113),"CHANSEY");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  6)  ,"CHARIZARD");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  4)  ,"CHARMANDER");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  5)  ,"CHARMELEON");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  152),"CHIKORITA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  170),"CHINCHOU");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  36) ,"CLEFABLE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  35) ,"CLEFAIRY");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  173),"CLEFFA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  91) ,"CLOYSTER");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  222),"CORSOLA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  169),"CROBAT");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  159),"CROCONAW");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  104),"CUBONE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  155),"CYNDAQUIL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  225),"DELIBIRD");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  87) ,"DEWGONG");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  50) ,"DIGLETT");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  132),"DITTO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  85) ,"DODRIO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  84) ,"DODUO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  232),"DONPHAN");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  148),"DRAGONAIR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  149),"DRAGONITE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  147),"DRATINI");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  96) ,"DROWZEE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  51) ,"DUGTRIO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  206),"DUNSPARCE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  133),"EEVEE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  23) ,"EKANS");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  125),"ELECTABUZZ");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  101),"ELECTRODE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  239),"ELEKID");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  244),"ENTEI");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  196),"ESPEON");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  102),"EXEGGCUTE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  103),"EXEGGUTOR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  83) ,"FARFETCHD");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  22) ,"FEAROW");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  160),"FERALIGATR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  180),"FLAAFFY");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  136),"FLAREON");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  205),"FORRETRESS");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  162),"FURRET");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  92) ,"GASTLY");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  94) ,"GENGAR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  74) ,"GEODUDE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  203),"GIRAFARIG");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  207),"GLIGAR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  44) ,"GLOOM");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  42) ,"GOLBAT");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  118),"GOLDEEN");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  55) ,"GOLDUCK");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  76) ,"GOLEM");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  210),"GRANBULL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  75) ,"GRAVELER");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  88) ,"GRIMER");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  58) ,"GROWLITHE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  130),"GYARADOS");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  94) ,"HAUNTER");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  214),"HERACROSS");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  107),"HITMONCHAN");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  106),"HITMONLEE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  237),"HITMONTOP");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  250),"HO_OH");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  163),"HOOTHOOT");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  187),"HOPPIP");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  116),"HORSEA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  229),"HOUNDOOM");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  228),"HOUNDOUR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  97) ,"HYPNO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  174),"IGGLYBUFF");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  2)  ,"IVYSAUR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  39) ,"JIGGLYPUFF");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  135),"JOLTEON");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  189),"JUMPLUFF");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  124),"JYNX");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  140),"KABUTO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  141),"KABUTOPS");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  64) ,"KADABRA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  14) ,"KAKUNA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  115),"KANGASKHAN");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  230),"KINGDRA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  99) ,"KINGLER");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  109),"KOFFING");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  98) ,"KRABBY");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  171),"LANTURN");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  131),"LAPRAS");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  246),"LARVITAR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  166),"LEDIAN");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  165),"LEDYBA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  108),"LICKITUNG");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  249),"LUGIA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  68) ,"MACHAMP");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  67) ,"MACHOKE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  66) ,"MACHOP");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  240),"MAGBY");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  219),"MAGCARGO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  129),"MAGIKARP");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  126),"MAGMAR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  81) ,"MAGNEMITE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  82) ,"MAGNETON");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  56) ,"MANKEY");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  226),"MANTINE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  179),"MAREEP");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  183),"MARILL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  105),"MAROWAK");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  154),"MEGANIUM");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  52) ,"MEOWTH");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  11) ,"METAPOD");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  151),"MEW");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  150),"MEWTWO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  241),"MILTANK");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  200),"MISDREAVUS");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  146),"MOLTRES");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  122),"MR_MIME");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  89) ,"MUK");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  198),"MURKROW");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  177),"NATU");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  34) ,"NIDOKING");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  31) ,"NIDOQUEEN");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  29) ,"NIDORAN_F");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  32) ,"NIDORAN_M");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  30) ,"NIDORINA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  33) ,"NIDORINO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  38) ,"NINETALES");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  164),"NOCTOWL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  224),"OCTILLERY");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  43) ,"ODDISH");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  138),"OMANYTE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  139),"OMASTAR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  95) ,"ONIX");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  46) ,"PARAS");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  47) ,"PARASECT");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  53) ,"PERSIAN");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  231),"PHANPY");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  172),"PICHU");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  18) ,"PIDGEOT");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  17) ,"PIDGEOTTO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  16) ,"PIDGEY");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  25) ,"PIKACHU");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  221),"PILOSWINE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  204),"PINECO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  127),"PINSIR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  186),"POLITOED");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  60) ,"POLIWAG");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  61) ,"POLIWHIRL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  62) ,"POLIWRATH");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  77) ,"PONYTA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  137),"PORYGON");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  233),"PORYGON2");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  57) ,"PRIMEAPE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  54) ,"PSYDUCK");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  247),"PUPITAR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  195),"QUAGSIRE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  156),"QUILAVA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  211),"QWILFISH");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  26) ,"RAICHU");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  243),"RAIKOU");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  78) ,"RAPIDASH");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  20) ,"RATICATE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  19) ,"RATTATA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  223),"REMORAID");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  112),"RHYDON");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  111),"RHYHORN");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  27) ,"SANDSHREW");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  28) ,"SANDSLASH");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  212),"SCIZOR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  123),"SCYTHER");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  117),"SEADRA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  119),"SEAKING");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  86) ,"SEEL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  161),"SENTRET");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  90) ,"SHELLDER");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  213),"SHUCKLE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  227),"SKARMORY");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  188),"SKIPLOOM");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  80) ,"SLOWBRO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  199),"SLOWKING");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  79) ,"SLOWPOKE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  218),"SLUGMA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  235),"SMEARGLE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  238),"SMOOCHUM");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  215),"SNEASEL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  143),"SNORLAX");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  209),"SNUBBULL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  21) ,"SPEAROW");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  167),"SPINARAK");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  7)  ,"SQUIRTLE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  234),"STANTLER");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  121),"STARMIE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  120),"STARYU");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  208),"STEELIX");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  185),"SUDOWOODO");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  245),"SUICUNE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  192),"SUNFLORA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  191),"SUNKERN");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  220),"SWINUB");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  114),"TANGELA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  128),"TAUROS");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  216),"TEDDIURSA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  72) ,"TENTACOOL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  73) ,"TENTACRUEL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  175),"TOGEPI");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  176),"TOGETIC");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  158),"TOTODILE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  157),"TYPHLOSION");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  248),"TYRANITAR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  236),"TYROGUE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  197),"UMBREON");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  201),"UNOWN");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  217),"URSARING");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  134),"VAPOREON");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  49) ,"VENOMOTH");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  48) ,"VENONAT");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  3)  ,"VENUSAUR");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  71) ,"VICTREEBEL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  45) ,"VILEPLUME");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  100),"VOLTORB");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  37) ,"VULPIX");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  8)  ,"WARTORTLE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  13) ,"WEEDLE");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  70) ,"WEEPINBELL");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  110),"WEEZING");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  40) ,"WIGGLYTUFF");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  202),"WOBBUFFET");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  194),"WOOPER");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  178),"XATU");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  193),"YANMA");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  145),"ZAPDOS");
words.set(((EC_GROUP_POKEMON_NATIONAL << EC_MASK_BITS) |  41) ,"ZUBAT");


// I don't think moves are valid for easy chat

// Moves 1
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  0),"ABSORB");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  1),"AEROBLAST");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  2),"AGILITY");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  3),"AIR_CUTTER");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  4),"ANCIENT_POWER");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  5),"AROMATHERAPY");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  6),"ASTONISH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  7),"AURORA_BEAM");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  8),"BIDE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  9),"BIND");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  10),"BITE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  11),"BRICK_BREAK");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  12),"BUBBLE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  13),"CHARGE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  14),"CHARM");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  15),"CLAMP");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  16),"CONFUSE_RAY");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  17),"CONSTRICT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  18),"COSMIC_POWER");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  19),"COUNTER");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  20),"CRABHAMMER");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  21),"CROSS_CHOP");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  22),"CRUNCH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  23),"CUT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  24),"DIG");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  25),"DISABLE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  26),"DOUBLE_TEAM");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  27),"DOUBLE_EDGE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  28),"DOUBLE_SLAP");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  29),"EARTHQUAKE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  30),"ENCORE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  31),"ENDEAVOR");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  32),"ENDURE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  33),"EXTRASENSORY");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  34),"EXTREME_SPEED");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  35),"FACADE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  36),"FAKE_TEARS");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  37),"FISSURE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  38),"FLAIL");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  39),"FLAME_WHEEL");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  40),"FLAMETHROWER");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  41),"FLATTER");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  42),"FLY");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  43),"FOCUS_ENERGY");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  44),"FOCUS_PUNCH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  45),"FOLLOW_ME");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  46),"GIGA_DRAIN");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  47),"GRASS_WHISTLE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  48),"GROWTH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  49),"GRUDGE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  50),"GUST");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  51),"HAIL");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  52),"HARDEN");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  53),"HAZE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  54),"HEADBUTT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  55),"HEAL_BELL");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  56),"HYPNOSIS");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  57),"ICE_BALL");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  58),"ICY_WIND");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  59),"IRON_TAIL");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  60),"KARATE_CHOP");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  61),"KINESIS");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  62),"LEECH_LIFE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  63),"LICK");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  64),"LOVELY_KISS");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  65),"LOW_KICK");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  66),"MEAN_LOOK");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  67),"MEMENTO");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  68),"METAL_SOUND");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  69),"METEOR_MASH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  70),"MIND_READER");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  71),"MIRROR_MOVE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  72),"MIST");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  73),"MORNING_SUN");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  74),"NATURE_POWER");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  75),"NIGHTMARE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  76),"OCTAZOOKA");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  77),"ODOR_SLEUTH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  78),"OUTRAGE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  79),"OVERHEAT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  80),"PAIN_SPLIT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  81),"POWDER_SNOW");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  82),"PSYBEAM");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  83),"PSYCH_UP");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  84),"PSYCHIC");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  85),"PSYCHO_BOOST");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  86),"PSYWAVE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  87),"PURSUIT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  88),"RAGE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  89),"RAIN_DANCE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  90),"RAPID_SPIN");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  91),"RAZOR_WIND");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  92),"RECOVER");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  93),"RETURN");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  94),"REVERSAL");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  95),"ROCK_SLIDE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  96),"ROCK_SMASH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  97),"ROCK_THROW");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  98),"ROCK_TOMB");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  99),"ROLLOUT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  100),"SACRED_FIRE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  101),"SAFEGUARD");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  102),"SAND_TOMB");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  103),"SAND_ATTACK");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  104),"SANDSTORM");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  105),"SCARY_FACE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  106),"SCREECH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  107),"SELF_DESTRUCT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  108),"SHADOW_BALL");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  109),"SHADOW_PUNCH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  110),"SHARPEN");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  111),"SHEER_COLD");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  112),"SIGNAL_BEAM");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  113),"SILVER_WIND");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  114),"SING");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  115),"SKETCH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  116),"SKILL_SWAP");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  117),"SKY_ATTACK");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  118),"SKY_UPPERCUT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  119),"SLASH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  120),"SMELLING_SALT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  121),"SMOG");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  122),"SMOKESCREEN");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  123),"SNORE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  124),"SOLAR_BEAM");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  125),"SONIC_BOOM");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  126),"SPARK");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  127),"SPIDER_WEB");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  128),"SPITE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  129),"SPORE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  130),"STRENGTH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  131),"STRING_SHOT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  132),"STUN_SPORE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  133),"SUBMISSION");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  134),"SUPER_FANG");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  135),"SWAGGER");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  136),"SWEET_SCENT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  137),"SWIFT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  138),"SYNTHESIS");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  139),"TAIL_WHIP");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  140),"THRASH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  141),"THUNDER");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  142),"THUNDERBOLT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  143),"THUNDER_PUNCH");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  144),"TICKLE");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  145),"TORMENT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  146),"UPROAR");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  147),"VITAL_THROW");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  148),"WATER_SPOUT");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  149),"WEATHER_BALL");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  150),"WHIRLPOOL");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  151),"WILL_O_WISP");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  152),"WITHDRAW");
// words.set(((EC_GROUP_MOVE_1 << EC_MASK_BITS) |  153),"YAWN");

// Moves 2
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  0), "ACID");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  1), "ACID_ARMOR");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  2), "AERIAL_ACE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  3), "AMNESIA");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  4), "ARM_THRUST");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  5), "ASSIST");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  6), "ATTRACT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  7), "BARRAGE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  8), "BARRIER");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  9), "BATON_PASS");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  10), "BEAT_UP");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  11), "BELLY_DRUM");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  12), "BLAST_BURN");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  13), "BLAZE_KICK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  14), "BLIZZARD");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  15), "BLOCK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  16), "BODY_SLAM");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  17), "BONE_CLUB");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  18), "BONE_RUSH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  19), "BONEMERANG");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  20), "BOUNCE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  21), "BUBBLE_BEAM");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  22), "BULK_UP");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  23), "BULLET_SEED");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  24), "CALM_MIND");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  25), "CAMOUFLAGE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  26), "COMET_PUNCH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  27), "CONFUSION");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  28), "CONVERSION");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  29), "CONVERSION_2");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  30), "COTTON_SPORE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  31), "COVET");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  32), "CRUSH_CLAW");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  33), "CURSE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  34), "DEFENSE_CURL");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  35), "DESTINY_BOND");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  36), "DETECT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  37), "DIVE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  38), "DIZZY_PUNCH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  39), "DOOM_DESIRE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  40), "DOUBLE_KICK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  41), "DRAGON_CLAW");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  42), "DRAGON_DANCE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  43), "DRAGON_RAGE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  44), "DRAGON_BREATH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  45), "DREAM_EATER");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  46), "DRILL_PECK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  47), "DYNAMIC_PUNCH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  48), "EGG_BOMB");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  49), "EMBER");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  50), "ERUPTION");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  51), "EXPLOSION");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  52), "FAINT_ATTACK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  53), "FAKE_OUT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  54), "FALSE_SWIPE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  55), "FEATHER_DANCE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  56), "FIRE_BLAST");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  57), "FIRE_PUNCH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  58), "FIRE_SPIN");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  59), "FLASH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  60), "FORESIGHT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  61), "FRENZY_PLANT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  62), "FRUSTRATION");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  63), "FURY_ATTACK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  64), "FURY_CUTTER");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  65), "FURY_SWIPES");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  66), "FUTURE_SIGHT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  67), "GLARE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  68), "GROWL");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  69), "GUILLOTINE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  70), "HEAT_WAVE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  71), "HELPING_HAND");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  72), "HI_JUMP_KICK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  73), "HIDDEN_POWER");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  74), "HORN_ATTACK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  75), "HORN_DRILL");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  76), "HOWL");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  77), "HYDRO_CANNON");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  78), "HYDRO_PUMP");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  79), "HYPER_BEAM");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  80), "HYPER_FANG");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  81), "HYPER_VOICE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  82), "ICE_BEAM");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  83), "ICE_PUNCH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  84), "ICICLE_SPEAR");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  85), "IMPRISON");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  86), "INGRAIN");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  87), "IRON_DEFENSE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  88), "JUMP_KICK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  89), "KNOCK_OFF");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  90), "LEAF_BLADE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  91), "LEECH_SEED");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  92), "LEER");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  93), "LIGHT_SCREEN");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  94), "LOCK_ON");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  95), "LUSTER_PURGE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  96), "MACH_PUNCH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  97), "MAGIC_COAT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  98), "MAGICAL_LEAF");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  99), "MAGNITUDE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  100), "MEDITATE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  101), "MEGA_DRAIN");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  102), "MEGA_KICK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  103), "MEGA_PUNCH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  104), "MEGAHORN");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  105), "METAL_CLAW");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  106), "METRONOME");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  107), "MILK_DRINK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  108), "MIMIC");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  109), "MINIMIZE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  110), "MIRROR_COAT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  111), "MIST_BALL");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  112), "MOONLIGHT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  113), "MUD_SHOT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  114), "MUD_SPORT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  115), "MUD_SLAP");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  116), "MUDDY_WATER");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  117), "NEEDLE_ARM");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  118), "NIGHT_SHADE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  119), "PAY_DAY");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  120), "PECK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  121), "PERISH_SONG");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  122), "PETAL_DANCE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  123), "PIN_MISSILE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  124), "POISON_FANG");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  125), "POISON_GAS");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  126), "POISON_STING");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  127), "POISON_TAIL");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  128), "POISON_POWDER");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  129), "POUND");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  130), "PRESENT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  131), "PROTECT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  132), "QUICK_ATTACK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  133), "RAZOR_LEAF");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  134), "RECYCLE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  135), "REFLECT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  136), "REFRESH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  137), "REST");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  138), "REVENGE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  139), "ROAR");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  140), "ROCK_BLAST");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  141), "ROLE_PLAY");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  142), "ROLLING_KICK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  143), "SCRATCH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  144), "SECRET_POWER");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  145), "SEISMIC_TOSS");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  146), "SHOCK_WAVE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  147), "SKULL_BASH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  148), "SLACK_OFF");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  149), "SLAM");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  150), "SLEEP_POWDER");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  151), "SLEEP_TALK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  152), "SLUDGE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  153), "SLUDGE_BOMB");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  154), "SNATCH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  155), "SOFT_BOILED");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  156), "SPIKE_CANNON");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  157), "SPIKES");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  158), "SPIT_UP");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  159), "SPLASH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  160), "STEEL_WING");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  161), "STOCKPILE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  162), "STOMP");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  163), "STRUGGLE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  164), "SUBSTITUTE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  165), "SUNNY_DAY");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  166), "SUPERPOWER");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  167), "SUPERSONIC");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  168), "SURF");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  169), "SWALLOW");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  170), "SWEET_KISS");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  171), "SWORDS_DANCE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  172), "TACKLE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  173), "TAIL_GLOW");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  174), "TAKE_DOWN");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  175), "TAUNT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  176), "TEETER_DANCE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  177), "TELEPORT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  178), "THIEF");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  179), "THUNDER_WAVE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  180), "THUNDER_SHOCK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  181), "TOXIC");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  182), "TRANSFORM");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  183), "TRI_ATTACK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  184), "TRICK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  185), "TRIPLE_KICK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  186), "TWINEEDLE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  187), "TWISTER");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  188), "VICE_GRIP");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  189), "VINE_WHIP");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  190), "VOLT_TACKLE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  191), "WATER_GUN");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  192), "WATER_PULSE");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  193), "WATER_SPORT");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  194), "WATERFALL");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  195), "WHIRLWIND");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  196), "WING_ATTACK");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  197), "WISH");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  198), "WRAP");
// words.set(((EC_GROUP_MOVE_2 << EC_MASK_BITS) |  199), "ZAP_CANNON");