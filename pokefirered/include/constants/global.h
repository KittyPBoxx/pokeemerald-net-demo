#ifndef GUARD_CONSTANTS_GLOBAL_H
#define GUARD_CONSTANTS_GLOBAL_H
// Invalid Versions show as "----------" in Gen 4 and Gen 5's summary screen.
// In Gens 6 and 7, invalid versions instead show "a distant land" in the summary screen.
// In Gen 4 only, migrated Pokemon with Diamond, Pearl, or Platinum's ID show as "----------".
// Gen 5 and up read Diamond, Pearl, or Platinum's ID as "Sinnoh".
// In Gen 4 and up, migrated Pokemon with HeartGold or SoulSilver's ID show the otherwise unused "Johto" string.
#define VERSION_SAPPHIRE 1
#define VERSION_RUBY 2
#define VERSION_EMERALD 3
#define VERSION_FIRE_RED 4
#define VERSION_LEAF_GREEN 5
#define VERSION_HEART_GOLD 7
#define VERSION_SOUL_SILVER 8
#define VERSION_DIAMOND 10
#define VERSION_PEARL 11
#define VERSION_PLATINUM 12
#define VERSION_GAMECUBE 15

#define LANGUAGE_JAPANESE 1
#define LANGUAGE_ENGLISH  2
#define LANGUAGE_FRENCH   3
#define LANGUAGE_ITALIAN  4
#define LANGUAGE_GERMAN   5
#define LANGUAGE_KOREAN   6 // 6 goes unused but the theory is it was meant to be Korean
#define LANGUAGE_SPANISH  7
#define NUM_LANGUAGES     7

#ifdef ENGLISH
#define GAME_LANGUAGE (LANGUAGE_ENGLISH)
#endif

// capacities of various saveblock objects
#define DAYCARE_MON_COUNT   2
#define PC_ITEMS_COUNT      30
#define BAG_ITEMS_COUNT     42
#define BAG_KEYITEMS_COUNT  30
#define BAG_POKEBALLS_COUNT 13
#define BAG_TMHM_COUNT      58
#define BAG_BERRIES_COUNT   43
#define OBJECT_EVENTS_COUNT 16
#define OBJECT_EVENT_TEMPLATES_COUNT 64
#define MAIL_COUNT         (PARTY_SIZE + 10)
#define PC_MAIL_NUM(i)     (PARTY_SIZE + (i))
#define DECOR_MAX_SECRET_BASE 16
#define MAX_REMATCH_ENTRIES 100
#define UNION_ROOM_KB_ROW_COUNT 10
#define GIFT_RIBBONS_COUNT 11

#define POCKET_ITEMS        1
#define POCKET_KEY_ITEMS    2
#define POCKET_POKE_BALLS   3
#define POCKET_TM_CASE      4
#define POCKET_BERRY_POUCH  5
#define NUM_BAG_POCKETS 5

// Contests
#define CONTEST_CATEGORIES_COUNT  5

// string lengths
#define ITEM_NAME_LENGTH 14
#define POKEMON_NAME_LENGTH 10
#define PLAYER_NAME_LENGTH   7
#define MAIL_WORDS_COUNT 9
#define EASY_CHAT_BATTLE_WORDS_COUNT 6
#define MOVE_NAME_LENGTH 12
#define NUM_QUESTIONNAIRE_WORDS 4
#define WONDER_CARD_TEXT_LENGTH 40
#define WONDER_NEWS_TEXT_LENGTH 40
#define WONDER_CARD_BODY_TEXT_LINES 4
#define WONDER_NEWS_BODY_TEXT_LINES 10

#define MAX_STAMP_CARD_STAMPS 7

#define TRAINER_ID_LENGTH 4
#define MAX_MON_MOVES 4
#define PARTY_SIZE 6
#define MULTI_PARTY_SIZE (PARTY_SIZE / 2)

#define QUEST_LOG_SCENE_COUNT 4

#define NUM_TOWER_CHALLENGE_TYPES 4

#define MALE   0
#define FEMALE 1
#define GENDER_COUNT 2

#define BARD_SONG_LENGTH       6
#define NUM_STORYTELLER_TALES  4
#define NUM_TRADER_ITEMS       4
#define GIDDY_MAX_TALES       10
#define GIDDY_MAX_QUESTIONS    8

#define OPTIONS_BUTTON_MODE_HELP         0
#define OPTIONS_BUTTON_MODE_LR           1
#define OPTIONS_BUTTON_MODE_L_EQUALS_A   2

#define OPTIONS_TEXT_SPEED_SLOW  0
#define OPTIONS_TEXT_SPEED_MID   1
#define OPTIONS_TEXT_SPEED_FAST  2

#define OPTIONS_SOUND_MONO    0
#define OPTIONS_SOUND_STEREO  1

#define OPTIONS_BATTLE_STYLE_SHIFT  0
#define OPTIONS_BATTLE_STYLE_SET    1

#define DIR_NONE        0
#define DIR_SOUTH       1
#define DIR_NORTH       2
#define DIR_WEST        3
#define DIR_EAST        4
#define DIR_SOUTHWEST   5
#define DIR_SOUTHEAST   6
#define DIR_NORTHWEST   7
#define DIR_NORTHEAST   8

#define CONNECTION_INVALID -1
#define CONNECTION_NONE     0
#define CONNECTION_SOUTH    1
#define CONNECTION_NORTH    2
#define CONNECTION_WEST     3
#define CONNECTION_EAST     4
#define CONNECTION_DIVE     5
#define CONNECTION_EMERGE   6

#endif //GUARD_CONSTANTS_GLOBAL_H
