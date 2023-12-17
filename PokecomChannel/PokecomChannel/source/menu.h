/****************************************************************************
 * libwiigui Template
 * Tantric 2009
 *
 * menu.h
 * Menu flow routines - handles all menu logic
 ***************************************************************************/

#ifndef _MENU_H_
#define _MENU_H_

#include <ogcsys.h>
#include "logger.h"
#include "linkcableclient.h"

void InitGUIThreads();
void MainMenu (int menuitem, Logger * LOGGER, LinkCableClient * gbas[4]);

enum
{
	MENU_EXIT = -1,
	MENU_NONE,
	MENU_SETTINGS,
	MENU_SETTINGS_NETWORK,
	MENU_DEBUG
};

#endif
