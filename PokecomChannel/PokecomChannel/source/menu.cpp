/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * menu.cpp
 * Menu flow routines - handles all menu logic
 ***************************************************************************/

#include <gccore.h>
#include <ogcsys.h>
#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <wiiuse/wpad.h>
#include <string.h>
#include <string>

#include "libwiigui/gui.h"
#include "menu.h"
#include "main.h"
#include "input.h"
#include "gettext.h"

extern "C" {
	#include "linkcableclient.h"
	#include "uilogger.h"
}

#define THREAD_SLEEP 10000

static GuiImageData * pointer[4];
static GuiImage * bgImg = nullptr;
static GuiSound * bgMusic = nullptr;
static GuiWindow * mainWindow = nullptr;
static lwp_t guithread = LWP_THREAD_NULL;
static bool guiHalt = true;

char ipv4[32] = "127.0.0.1:9000";
char serverName[32] = "\0";
bool serverSet = false;

bool isPlayerConnected[4] = {false, false, false, false};
bool isPlayerNamed[4] = {false, false, false, false};

/****************************************************************************
 * ResumeGui
 *
 * Signals the GUI thread to start, and resumes the thread. This is called
 * after finishing the removal/insertion of new elements, and after initial
 * GUI setup.
 ***************************************************************************/
static void ResumeGui()
{
	guiHalt = false;
	LWP_ResumeThread (guithread);
}

/****************************************************************************
 * HaltGui
 *
 * Signals the GUI thread to stop, and waits for GUI thread to stop
 * This is necessary whenever removing/inserting new elements into the GUI.
 * This eliminates the possibility that the GUI is in the middle of accessing
 * an element that is being changed.
 ***************************************************************************/
static void HaltGui()
{
	guiHalt = true;

	// wait for thread to finish
	while(!LWP_ThreadIsSuspended(guithread))
		usleep(THREAD_SLEEP);
}

static const char * resolveNetworkMessage(u8 state)
{
	switch(state)
	{
		case CONNECTION_SUCCESS: 
		{
			int bufferSize = strlen(gettext("networkTest.CONNECTION_SUCCESS")) + strlen(getServerName()) + 1;
			char* concatString = new char[ bufferSize ];
			strcpy( concatString, gettext("networkTest.CONNECTION_SUCCESS") );
			strcat( concatString, getServerName());
			return concatString;
		}
		break;
		case CONNECTION_ERROR_INVALID_IP: 
			return gettext("networkTest.CONNECTION_ERROR_INVALID_IP");
		break;
		case CONNECTION_ERROR_COULD_NOT_RESOLVE_IPV4:
			return gettext("networkTest.CONNECTION_ERROR_COULD_NOT_RESOLVE_IPV4");
		break;
		case CONNECTION_ERROR_NO_NETWORK_DEVICE: 
			return gettext("networkTest.CONNECTION_ERROR_NO_NETWORK_DEVICE");
		break;
		case CONNECTION_ERROR_CONNECTION_FAILED: 
			return gettext("networkTest.CONNECTION_ERROR_CONNECTION_FAILED");
		break;
		case CONNECTION_ERROR_INVALID_RESPONSE: 
			return gettext("networkTest.CONNECTION_ERROR_INVALID_RESPONSE");
		break;
		case CONNECTION_STARTING: 
			return gettext("networkTest.CONNECTION_STARTING");
		case CONNECTION_INIT:	
		default:
			return gettext("networkTest.CONNECTION_INIT");
	}
}

/****************************************************************************
 * NetworkTestPopup
 *
 * Displays a window to the user while trying to connect to the network
 ***************************************************************************/
