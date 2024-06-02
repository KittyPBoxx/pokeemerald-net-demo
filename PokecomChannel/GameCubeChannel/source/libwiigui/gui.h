/*!\mainpage libwiigui Documentation
 *
 * \section Introduction
 * libwiigui is a GUI library for the Wii, created to help structure the
 * design of a complicated GUI interface, and to enable an author to create
 * a sophisticated, feature-rich GUI. It was originally conceived and written
 * after I started to design a GUI for Snes9x GX, and found libwiisprite and
 * GRRLIB inadequate for the purpose. It uses GX for drawing, and makes use
 * of PNGU for displaying images and FreeTypeGX for text. It was designed to
 * be flexible and is easy to modify - don't be afraid to change the way it
 * works or expand it to suit your GUI's purposes! If you do, and you think
 * your changes might benefit others, please share them so they might be
 * added to the project!
 *
 * \section Quickstart
 * Start from the supplied template example. For more advanced uses, see the
 * source code for Snes9x GX, FCE Ultra GX, and Visual Boy Advance GX.

 * \section Contact
 * If you have any suggestions for the library or documentation, or want to
 * contribute, please visit the libwiigui website:
 * http://code.google.com/p/libwiigui/

 * \section Credits
 * This library was wholly designed and written by Tantric. Thanks to the
 * authors of PNGU and FreeTypeGX, of which this library makes use. Thanks
 * also to the authors of GRRLIB and libwiisprite for laying the foundations.
 *
*/

#ifndef LIBWIIGUI_H
#define LIBWIIGUI_H

#include <gccore.h>
#include <malloc.h>
#include <stdlib.h>
#include <string.h>
#include <vector>
#include <exception>
#include <wchar.h>
#include <math.h>
#include <asndlib.h>
#include <wiiuse/wpad.h>
#include <mp3player.h>

#include "video.h"
#include "filelist.h"
#include "input.h"
#include "pngu.h"
#include "FreeTypeGX.h"
#include "wiidrc.h"

extern FreeTypeGX *fontSystem[];

#define SCROLL_DELAY_INITIAL	200000
#define SCROLL_DELAY_LOOP		30000
#define SCROLL_DELAY_DECREASE	300
#define FILE_PAGESIZE 			8
#define PAGESIZE 				8
#define MAX_OPTIONS 			150
#define MAX_KEYBOARD_DISPLAY	32
#define MAX_NUMPAD_DISPLAY      32

#define KB_ROWS 4
#define KB_COLUMNS 11

#define NUMPAD_ROWS 3
#define NUMPAD_COLUMNS 5

typedef void (*UpdateCallback)(void * e);

enum class ALIGN_V {
	TOP,
	BOTTOM,
	MIDDLE
};

enum class ALIGN_H {
	LEFT,
	RIGHT,
	CENTRE
};

enum class STATE {
	DEFAULT,
	SELECTED,
	CLICKED,
	HELD,
	DISABLED
};

enum class SOUND {
	PCM,
	MP3
};

enum class IMAGE {
	TEXTURE,
	COLOR,
	DATA
};

enum class TRIGGER {
	SIMPLE,
	HELD,
	BUTTON_ONLY,
	BUTTON_ONLY_IN_FOCUS
};

enum class SCROLL {
	NONE,
	HORIZONTAL
};

enum EFFECT {
	SLIDE_TOP = (1u << 0),
	SLIDE_BOTTOM = (1u << 1),
	SLIDE_RIGHT = (1u << 2),
	SLIDE_LEFT = (1u << 3),
	SLIDE_IN = (1u << 4),
	SLIDE_OUT = (1u << 5),
	FADE = (1u << 6),
	SCALE = (1u << 7),
	COLOR_TRANSITION = (1u << 8),
	PLUSE = (1u << 9)
};

typedef struct _paddata {
	u16 btns_d;
	u16 btns_u;
	u16 btns_h;
	s8 stickX;
	s8 stickY;
	s8 substickX;
	s8 substickY;
	u8 triggerL;
	u8 triggerR;
} PADData;

typedef struct _gamepaddata {
	u16 btns_d;
	u16 btns_u;
	u16 btns_h;
	s16 stickX;
	s16 stickY;
	s16 substickX;
	s16 substickY;
} GamePadData;

#include "gui_sound.h"
#include "gui_trigger.h"
#include "gui_element.h"
#include "gui_window.h"
#include "gui_imagedata.h"
#include "gui_image.h"
#include "gui_text.h"
#include "gui_tooltip.h"
#include "gui_button.h"
#include "gui_keyboard.h"
#include "gui_numpad.h"
#include "gui_loader.h"
#include "gui_gbaconnections.h"

extern GuiTrigger userInput[1];

#endif
