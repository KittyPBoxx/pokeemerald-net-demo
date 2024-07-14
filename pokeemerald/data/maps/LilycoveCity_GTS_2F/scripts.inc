LilycoveCity_GTS_2F_MapScripts::
	.byte 0

LilycoveCity_GTS_F2_EventScript_UnionLady::
	lock
	faceplayer
	msgbox LilycoveCity_GTS_F2_Text_DoYouWantToRandomTrade, MSGBOX_YESNO
	goto_if_eq VAR_RESULT, NO, LilycoveCity_GTS_F2_EventScript_DeclineTrade
	special ChoosePartyMon
	waitstate
	copyvar VAR_0x8005, VAR_0x8004
	goto_if_eq VAR_0x8005, PARTY_NOTHING_CHOSEN, LilycoveCity_GTS_F2_EventScript_DeclineTrade
	specialvar VAR_RESULT, ScriptGetPartyMonSpecies
	copyvar VAR_0x8009, VAR_RESULT
	bufferspeciesname STR_VAR_1, VAR_0x8009
	message LilycoveCity_GTS_F2_Text_PleaseConfirmTrade
	waitmessage
	multichoicedefault 20, 8, MULTI_YESNO, 1, FALSE
	switch VAR_RESULT
	case 1, LilycoveCity_GTS_F2_EventScript_DeclineTrade
	case 0, LilycoveCity_GTS_F2_EventScript_Trade
	case MULTI_B_PRESSED, LilycoveCity_GTS_F2_EventScript_DeclineTrade
	end

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
	waitstate
	frontier_restorehelditems
	special HealPlayerParty
	closemessage
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

LilycoveCity_GTS_F2_EventScript_Trade::
	message LilycoveCity_GTS_F2_Text_TradePleaseWait
	setvar VAR_0x8004, NET_CONN_TRADE_FUNC
	special CallNetworkFunction
	waitstate
	goto_if_eq VAR_0x8003, 0, LilycoveCity_GTS_F2_EventScript_ConnectionEnded
	goto_if_eq VAR_0x8003, 1, LilycoveCity_GTS_F2_EventScript_NoPartner
	special DoInGameTradeScene
	waitstate
	release
	end

LilycoveCity_GTS_F2_EventScript_TradeRetry::
	setvar VAR_0x8004, NET_CONN_RETRY_TRADE_FUNC
	special CallNetworkFunction
	waitstate
	goto_if_eq VAR_0x8003, 0, LilycoveCity_GTS_F2_EventScript_ConnectionEnded
	goto_if_eq VAR_0x8003, 1, LilycoveCity_GTS_F2_EventScript_NoPartner
	special DoInGameTradeScene
	waitstate
	release
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

LilycoveCity_GTS_F2_EventScript_MailMan::
	lock
	faceplayer
	message LilycoveCity_GTS_F2_Text_MailMan
	waitmessage
	multichoicedefault 20, 8, MULTI_NET_MAIL, 2, FALSE
	switch VAR_RESULT
	case 0, LilycoveCity_GTS_F2_EventScript_PostMail
	case 1, LilycoveCity_GTS_F2_EventScript_ReadMail
	case 2, LilycoveCity_GTS_F2_EventScript_CloseMail
	case MULTI_B_PRESSED, LilycoveCity_GTS_F2_EventScript_CloseMail
	end

LilycoveCity_GTS_F2_EventScript_PostMail::
	message LilycoveCity_GTS_F2_Text_SelectMailMon
	waitbuttonpress
	special ChoosePartyMon
	waitstate
	copyvar VAR_0x8005, VAR_0x8004
	goto_if_eq VAR_0x8005, PARTY_NOTHING_CHOSEN, LilycoveCity_GTS_F2_EventScript_CloseMail
	setvar VAR_0x8004, NET_CONN_POST_MAIL
	special CallNetworkFunction
	waitstate
	goto_if_eq VAR_0x8003, 0, LilycoveCity_GTS_F2_EventScript_ConnectionEnded
	goto_if_eq VAR_0x8003, 1, LilycoveCity_GTS_F2_EventScript_MonHadNoMail
	message LilycoveCity_GTS_F2_Text_MailSent
	waitmessage
	waitbuttonpress
	releaseall
	end

LilycoveCity_GTS_F2_EventScript_ReadMail::
	setvar VAR_0x8004, NET_CONN_READ_MAIL
	special CallNetworkFunction
	waitstate
	goto_if_eq VAR_0x8003, 0, LilycoveCity_GTS_F2_EventScript_ConnectionEnded
	goto_if_eq VAR_0x8003, 1, LilycoveCity_GTS_F2_EventScript_NoMailFound
	releaseall
	end

