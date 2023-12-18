
/**
 * TODO: Currently the intial state is hard coded into the html but this needs to be 
 * changed so the state gets fetched from the server when the page is loaded
 */

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

    refreshClientList();
    refreshTrainer();
    refreshMart();
    refreshGiftEgg();

    setInterval(refreshClientList, 1000 * 30)
}

function refreshDropdowns() {
    [...document.querySelectorAll('.ui.dropdown')].forEach(e => { $(e).dropdown('set selected', e.querySelector("input[type='hidden']").value) })
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
        const rawResponse = await fetch('/client-list', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        const content = await rawResponse.json();
        console.log("Refreshing Client List " + JSON.stringify(content));
        const clientMap = new Map(Object.entries(content));

        let titleElement = document.getElementById("connectedPlayersTitle");
        titleElement.innerHTML = titleElement.innerHTML.split("-")[0] + " - " + clientMap.size + " Connected";

        let bodyElement = document.getElementById("connectedPlayersBody");
        bodyElement.innerHTML = "";
        let finalBody = "";
        clientMap.forEach(c => {
            let row = document.createElement("tr");
            row.innerHTML  = "<td>" + c.name                     + "</td>";
            row.innerHTML += "<td>" + c.id                       + "</td>";
            row.innerHTML += "<td>" + c.game                     + "</td>";
            row.innerHTML += "<td>" + c.gender                   + "</td>";
            row.innerHTML += "<td>" + (c.lastSentMail || "N/A")  + "</td>";
            finalBody +=  row.outerHTML;
        });
        bodyElement.innerHTML = finalBody;
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
itemStrings.set(370, 'mystic-ticket');
itemStrings.set(371, 'aurora-ticket');
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
