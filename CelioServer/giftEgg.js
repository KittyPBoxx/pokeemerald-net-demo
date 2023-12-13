class GiftEggHelper {

    static createDefault() {
        return new GiftEgg(SPECIES_PICHU, MOVE_SURF);
    }

    static getGiftEgg() {
        return giftEgg1;
    }

    static updateGiftEgg(data) {
        giftEgg1 = new GiftEgg(data.species, data.specialMove);
    }

}

class GiftEgg {

    constructor(species, specialMove) {
        this.species = species;
        this.specialMove = specialMove; 
        this.idsGiven = new Map();
        this.secondsToAllowRetry = 3;
    }

    toString() {

        if (this.species == 0) {
            return "No Gift Egg";
        }

        return speciesNames.get(this.species) + " With Move " + this.specialMove;
    }

    getDataArray(trainerId) {
        let data = new Uint8Array(4); // only first 2 bytes used

        let lastGivenDate = this.idsGiven.get(trainerId);
        let eggAlreadyObtained = true;

        // If we get two request very quickly it's probably a failed request/retry.
        if (lastGivenDate == null) {
            eggAlreadyObtained = false;
        } else if (Math.floor((Date.now() - lastGivenDate) / 1000) <= this.secondsToAllowRetry) {
            eggAlreadyObtained = false;
        }


        if (eggAlreadyObtained) {
            data[0] = (SPECIES_EGG & 0xff);
            data[1] = SPECIES_EGG >> 8;
        } else {
            this.idsGiven.set(trainerId, Date.now());
            data[0] = (this.species & 0xff);
            data[1] = this.species >> 8;

            data[2] = (this.specialMove & 0xff);
            data[3] = this.specialMove >> 8;
        }

        return data;
    }


 }

 /* SPECIES */
const SPECIES_PICHU       = 172;
const SPECIES_EGG         = 412;

/* MOVES */
const MOVE_SURF             = 57;

const speciesNames = new Map();