LilycoveCity_GTS_F2_EventScript_CloseMail::
	closemessage
	releaseall
	end

LilycoveCity_GTS_F2_EventScript_NetEgg_No_Special_Move::
	closemessage
	releaseall
	end

LilycoveCity_GTS_F2_EventScript_DeclineTrade::
	closemessage
	releaseall
	end

LilycoveCity_GTS_F2_EventScript_NoPartner::
	msgbox LilycoveCity_GTS_F2_Text_NoPartner, MSGBOX_YESNO
	goto_if_eq VAR_RESULT, YES, LilycoveCity_GTS_F2_EventScript_TradeRetry
	closemessage
	end

LilycoveCity_GTS_F2_EventScript_ConnectionEnded::
	msgbox LilycoveCity_GTS_F2_Text_ConnectionEnded, MSGBOX_NPC
	end

LilycoveCity_GTS_F2_Text_ConnectionEnded::
	.string "{COLOR LIGHT_RED}{SHADOW LIGHT_RED}CHECK CONNECTION.$"

LilycoveCity_GTS_F2_EventScript_AlreadyObtained::
	msgbox LilycoveCity_GTS_F2_Text_AlreadyObtained, MSGBOX_NPC
	end

LilycoveCity_GTS_F2_EventScript_NoRoomForEgg::
	msgbox LilycoveCity_GTS_F2_Text_NoRoomForThisEgg, MSGBOX_DEFAULT
	release
	end

LilycoveCity_GTS_F2_EventScript_MonHadNoMail::
	msgbox LilycoveCity_GTS_F2_Text_MonHadNoMail, MSGBOX_DEFAULT
	release
	end

LilycoveCity_GTS_F2_EventScript_NoMailFound::
	msgbox LilycoveCity_GTS_F2_Text_NoMailFound, MSGBOX_DEFAULT
	release
	end

LilycoveCity_GTS_F2_Text_NotAvailable::
	.string "This feature is not yet available.$"

LilycoveCity_GTS_F2_Text_TradePleaseWait::
	.string "Preparing trade...$"

LilycoveCity_GTS_F2_Text_DoYouWantToRandomTrade::
	.string "Do you want to randomly trade with\n"
	.string "another player on this server?$"

LilycoveCity_GTS_F2_Text_PleaseConfirmTrade::
	.string "So you want to trade {STR_VAR_1}?\n"
	.string "YOU WON'T BE ABLE TO CANCEL THIS!$"

LilycoveCity_GTS_F2_Text_NoPartner::
	.string "No trade partner found.\n"
	.string "Do you want to search again?$"

LilycoveCity_GTS_F2_Text_TakeGoodCareOfEgg::
	.string "Take good care of the EGG.$"

LilycoveCity_GTS_F2_Text_AlreadyObtained::
	.string "It seems you have already obtained\n"
	.string "this gift egg before.$"

LilycoveCity_GTS_F2_Text_NoRoomForThisEgg::
	.string "Oh? You've too many POKéMON.\n"
	.string "There's no room for this EGG…$"

LilycoveCity_GTS_F2_Text_StartDownloadEgg::
	.string "Do you want to download a gift\n"
	.string "egg?$"

LilycoveCity_GTS_F2_Text_StartDownloadBattle::
	.string "Do you want to start the download\n"
	.string "battle?$"

LilycoveCity_GTS_F2_Text_MailMan::	
	.string "Welcome to the mail service!\p"
	.string "How may I serve you?$"

LilycoveCity_GTS_F2_Text_SelectMailMon::
	.string "Please select a POKéMON whose mail\n"
	.string "you wish to send.$"

LilycoveCity_GTS_F2_Text_MailSent::
	.string "Your mail has been sent!\p"
	.string "Thank you for using the mail service.\n"
	.string "We hope to see you again soon.$"

LilycoveCity_GTS_F2_Text_MonHadNoMail::
    .string "Oh… I'm sorry…\p"
	.string "That POKéMON doesn't appear to be\n" 
	.string "holding any mail...$"

LilycoveCity_GTS_F2_Text_NoMailFound::
	.string "No new mail was found.$"

LilycoveCity_GTS_F2_Text_StartDownloadMart::
	.string "Do you want to start the online mart?$"

LilycoveCity_GTS_F2_EventScript_DontConnect::
	release
	end
