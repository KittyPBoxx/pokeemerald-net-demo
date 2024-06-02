#ifndef LIBWIIGUI_GBACONNECTIONS_H
#define LIBWIIGUI_GBACONNECTIONS_H

//!GUI For gba link connecitons
class GuiGbaConnections : public GuiElement {
public:
	GuiGbaConnections(char * serverName);
	~GuiGbaConnections();
    void Draw();
    void ConnectPlayer(int player);
	void Update(GuiTrigger * t);
    void SetPlayerName(int playerNo, char * name);
    void SetServerName(char * name);
protected:
    void HidePlayerTag(int playerNo);
    void ShowPlayerTag(int playerNo);

    GuiImageData * playerTag;
    GuiImageData * p1GBA;
    GuiImageData * p2GBA;
    GuiImageData * p1Link;
    GuiImageData * p2Link;
    GuiImageData * ports;
    GuiImageData * globe;
    GuiImageData * c1;
    GuiImageData * c1Link;

    GuiImage * playerTagImg[2];
    GuiImage * p1GBAImg;
    GuiImage * p2GBAImg;
    GuiImage * p1LinkImg;
    GuiImage * p2LinkImg;
    GuiImage * p1Screen;
    GuiImage * p2Screen;
    GuiImage * globeImg;
    GuiImage * portsImg;
    GuiImage * c1Img;
    GuiImage * c1LinkImg;

    GuiText * playerTagText[2];
    GuiText * serverTagText;
    GuiText * controllerInstructions;
    GuiText * gbaInstructions;
};

#endif