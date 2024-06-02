/****************************************************************************
 * libwiigui
 *
 * Tantric 2009
 *
 * gui_trigger.cpp
 *
 * GUI class definitions
 ***************************************************************************/

#include "gui.h"
#include <ogc/lwp_watchdog.h>
#include <gctypes.h>

static u64 prev[4];
static u64 now[4];
static u32 delay[4];

/**
 * Constructor for the GuiTrigger class.
 */
GuiTrigger::GuiTrigger()
{
	chan = -1;
	WiimoteTurned = false;
	memset(&wiidrcdata, 0, sizeof(GamePadData));
	memset(&wpaddata, 0, sizeof(WPADData));
	memset(&pad, 0, sizeof(PADData));
	wpad = &wpaddata;
	padX = 50;
	padY = 50;
}

/**
 * Destructor for the GuiTrigger class.
 */
GuiTrigger::~GuiTrigger()
{
}

/**
 * Sets a simple trigger. Requires:
 * - Element is selected
 * - Trigger button is pressed
 */
void GuiTrigger::SetSimpleTrigger(s32 ch, u16 gcbtns)
{
	type = TRIGGER::SIMPLE;
	chan = ch;
	pad.btns_d = gcbtns;
}

/**
 * Sets a held trigger. Requires:
 * - Element is selected
 * - Trigger button is pressed and held
 */
void GuiTrigger::SetHeldTrigger(s32 ch, u16 gcbtns)
{
	type = TRIGGER::HELD;
	chan = ch;
	pad.btns_h = gcbtns;
}

/**
 * Sets a button trigger. Requires:
 * - Trigger button is pressed
 */
void GuiTrigger::SetButtonOnlyTrigger(s32 ch, u16 gcbtns)
{
	type = TRIGGER::BUTTON_ONLY;
	chan = ch;
	pad.btns_d = gcbtns;
}

/**
 * Sets a button trigger. Requires:
 * - Trigger button is pressed
 * - Parent window is in focus
 */
void GuiTrigger::SetButtonOnlyInFocusTrigger(s32 ch, u16 gcbtns)
{
	type = TRIGGER::BUTTON_ONLY_IN_FOCUS;
	chan = ch;
	pad.btns_d = gcbtns;
}

bool GuiTrigger::Left()
{
	if((pad.btns_d | pad.btns_h) & PAD_BUTTON_LEFT || pad.stickX < -PADCAL)
	{
		if(pad.btns_d & PAD_BUTTON_LEFT)
		{
			prev[chan] = gettime();
			delay[chan] = SCROLL_DELAY_INITIAL; // reset scroll delay
			return true;
		}

		now[chan] = gettime();

		if(diff_usec(prev[chan], now[chan]) > delay[chan])
		{
			prev[chan] = now[chan];
			
			if(delay[chan] == SCROLL_DELAY_INITIAL)
				delay[chan] = SCROLL_DELAY_LOOP;
			else if(delay[chan] > SCROLL_DELAY_DECREASE)
				delay[chan] -= SCROLL_DELAY_DECREASE;
			return true;
		}
	}
	return false;
}

bool GuiTrigger::Right()
{
	if((pad.btns_d | pad.btns_h) & PAD_BUTTON_RIGHT || pad.stickX > PADCAL)
	{
		if( pad.btns_d & PAD_BUTTON_RIGHT)
		{
			prev[chan] = gettime();
			delay[chan] = SCROLL_DELAY_INITIAL; // reset scroll delay
			return true;
		}

		now[chan] = gettime();

		if(diff_usec(prev[chan], now[chan]) > delay[chan])
		{
			prev[chan] = now[chan];
			
			if(delay[chan] == SCROLL_DELAY_INITIAL)
				delay[chan] = SCROLL_DELAY_LOOP;
			else if(delay[chan] > SCROLL_DELAY_DECREASE)
				delay[chan] -= SCROLL_DELAY_DECREASE;
			return true;
		}
	}
	return false;
}

bool GuiTrigger::Up()
{
	if((pad.btns_d | pad.btns_h) & PAD_BUTTON_UP || pad.stickY > PADCAL)
	{
		if(pad.btns_d & PAD_BUTTON_UP)
		{
			prev[chan] = gettime();
			delay[chan] = SCROLL_DELAY_INITIAL; // reset scroll delay
			return true;
		}

		now[chan] = gettime();

		if(diff_usec(prev[chan], now[chan]) > delay[chan])
		{
			prev[chan] = now[chan];
			
			if(delay[chan] == SCROLL_DELAY_INITIAL)
				delay[chan] = SCROLL_DELAY_LOOP;
			else if(delay[chan] > SCROLL_DELAY_DECREASE)
				delay[chan] -= SCROLL_DELAY_DECREASE;
			return true;
		}
	}
	return false;
}

bool GuiTrigger::Down()
{
	if((pad.btns_d | pad.btns_h) & PAD_BUTTON_DOWN || pad.stickY < -PADCAL)
	{
		if(pad.btns_d & PAD_BUTTON_DOWN)
		{
			prev[chan] = gettime();
			delay[chan] = SCROLL_DELAY_INITIAL; // reset scroll delay
			return true;
		}

		now[chan] = gettime();

		if(diff_usec(prev[chan], now[chan]) > delay[chan])
		{
			prev[chan] = now[chan];
			
			if(delay[chan] == SCROLL_DELAY_INITIAL)
				delay[chan] = SCROLL_DELAY_LOOP;
			else if(delay[chan] > SCROLL_DELAY_DECREASE)
				delay[chan] -= SCROLL_DELAY_DECREASE;
			return true;
		}
	}
	return false;
}
