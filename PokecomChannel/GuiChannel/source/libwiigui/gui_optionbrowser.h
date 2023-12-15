#ifndef LIBWIIGUI_OPTIONBROWSER_H
#define LIBWIIGUI_OPTIONBROWSER_H

typedef struct _optionlist {
	int length;
	char name[MAX_OPTIONS][50];
	char value[MAX_OPTIONS][50];
} OptionList;

//!Display a list of menu options
class GuiOptionBrowser : public GuiElement {
public:
	GuiOptionBrowser(int w, int h, OptionList * l);
	~GuiOptionBrowser();
	void SetCol1Position(int x);
	void SetCol2Position(int x);
	int FindMenuItem(int c, int d);
	int GetClickedOption();
	void ResetState();
	void SetFocus(int f);
	void Draw();
	void TriggerUpdate();
	void ResetText();
	void Update(GuiTrigger * t);
	GuiText * optionVal[PAGESIZE];
protected:
	int optionIndex[PAGESIZE];
	GuiButton * optionBtn[PAGESIZE];
	GuiText * optionTxt[PAGESIZE];
	GuiImage * optionBg[PAGESIZE];

	int selectedItem;
	int listOffset;
	OptionList * options;

	GuiButton * arrowUpBtn;
	GuiButton * arrowDownBtn;

	GuiImage * bgOptionsImg;
	GuiImage * scrollbarImg;
	GuiImage * arrowDownImg;
	GuiImage * arrowDownOverImg;
	GuiImage * arrowUpImg;
	GuiImage * arrowUpOverImg;

	GuiImageData * bgOptions;
	GuiImageData * bgOptionsEntry;
	GuiImageData * scrollbar;
	GuiImageData * arrowDown;
	GuiImageData * arrowDownOver;
	GuiImageData * arrowUp;
	GuiImageData * arrowUpOver;

	GuiSound * btnSoundOver;
	GuiSound * btnSoundClick;
	GuiTrigger * trigA;
	GuiTrigger * trig2;

	bool listChanged;
};

#endif
