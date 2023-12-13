 class MarketHelper {

    static createDefault() {
        return new Market(ITEM_PREMIER_BALL, ITEM_BERRY_JUICE, ITEM_ENIGMA_BERRY, ITEM_TM43, ITEM_HELIX_FOSSIL, ITEM_OLD_SEA_MAP);
    }

    static getMart() {
        return mart1;
    }

    static updateMart(data) {
        mart1 = new Market(data.item1, data.item2, data.item3, data.item4, data.item5, data.item6);
    }

}

class Market {

    constructor(item1, item2, item3, item4, item5, item6) {
        this.item1 = item1;
        this.item2 = item2;
        this.item3 = item3;
        this.item4 = item4;
        this.item5 = item5;
        this.item6 = item6;
    }

    toString() {

        let selectableItems = [this.item1, this.item2, this.item3, this.item4, this.item5, this.item6].filter(i => i != ITEM_NONE).map(i => itemNames.get(i));

        if (selectableItems.length == 0) {
            return "No Items For Sale";
        }

        return selectableItems.join(", ");
    }

    getDataArray() {
        let data = new Uint8Array(12);
        data[0] = (this.item1 & 0xff);
        data[1] = this.item1 >> 8;

        data[2] = (this.item2 & 0xff);
        data[3] = this.item2 >> 8;

        data[4] = (this.item3 & 0xff);
        data[5] = this.item3 >> 8;

        data[6] = (this.item4 & 0xff);
        data[7] = this.item4 >> 8;

        data[8] = (this.item5 & 0xff);
        data[9] = this.item5 >> 8;

        data[10] = (this.item6 & 0xff);
        data[11] = this.item6  >> 8;

        return data;
    }

 }

 /* Buyable items */

const ITEM_NONE = 0;

// Balls
const ITEM_MASTER_BALL  = 1;
const ITEM_ULTRA_BALL   = 2;
const ITEM_GREAT_BALL   = 3;
const ITEM_POKE_BALL    = 4;
const ITEM_NET_BALL     = 6;
const ITEM_DIVE_BALL    = 7;
const ITEM_NEST_BALL    = 8;
const ITEM_REPEAT_BALL  = 9;
const ITEM_TIMER_BALL   = 10;
const ITEM_LUXURY_BALL  = 11;
const ITEM_PREMIER_BALL = 12;

// Pokemon Items
const ITEM_POTION         = 13;
const ITEM_ANTIDOTE       = 14;
const ITEM_BURN_HEAL      = 15;
const ITEM_ICE_HEAL       = 16;
const ITEM_AWAKENING      = 17;
const ITEM_PARALYZE_HEAL  = 18;
const ITEM_FULL_RESTORE   = 19;
const ITEM_MAX_POTION     = 20;
const ITEM_HYPER_POTION   = 21;
const ITEM_SUPER_POTION   = 22;
const ITEM_FULL_HEAL      = 23;
const ITEM_REVIVE         = 24;
const ITEM_MAX_REVIVE     = 25;
const ITEM_FRESH_WATER    = 26;
const ITEM_SODA_POP       = 27;
const ITEM_LEMONADE       = 28;
const ITEM_MOOMOO_MILK    = 29;
const ITEM_ENERGY_POWDER  = 30;
const ITEM_ENERGY_ROOT    = 31;
const ITEM_HEAL_POWDER    = 32;
const ITEM_REVIVAL_HERB   = 33;
const ITEM_ETHER          = 34;
const ITEM_MAX_ETHER      = 35;
const ITEM_ELIXIR         = 36;
const ITEM_MAX_ELIXIR     = 37;
const ITEM_LAVA_COOKIE    = 38;
const ITEM_BLUE_FLUTE     = 39;
const ITEM_YELLOW_FLUTE   = 40;
const ITEM_RED_FLUTE      = 41;
const ITEM_BLACK_FLUTE    = 42;
const ITEM_WHITE_FLUTE    = 43;
const ITEM_BERRY_JUICE    = 44;
const ITEM_SACRED_ASH     = 45;
const ITEM_SHOAL_SALT     = 46;
const ITEM_SHOAL_SHELL    = 47;
const ITEM_RED_SHARD      = 48;
const ITEM_BLUE_SHARD     = 49;
const ITEM_YELLOW_SHARD   = 50;
const ITEM_GREEN_SHARD    = 51;
const ITEM_HP_UP          = 63;
const ITEM_PROTEIN        = 64;
const ITEM_IRON           = 65;
const ITEM_CARBOS         = 66;
const ITEM_CALCIUM        = 67;
const ITEM_RARE_CANDY     = 68;
const ITEM_PP_UP          = 69;
const ITEM_ZINC           = 70;
const ITEM_PP_MAX         = 71;
const ITEM_GUARD_SPEC     = 73;
const ITEM_DIRE_HIT       = 74;
const ITEM_X_ATTACK       = 75;
const ITEM_X_DEFEND       = 76;
const ITEM_X_SPEED        = 77;
const ITEM_X_ACCURACY     = 78;
const ITEM_X_SPECIAL      = 79;
const ITEM_POKE_DOLL      = 80;
const ITEM_FLUFFY_TAIL    = 81;
const ITEM_052            = 82;
const ITEM_SUPER_REPEL    = 83;
const ITEM_MAX_REPEL      = 84;
const ITEM_ESCAPE_ROPE    = 85;
const ITEM_REPEL          = 86;
const ITEM_SUN_STONE      = 93;
const ITEM_MOON_STONE     = 94;
const ITEM_FIRE_STONE     = 95;
const ITEM_THUNDER_STONE  = 96;
const ITEM_WATER_STONE    = 97;
const ITEM_LEAF_STONE     = 98;