int NetworkTestPopup(const char *title, const char *msg, const char *btn1Label, GuiSound* bgMusic)
{
	int choice = -1;

	if (bgMusic->GetVolume() != 0)
	{
		bgMusic->SetVolume(15);
	}

	GuiWindow promptWindow(448,288);
	promptWindow.SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	promptWindow.SetPosition(0, -10);
	GuiSound btnSoundOver(button_over_pcm, button_over_pcm_size, SOUND::PCM);
	btnSoundOver.SetVolume(20);
	GuiImageData btnOutline(button_png);
	GuiImageData btnOutlineOver(button_over_png);
	GuiTrigger trigA;
	trigA.SetSimpleTrigger(-1, WPAD_BUTTON_A | WPAD_CLASSIC_BUTTON_A, PAD_BUTTON_A);

	GuiImageData dialogBox(dialogue_box_png);
	GuiImage dialogBoxImg(&dialogBox);

	GuiText titleTxt(title, 26, (GXColor){0, 0, 0, 255});
	titleTxt.SetAlignment(ALIGN_H::CENTRE, ALIGN_V::TOP);
	titleTxt.SetPosition(0,40);
	GuiText msgTxt(msg, 22, (GXColor){0, 0, 0, 255});
	msgTxt.SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	msgTxt.SetPosition(0,-20);
	msgTxt.SetWrap(true, 400);

	GuiText infoTxt(msg, 14, (GXColor){137, 207, 240, 255});
	infoTxt.SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	infoTxt.SetPosition(0,35);
	infoTxt.SetWrap(true, 400);
	infoTxt.SetVisible(false);
	infoTxt.SetText(gettext("networkTest.connectionOverrideNotification"));

	GuiText btn1Txt(btn1Label, 22, (GXColor){0, 0, 0, 255});
	GuiImage btn1Img(&btnOutline);
	GuiImage btn1ImgOver(&btnOutlineOver);
	GuiButton btn1(btnOutline.GetWidth(), btnOutline.GetHeight());

	GuiLoader loader;
	loader.SetPosition(20, -40);
	loader.SetAlignment(ALIGN_H::CENTRE, ALIGN_V::BOTTOM);

	btn1.SetAlignment(ALIGN_H::CENTRE, ALIGN_V::BOTTOM);
	btn1.SetPosition(0, -25);

	btn1.SetLabel(&btn1Txt);
	btn1.SetImage(&btn1Img);
	btn1.SetImageOver(&btn1ImgOver);
	btn1.SetSoundOver(&btnSoundOver);
	btn1.SetTrigger(&trigA);
	btn1.SetState(STATE::SELECTED);
	btn1.SetEffectGrow();

	promptWindow.Append(&dialogBoxImg);
	promptWindow.Append(&titleTxt);
	promptWindow.Append(&msgTxt);
	promptWindow.Append(&infoTxt);
	promptWindow.Append(&loader);
	promptWindow.Append(&btn1);

	promptWindow.SetEffect(EFFECT::SLIDE_TOP | EFFECT::SLIDE_IN, 40);
	HaltGui();
	mainWindow->SetState(STATE::DISABLED);
	mainWindow->Append(&promptWindow);
	mainWindow->ChangeFocus(&promptWindow);
	ResumeGui();

	u32 connectionTestResult = testTCPConnection(ipv4);

	GuiSound connectingSound(connecting_pcm, connecting_pcm_size, SOUND::PCM);
	connectingSound.Play();

	u32 isStarting = 1;
	u8 connectionRetries = 0;

	// Make sure a minimum amount of refreshes has always happened before we display a result
	int updatesBeforeResult = 0;

	while(choice == -1)
	{
		usleep(THREAD_SLEEP);
		bgMusic->Loop();

		if (isStarting)
		{
			connectingSound.Loop();
		}

		if(btn1.GetState() == STATE::CLICKED)
		{
			choice = 1;
		}
		else if (updatesBeforeResult > 300)
		{

			if ((connectionTestResult >= CONNECTION_ERROR_INVALID_RESPONSE) && connectionRetries < 10)
			{
				updatesBeforeResult = 0;
				isStarting = 1;
				connectionRetries++;
				connectionTestResult = testTCPConnection(ipv4);
			} 
			else
			{
				if (connectionTestResult == CONNECTION_SUCCESS)
				{
					GuiSound connectingSuccessSound(success_pcm, success_pcm_size, SOUND::PCM);
					connectingSuccessSound.SetVolume(20);
					connectingSuccessSound.Play();
					infoTxt.SetVisible(true);
					setOverrideAddress(ipv4);
				}
				else
				{
					GuiSound connectingErrorSound(fail_pcm, fail_pcm_size, SOUND::PCM);
					connectingErrorSound.SetVolume(20);
					connectingErrorSound.Play();
				}

				isStarting = 0;
				connectingSound.Stop();
				loader.SetVisible(false);
				msgTxt.SetText(resolveNetworkMessage(connectionTestResult));
			} 
		} 
		else 
		{
			updatesBeforeResult++;
		}

	}

	connectingSound.Stop();

	if (bgMusic->GetVolume() != 0)
	{
		bgMusic->SetVolume(50);
	}

	promptWindow.SetEffect(EFFECT::SLIDE_TOP | EFFECT::SLIDE_OUT, 50);
	while(promptWindow.GetEffect() > 0) usleep(THREAD_SLEEP);
	HaltGui();
	mainWindow->Remove(&promptWindow);
	mainWindow->SetState(STATE::DEFAULT);
	ResumeGui();
	return choice;
}

