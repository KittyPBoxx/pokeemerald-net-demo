#ifndef LIBWIIGUI_LOADER_H
#define LIBWIIGUI_LOADER_H

//Animated loader
class GuiLoader : public GuiElement {
public:
	GuiLoader();
	~GuiLoader();
    void Draw();
	void Update(GuiTrigger * t);
protected:
    GuiImageData * dot;
	GuiImage * dots[3][3];
};

#endif