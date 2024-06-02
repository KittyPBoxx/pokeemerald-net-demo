#ifndef LIBWIIGUI_TEXT_H
#define LIBWIIGUI_TEXT_H

//!Display, manage, and manipulate text in the GUI
class GuiText : public GuiElement {
public:
	//!Constructor
	//!\param t Text
	//!\param s Font size
	//!\param c Font color
	GuiText(const char * t, int s, GXColor c);
	//!\overload
	//!Assumes SetPresets() has been called to setup preferred text attributes
	//!\param t Text
	GuiText(const char * t);
	//!Destructor
	~GuiText();
	//!Sets the text of the GuiText element
	//!\param t Text
	void SetText(const char * t);
	//!Sets the text of the GuiText element
	//!\param t UTF-8 Text
	void SetWText(wchar_t * t);
	//!Gets the translated text length of the GuiText element
	int GetLength();
	//!Sets up preset values to be used by GuiText(t)
	//!Useful when printing multiple text elements, all with the same attributes set
	//!\param sz Font size
	//!\param c Font color
	//!\param w Maximum width of texture image (for text wrapping)
	//!\param s Font size
	//!\param h Text alignment (horizontal)
	//!\param v Text alignment (vertical)
	static void SetPresets(int sz, GXColor c, int w, u16 s, ALIGN_H h, ALIGN_V v);
	//!Sets the font size
	//!\param s Font size
	void SetFontSize(int s);
	//!Sets the maximum width of the drawn texture image
	//!\param w Maximum width
	void SetMaxWidth(int w);
	//!Gets the width of the text when rendered
	int GetTextWidth();
	//!Enables/disables text scrolling
	//!\param s Scrolling on/off
	void SetScroll(SCROLL s);
	//!Enables/disables text wrapping
	//!\param w Wrapping on/off
	//!\param width Maximum width (0 to disable)
	void SetWrap(bool w, int width = 0);
	//!Sets the font color
	//!\param c Font color
	void SetColor(GXColor c);
	//!Sets the FreeTypeGX style attributes
	//!\param s Style attributes
	void SetStyle(u16 s);
	//!Sets the text alignment
	//!\param hor Horizontal alignment (LEFT, RIGHT, CENTRE)
	//!\param vert Vertical alignment (TOP, BOTTOM, MIDDLE)
	void SetAlignment(ALIGN_H hor, ALIGN_V vert);
	//!Updates the text to the selected language
	void ResetText();
	//!Constantly called to draw the text
	void Draw();
protected:
	GXColor color; //!< Font color
	wchar_t* text; //!< Translated Unicode text value
	wchar_t *textDyn[20]; //!< Text value, if max width, scrolling, or wrapping enabled
	int textDynNum; //!< Number of text lines
	char * origText; //!< Original text data (English)
	int size; //!< Font size
	int maxWidth; //!< Maximum width of the generated text object (for text wrapping)
	SCROLL textScroll; //!< Scrolling toggle
	int textScrollPos; //!< Current starting index of text string for scrolling
	int textScrollInitialDelay; //!< Delay to wait before starting to scroll
	int textScrollDelay; //!< Scrolling speed
	u16 style; //!< FreeTypeGX style attributes
	bool wrap; //!< Wrapping toggle
};

#endif