/****************************************************************************
 * WindowPrompt
 *
 * Displays a prompt window to user, with information, an error message, or
 * presenting a user with a choice
 ***************************************************************************/
int WindowPrompt(const char *title, const char *msg, const char *btn1Label, const char *btn2Label, GuiSound* bgMusic)
{
	int choice = -1;

	if (bgMusic->GetVolume() != 0)
	{
		bgMusic->SetVolume(15);
	}

	GuiWindow promptWindow(448,288);
	promptWindow.SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	promptWindow.SetPosition(0, -10);
	GuiSound btnSoundOver(button_over_pcm, button_over_pcm_size, SOUND::PCM);
	btnSoundOver.SetVolume(20);
	GuiImageData btnOutline(button_png);
	GuiImageData btnOutlineOver(button_over_png);
	GuiTrigger trigA;
	trigA.SetSimpleTrigger(-1, WPAD_BUTTON_A | WPAD_CLASSIC_BUTTON_A, PAD_BUTTON_A);

	GuiSound btnClick(swish_pcm, swish_pcm_size, SOUND::PCM);
	btnClick.SetVolume(40);

	GuiImageData dialogBox(dialogue_box_png);
	GuiImage dialogBoxImg(&dialogBox);

	GuiText titleTxt(title, 26, (GXColor){0, 0, 0, 255});
	titleTxt.SetAlignment(ALIGN_H::CENTRE, ALIGN_V::TOP);
	titleTxt.SetPosition(0,40);
	GuiText msgTxt(msg, 22, (GXColor){0, 0, 0, 255});
	msgTxt.SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	msgTxt.SetPosition(0,-20);
	msgTxt.SetWrap(true, 400);

	GuiText btn1Txt(btn1Label, 22, (GXColor){0, 0, 0, 255});
	GuiImage btn1Img(&btnOutline);
	GuiImage btn1ImgOver(&btnOutlineOver);
	GuiButton btn1(btnOutline.GetWidth(), btnOutline.GetHeight());

	if(btn2Label)
	{
		btn1.SetAlignment(ALIGN_H::LEFT, ALIGN_V::BOTTOM);
		btn1.SetPosition(20, -25);
	}
	else
	{
		btn1.SetAlignment(ALIGN_H::CENTRE, ALIGN_V::BOTTOM);
		btn1.SetPosition(0, -25);
	}

	btn1.SetLabel(&btn1Txt);
	btn1.SetImage(&btn1Img);
	btn1.SetImageOver(&btn1ImgOver);
	btn1.SetSoundOver(&btnSoundOver);
	btn1.SetTrigger(&trigA);
	btn1.SetState(STATE::SELECTED);
	btn1.SetEffectGrow();

	GuiText btn2Txt(btn2Label, 22, (GXColor){0, 0, 0, 255});
	GuiImage btn2Img(&btnOutline);
	GuiImage btn2ImgOver(&btnOutlineOver);
	GuiButton btn2(btnOutline.GetWidth(), btnOutline.GetHeight());
	btn2.SetAlignment(ALIGN_H::RIGHT, ALIGN_V::BOTTOM);
	btn2.SetPosition(-20, -25);
	btn2.SetLabel(&btn2Txt);
	btn2.SetImage(&btn2Img);
	btn2.SetImageOver(&btn2ImgOver);
	btn2.SetSoundOver(&btnSoundOver);
	btn2.SetSoundClick(&btnClick);
	btn2.SetTrigger(&trigA);
	btn2.SetEffectGrow();

	promptWindow.Append(&dialogBoxImg);
	promptWindow.Append(&titleTxt);
	promptWindow.Append(&msgTxt);
	promptWindow.Append(&btn1);

	if(btn2Label)
		promptWindow.Append(&btn2);

	promptWindow.SetEffect(EFFECT::SLIDE_TOP | EFFECT::SLIDE_IN, 40);
	HaltGui();
	mainWindow->SetState(STATE::DISABLED);
	mainWindow->Append(&promptWindow);
	mainWindow->ChangeFocus(&promptWindow);
	ResumeGui();

	while(choice == -1)
	{
		usleep(THREAD_SLEEP);
		bgMusic->Loop();
		if(btn1.GetState() == STATE::CLICKED)
			choice = 1;
		else if(btn2.GetState() == STATE::CLICKED)
			choice = 0;
	}

	if (bgMusic->GetVolume() != 0)
	{
		bgMusic->SetVolume(50);
	}

	promptWindow.SetEffect(EFFECT::SLIDE_TOP | EFFECT::SLIDE_OUT, 50);
	while(promptWindow.GetEffect() > 0) usleep(THREAD_SLEEP);
	HaltGui();
	mainWindow->Remove(&promptWindow);
	mainWindow->SetState(STATE::DEFAULT);
	ResumeGui();
	return choice;
}