// Unusable
const ITEM_TINY_MUSHROOM = 103;
const ITEM_BIG_MUSHROOM  = 104;
const ITEM_PEARL         = 106;
const ITEM_BIG_PEARL     = 107;
const ITEM_STARDUST      = 108;
const ITEM_STAR_PIECE    = 109;
const ITEM_NUGGET        = 110;
const ITEM_HEART_SCALE   = 111;

// Mail
const ITEM_ORANGE_MAIL   = 121;
const ITEM_HARBOR_MAIL   = 122;
const ITEM_GLITTER_MAIL  = 123;
const ITEM_MECH_MAIL     = 124;
const ITEM_WOOD_MAIL     = 125;
const ITEM_WAVE_MAIL     = 126;
const ITEM_BEAD_MAIL     = 127;
const ITEM_SHADOW_MAIL   = 128;
const ITEM_TROPIC_MAIL   = 129;
const ITEM_DREAM_MAIL    = 130;
const ITEM_FAB_MAIL      = 131;
const ITEM_RETRO_MAIL    = 132;

// Berries
const ITEM_CHERI_BERRY   = 133;
const ITEM_CHESTO_BERRY  = 134;
const ITEM_PECHA_BERRY   = 135;
const ITEM_RAWST_BERRY   = 136;
const ITEM_ASPEAR_BERRY  = 137;
const ITEM_LEPPA_BERRY   = 138;
const ITEM_ORAN_BERRY    = 139;
const ITEM_PERSIM_BERRY  = 140;
const ITEM_LUM_BERRY     = 141;
const ITEM_SITRUS_BERRY  = 142;
const ITEM_FIGY_BERRY    = 143;
const ITEM_WIKI_BERRY    = 144;
const ITEM_MAGO_BERRY    = 145;
const ITEM_AGUAV_BERRY   = 146;
const ITEM_IAPAPA_BERRY  = 147;
const ITEM_RAZZ_BERRY    = 148;
const ITEM_BLUK_BERRY    = 149;
const ITEM_NANAB_BERRY   = 150;
const ITEM_WEPEAR_BERRY  = 151;
const ITEM_PINAP_BERRY   = 152;
const ITEM_POMEG_BERRY   = 153;
const ITEM_KELPSY_BERRY  = 154;
const ITEM_QUALOT_BERRY  = 155;
const ITEM_HONDEW_BERRY  = 156;
const ITEM_GREPA_BERRY   = 157;
const ITEM_TAMATO_BERRY  = 158;
const ITEM_CORNN_BERRY   = 159;
const ITEM_MAGOST_BERRY  = 160;
const ITEM_RABUTA_BERRY  = 161;
const ITEM_NOMEL_BERRY   = 162;
const ITEM_SPELON_BERRY  = 163;
const ITEM_PAMTRE_BERRY  = 164;
const ITEM_WATMEL_BERRY  = 165;
const ITEM_DURIN_BERRY   = 166;
const ITEM_BELUE_BERRY   = 167;
const ITEM_LIECHI_BERRY  = 168;
const ITEM_GANLON_BERRY  = 169;
const ITEM_SALAC_BERRY   = 170;
const ITEM_PETAYA_BERRY  = 171;
const ITEM_APICOT_BERRY  = 172;
const ITEM_LANSAT_BERRY  = 173;
const ITEM_STARF_BERRY   = 174;
const ITEM_ENIGMA_BERRY  = 175;

