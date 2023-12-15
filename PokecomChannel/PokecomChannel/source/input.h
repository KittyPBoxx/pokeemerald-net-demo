/****************************************************************************
 * libwiigui Template
 * Tantric 2009
 *
 * input.h
 * Wii/GameCube controller management
 ***************************************************************************/

#ifndef _INPUT_H_
#define _INPUT_H_

#include <gccore.h>
#include <wiiuse/wpad.h>
#include "wiidrc.h"

#define PI 				3.14159265f
#define PADCAL			50
#define WIIDRCCAL		20

extern int rumbleRequest[4];

void SetupPads();
void UpdatePads();
void ShutoffRumble();
void DoRumble(int i);

#endif
