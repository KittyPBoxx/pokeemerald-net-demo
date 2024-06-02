#ifndef LIBWIIGUI_TRIGGER_H
#define LIBWIIGUI_TRIGGER_H

//!Menu input trigger management. Determine if action is neccessary based on input data by comparing controller input data to a specific trigger element.
class GuiTrigger {
public:
	//!Constructor
	GuiTrigger();
	//!Destructor
	~GuiTrigger();
	//!Sets a simple trigger. Requires: element is selected, and trigger button is pressed
	//!\param ch Controller channel number
	//!\param gcbtns GameCube controller trigger button(s)
	void SetSimpleTrigger(s32 ch, u16 gcbtns = 0);
	//!Sets a held trigger. Requires: element is selected, and trigger button is pressed
	//!\param ch Controller channel number
	//!\param gcbtns GameCube controller trigger button(s)
	void SetHeldTrigger(s32 ch, u16 gcbtns = 0);
	//!Sets a button-only trigger. Requires: Trigger button is pressed
	//!\param ch Controller channel number
	//!\param gcbtns GameCube controller trigger button(s)
	void SetButtonOnlyTrigger(s32 ch, u16 gcbtns = 0);
	//!Sets a button-only trigger. Requires: trigger button is pressed and parent window of element is in focus
	//!\param ch Controller channel number
	//!\param gcbtns GameCube controller trigger button(s)
	void SetButtonOnlyInFocusTrigger(s32 ch, u16 gcbtns = 0);
	//!Move menu selection left (via pad/joystick). Allows scroll delay and button overriding
	//!\return true if selection should be moved left, false otherwise
	bool Left();
	//!Move menu selection right (via pad/joystick). Allows scroll delay and button overriding
	//!\return true if selection should be moved right, false otherwise
	bool Right();
	//!Move menu selection up (via pad/joystick). Allows scroll delay and button overriding
	//!\return true if selection should be moved up, false otherwise
	bool Up();
	//!Move menu selection down (via pad/joystick). Allows scroll delay and button overriding
	//!\return true if selection should be moved down, false otherwise
	bool Down();

	WPADData wpaddata; //!< Wii controller trigger data
	PADData pad; //!< GameCube controller trigger data
	int padX;
	int padY;
	GamePadData wiidrcdata; //!< Wii U Gamepad trigger data
	WPADData * wpad; //!< Wii controller trigger
	bool WiimoteTurned; //!< Wiimote orientation
	s32 chan; //!< Trigger controller channel (0-3, -1 for all)
	TRIGGER type; //!< trigger type (TRIGGER::SIMPLE, TRIGGER::HELD, TRIGGER::BUTTON_ONLY, TRIGGER::BUTTON_ONLY_IN_FOCUS)
};

#endif