// Battle Held items
const ITEM_BRIGHT_POWDER  = 179;
const ITEM_WHITE_HERB     = 180;
const ITEM_MACHO_BRACE    = 181;
const ITEM_EXP_SHARE      = 182;
const ITEM_QUICK_CLAW     = 183;
const ITEM_SOOTHE_BELL    = 184;
const ITEM_MENTAL_HERB    = 185;
const ITEM_CHOICE_BAND    = 186;
const ITEM_KINGS_ROCK     = 187;
const ITEM_SILVER_POWDER  = 188;
const ITEM_AMULET_COIN    = 189;
const ITEM_CLEANSE_TAG    = 190;
const ITEM_SOUL_DEW       = 191;
const ITEM_DEEP_SEA_TOOTH = 192;
const ITEM_DEEP_SEA_SCALE = 193;
const ITEM_SMOKE_BALL     = 194;
const ITEM_EVERSTONE      = 195;
const ITEM_FOCUS_BAND     = 196;
const ITEM_LUCKY_EGG      = 197;
const ITEM_SCOPE_LENS     = 198;
const ITEM_METAL_COAT     = 199;
const ITEM_LEFTOVERS      = 200;
const ITEM_DRAGON_SCALE   = 201;
const ITEM_LIGHT_BALL     = 202;
const ITEM_SOFT_SAND      = 203;
const ITEM_HARD_STONE     = 204;
const ITEM_MIRACLE_SEED   = 205;
const ITEM_BLACK_GLASSES  = 206;
const ITEM_BLACK_BELT     = 207;
const ITEM_MAGNET         = 208;
const ITEM_MYSTIC_WATER   = 209;
const ITEM_SHARP_BEAK     = 210;
const ITEM_POISON_BARB    = 211;
const ITEM_NEVER_MELT_ICE = 212;
const ITEM_SPELL_TAG      = 213;
const ITEM_TWISTED_SPOON  = 214;
const ITEM_CHARCOAL       = 215;
const ITEM_DRAGON_FANG    = 216;
const ITEM_SILK_SCARF     = 217;
const ITEM_UP_GRADE       = 218;
const ITEM_SHELL_BELL     = 219;
const ITEM_SEA_INCENSE    = 220;
const ITEM_LAX_INCENSE    = 221;
const ITEM_LUCKY_PUNCH    = 222;
const ITEM_METAL_POWDER   = 223;
const ITEM_THICK_CLUB     = 224;
const ITEM_STICK          = 225;

// Contest held items
const ITEM_RED_SCARF    = 254;
const ITEM_BLUE_SCARF   = 255;
const ITEM_PINK_SCARF   = 256;
const ITEM_GREEN_SCARF  = 257;
const ITEM_YELLOW_SCARF = 258;