/****************************************************************************
 * UpdateGUI
 *
 * Primary thread to allow GUI to respond to state changes, and draws GUI
 ***************************************************************************/
static void *UpdateGUI (void *arg)
{
	(void)arg;

	int i;

	while(1)
	{
		if(guiHalt)
		{
			LWP_SuspendThread(guithread);
		}
		else
		{
			SetupPads(); // Pads a re-setup each time, because otherwise data gets messed up by disconnect/reconnect cycles 
			UpdatePads();
			mainWindow->Draw();

			#ifdef HW_RVL
			for(i=3; i >= 0; i--) // so that player 1's cursor appears on top!
			{
				if(userInput[i].wpad->ir.valid)
					Menu_DrawImg(userInput[i].wpad->ir.x-48, userInput[i].wpad->ir.y-48,
						96, 96, pointer[i]->GetImage(), userInput[i].wpad->ir.angle, 1, 1, 255);
				DoRumble(i);
			}
			#endif

			Menu_Render();

			for(i=0; i < 4; i++)
				mainWindow->Update(&userInput[i]);

			if(ExitRequested)
			{
				for(i = 0; i <= 255; i += 15)
				{
					mainWindow->Draw();
					Menu_DrawRectangle(0,0,screenwidth,screenheight,(GXColor){0, 0, 0, (u8)i},1);
					Menu_Render();
				}
				ExitApp();
			}
		}
	}
	return nullptr;
}

/****************************************************************************
 * DebugMenu
 ***************************************************************************/
