/****************************************************************************
 * libwiigui Template
 * Tantric 2009
 *
 * input.cpp
 * Wii/GameCube controller management
 ***************************************************************************/

#include <gccore.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <ogcsys.h>
#include <unistd.h>

#include "menu.h"
#include "video.h"
#include "input.h"
#include "libwiigui/gui.h"

GuiTrigger userInput[1];

/****************************************************************************
 * UpdatePads
 *
 * Scans pad and wpad
 ***************************************************************************/
void UpdatePads()
{
	PAD_ScanPads();

	userInput[0].pad.btns_d = PAD_ButtonsDown(0);
	userInput[0].pad.btns_u = PAD_ButtonsUp(0);
	userInput[0].pad.btns_h = PAD_ButtonsHeld(0);
	userInput[0].pad.stickX = PAD_StickX(0);
	userInput[0].pad.stickY = PAD_StickY(0);
	userInput[0].pad.substickX = PAD_SubStickX(0);
	userInput[0].pad.substickY = PAD_SubStickY(0);
	userInput[0].pad.triggerL = PAD_TriggerL(0);
	userInput[0].pad.triggerR = PAD_TriggerR(0);
}

/****************************************************************************
 * SetupPads
 *
 * Sets up userInput triggers for use
 ***************************************************************************/
void SetupPads()
{
	PAD_Init();
}