// TMs/HMs
const ITEM_TM01 = 289;
const ITEM_TM02 = 290;
const ITEM_TM03 = 291;
const ITEM_TM04 = 292;
const ITEM_TM05 = 293;
const ITEM_TM06 = 294;
const ITEM_TM07 = 295;
const ITEM_TM08 = 296;
const ITEM_TM09 = 297;
const ITEM_TM10 = 298;
const ITEM_TM11 = 299;
const ITEM_TM12 = 300;
const ITEM_TM13 = 301;
const ITEM_TM14 = 302;
const ITEM_TM15 = 303;
const ITEM_TM16 = 304;
const ITEM_TM17 = 305;
const ITEM_TM18 = 306;
const ITEM_TM19 = 307;
const ITEM_TM20 = 308;
const ITEM_TM21 = 309;
const ITEM_TM22 = 310;
const ITEM_TM23 = 311;
const ITEM_TM24 = 312;
const ITEM_TM25 = 313;
const ITEM_TM26 = 314;
const ITEM_TM27 = 315;
const ITEM_TM28 = 316;
const ITEM_TM29 = 317;
const ITEM_TM30 = 318;
const ITEM_TM31 = 319;
const ITEM_TM32 = 320;
const ITEM_TM33 = 321;
const ITEM_TM34 = 322;
const ITEM_TM35 = 323;
const ITEM_TM36 = 324;
const ITEM_TM37 = 325;
const ITEM_TM38 = 326;
const ITEM_TM39 = 327;
const ITEM_TM40 = 328;
const ITEM_TM41 = 329;
const ITEM_TM42 = 330;
const ITEM_TM43 = 331;
const ITEM_TM44 = 332;
const ITEM_TM45 = 333;
const ITEM_TM46 = 334;
const ITEM_TM47 = 335;
const ITEM_TM48 = 336;
const ITEM_TM49 = 337;
const ITEM_TM50 = 338;

// Other / Key
const ITEM_MACH_BIKE       =  259;
const ITEM_COIN_CASE       =  260;
const ITEM_ITEMFINDER      =  261;
const ITEM_OLD_ROD         =  262;
const ITEM_GOOD_ROD        =  263;
const ITEM_SUPER_ROD       =  264;
const ITEM_SS_TICKET       =  265;
const ITEM_CONTEST_PASS    =  266;

const ITEM_WAILMER_PAIL    =  268;
const ITEM_DEVON_GOODS     =  269;
const ITEM_SOOT_SACK       =  270;
const ITEM_BASEMENT_KEY    =  271;
const ITEM_ACRO_BIKE       =  272;
const ITEM_POKEBLOCK_CASE  =  273;
const ITEM_LETTER          =  274;
const ITEM_EON_TICKET      =  275;
const ITEM_RED_ORB         =  276;
const ITEM_BLUE_ORB        =  277;
const ITEM_SCANNER         =  278;
const ITEM_GO_GOGGLES      =  279;
const ITEM_METEORITE       =  280;
const ITEM_ROOM_1_KEY      =  281;
const ITEM_ROOM_2_KEY      =  282;
const ITEM_ROOM_4_KEY      =  283;
const ITEM_ROOM_6_KEY      =  284;
const ITEM_STORAGE_KEY     =  285;
const ITEM_ROOT_FOSSIL     =  286;
const ITEM_CLAW_FOSSIL     =  287;
const ITEM_DEVON_SCOPE     =  288;

const ITEM_OAKS_PARCEL     = 349;
const ITEM_POKE_FLUTE      = 350;
const ITEM_SECRET_KEY      = 351;
const ITEM_BIKE_VOUCHER    = 352;
const ITEM_GOLD_TEETH      = 353;
const ITEM_OLD_AMBER       = 354;
const ITEM_CARD_KEY        = 355;
const ITEM_LIFT_KEY        = 356;
const ITEM_HELIX_FOSSIL    = 357;
const ITEM_DOME_FOSSIL     = 358;
const ITEM_SILPH_SCOPE     = 359;
const ITEM_BICYCLE         = 360;
const ITEM_TOWN_MAP        = 361;
const ITEM_VS_SEEKER       = 362;
const ITEM_FAME_CHECKER    = 363;
const ITEM_TM_CASE         = 364;
const ITEM_BERRY_POUCH     = 365;
const ITEM_TEACHY_TV       = 366;
const ITEM_TRI_PASS        = 367;
const ITEM_RAINBOW_PASS    = 368;
const ITEM_TEA             = 369;
const ITEM_MYSTIC_TICKET   = 370;
const ITEM_AURORA_TICKET   = 371;
const ITEM_POWDER_JAR      = 372;
const ITEM_RUBY            = 373;
const ITEM_SAPPHIRE        = 374;