static int DebugMenu(GuiSound* bgMusic)
{
	int menu = MENU_NONE;

	GuiText titleTxt(gettext("debug.title"), 24, (GXColor){255, 255, 255, 255});
	titleTxt.SetAlignment(ALIGN_H::LEFT, ALIGN_V::TOP);
	titleTxt.SetPosition(50,50);
	titleTxt.SetEffect(EFFECT::SLIDE_TOP | EFFECT::SLIDE_IN, 25);

	GuiSound btnSoundOver(button_over_pcm, button_over_pcm_size, SOUND::PCM);
	btnSoundOver.SetVolume(20);
	GuiImageData btnOutline(button_png);
	GuiImageData btnOutlineOver(button_over_png);
	GuiImageData btnLongOutline(button_long_png);
	GuiImageData btnLongOutlineOver(button_long_over_png);

	GuiSound btnClick(swish_pcm, swish_pcm_size, SOUND::PCM);
	btnClick.SetVolume(40);

	GuiTrigger trigA;
	trigA.SetSimpleTrigger(-1, WPAD_BUTTON_A | WPAD_CLASSIC_BUTTON_A, PAD_BUTTON_A);

	GuiText logs[MAX_LOGS] = {
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255}),
		GuiText("", 16, (GXColor){200, 200, 0, 255})
	};

	for (int i = 0; i < MAX_LOGS; i++)
	{
		logs[i].SetText(read_ui_log(i));
		logs[i].SetAlignment(ALIGN_H::LEFT, ALIGN_V::TOP);
		logs[i].SetPosition(50,100 + (20 * i));
	}

	GuiText backBtnTxt(gettext("debug.back"), 22, (GXColor){0, 0, 0, 255});
	GuiImage backBtnImg(&btnOutline);
	GuiImage backBtnImgOver(&btnOutlineOver);
	GuiButton backBtn(btnOutline.GetWidth(), btnOutline.GetHeight());
	backBtn.SetAlignment(ALIGN_H::LEFT, ALIGN_V::BOTTOM);
	backBtn.SetPosition(50, -35);
	backBtn.SetLabel(&backBtnTxt);
	backBtn.SetImage(&backBtnImg);
	backBtn.SetImageOver(&backBtnImgOver);
	backBtn.SetSoundOver(&btnSoundOver);
	backBtn.SetSoundClick(&btnClick);
	backBtn.SetTrigger(&trigA);
	backBtn.SetEffectGrow();

	HaltGui();
	GuiWindow w(screenwidth, screenheight);
	for (int i = 0; i < MAX_LOGS; i++)
	{
		w.Append(&logs[i]);
	}
	w.Append(&backBtn);
	mainWindow->Append(&w);
	mainWindow->Append(&titleTxt);
	ResumeGui();

	while(menu == MENU_NONE)
	{
		usleep(THREAD_SLEEP);

		for (int i = 0; i < MAX_LOGS; i++)
		{
			logs[i].SetText(read_ui_log(i));
		}

		if(backBtn.GetState() == STATE::CLICKED)
		{
			menu = MENU_SETTINGS;
		}
		if (WPAD_ButtonsDown(0) & WPAD_BUTTON_MINUS) {
			menu = MENU_SETTINGS;
		}

		bgMusic->Loop();
	}
	HaltGui();

	for (int i = 0; i < MAX_LOGS; i++)
	{
		logs[i].SetText("");
	}

	mainWindow->Remove(&w);
	mainWindow->Remove(&titleTxt);
	return menu;
}


/****************************************************************************
 * InitGUIThread
 *
 * Startup GUI threads
 ***************************************************************************/
void InitGUIThreads()
{
	LWP_CreateThread (&guithread, UpdateGUI, nullptr, nullptr, 0, 20);
}

/****************************************************************************
 * MenuSettings
 ***************************************************************************/
