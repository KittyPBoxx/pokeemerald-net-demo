#ifndef LIBWIIGUI_FILEBROWSER_H
#define LIBWIIGUI_FILEBROWSER_H

//!Display a list of files
class GuiFileBrowser : public GuiElement {
public:
	GuiFileBrowser(int w, int h);
	~GuiFileBrowser();
	void ResetState();
	void SetFocus(int f);
	void Draw();
	void DrawTooltip();
	void TriggerUpdate();
	void Update(GuiTrigger * t);
	GuiButton * fileList[FILE_PAGESIZE];
protected:
	GuiText * fileListText[FILE_PAGESIZE];
	GuiImage * fileListBg[FILE_PAGESIZE];
	GuiImage * fileListFolder[FILE_PAGESIZE];

	GuiButton * arrowUpBtn;
	GuiButton * arrowDownBtn;
	GuiButton * scrollbarBoxBtn;

	GuiImage * bgFileSelectionImg;
	GuiImage * scrollbarImg;
	GuiImage * arrowDownImg;
	GuiImage * arrowDownOverImg;
	GuiImage * arrowUpImg;
	GuiImage * arrowUpOverImg;
	GuiImage * scrollbarBoxImg;
	GuiImage * scrollbarBoxOverImg;

	GuiImageData * bgFileSelection;
	GuiImageData * bgFileSelectionEntry;
	GuiImageData * fileFolder;
	GuiImageData * scrollbar;
	GuiImageData * arrowDown;
	GuiImageData * arrowDownOver;
	GuiImageData * arrowUp;
	GuiImageData * arrowUpOver;
	GuiImageData * scrollbarBox;
	GuiImageData * scrollbarBoxOver;

	GuiSound * btnSoundOver;
	GuiSound * btnSoundClick;
	GuiTrigger * trigA;
	GuiTrigger * trig2;
	GuiTrigger * trigHeldA;

	int selectedItem;
	int numEntries;
	bool listChanged;
};

#endif
