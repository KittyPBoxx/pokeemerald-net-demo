#ifndef LIBWIIGUI_TOOLTIP_H
#define LIBWIIGUI_TOOLTIP_H

//!Display, manage, and manipulate tooltips in the GUI
class GuiTooltip : public GuiElement {
public:
	//!Constructor
	//!\param t Text
	GuiTooltip(const char *t);
	//!Destructor
	~GuiTooltip();
	//!Gets the element's current scale
	float GetScale();
	//!Sets the text of the GuiTooltip element
	//!\param t Text
	void SetText(const char * t);
	//!Constantly called to draw the GuiTooltip
	void DrawTooltip();

	time_t time1, time2; //!< Tooltip times

protected:
	GuiImage leftImage; //!< Tooltip left image
	GuiImage tileImage; //!< Tooltip tile image
	GuiImage rightImage; //!< Tooltip right image
	GuiText *text; //!< Tooltip text
};

#endif