static int MenuSettings(GuiSound* bgMusic)
{
	int menu = MENU_NONE;

	GuiText titleTxt(gettext("main.title"), 24, (GXColor){255, 255, 255, 255});
	titleTxt.SetAlignment(ALIGN_H::LEFT, ALIGN_V::TOP);
	titleTxt.SetPosition(50,50);
	titleTxt.SetEffect(EFFECT::SLIDE_TOP | EFFECT::SLIDE_IN, 25);

	GuiText versionTxt(gettext("main.version"), 12, (GXColor){255, 255, 255, 15});
	versionTxt.SetAlignment(ALIGN_H::RIGHT, ALIGN_V::TOP);
	versionTxt.SetPosition(-20,20);

	GuiSound btnSoundOver(button_over_pcm, button_over_pcm_size, SOUND::PCM);
	btnSoundOver.SetVolume(20);
	GuiImageData btnOutline(button_png);
	GuiImageData btnOutlineOver(button_over_png);
	GuiImageData btnLongOutline(button_long_png);
	GuiImageData btnLongOutlineOver(button_long_over_png);

	GuiTrigger trigA;
	trigA.SetSimpleTrigger(-1, WPAD_BUTTON_A | WPAD_CLASSIC_BUTTON_A, PAD_BUTTON_A);
	GuiTrigger trigHome;
	trigHome.SetButtonOnlyTrigger(-1, WPAD_BUTTON_HOME | WPAD_CLASSIC_BUTTON_HOME, 0);

	GuiSound btnClick(swish_pcm, swish_pcm_size, SOUND::PCM);
	btnClick.SetVolume(40);

	GuiGbaConnections connections(serverName);
	connections.SetPosition(-125, 30);
	connections.SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	connections.SetEffect(EFFECT::SLIDE_BOTTOM | EFFECT::SLIDE_IN, 40);

	GuiText networkBtnTxt(gettext("main.network"), 22, (GXColor){0, 0, 0, 255});
	networkBtnTxt.SetWrap(false, btnLongOutline.GetWidth()-30);
	GuiImage networkBtnImg(&btnLongOutline);
	GuiImage networkBtnImgOver(&btnLongOutlineOver);
	GuiButton networkBtn(btnLongOutline.GetWidth(), btnLongOutline.GetHeight());
	networkBtn.SetAlignment(ALIGN_H::LEFT, ALIGN_V::BOTTOM);
	networkBtn.SetPosition(50, -35);
	networkBtn.SetLabel(&networkBtnTxt);
	networkBtn.SetImage(&networkBtnImg);
	networkBtn.SetImageOver(&networkBtnImgOver);
	networkBtn.SetSoundOver(&btnSoundOver);
	networkBtn.SetSoundClick(&btnClick);
	networkBtn.SetTrigger(&trigA);
	networkBtn.SetEffectGrow();

	GuiText exitBtnTxt(gettext("main.exit"), 22, (GXColor){0, 0, 0, 255});
	GuiImage exitBtnImg(&btnOutline);
	GuiImage exitBtnImgOver(&btnOutlineOver);
	GuiButton exitBtn(btnOutline.GetWidth(), btnOutline.GetHeight());
	exitBtn.SetAlignment(ALIGN_H::RIGHT, ALIGN_V::BOTTOM);
	exitBtn.SetPosition(-50, -35);
	exitBtn.SetLabel(&exitBtnTxt);
	exitBtn.SetImage(&exitBtnImg);
	exitBtn.SetImageOver(&exitBtnImgOver);
	exitBtn.SetSoundOver(&btnSoundOver);
	exitBtn.SetSoundClick(&btnClick);
	exitBtn.SetTrigger(&trigA);
	exitBtn.SetTrigger(&trigHome);
	exitBtn.SetEffectGrow();

	isPlayerConnected[0] = false;
	isPlayerConnected[1] = false;
	isPlayerConnected[2] = false;
	isPlayerConnected[3] = false;

	isPlayerNamed[0] = false;
	isPlayerNamed[1] = false;
	isPlayerNamed[2] = false;
	isPlayerNamed[3] = false;

	HaltGui();
	GuiWindow w(screenwidth, screenheight);
	w.Append(&titleTxt);
	w.Append(&versionTxt);
	w.Append(&connections);

#ifdef HW_RVL
	w.Append(&networkBtn);
#endif

	w.Append(&exitBtn);

	mainWindow->Append(&w);

	/* Force inital redraw all on load then we loop */
	connections.Draw();
	bgImg->ApplyBackgroundPattern();

	ResumeGui();

	int soundFadeLoop = 0;	
	bool isMuted = bgMusic->GetVolume() == 0;

	/*
	* On real hardware images with alpha seem to start gliching over time (espessially when changing screens)
	* to fix this we periodically redraw the background, forcing all areas to be redrawn without corruption  
	*/
	int forceUiRefreshLoop = 0;


	while(menu == MENU_NONE)
	{
		usleep(THREAD_SLEEP);
		bgMusic->Loop();
		if(networkBtn.GetState() == STATE::CLICKED)
		{
			menu = MENU_SETTINGS_NETWORK;
		}
		if (WPAD_ButtonsDown(0) & WPAD_BUTTON_MINUS) {
			menu = MENU_DEBUG;
		}
		if(exitBtn.GetState() == STATE::CLICKED)
		{
			int choice = WindowPrompt(
				gettext("quit.title"),
				gettext("quit.msg"),
				gettext("quit.yes"),
				gettext("quit.no"),
				bgMusic);
			if(choice == 1)
			{
				menu = MENU_EXIT;
			}
		}

		/* Handle GBA connections in the ui */

		for (int i = 0; i < 4; i++)
		{
			if (!isPlayerConnected[i] && isConnected(i) > 0)
			{
				connections.ConnectPlayer(i + 1);
				isPlayerConnected[i] = true;
			} 

			if (isPlayerConnected[i] && !isPlayerNamed[i] && hasPlayerName(i))
			{
				connections.SetPlayerName(i + 1, getPlayerName(i));
				isPlayerNamed[i] = true;
			}
		}

		if (!serverSet)
		{
			if (hasServerName())
			{
				strcpy(serverName, getServerName());
				connections.SetServerName(serverName);
				serverSet = true;
			}
		}

		if (!isMuted && 
		    (isPlayerConnected[0] || isPlayerConnected[1] || isPlayerConnected[2] || isPlayerConnected[3]) 
			&& bgMusic->GetVolume() > 0)
		{
			if (soundFadeLoop % 100000 == 0)
			{
				bgMusic->SetVolume((bgMusic->GetVolume() - 1));
			} 
			else 
			{
				soundFadeLoop++;
			}
			
		} 
		else if (bgMusic->GetVolume() == 0)
		{
			isMuted = true;
		}

		if (forceUiRefreshLoop == 300)
		{
			forceUiRefreshLoop = 0;
			HaltGui();
			connections.Draw(); // Try and prevent the main ui going glitchy
			bgImg->ApplyBackgroundPattern();
			ResumeGui();
		}
		else
		{
			forceUiRefreshLoop++;
		}


	}

	HaltGui();
	mainWindow->Remove(&w);
	mainWindow->Remove(&titleTxt);
	return menu;
}

