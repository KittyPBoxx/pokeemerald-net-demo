#ifndef LIBWIIGUI_NUMPAD_H
#define LIBWIIGUI_NUMPAD_H

//!On-screen numberpad
class GuiNumpad : public GuiElement {
public:
	GuiNumpad(const char * numpadPromptTxt, char * t, u32 m);
	~GuiNumpad();
    void Draw();
	void Update(GuiTrigger * t);
	void DeleteKey();
	char numpadtextstr[31];
	char * storedValue;
protected:
	u32 numpadtextmaxlen;
    GuiText * prompt;
	GuiText * kbText;
	GuiImage * keyTextboxImg;
	GuiButton * keyBtn[NUMPAD_ROWS][NUMPAD_COLUMNS];
	GuiImage * keyImg[NUMPAD_ROWS][NUMPAD_COLUMNS];
	GuiImage * keyImgOver[NUMPAD_ROWS][NUMPAD_COLUMNS];
	GuiText * keyTxt[NUMPAD_ROWS][NUMPAD_COLUMNS];
	GuiImageData * keyTextbox;
	GuiImageData * key;
	GuiImageData * keyOver;
	GuiImageData * keyTall;
	GuiImageData * keyTallOver;
	GuiImageData * keyLarge;
	GuiImageData * keyLargeOver;
	GuiSound * keySoundOver;
	GuiSound * keySoundClick;
	GuiTrigger * trigA;
	GuiTrigger * trig2;
	char keys[NUMPAD_ROWS][NUMPAD_COLUMNS];
};

#endif