const ITEM_MAGMA_EMBLEM    = 375;
const ITEM_OLD_SEA_MAP     = 376;

const itemNames = new Map();

/* Balls */
itemNames.set(1, "MASTER_BALL" );
itemNames.set(2, "ULTRA_BALL"  );
itemNames.set(3, "GREAT_BALL"  );
itemNames.set(4, "POKE_BALL"   );
itemNames.set(6, "NET_BALL"    );
itemNames.set(7, "DIVE_BALL"   );
itemNames.set(8, "NEST_BALL"   );
itemNames.set(9, "REPEAT_BALL" );
itemNames.set(10,"TIMER_BALL"  );
itemNames.set(11,"LUXURY_BALL" );
itemNames.set(12,"PREMIER_BALL");

/* Pokemon Items */
itemNames.set(13  , "POTION");    
itemNames.set(14  , "ANTIDOTE");    
itemNames.set(15  , "BURN_HEAL");    
itemNames.set(16  , "ICE_HEAL");    
itemNames.set(17  , "AWAKENING");    
itemNames.set(18  , "PARALYZE_HEAL");    
itemNames.set(19  , "FULL_RESTORE");    
itemNames.set(20  , "MAX_POTION");    
itemNames.set(21  , "HYPER_POTION");    
itemNames.set(22  , "SUPER_POTION");    
itemNames.set(23  , "FULL_HEAL");    
itemNames.set(24  , "REVIVE");    
itemNames.set(25  , "MAX_REVIVE");    
itemNames.set(26  , "FRESH_WATER");    
itemNames.set(27  , "SODA_POP");    
itemNames.set(28  , "LEMONADE");    
itemNames.set(29  , "MOOMOO_MILK");    
itemNames.set(30  , "ENERGY_POWDER");    
itemNames.set(31  , "ENERGY_ROOT");    
itemNames.set(32  , "HEAL_POWDER");    
itemNames.set(33  , "REVIVAL_HERB");    
itemNames.set(34  , "ETHER");    
itemNames.set(35  , "MAX_ETHER");    
itemNames.set(36  , "ELIXIR");    
itemNames.set(37  , "MAX_ELIXIR");    
itemNames.set(38  , "LAVA_COOKIE");    
itemNames.set(39  , "BLUE_FLUTE");    
itemNames.set(40  , "YELLOW_FLUTE");    
itemNames.set(41  , "RED_FLUTE");    
itemNames.set(42  , "BLACK_FLUTE");    
itemNames.set(43  , "WHITE_FLUTE");    
itemNames.set(44  , "BERRY_JUICE");    
itemNames.set(45  , "SACRED_ASH");    
itemNames.set(46  , "SHOAL_SALT");    
itemNames.set(47  , "SHOAL_SHELL");    
itemNames.set(48  , "RED_SHARD");    
itemNames.set(49  , "BLUE_SHARD");    
itemNames.set(50  , "YELLOW_SHARD");    
itemNames.set(51  , "GREEN_SHARD");     
itemNames.set(63  , "HP_UP");    
itemNames.set(64  , "PROTEIN");    
itemNames.set(65  , "IRON");    
itemNames.set(66  , "CARBOS");    
itemNames.set(67  , "CALCIUM");    
itemNames.set(68  , "RARE_CANDY");    
itemNames.set(69  , "PP_UP");    
itemNames.set(70  , "ZINC");    
itemNames.set(71  , "PP_MAX");    
itemNames.set(73  , "GUARD_SPEC");    
itemNames.set(74  , "DIRE_HIT");    
itemNames.set(75  , "X_ATTACK");    
itemNames.set(76  , "X_DEFEND");    
itemNames.set(77  , "X_SPEED");    
itemNames.set(78  , "X_ACCURACY");    
itemNames.set(79  , "X_SPECIAL");    
itemNames.set(80  , "POKE_DOLL");    
itemNames.set(81  , "FLUFFY_TAIL");    
itemNames.set(82  , "052");    
itemNames.set(83  , "SUPER_REPEL");    
itemNames.set(84  , "MAX_REPEL");    
itemNames.set(85  , "ESCAPE_ROPE");    
itemNames.set(86  , "REPEL");    
itemNames.set(93  , "SUN_STONE");    
itemNames.set(94  , "MOON_STONE");    
itemNames.set(95  , "FIRE_STONE");    
itemNames.set(96  , "THUNDER_STONE");    
itemNames.set(97  , "WATER_STONE");    
itemNames.set(98  , "LEAF_STONE");    