speciesNames.set(0  , "NONE");
speciesNames.set(1  , "BULBASAUR");
speciesNames.set(2  , "IVYSAUR");
speciesNames.set(3  , "VENUSAUR");
speciesNames.set(4  , "CHARMANDER");
speciesNames.set(5  , "CHARMELEON");
speciesNames.set(6  , "CHARIZARD");
speciesNames.set(7  , "SQUIRTLE");
speciesNames.set(8  , "WARTORTLE");
speciesNames.set(9  , "BLASTOISE");
speciesNames.set(10 , "CATERPIE");
speciesNames.set(11 , "METAPOD");
speciesNames.set(12 , "BUTTERFREE");
speciesNames.set(13 , "WEEDLE");
speciesNames.set(14 , "KAKUNA");
speciesNames.set(15 , "BEEDRILL");
speciesNames.set(16 , "PIDGEY");
speciesNames.set(17 , "PIDGEOTTO");
speciesNames.set(18 , "PIDGEOT");
speciesNames.set(19 , "RATTATA");
speciesNames.set(20 , "RATICATE");
speciesNames.set(21 , "SPEAROW");
speciesNames.set(22 , "FEAROW");
speciesNames.set(23 , "EKANS");
speciesNames.set(24 , "ARBOK");
speciesNames.set(25 , "PIKACHU");
speciesNames.set(26 , "RAICHU");
speciesNames.set(27 , "SANDSHREW");
speciesNames.set(28 , "SANDSLASH");
speciesNames.set(29 , "NIDORAN_F");
speciesNames.set(30 , "NIDORINA");
speciesNames.set(31 , "NIDOQUEEN");
speciesNames.set(32 , "NIDORAN_M");
speciesNames.set(33 , "NIDORINO");
speciesNames.set(34 , "NIDOKING");
speciesNames.set(35 , "CLEFAIRY");
speciesNames.set(36 , "CLEFABLE");
speciesNames.set(37 , "VULPIX");
speciesNames.set(38 , "NINETALES");
speciesNames.set(39 , "JIGGLYPUFF");
speciesNames.set(40 , "WIGGLYTUFF");
speciesNames.set(41 , "ZUBAT");
speciesNames.set(42 , "GOLBAT");
speciesNames.set(43 , "ODDISH");
speciesNames.set(44 , "GLOOM");
speciesNames.set(45 , "VILEPLUME");
speciesNames.set(46 , "PARAS");
speciesNames.set(47 , "PARASECT");
speciesNames.set(48 , "VENONAT");
speciesNames.set(49 , "VENOMOTH");
speciesNames.set(50 , "DIGLETT");
speciesNames.set(51 , "DUGTRIO");
speciesNames.set(52 , "MEOWTH");
speciesNames.set(53 , "PERSIAN");
speciesNames.set(54 , "PSYDUCK");
speciesNames.set(55 , "GOLDUCK");
speciesNames.set(56 , "MANKEY");
speciesNames.set(57 , "PRIMEAPE");
speciesNames.set(58 , "GROWLITHE");
speciesNames.set(59 , "ARCANINE");
speciesNames.set(60 , "POLIWAG");
speciesNames.set(61 , "POLIWHIRL");
speciesNames.set(62 , "POLIWRATH");
speciesNames.set(63 , "ABRA");
speciesNames.set(64 , "KADABRA");
speciesNames.set(65 , "ALAKAZAM");
speciesNames.set(66 , "MACHOP");
speciesNames.set(67 , "MACHOKE");
speciesNames.set(68 , "MACHAMP");
speciesNames.set(69 , "BELLSPROUT");
speciesNames.set(70 , "WEEPINBELL");
speciesNames.set(71 , "VICTREEBEL");
speciesNames.set(72 , "TENTACOOL");
speciesNames.set(73 , "TENTACRUEL");
speciesNames.set(74 , "GEODUDE");
speciesNames.set(75 , "GRAVELER");
speciesNames.set(76 , "GOLEM");
speciesNames.set(77 , "PONYTA");
speciesNames.set(78 , "RAPIDASH");
speciesNames.set(79 , "SLOWPOKE");
speciesNames.set(80 , "SLOWBRO");
speciesNames.set(81 , "MAGNEMITE");
speciesNames.set(82 , "MAGNETON");
speciesNames.set(83 , "FARFETCHD");
speciesNames.set(84 , "DODUO");
speciesNames.set(85 , "DODRIO");
speciesNames.set(86 , "SEEL");
speciesNames.set(87 , "DEWGONG");
speciesNames.set(88 , "GRIMER");
speciesNames.set(89 , "MUK");
speciesNames.set(90 , "SHELLDER");
speciesNames.set(91 , "CLOYSTER");
speciesNames.set(92 , "GASTLY");
speciesNames.set(93 , "HAUNTER");
speciesNames.set(94 , "GENGAR");
speciesNames.set(95 , "ONIX");
speciesNames.set(96 , "DROWZEE");
speciesNames.set(97 , "HYPNO");
speciesNames.set(98 , "KRABBY");
speciesNames.set(99 , "KINGLER");
speciesNames.set(100, "VOLTORB");
speciesNames.set(101, "ELECTRODE");
speciesNames.set(102, "EXEGGCUTE");
speciesNames.set(103, "EXEGGUTOR");
speciesNames.set(104, "CUBONE");
speciesNames.set(105, "MAROWAK");
speciesNames.set(106, "HITMONLEE");
speciesNames.set(107, "HITMONCHAN");
speciesNames.set(108, "LICKITUNG");
speciesNames.set(109, "KOFFING");
speciesNames.set(110, "WEEZING");
speciesNames.set(111, "RHYHORN");
speciesNames.set(112, "RHYDON");
speciesNames.set(113, "CHANSEY");
speciesNames.set(114, "TANGELA");
speciesNames.set(115, "KANGASKHAN");
speciesNames.set(116, "HORSEA");
speciesNames.set(117, "SEADRA");
speciesNames.set(118, "GOLDEEN");
speciesNames.set(119, "SEAKING");
speciesNames.set(120, "STARYU");
speciesNames.set(121, "STARMIE");
speciesNames.set(122, "MR_MIME");
speciesNames.set(123, "SCYTHER");
speciesNames.set(124, "JYNX");
speciesNames.set(125, "ELECTABUZZ");
speciesNames.set(126, "MAGMAR");
speciesNames.set(127, "PINSIR");
speciesNames.set(128, "TAUROS");
speciesNames.set(129, "MAGIKARP");
speciesNames.set(130, "GYARADOS");
speciesNames.set(131, "LAPRAS");
speciesNames.set(132, "DITTO");
speciesNames.set(133, "EEVEE");
speciesNames.set(134, "VAPOREON");
speciesNames.set(135, "JOLTEON");
speciesNames.set(136, "FLAREON");
speciesNames.set(137, "PORYGON");
speciesNames.set(138, "OMANYTE");
speciesNames.set(139, "OMASTAR");
speciesNames.set(140, "KABUTO");
speciesNames.set(141, "KABUTOPS");
speciesNames.set(142, "AERODACTYL");
speciesNames.set(143, "SNORLAX");
speciesNames.set(144, "ARTICUNO");
speciesNames.set(145, "ZAPDOS");
speciesNames.set(146, "MOLTRES");
speciesNames.set(147, "DRATINI");
speciesNames.set(148, "DRAGONAIR");
speciesNames.set(149, "DRAGONITE");
speciesNames.set(150, "MEWTWO");
speciesNames.set(151, "MEW");
speciesNames.set(152, "CHIKORITA");
speciesNames.set(153, "BAYLEEF");
speciesNames.set(154, "MEGANIUM");
speciesNames.set(155, "CYNDAQUIL");
speciesNames.set(156, "QUILAVA");
speciesNames.set(157, "TYPHLOSION");
speciesNames.set(158, "TOTODILE");
speciesNames.set(159, "CROCONAW");
speciesNames.set(160, "FERALIGATR");
speciesNames.set(161, "SENTRET");
speciesNames.set(162, "FURRET");
speciesNames.set(163, "HOOTHOOT");
speciesNames.set(164, "NOCTOWL");
speciesNames.set(165, "LEDYBA");
speciesNames.set(166, "LEDIAN");
speciesNames.set(167, "SPINARAK");
speciesNames.set(168, "ARIADOS");
speciesNames.set(169, "CROBAT");
speciesNames.set(170, "CHINCHOU");
speciesNames.set(171, "LANTURN");
speciesNames.set(172, "PICHU");
speciesNames.set(173, "CLEFFA");
speciesNames.set(174, "IGGLYBUFF");
speciesNames.set(175, "TOGEPI");
speciesNames.set(176, "TOGETIC");
speciesNames.set(177, "NATU");
speciesNames.set(178, "XATU");
speciesNames.set(179, "MAREEP");
speciesNames.set(180, "FLAAFFY");
speciesNames.set(181, "AMPHAROS");
speciesNames.set(182, "BELLOSSOM");
speciesNames.set(183, "MARILL");
speciesNames.set(184, "AZUMARILL");
speciesNames.set(185, "SUDOWOODO");
speciesNames.set(186, "POLITOED");
speciesNames.set(187, "HOPPIP");
speciesNames.set(188, "SKIPLOOM");
speciesNames.set(189, "JUMPLUFF");
speciesNames.set(190, "AIPOM");
speciesNames.set(191, "SUNKERN");
speciesNames.set(192, "SUNFLORA");
speciesNames.set(193, "YANMA");
speciesNames.set(194, "WOOPER");
speciesNames.set(195, "QUAGSIRE");
speciesNames.set(196, "ESPEON");
speciesNames.set(197, "UMBREON");
speciesNames.set(198, "MURKROW");
speciesNames.set(199, "SLOWKING");
speciesNames.set(200, "MISDREAVUS");
speciesNames.set(201, "UNOWN");
speciesNames.set(202, "WOBBUFFET");
speciesNames.set(203, "GIRAFARIG");
speciesNames.set(204, "PINECO");
speciesNames.set(205, "FORRETRESS");
speciesNames.set(206, "DUNSPARCE");
speciesNames.set(207, "GLIGAR");
speciesNames.set(208, "STEELIX");
speciesNames.set(209, "SNUBBULL");
speciesNames.set(210, "GRANBULL");
speciesNames.set(211, "QWILFISH");
speciesNames.set(212, "SCIZOR");
speciesNames.set(213, "SHUCKLE");
speciesNames.set(214, "HERACROSS");
speciesNames.set(215, "SNEASEL");
speciesNames.set(216, "TEDDIURSA");
speciesNames.set(217, "URSARING");
speciesNames.set(218, "SLUGMA");
speciesNames.set(219, "MAGCARGO");
speciesNames.set(220, "SWINUB");
speciesNames.set(221, "PILOSWINE");
speciesNames.set(222, "CORSOLA");
speciesNames.set(223, "REMORAID");
speciesNames.set(224, "OCTILLERY");
speciesNames.set(225, "DELIBIRD");
speciesNames.set(226, "MANTINE");
speciesNames.set(227, "SKARMORY");
speciesNames.set(228, "HOUNDOUR");
speciesNames.set(229, "HOUNDOOM");
speciesNames.set(230, "KINGDRA");
speciesNames.set(231, "PHANPY");
speciesNames.set(232, "DONPHAN");
speciesNames.set(233, "PORYGON2");
speciesNames.set(234, "STANTLER");
speciesNames.set(235, "SMEARGLE");
speciesNames.set(236, "TYROGUE");
speciesNames.set(237, "HITMONTOP");
speciesNames.set(238, "SMOOCHUM");
speciesNames.set(239, "ELEKID");
speciesNames.set(240, "MAGBY");
speciesNames.set(241, "MILTANK");
speciesNames.set(242, "BLISSEY");
speciesNames.set(243, "RAIKOU");
speciesNames.set(244, "ENTEI");
speciesNames.set(245, "SUICUNE");
speciesNames.set(246, "LARVITAR");
speciesNames.set(247, "PUPITAR");
speciesNames.set(248, "TYRANITAR");
speciesNames.set(249, "LUGIA");
speciesNames.set(250, "HO_OH");
speciesNames.set(251, "CELEBI");
speciesNames.set(252, "OLD_UNOWN_B");
speciesNames.set(253, "OLD_UNOWN_C");
speciesNames.set(254, "OLD_UNOWN_D");
speciesNames.set(255, "OLD_UNOWN_E");
speciesNames.set(256, "OLD_UNOWN_F");
speciesNames.set(257, "OLD_UNOWN_G");
speciesNames.set(258, "OLD_UNOWN_H");
speciesNames.set(259, "OLD_UNOWN_I");
speciesNames.set(260, "OLD_UNOWN_J");
speciesNames.set(261, "OLD_UNOWN_K");
speciesNames.set(262, "OLD_UNOWN_L");
speciesNames.set(263, "OLD_UNOWN_M");
speciesNames.set(264, "OLD_UNOWN_N");
speciesNames.set(265, "OLD_UNOWN_O");
speciesNames.set(266, "OLD_UNOWN_P");
speciesNames.set(267, "OLD_UNOWN_Q");
speciesNames.set(268, "OLD_UNOWN_R");
speciesNames.set(269, "OLD_UNOWN_S");
speciesNames.set(270, "OLD_UNOWN_T");
speciesNames.set(271, "OLD_UNOWN_U");
speciesNames.set(272, "OLD_UNOWN_V");
speciesNames.set(273, "OLD_UNOWN_W");
speciesNames.set(274, "OLD_UNOWN_X");
speciesNames.set(275, "OLD_UNOWN_Y");
speciesNames.set(276, "OLD_UNOWN_Z");
speciesNames.set(277, "TREECKO");
speciesNames.set(278, "GROVYLE");
speciesNames.set(279, "SCEPTILE");
speciesNames.set(280, "TORCHIC");
speciesNames.set(281, "COMBUSKEN");
speciesNames.set(282, "BLAZIKEN");
speciesNames.set(283, "MUDKIP");
speciesNames.set(284, "MARSHTOMP");
speciesNames.set(285, "SWAMPERT");
speciesNames.set(286, "POOCHYENA");
speciesNames.set(287, "MIGHTYENA");
speciesNames.set(288, "ZIGZAGOON");
speciesNames.set(289, "LINOONE");
speciesNames.set(290, "WURMPLE");
speciesNames.set(291, "SILCOON");
speciesNames.set(292, "BEAUTIFLY");
speciesNames.set(293, "CASCOON");
speciesNames.set(294, "DUSTOX");
speciesNames.set(295, "LOTAD");
speciesNames.set(296, "LOMBRE");
speciesNames.set(297, "LUDICOLO");
speciesNames.set(298, "SEEDOT");
speciesNames.set(299, "NUZLEAF");
speciesNames.set(300, "SHIFTRY");
speciesNames.set(301, "NINCADA");
speciesNames.set(302, "NINJASK");
speciesNames.set(303, "SHEDINJA");
speciesNames.set(304, "TAILLOW");
speciesNames.set(305, "SWELLOW");
speciesNames.set(306, "SHROOMISH");
speciesNames.set(307, "BRELOOM");
speciesNames.set(308, "SPINDA");
speciesNames.set(309, "WINGULL");
speciesNames.set(310, "PELIPPER");
speciesNames.set(311, "SURSKIT");
speciesNames.set(312, "MASQUERAIN");
speciesNames.set(313, "WAILMER");
speciesNames.set(314, "WAILORD");
speciesNames.set(315, "SKITTY");
speciesNames.set(316, "DELCATTY");
speciesNames.set(317, "KECLEON");
speciesNames.set(318, "BALTOY");
speciesNames.set(319, "CLAYDOL");
speciesNames.set(320, "NOSEPASS");
speciesNames.set(321, "TORKOAL");
speciesNames.set(322, "SABLEYE");
speciesNames.set(323, "BARBOACH");
speciesNames.set(324, "WHISCASH");
speciesNames.set(325, "LUVDISC");
speciesNames.set(326, "CORPHISH");
speciesNames.set(327, "CRAWDAUNT");
speciesNames.set(328, "FEEBAS");
speciesNames.set(329, "MILOTIC");
speciesNames.set(330, "CARVANHA");
speciesNames.set(331, "SHARPEDO");
speciesNames.set(332, "TRAPINCH");
speciesNames.set(333, "VIBRAVA");
speciesNames.set(334, "FLYGON");
speciesNames.set(335, "MAKUHITA");
speciesNames.set(336, "HARIYAMA");
speciesNames.set(337, "ELECTRIKE");
speciesNames.set(338, "MANECTRIC");
speciesNames.set(339, "NUMEL");
speciesNames.set(340, "CAMERUPT");
speciesNames.set(341, "SPHEAL");
speciesNames.set(342, "SEALEO");
speciesNames.set(343, "WALREIN");
speciesNames.set(344, "CACNEA");
speciesNames.set(345, "CACTURNE");
speciesNames.set(346, "SNORUNT");
speciesNames.set(347, "GLALIE");
speciesNames.set(348, "LUNATONE");
speciesNames.set(349, "SOLROCK");
speciesNames.set(350, "AZURILL");
speciesNames.set(351, "SPOINK");
speciesNames.set(352, "GRUMPIG");
speciesNames.set(353, "PLUSLE");
speciesNames.set(354, "MINUN");
speciesNames.set(355, "MAWILE");
speciesNames.set(356, "MEDITITE");
speciesNames.set(357, "MEDICHAM");
speciesNames.set(358, "SWABLU");
speciesNames.set(359, "ALTARIA");
speciesNames.set(360, "WYNAUT");
speciesNames.set(361, "DUSKULL");
speciesNames.set(362, "DUSCLOPS");
speciesNames.set(363, "ROSELIA");
speciesNames.set(364, "SLAKOTH");
speciesNames.set(365, "VIGOROTH");
speciesNames.set(366, "SLAKING");
speciesNames.set(367, "GULPIN");
speciesNames.set(368, "SWALOT");
speciesNames.set(369, "TROPIUS");
speciesNames.set(370, "WHISMUR");
speciesNames.set(371, "LOUDRED");
speciesNames.set(372, "EXPLOUD");
speciesNames.set(373, "CLAMPERL");
speciesNames.set(374, "HUNTAIL");
speciesNames.set(375, "GOREBYSS");
speciesNames.set(376, "ABSOL");
speciesNames.set(377, "SHUPPET");
speciesNames.set(378, "BANETTE");
speciesNames.set(379, "SEVIPER");
speciesNames.set(380, "ZANGOOSE");
speciesNames.set(381, "RELICANTH");
speciesNames.set(382, "ARON");
speciesNames.set(383, "LAIRON");
speciesNames.set(384, "AGGRON");
speciesNames.set(385, "CASTFORM");
speciesNames.set(386, "VOLBEAT");
speciesNames.set(387, "ILLUMISE");
speciesNames.set(388, "LILEEP");
speciesNames.set(389, "CRADILY");
speciesNames.set(390, "ANORITH");
speciesNames.set(391, "ARMALDO");
speciesNames.set(392, "RALTS");
speciesNames.set(393, "KIRLIA");
speciesNames.set(394, "GARDEVOIR");
speciesNames.set(395, "BAGON");
speciesNames.set(396, "SHELGON");
speciesNames.set(397, "SALAMENCE");
speciesNames.set(398, "BELDUM");
speciesNames.set(399, "METANG");
speciesNames.set(400, "METAGROSS");
speciesNames.set(401, "REGIROCK");
speciesNames.set(402, "REGICE");
speciesNames.set(403, "REGISTEEL");
speciesNames.set(404, "KYOGRE");
speciesNames.set(405, "GROUDON");
speciesNames.set(406, "RAYQUAZA");
speciesNames.set(407, "LATIAS");
speciesNames.set(408, "LATIOS");
speciesNames.set(409, "JIRACHI");
speciesNames.set(410, "DEOXYS");
speciesNames.set(411, "CHIMECHO");
speciesNames.set(412, "EGG");

var giftEgg1 = GiftEggHelper.createDefault();

module.exports = GiftEggHelper;