/****************************************************************************
 * NetworkConfigurationMenu
 ***************************************************************************/

static int NetworkConfigurationMenu(GuiSound* bgMusic)
{
	int menu = MENU_NONE;

	GuiText titleTxt(gettext("network.title"), 24, (GXColor){255, 255, 255, 255});
	titleTxt.SetAlignment(ALIGN_H::LEFT, ALIGN_V::TOP);
	titleTxt.SetPosition(50,50);
	titleTxt.SetEffect(EFFECT::SLIDE_TOP | EFFECT::SLIDE_IN, 25);

	GuiText versionTxt(gettext("main.version"), 12, (GXColor){255, 255, 255, 15});
	versionTxt.SetAlignment(ALIGN_H::RIGHT, ALIGN_V::TOP);
	versionTxt.SetPosition(-20,20);

	GuiSound btnSoundOver(button_over_pcm, button_over_pcm_size, SOUND::PCM);
	btnSoundOver.SetVolume(20);
	GuiImageData btnOutline(button_png);
	GuiImageData btnOutlineOver(button_over_png);
	GuiImageData btnLongOutline(button_long_png);
	GuiImageData btnLongOutlineOver(button_long_over_png);

	GuiSound btnClick(swish_pcm, swish_pcm_size, SOUND::PCM);
	btnClick.SetVolume(40);

	GuiTrigger trigA;
	trigA.SetSimpleTrigger(-1, WPAD_BUTTON_A | WPAD_CLASSIC_BUTTON_A, PAD_BUTTON_A);

	GuiText backBtnTxt(gettext("network.back"), 22, (GXColor){0, 0, 0, 255});
	GuiImage backBtnImg(&btnOutline);
	GuiImage backBtnImgOver(&btnOutlineOver);
	GuiButton backBtn(btnOutline.GetWidth(), btnOutline.GetHeight());
	backBtn.SetAlignment(ALIGN_H::LEFT, ALIGN_V::BOTTOM);
	backBtn.SetPosition(50, -35);
	backBtn.SetLabel(&backBtnTxt);
	backBtn.SetImage(&backBtnImg);
	backBtn.SetImageOver(&backBtnImgOver);
	backBtn.SetSoundOver(&btnSoundOver);
	backBtn.SetSoundClick(&btnClick);
	backBtn.SetTrigger(&trigA);
	backBtn.SetEffectGrow();

	GuiText testConnectionBtnTxt(gettext("network.test"), 22, (GXColor){0, 0, 0, 255});
	testConnectionBtnTxt.SetWrap(false, btnLongOutline.GetWidth()-30);
	GuiImage testConnectionBtnImg(&btnLongOutline);
	GuiImage testConnectionBtnImgOver(&btnLongOutlineOver);
	GuiButton testConnectionBtn(btnLongOutline.GetWidth(), btnLongOutline.GetHeight());
	testConnectionBtn.SetAlignment(ALIGN_H::RIGHT, ALIGN_V::BOTTOM);
	testConnectionBtn.SetPosition(-50, -35);
	testConnectionBtn.SetLabel(&testConnectionBtnTxt);
	testConnectionBtn.SetImage(&testConnectionBtnImg);
	testConnectionBtn.SetImageOver(&testConnectionBtnImgOver);
	testConnectionBtn.SetSoundOver(&btnSoundOver);
	testConnectionBtn.SetTrigger(&trigA);
	testConnectionBtn.SetEffectGrow();

	GuiNumpad numpad(gettext("network.prompt"), ipv4, 32);
	numpad.SetPosition(-107, -60);
	numpad.SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	numpad.SetEffect(EFFECT::SLIDE_BOTTOM | EFFECT::SLIDE_IN, 40);

	HaltGui();
	GuiWindow w(screenwidth, screenheight);
	w.Append(&numpad);
	w.Append(&backBtn);
	w.Append(&testConnectionBtn);
	mainWindow->Append(&w);
	mainWindow->Append(&titleTxt);
	mainWindow->Append(&versionTxt);
	ResumeGui();

	while(menu == MENU_NONE)
	{
		usleep(THREAD_SLEEP);
		bgMusic->Loop();
		if(backBtn.GetState() == STATE::CLICKED)
		{
			menu = MENU_SETTINGS;
		}
		else if (testConnectionBtn.GetState() == STATE::CLICKED)
		{
			NetworkTestPopup(gettext("networkTest.title"),
				             gettext("networkTest.attemptingConnection"),
				             gettext("networkTest.close"), 
				             bgMusic);
		}
	}
	HaltGui();

	mainWindow->Remove(&w);
	mainWindow->Remove(&titleTxt);
	mainWindow->Remove(&versionTxt);
	return menu;
}


