LilycoveCity_GTS_2F_MapScripts::
	.byte 0

LilycoveCity_GTS_F2_EventScript_UnionLady::
	msgbox LilycoveCity_GTS_F2_Text_NotAvailable, MSGBOX_NPC
	end

LilycoveCity_GTS_F2_Text_NotAvailable::
	.string "This feature is not yet available.$"

LilycoveCity_GTS_F2_EventScript_Trainer::
	lock
	faceplayer
	message LilycoveCity_GTS_F2_Text_StartDownloadBattle
	waitmessage
	multichoicedefault 20, 8, MULTI_YESNO, 1, FALSE
	switch VAR_RESULT
	case 1, LilycoveCity_GTS_F2_EventScript_DontConnect
	case 0, LilycoveCity_GTS_F2_EventScript_NetTrainer
	case MULTI_B_PRESSED, LilycoveCity_GTS_F2_EventScript_DontConnect
	end

LilycoveCity_GTS_F2_EventScript_NetTrainer::
	setvar VAR_0x8004, NET_CONN_START_BATTLE_FUNC
	special CallNetworkFunction
	waitstate
	goto_if_eq VAR_0x8003, 0, LilycoveCity_GTS_F2_EventScript_ConnectionEnded
	setvar VAR_0x8004, SPECIAL_BATTLE_EREADER
	setvar VAR_0x8005, 0
	special DoSpecialTrainerBattle
	closemessage
	special HealPlayerParty
	releaseall
	end

LilycoveCity_GTS_F2_EventScript_MartClerk::
	lock
	faceplayer
	message LilycoveCity_GTS_F2_Text_StartDownloadMart
	waitmessage
	multichoicedefault 20, 8, MULTI_YESNO, 1, FALSE
	switch VAR_RESULT
	case 1, LilycoveCity_GTS_F2_EventScript_DontConnect
	case 0, LilycoveCity_GTS_F2_EventScript_NetShop
	case MULTI_B_PRESSED, LilycoveCity_GTS_F2_EventScript_DontConnect
	end

LilycoveCity_GTS_F2_EventScript_NetShop::
	setvar VAR_0x8004, NET_CONN_START_MART_FUNC
	special CallNetworkFunction
	waitstate
	goto_if_eq VAR_0x8003, 0, LilycoveCity_GTS_F2_EventScript_ConnectionEnded
	closemessage
	releaseall
	end

LilycoveCity_GTS_F2_EventScript_OldGuy::
	lock
	faceplayer
	message LilycoveCity_GTS_F2_Text_StartDownloadEgg
	waitmessage
	multichoicedefault 20, 8, MULTI_YESNO, 1, FALSE
	switch VAR_RESULT
	case 1, LilycoveCity_GTS_F2_EventScript_DontConnect
	case 0, LilycoveCity_GTS_F2_EventScript_NetEgg
	case MULTI_B_PRESSED, LilycoveCity_GTS_F2_EventScript_DontConnect
	end

LilycoveCity_GTS_F2_EventScript_NetEgg::
	specialvar VAR_GIFT_PICHU_SLOT, CalculatePlayerPartyCount
	getpartysize
	goto_if_eq VAR_RESULT, PARTY_SIZE, LilycoveCity_GTS_F2_EventScript_NoRoomForEgg
	setvar VAR_0x8004, NET_CONN_START_EGG_FUNC
	special CallNetworkFunction
	waitstate
	goto_if_eq VAR_0x8003, 0, LilycoveCity_GTS_F2_EventScript_ConnectionEnded
	goto_if_eq VAR_0x8003, SPECIES_EGG, LilycoveCity_GTS_F2_EventScript_AlreadyObtained
	playfanfare MUS_OBTAIN_ITEM
	msgbox LilycoveCity_GTS_F2_Text_TakeGoodCareOfEgg, MSGBOX_DEFAULT
	waitfanfare
	giveegg VAR_0x8003
	setmonmetlocation VAR_GIFT_PICHU_SLOT, METLOC_FATEFUL_ENCOUNTER
	goto_if_eq VAR_0x8005, MOVE_NONE, LilycoveCity_GTS_F2_EventScript_NetEgg_No_Special_Move
	setmonmove VAR_GIFT_PICHU_SLOT, 3, VAR_0x8005
	closemessage
	releaseall
	end

LilycoveCity_GTS_F2_EventScript_NetEgg_No_Special_Move::
	closemessage
	releaseall
	end

LilycoveCity_GTS_F2_EventScript_ConnectionEnded::
	msgbox LilycoveCity_GTS_F2_Text_ConnectionEnded, MSGBOX_NPC
	end

LilycoveCity_GTS_F2_Text_ConnectionEnded::
	.string "{COLOR LIGHT_RED}{SHADOW LIGHT_RED}CHECK CONNECTION.$"

LilycoveCity_GTS_F2_EventScript_AlreadyObtained::
	msgbox LilycoveCity_GTS_F2_Text_AlreadyObtained, MSGBOX_NPC
	end

LilycoveCity_GTS_F2_Text_TakeGoodCareOfEgg::
	.string "Take good care of the EGG.$"

LilycoveCity_GTS_F2_Text_AlreadyObtained::
	.string "It seems you have already obtained\n"
	.string "this gift egg before.$"

LilycoveCity_GTS_F2_EventScript_NoRoomForEgg::
	msgbox LilycoveCity_GTS_F2_Text_NoRoomForThisEgg, MSGBOX_DEFAULT
	release
	end

LilycoveCity_GTS_F2_Text_NoRoomForThisEgg:
	.string "Oh? You've too many POKéMON.\n"
	.string "There's no room for this EGG…$"

LilycoveCity_GTS_F2_Text_StartDownloadEgg::
	.string "Do you want to download a gift\n"
	.string "egg?$"

LilycoveCity_GTS_F2_Text_StartDownloadBattle::
	.string "Do you want to start the download\n"
	.string "battle?$"

LilycoveCity_GTS_F2_Text_StartDownloadMart::
	.string "Do you want to start the online mart?$"

LilycoveCity_GTS_F2_EventScript_DontConnect::
	release
	end