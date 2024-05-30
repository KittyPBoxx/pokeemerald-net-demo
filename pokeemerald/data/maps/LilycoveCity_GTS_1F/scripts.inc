LilycoveCity_GTS_1F_MapScripts::
	.byte 0

LilycoveCity_GTS_F1_EventScript_ScammedGuy::
	msgbox LilycoveCity_GTS_F1_Text_ITradedMyShiny, MSGBOX_NPC
	end

LilycoveCity_GTS_F1_EventScript_ScienceGuy::
	msgbox LilycoveCity_GTS_F1_Text_TheUnderSeaCables, MSGBOX_NPC
	end

LilycoveCity_GTS_F1_EventScript_SmallWorldGran::
	msgbox LilycoveCity_GTS_F1_Text_ItsSoEasyToConnect, MSGBOX_NPC
	end

LilycoveCity_GTS_F1_EventScript_MailGirl::
	lock
	faceplayer
	goto_if_eq VAR_TEMP_1, 1, LilycoveCity_GTS_F1_MailGirlItemGiven
	msgbox LilycoveCity_GTS_F1_Text_WhenMyFriendMoved, MSGBOX_DEFAULT
	random 12
	addvar VAR_RESULT, FIRST_MAIL_INDEX
	giveitem VAR_RESULT
	goto_if_eq VAR_RESULT, FALSE, Common_EventScript_ShowBagIsFull
	setvar VAR_TEMP_1, 1
	msgbox LilycoveCity_GTS_F1_Text_YouCanHaveThis, MSGBOX_DEFAULT
	release
	end

LilycoveCity_GTS_F1_MailGirlItemGiven::
	msgbox LilycoveCity_GTS_F1_Text_YouCanHaveThis, MSGBOX_DEFAULT
	release
	end

LilycoveCity_GTS_F1_EventScript_Receptionist::
	lock
	faceplayer
	msgbox LilycoveCity_GTS_F1_Text_Info, MSGBOX_NPC
	releaseall
	end
	
LilycoveCity_GTS_F1_EventScript_DeskMonitor::
	message LilycoveCity_GTS_F1_EventScript_ShouldStartConnection
	waitmessage
	multichoicedefault 20, 8, MULTI_YESNO, 1, FALSE
	switch VAR_RESULT
	case 1, LilycoveCity_GTS_F1_EventScript_DontDisplayConnectionStatus
	case 0, LilycoveCity_GTS_F1_EventScript_TryDisplayConnectionStatus
	case MULTI_B_PRESSED, LilycoveCity_GTS_F1_EventScript_DontDisplayConnectionStatus

LilycoveCity_GTS_F1_EventScript_ProfileGuy::
	lock
	faceplayer
	msgbox ProfileMan_Text_OnlineSafety, MSGBOX_DEFAULT
	goto_if_set FLAG_SYS_CHAT_USED, ProfileMan_EventScript_AskToSeeNewProfile
	goto ProfileMan_EventScript_AskToSeeProfile
	end

LilycoveCity_GTS_F1_EventScript_ResultScreen::
	msgbox LilycoveCity_GTS_F1_Text_Version, MSGBOX_NPC
	releaseall
	end

LilycoveCity_GTS_F1_EventScript_DontDisplayConnectionStatus::
	release
	end

@special CallNetworkFunction
LilycoveCity_GTS_F1_EventScript_TryDisplayConnectionStatus::
	message LilycoveCity_GTS_F1_PleaseWaitForLink
	waitmessage
	setvar VAR_0x8004, NET_CONN_START_LINK_FUNC
	special CallNetworkFunction
	waitstate
	call LilycoveCity_GTS_F1_EventScript_GetConnectionStatusText
	lock
	message LilycoveCity_GTS_F1_EventScript_ConnectionStatusMessage
	waitmessage
	goto_if_eq VAR_0x8003, 2, LilycoveCity_GTS_F1_EventScript_ServerWelcome
	waitbuttonpress
	closemessage
	release
	end

LilycoveCity_GTS_F1_EventScript_ConnectionStatusMessage::
	.string "Connection Status: \n{STR_VAR_2}$"


