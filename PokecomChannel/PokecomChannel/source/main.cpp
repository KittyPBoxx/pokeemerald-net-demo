/****************************************************************************
 * libwiigui Template
 * Tantric 2009
 *
 * main.cpp
 * Basic template/demonstration of libwiigui capabilities. For a
 * full-featured app using many more extensions, check out Snes9x GX.
 ***************************************************************************/

#include <gccore.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ogcsys.h>
#include <unistd.h>
#include <wiiuse/wpad.h>
#include <fat.h>

#include "FreeTypeGX.h"
#include "video.h"
#include "audio.h"
#include "menu.h"
#include "input.h"
#include "filelist.h"
#include "main.h"
#include "gettext.h"
#include "linkcableclient.h"
#include "logger.h"

#define USE_UI TRUE

static LinkCableClient * gbas[4];
static Logger * LOGGER = nullptr;
int ExitRequested = 0;

void ExitApp()
{
	ShutoffRumble();
	StopGX();
	exit(0);
}

void setupGBAConnector(int port, Logger * LOGGER)
{
	gbas[port] = new LinkCableClient(port, LOGGER);
	gbas[port]->Start();
}

int main(int argc, char *argv[])
{
	(void)argc;
	(void)argv;

	InitVideo(); // Initialize video
	SetupPads(); // Initialize input
	InitAudio(); // Initialize audio
	InitFreeType((u8*)font_ttf, font_ttf_size); // Initialize font system
	InitGUIThreads(); // Initialize GUI
	LoadLanguage(); // Load localised text

	LOGGER = new Logger();

	setupGBAConnector(0, LOGGER);
	setupGBAConnector(1, LOGGER);
	setupGBAConnector(2, LOGGER);
	setupGBAConnector(3, LOGGER);

	if (USE_UI)
	{
		MainMenu(MENU_SETTINGS, LOGGER, gbas);
	}
	else
	{
		printf ("Starting Pokecom Channel\n");

		while(1) {

			VIDEO_WaitVSync();
			WPAD_ScanPads();

			int buttonsDown = WPAD_ButtonsDown(0);

			if (buttonsDown & WPAD_BUTTON_HOME) {
				exit(0);
			}
		}
	}
}