/* Unusable Items */
itemNames.set(103, "TINY_MUSHROOM");
itemNames.set(104, "BIG_MUSHROOM");
itemNames.set(106, "PEARL");
itemNames.set(107, "BIG_PEARL");
itemNames.set(108, "STARDUST");
itemNames.set(109, "STAR_PIECE");
itemNames.set(110, "NUGGET");
itemNames.set(111, "HEART_SCALE");

/* Mail*/
itemNames.set(121, "ORANGE_MAIL");
itemNames.set(122, "HARBOR_MAIL");
itemNames.set(123, "GLITTER_MAIL");
itemNames.set(124, "MECH_MAIL");
itemNames.set(125, "WOOD_MAIL");
itemNames.set(126, "WAVE_MAIL");
itemNames.set(127, "BEAD_MAIL");
itemNames.set(128, "SHADOW_MAIL");
itemNames.set(129, "TROPIC_MAIL");
itemNames.set(130, "DREAM_MAIL");
itemNames.set(131, "FAB_MAIL");
itemNames.set(132, "RETRO_MAIL");

itemNames.set(133, "CHERI_BERRY");
itemNames.set(134, "CHESTO_BERRY");
itemNames.set(135, "PECHA_BERRY");
itemNames.set(136, "RAWST_BERRY");
itemNames.set(137, "ASPEAR_BERRY");
itemNames.set(138, "LEPPA_BERRY");
itemNames.set(139, "ORAN_BERRY");
itemNames.set(140, "PERSIM_BERRY");
itemNames.set(141, "LUM_BERRY");
itemNames.set(142, "SITRUS_BERRY");
itemNames.set(143, "FIGY_BERRY");
itemNames.set(144, "WIKI_BERRY");
itemNames.set(145, "MAGO_BERRY");
itemNames.set(146, "AGUAV_BERRY");
itemNames.set(147, "IAPAPA_BERRY");
itemNames.set(148, "RAZZ_BERRY");
itemNames.set(149, "BLUK_BERRY");
itemNames.set(150, "NANAB_BERRY");
itemNames.set(151, "WEPEAR_BERRY");
itemNames.set(152, "PINAP_BERRY");
itemNames.set(153, "POMEG_BERRY");
itemNames.set(154, "KELPSY_BERRY");
itemNames.set(155, "QUALOT_BERRY");
itemNames.set(156, "HONDEW_BERRY");
itemNames.set(157, "GREPA_BERRY");
itemNames.set(158, "TAMATO_BERRY");
itemNames.set(159, "CORNN_BERRY");
itemNames.set(160, "MAGOST_BERRY");
itemNames.set(161, "RABUTA_BERRY");
itemNames.set(162, "NOMEL_BERRY");
itemNames.set(163, "SPELON_BERRY");
itemNames.set(164, "PAMTRE_BERRY");
itemNames.set(165, "WATMEL_BERRY");
itemNames.set(166, "DURIN_BERRY");
itemNames.set(167, "BELUE_BERRY");
itemNames.set(168, "LIECHI_BERRY");
itemNames.set(169, "GANLON_BERRY");
itemNames.set(170, "SALAC_BERRY");
itemNames.set(171, "PETAYA_BERRY");
itemNames.set(172, "APICOT_BERRY");
itemNames.set(173, "LANSAT_BERRY");
itemNames.set(174, "STARF_BERRY");
itemNames.set(175, "ENIGMA_BERRY");

