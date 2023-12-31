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
    GuiImageData * p3GBA;
    GuiImageData * p4GBA;
    GuiImageData * p1Link;
    GuiImageData * p2Link;
    GuiImageData * p3Link;
    GuiImageData * p4Link;
    GuiImageData * ports;
    GuiImageData * globe;

    GuiImage * playerTagImg[4];
    GuiImage * p1GBAImg;
    GuiImage * p2GBAImg;
    GuiImage * p3GBAImg;
    GuiImage * p4GBAImg;
    GuiImage * p1LinkImg;
    GuiImage * p2LinkImg;
    GuiImage * p3LinkImg;
    GuiImage * p4LinkImg;
    GuiImage * p1Screen;
    GuiImage * p2Screen;
    GuiImage * p3Screen;
    GuiImage * p4Screen;
    GuiImage * globeImg;
    GuiImage * portsImg;

    GuiText * playerTagText[4];
    GuiText * serverTagText;
    GuiText * instructionsText;
};

#endif