/****************************************************************************
 * MainMenu
 ***************************************************************************/
void MainMenu()
{
	int currentMenu = MENU_SETTINGS;

	#ifdef HW_RVL
	pointer[0] = new GuiImageData(player1_point_png);
	pointer[1] = new GuiImageData(player2_point_png);
	pointer[2] = new GuiImageData(player3_point_png);
	pointer[3] = new GuiImageData(player4_point_png);
	#endif

	mainWindow = new GuiWindow(screenwidth, screenheight);

	bgImg = new GuiImage(screenwidth, screenheight, (GXColor){20, 20, 20, 255});
	bgImg->ApplyBackgroundPattern();
	mainWindow->Append(bgImg);

	ResumeGui();

	bgMusic = new GuiSound(bg_music_mp3, bg_music_mp3_size, SOUND::MP3);
	bgMusic->SetVolume(50);
	bgMusic->Play(); // startup music

	while(currentMenu != MENU_EXIT)
	{
		bgMusic->Loop();
		switch (currentMenu)
		{
			case MENU_SETTINGS:
				currentMenu = MenuSettings(bgMusic);
				break;
			case MENU_SETTINGS_NETWORK:
				currentMenu = NetworkConfigurationMenu(bgMusic);
				break;
			case MENU_DEBUG:
				currentMenu = DebugMenu(bgMusic);
				break;
			default: // unrecognized menu
				currentMenu = MenuSettings(bgMusic);
				break;
		}
	}

	ResumeGui();
	ExitRequested = 1;

	HaltGui();

	bgMusic->Stop();
	delete bgMusic;
	delete bgImg;
	delete mainWindow;

	delete pointer[0];
	delete pointer[1];
	delete pointer[2];
	delete pointer[3];

	mainWindow = nullptr;
}
