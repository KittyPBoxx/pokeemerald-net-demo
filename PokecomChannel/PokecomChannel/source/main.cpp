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

extern "C" {
	#include "linkcableclient.h"
}

#define USE_UI TRUE

int ExitRequested = 0;

void ExitApp()
{
	ShutdownAudio();
	ShutoffRumble();
	StopGX();
	exit(0);
}

int main(int argc, char *argv[])
{
	(void)argc;
	(void)argv;

	InitVideo(USE_UI); // Initialize video
	InitAudio(); // Initialize audio
	InitFreeType((u8*)font_ttf, font_ttf_size); // Initialize font system
	InitGUIThreads(); // Initialize GUI
	LoadLanguage(); // Load localised text

	PAD_Init();

	setupGBAConnectors();

	if (USE_UI)
	{
		MainMenu();
	}
	else
	{
		printf ("Starting Pokecom Channel\n");
		while(1)
		{
			VIDEO_WaitVSync();
			WPAD_ScanPads();

			int buttonsDown = WPAD_ButtonsDown(0);

			if (buttonsDown & WPAD_BUTTON_HOME) 
			{
				ExitApp();
			}
		}
	}
}