LilycoveCity_GTS_F1_EventScript_ServerWelcome::
	waitmessage
	waitbuttonpress
	msgbox gStringVar3, MSGBOX_DEFAULT
	waitmessage
	closemessage
	release
	end

LilycoveCity_GTS_F1_EventScript_GetConnectionStatusText::
	goto_if_eq VAR_0x8003, 1, LilycoveCity_GTS_F1_EventScript_SetConnectionStatusLocal
	goto_if_eq VAR_0x8003, 2, LilycoveCity_GTS_F1_EventScript_SetConnectionStatusOnline
	bufferstring STR_VAR_2, LilycoveCity_GTS_F1_EventScript_Text_ConnectinoFailed
	return

LilycoveCity_GTS_F1_EventScript_SetConnectionStatusLocal::
	bufferstring STR_VAR_2, LilycoveCity_GTS_F1_EventScript_Text_ConnectionLocal
	return

LilycoveCity_GTS_F1_EventScript_SetConnectionStatusOnline::
	bufferstring STR_VAR_2, LilycoveCity_GTS_F1_EventScript_Text_ConnectionOnline
	return

LilycoveCity_GTS_F1_EventScript_ShouldStartConnection::
	.string "Start Pokecom channel connection?$"

LilycoveCity_GTS_F1_Text_ITradedMyShiny::
	.string "I traded my shiny KADABRA to\n"
	.string "a cute girl I met online.\p"
	.string "Her phone must have broken because\n"
	.string "she's not returning my calls…$"

LilycoveCity_GTS_F1_Text_TheUnderSeaCables::
	.string "The under-sea network cables go\n"
	.string "all the way to GOLDENROD.\p"
	.string "Special ships called cable-layers\n"
	.string "sink them to the ocean floor.$"

LilycoveCity_GTS_F1_Text_ItsSoEasyToConnect::
	.string "Connecting to others has become\p"
	.string "so simple.\p"
	.string "Is it my age or does the world feel\n"
	.string "smaller now?$"

LilycoveCity_GTS_F1_Text_WhenMyFriendMoved::
	.string "When my friend moved to KANTO I thought\n"
	.string "we wouldn't be able to talk anymore.\p"
	.string "Thanks to the INTERNET we can \n"
	.string "send messages every day!\p"
	.string "You can have this.$"

LilycoveCity_GTS_F1_Text_YouCanHaveThis::
	.string "By sending mail maybe you can make\n"
	.string "friends too.$"

LilycoveCity_GTS_F1_PleaseWaitForLink::
	.string "Please wait.\n"
	.string "… … Hold B Button: Cancel$"

LilycoveCity_GTS_F1_EventScript_Text_ConnectinoFailed:
	.string "{COLOR RED}{SHADOW LIGHT_RED}FAILED$"

LilycoveCity_GTS_F1_EventScript_Text_ConnectionLocal:
	.string "{COLOR BLUE}{SHADOW LIGHT_BLUE}PLUGGED IN - NO INTERNET$"

LilycoveCity_GTS_F1_EventScript_Text_ConnectionOnline:
	.string "{COLOR GREEN}{SHADOW LIGHT_GREEN}ONLINE$"

LilycoveCity_GTS_F1_Text_Version::
	.string "Emerald Net Demo 0.1.2$"

LilycoveCity_GTS_F1_Text_Info::
	.string "Welcome to LILYCOVE NETWORK CENTER!\n"
	.string "You can get connected with the\l"
	.string "terminal on the left.\p" 
	.string "Through the door behind me you can find\n"
	.string "network demos to try when connected.$"

ProfileMan_Text_OnlineSafety::
	.string "Did you know that your profile can\n"
	.string "help you stay safe while online?\p"
	.string "If a trainers profile starts with\n"
	.string "{COLOR BLUE}{SHADOW LIGHT_BLUE}FRIEND LINK {COLOR DARK_GRAY}{SHADOW LIGHT_GRAY}then they'll only link\l"
	.string "to players with a matching profile.\p"
	.string "Actually, my hobby is collecting the\n"
	.string "profiles of POKéMON TRAINERS.$"



