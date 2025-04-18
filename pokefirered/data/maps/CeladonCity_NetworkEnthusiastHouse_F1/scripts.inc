CeladonCity_NetworkEnthusiastHouse_F1_MapScripts::
	.byte 0

CeladonCity_NetworkEnthusiastHouse_F1_EventScript_Receptionist::
	lockall
	textcolor NPC_TEXT_COLOR_FEMALE
	faceplayer
	msgbox CeladonCity_NetworkEnthusiastHouse_F1_Text_Info, MSGBOX_NPC
	releaseall
	end

CeladonCity_NetworkEnthusiastHouse_F1_EventScript_YoungGirl::
	lockall
	textcolor NPC_TEXT_COLOR_FEMALE
	faceplayer
	msgbox CeladonCity_NetworkEnthusiastHouse_F1_Text_PlaceHolder, MSGBOX_NPC
	releaseall
	end

CeladonCity_NetworkEnthusiastHouse_F1_EventScript_Scientist::
	lockall
	textcolor NPC_TEXT_COLOR_MALE
	faceplayer
	msgbox CeladonCity_NetworkEnthusiastHouse_F1_Text_PlaceHolder, MSGBOX_NPC
	releaseall
	end

CeladonCity_NetworkEnthusiastHouse_F1_EventScript_ProfileMan::
	lockall
	textcolor NPC_TEXT_COLOR_MALE
	faceplayer
	msgbox CeladonCity_NetworkEnthusiastHouse_F1_Text_PlaceHolder, MSGBOX_NPC
	releaseall
	end

CeladonCity_NetworkEnthusiastHouse_F1_EventScript_DeskMonitor::
	msgbox CeladonCity_NetworkEnthusiastHouse_F1_Text_ShouldStartConnection, MSGBOX_YESNO
	goto_if_eq VAR_RESULT, YES, CeladonCity_NetworkEnthusiastHouse_F1_EventScript_TryDisplayConnectionStatus
	goto CeladonCity_NetworkEnthusiastHouse_F1_EventScript_DontDisplayConnectionStatus


CeladonCity_NetworkEnthusiastHouse_F1_EventScript_DontDisplayConnectionStatus::
	release
	end

CeladonCity_NetworkEnthusiastHouse_F1_EventScript_TryDisplayConnectionStatus::
	message CeladonCity_NetworkEnthusiastHouse_F1_Text_PleaseWaitForLink
	waitmessage
	setvar VAR_0x8004, NET_CONN_START_LINK_FUNC
	special CallNetworkFunction
	waitstate
	call CeladonCity_NetworkEnthusiastHouse_F1_EventScript_GetConnectionStatusText
	lock
	message CeladonCity_NetworkEnthusiastHouse_F1_EventScript_ConnectionStatusMessage
	waitmessage
	goto_if_eq VAR_0x8003, 2, CeladonCity_NetworkEnthusiastHouse_F1_EventScript_ServerWelcome
	waitbuttonpress
	closemessage
	release
	end

CeladonCity_NetworkEnthusiastHouse_F1_EventScript_GetConnectionStatusText::
	goto_if_eq VAR_0x8003, 1, CeladonCity_NetworkEnthusiastHouse_F1_EventScript_SetConnectionStatusLocal
	goto_if_eq VAR_0x8003, 2, CeladonCity_NetworkEnthusiastHouse_F1_EventScript_SetConnectionStatusOnline
	bufferstring STR_VAR_2, CeladonCity_NetworkEnthusiastHouse_F1_Text_ConnectionFailed
	return

CeladonCity_NetworkEnthusiastHouse_F1_EventScript_ConnectionStatusMessage::
	.string "Connection Status: \n{STR_VAR_2}$"


CeladonCity_NetworkEnthusiastHouse_F1_EventScript_ServerWelcome::
	waitmessage
	waitbuttonpress
	msgbox gStringVar4, MSGBOX_DEFAULT
	waitmessage
	closemessage
	release
	end

CeladonCity_NetworkEnthusiastHouse_F1_EventScript_SetConnectionStatusLocal::
	bufferstring STR_VAR_2, CeladonCity_NetworkEnthusiastHouse_F1_Text_ConnectionLocal
	return

CeladonCity_NetworkEnthusiastHouse_F1_EventScript_SetConnectionStatusOnline::
	bufferstring STR_VAR_2, CeladonCity_NetworkEnthusiastHouse_F1_Text_ConnectionOnline
	return

