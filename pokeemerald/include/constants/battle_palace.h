#ifndef GUARD_CONSTANTS_BATTLE_PALACE_H
#define GUARD_CONSTANTS_BATTLE_PALACE_H

#define BATTLE_PALACE_FUNC_INIT                 0
#define BATTLE_PALACE_FUNC_GET_DATA             1
#define BATTLE_PALACE_FUNC_SET_DATA             2
#define BATTLE_PALACE_FUNC_GET_COMMENT_ID       3
#define BATTLE_PALACE_FUNC_SET_OPPONENT         4
#define BATTLE_PALACE_FUNC_GET_OPPONENT_INTRO   5
#define BATTLE_PALACE_FUNC_INCREMENT_STREAK     6
#define BATTLE_PALACE_FUNC_SAVE                 7
#define BATTLE_PALACE_FUNC_SET_PRIZE            8
#define BATTLE_PALACE_FUNC_GIVE_PRIZE           9

#define PALACE_DATA_PRIZE               0
#define PALACE_DATA_WIN_STREAK          1
#define PALACE_DATA_WIN_STREAK_ACTIVE   2

// Pokemon in Battle Palace have a move "group" type preference depending on nature
#define PALACE_MOVE_GROUP_ATTACK  0
#define PALACE_MOVE_GROUP_DEFENSE 1
#define PALACE_MOVE_GROUP_SUPPORT 2

// In palace doubles battles pokemon have a target preference depending on nature
#define PALACE_TARGET_STRONGER 0
#define PALACE_TARGET_WEAKER   1
#define PALACE_TARGET_RANDOM   2

#endif //GUARD_CONSTANTS_BATTLE_PALACE_H