// Battle Held items
itemNames.set(179, "BRIGHT_POWDER");
itemNames.set(180, "WHITE_HERB");
itemNames.set(181, "MACHO_BRACE");
itemNames.set(182, "EXP_SHARE");
itemNames.set(183, "QUICK_CLAW");
itemNames.set(184, "SOOTHE_BELL");
itemNames.set(185, "MENTAL_HERB");
itemNames.set(186, "CHOICE_BAND");
itemNames.set(187, "KINGS_ROCK");
itemNames.set(188, "SILVER_POWDER");
itemNames.set(189, "AMULET_COIN");
itemNames.set(190, "CLEANSE_TAG");
itemNames.set(191, "SOUL_DEW");
itemNames.set(192, "DEEP_SEA_TOOTH");
itemNames.set(193, "DEEP_SEA_SCALE");
itemNames.set(194, "SMOKE_BALL");
itemNames.set(195, "EVERSTONE");
itemNames.set(196, "FOCUS_BAND");
itemNames.set(197, "LUCKY_EGG");
itemNames.set(198, "SCOPE_LENS");
itemNames.set(199, "METAL_COAT");
itemNames.set(200, "LEFTOVERS");
itemNames.set(201, "DRAGON_SCALE");
itemNames.set(202, "LIGHT_BALL");
itemNames.set(203, "SOFT_SAND");
itemNames.set(204, "HARD_STONE");
itemNames.set(205, "MIRACLE_SEED");
itemNames.set(206, "BLACK_GLASSES");
itemNames.set(207, "BLACK_BELT");
itemNames.set(208, "MAGNET");
itemNames.set(209, "MYSTIC_WATER");
itemNames.set(210, "SHARP_BEAK");
itemNames.set(211, "POISON_BARB");
itemNames.set(212, "NEVER_MELT_ICE");
itemNames.set(213, "SPELL_TAG");
itemNames.set(214, "TWISTED_SPOON");
itemNames.set(215, "CHARCOAL");
itemNames.set(216, "DRAGON_FANG");
itemNames.set(217, "SILK_SCARF");
itemNames.set(218, "UP_GRADE");
itemNames.set(219, "SHELL_BELL");
itemNames.set(220, "SEA_INCENSE");
itemNames.set(221, "LAX_INCENSE");
itemNames.set(222, "LUCKY_PUNCH");
itemNames.set(223, "METAL_POWDER");
itemNames.set(224, "THICK_CLUB");
itemNames.set(225, "STICK");

// Contest held items
itemNames.set(254, "RED_SCARF");
itemNames.set(255, "BLUE_SCARF");
itemNames.set(256, "PINK_SCARF");
itemNames.set(257, "GREEN_SCARF");
itemNames.set(258, "YELLOW_SCARF");

// TMs/HMs
itemNames.set(289, "TM01");
itemNames.set(290, "TM02");
itemNames.set(291, "TM03");
itemNames.set(292, "TM04");
itemNames.set(293, "TM05");
itemNames.set(294, "TM06");
itemNames.set(295, "TM07");
itemNames.set(296, "TM08");
itemNames.set(297, "TM09");
itemNames.set(298, "TM10");
itemNames.set(299, "TM11");
itemNames.set(300, "TM12");
itemNames.set(301, "TM13");
itemNames.set(302, "TM14");
itemNames.set(303, "TM15");
itemNames.set(304, "TM16");
itemNames.set(305, "TM17");
itemNames.set(306, "TM18");
itemNames.set(307, "TM19");
itemNames.set(308, "TM20");
itemNames.set(309, "TM21");
itemNames.set(310, "TM22");
itemNames.set(311, "TM23");
itemNames.set(312, "TM24");
itemNames.set(313, "TM25");
itemNames.set(314, "TM26");
itemNames.set(315, "TM27");
itemNames.set(316, "TM28");
itemNames.set(317, "TM29");
itemNames.set(318, "TM30");
itemNames.set(319, "TM31");
itemNames.set(320, "TM32");
itemNames.set(321, "TM33");
itemNames.set(322, "TM34");
itemNames.set(323, "TM35");
itemNames.set(324, "TM36");
itemNames.set(325, "TM37");
itemNames.set(326, "TM38");
itemNames.set(327, "TM39");
itemNames.set(328, "TM40");
itemNames.set(329, "TM41");
itemNames.set(330, "TM42");
itemNames.set(331, "TM43");
itemNames.set(332, "TM44");
itemNames.set(333, "TM45");
itemNames.set(334, "TM46");
itemNames.set(335, "TM47");
itemNames.set(336, "TM48");
itemNames.set(337, "TM49");
itemNames.set(338, "TM50");

// Other / Key
itemNames.set(259, "MACH_BIKE");
itemNames.set(260, "COIN_CASE");
itemNames.set(261, "ITEMFINDER");
itemNames.set(262, "OLD_ROD");
itemNames.set(263, "GOOD_ROD");
itemNames.set(264, "SUPER_ROD");
itemNames.set(265, "SS_TICKET");
itemNames.set(266, "CONTEST_PASS");

itemNames.set(268, "WAILMER_PAIL");
itemNames.set(269, "DEVON_GOODS");
itemNames.set(270, "SOOT_SACK");
itemNames.set(271, "BASEMENT_KEY");
itemNames.set(272, "ACRO_BIKE");
itemNames.set(273, "POKEBLOCK_CASE");
itemNames.set(274, "LETTER");
itemNames.set(275, "EON_TICKET");
itemNames.set(276, "RED_ORB");
itemNames.set(277, "BLUE_ORB");
itemNames.set(278, "SCANNER");
itemNames.set(279, "GO_GOGGLES");
itemNames.set(280, "METEORITE");
itemNames.set(281, "ROOM_1_KEY");
itemNames.set(282, "ROOM_2_KEY");
itemNames.set(283, "ROOM_4_KEY");
itemNames.set(284, "ROOM_6_KEY");
itemNames.set(285, "STORAGE_KEY");
itemNames.set(286, "ROOT_FOSSIL");
itemNames.set(287, "CLAW_FOSSIL");
itemNames.set(288, "DEVON_SCOPE");

itemNames.set(349, "OAKS_PARCEL");
itemNames.set(350, "POKE_FLUTE");
itemNames.set(351, "SECRET_KEY");
itemNames.set(352, "BIKE_VOUCHER");
itemNames.set(353, "GOLD_TEETH");
itemNames.set(354, "OLD_AMBER");
itemNames.set(355, "CARD_KEY");
itemNames.set(356, "LIFT_KEY");
itemNames.set(357, "HELIX_FOSSIL");
itemNames.set(358, "DOME_FOSSIL");
itemNames.set(359, "SILPH_SCOPE");
itemNames.set(360, "BICYCLE");
itemNames.set(361, "TOWN_MAP");
itemNames.set(362, "VS_SEEKER");
itemNames.set(363, "FAME_CHECKER");
itemNames.set(364, "TM_CASE");
itemNames.set(365, "BERRY_POUCH");
itemNames.set(366, "TEACHY_TV");
itemNames.set(367, "TRI_PASS");
itemNames.set(368, "RAINBOW_PASS");
itemNames.set(369, "TEA");
itemNames.set(370, "MYSTIC_TICKET");
itemNames.set(371, "AURORA_TICKET");
itemNames.set(372, "POWDER_JAR");
itemNames.set(373, "RUBY");
itemNames.set(374, "SAPPHIRE");

itemNames.set(375, "MAGMA_EMBLEM");
itemNames.set(376, "OLD_SEA_MAP");

var mart1 = MarketHelper.createDefault();

module.exports = MarketHelper;