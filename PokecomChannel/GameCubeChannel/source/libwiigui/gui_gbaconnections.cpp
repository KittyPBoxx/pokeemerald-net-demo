/****************************************************************************
 * libwiigui
 *
 * KittyPBoxx 2023
 *
 * gui_gbaconnections.cpp
 *
 * GUI class definitions
 ***************************************************************************/

#include "gui.h"
#include "gettext.h"

GuiGbaConnections::GuiGbaConnections(char * serverName)
{
    width = 300;
    height = 400;

	alignmentHor = ALIGN_H::CENTRE;
	alignmentVert = ALIGN_V::MIDDLE;

    playerTag = new GuiImageData(player_tag_png);
    p1GBA = new GuiImageData(p1_gba_png);
    p2GBA = new GuiImageData(p2_gba_png);
    p1Link = new GuiImageData(p1_link_png);
    p2Link = new GuiImageData(p2_link_png);
    ports = new GuiImageData(port_png);
    globe = new GuiImageData(globe_png);
    c1 = new GuiImageData(c1_png);
    c1Link = new GuiImageData(c1_link_png);

    playerTagImg[0] = new GuiImage(playerTag);
    playerTagImg[0]->SetPosition(277, 260);
    playerTagImg[0]->SetParent(this);
    playerTagImg[0]->Tint(-150,-150,-150);

    playerTagText[0] = new GuiText(gettext("connectionsUI.playerWaiting"), 12, (GXColor){230, 230, 230, 0xff});
	playerTagText[0]->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	playerTagText[0]->SetPosition(0, 0);
    playerTagText[0]->SetParent(playerTagImg[0]);

    HidePlayerTag(1);

    playerTagImg[1] = new GuiImage(playerTag);
    playerTagImg[1]->SetPosition(412, 260);
    playerTagImg[1]->SetParent(this);

    playerTagText[1] = new GuiText(gettext("connectionsUI.playerWaiting"), 12, (GXColor){230, 230, 230, 0xff});
	playerTagText[1]->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	playerTagText[1]->SetPosition(0, 0);
    playerTagText[1]->SetParent(playerTagImg[1]);

    HidePlayerTag(2);

    p1GBAImg = new GuiImage(p1GBA);
    p1GBAImg->SetPosition(288, 185);
    p1GBAImg->SetParent(this);
    p1GBAImg->SetAlpha(50);

    p2GBAImg = new GuiImage(p2GBA);
    p2GBAImg->SetPosition(422, 185);
    p2GBAImg->SetParent(this);
    p2GBAImg->SetAlpha(50);

    p1LinkImg = new GuiImage(p1Link);
    p1LinkImg->SetPosition(260, 115);
    p1LinkImg->SetParent(this);
    p1LinkImg->SetAlpha(50);

    p2LinkImg = new GuiImage(p2Link);
    p2LinkImg->SetPosition(285, 115);
    p2LinkImg->SetParent(this);
    p2LinkImg->SetAlpha(50);

    p1Screen = new GuiImage(32, 25, (GXColor){240, 240, 240, 255});
    p1Screen->ApplyBackgroundPattern();
    p1Screen->SetPosition(28, 29);
    p1Screen->SetParent(p1GBAImg);
    p1Screen->Tint(120,120,120);
    p1Screen->SetAlpha(0);

    p2Screen = new GuiImage(32, 25, (GXColor){240, 240, 240, 255});
    p2Screen->ApplyBackgroundPattern();
    p2Screen->SetPosition(28, 29);
    p2Screen->SetParent(p2GBAImg);
    p2Screen->Tint(120,120,120);
    p2Screen->SetAlpha(0);

    globeImg = new GuiImage(globe);
    globeImg->SetPosition(245, 35);
    globeImg->SetAlpha(200);
    globeImg->SetParent(this);

    c1Img = new GuiImage(c1);
    c1Img->SetPosition(128, 185);
    c1Img->SetParent(this);
    c1Img->SetAlpha(175);

    c1LinkImg = new GuiImage(c1Link);
    c1LinkImg->SetPosition(170, 115);
    c1LinkImg->SetParent(this);
    c1LinkImg->Tint(-10, -10, 20);


    if(serverName[0] == '\0' || strcmp(serverName,gettext("connectionsUI.noServer")) == 0) 
	{
        strcpy( serverName, gettext("connectionsUI.noServer"));
        serverTagText = new GuiText(serverName, 14, (GXColor){255, 195, 0, 0xff});
	}
    else
    {
        globeImg->Tint(10, 10, 10);
        serverTagText = new GuiText(serverName, 14, (GXColor){70, 130, 180, 0xff});
    }
	serverTagText->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	serverTagText->SetPosition(0, 0);
    serverTagText->SetParent(globeImg);

    portsImg = new GuiImage(ports);
    portsImg->SetPosition(217, 85);
    portsImg->SetParent(this);
    portsImg->SetAlpha(150);

    controllerInstructions = new GuiText(gettext("connectionsUI.controllerInstructions"), 16, (GXColor){70, 130, 180, 0xff});
    controllerInstructions->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	controllerInstructions->SetPosition(0, 210);
    controllerInstructions->SetParent(globeImg);
    controllerInstructions->SetEffect(EFFECT::PLUSE, -3, 100);

    gbaInstructions = new GuiText(gettext("connectionsUI.gbaInstructions"), 16, (GXColor){70, 130, 180, 0xff});
    gbaInstructions->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	gbaInstructions->SetPosition(0, 230);
    gbaInstructions->SetParent(globeImg);
    gbaInstructions->SetEffect(EFFECT::PLUSE, -3, 100);

}

void GuiGbaConnections::ConnectPlayer(int player) 
{
    controllerInstructions->SetVisible(false);
    gbaInstructions->SetVisible(false);

    if (player == 1)
    {
        p1GBAImg->SetAlpha(255);
        p1LinkImg->SetAlpha(255);
        p1LinkImg->Tint(-10, -10, 20);
        ShowPlayerTag(player);
        p1Screen->SetAlpha(220);
    }

    if (player == 2)
    {
        p2GBAImg->SetAlpha(255);
        p2LinkImg->SetAlpha(255);
        p2LinkImg->Tint(-10, -10, 20);
        ShowPlayerTag(player);
        p2Screen->SetAlpha(220);
    }

}

void GuiGbaConnections::SetPlayerName(int playerNo, char * name) 
{
    if (playerNo > 2 || playerNo < 1)
        return;

    playerTagText[playerNo - 1]->SetText(name);
}

void GuiGbaConnections::SetServerName(char * name)
{
    globeImg->Tint(10, 10, 10);
    delete serverTagText;
    serverTagText = new GuiText(name, 14, (GXColor){70, 130, 180, 0xff});
    serverTagText->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	serverTagText->SetPosition(0, 0);
    serverTagText->SetParent(globeImg);
}

void GuiGbaConnections::Draw()
{
	if(!this->IsVisible())
		return;

    playerTagImg[0]->Draw();
    playerTagImg[1]->Draw();

    playerTagText[0]->Draw();
    playerTagText[1]->Draw();

    p1GBAImg->Draw();
    p2GBAImg->Draw();

    p1LinkImg->Draw();
    p2LinkImg->Draw();

    p1Screen->Draw();
    p2Screen->Draw();

    globeImg->Draw();
    portsImg->Draw();

    globeImg->Draw();
    portsImg->Draw();

    c1Img->Draw();
    c1LinkImg->Draw();

    serverTagText->Draw();

    controllerInstructions->Draw();
    gbaInstructions->Draw();

	this->UpdateEffects();
}

GuiGbaConnections::~GuiGbaConnections()
{
    delete playerTag;
    delete p1GBA;
    delete p2GBA;
    delete p1Link;
    delete p2Link;
    delete ports;
    delete globe;
    delete c1;
    delete c1Link;

    delete playerTagImg[0];
    delete playerTagImg[1];

    delete p1GBAImg;
    delete p2GBAImg;

    delete p1LinkImg;
    delete p2LinkImg;

    delete p1Screen;
    delete p2Screen;

    delete globeImg;
    delete portsImg;

    delete c1Img;
    delete c1LinkImg;

}

void GuiGbaConnections::Update(GuiTrigger * t)
{
    (void) t;
}

void GuiGbaConnections::HidePlayerTag(int playerNo)
{
    if (playerNo > 2 || playerNo < 1)
        return;

    playerTagImg[playerNo - 1]->SetVisible(false);
    playerTagText[playerNo - 1]->SetVisible(false);
}

void GuiGbaConnections::ShowPlayerTag(int playerNo)
{
    if (playerNo > 2 || playerNo < 1)
        return;

    playerTagImg[playerNo - 1]->SetVisible(true);
    playerTagText[playerNo - 1]->SetVisible(true);

    controllerInstructions->SetVisible(false);
    gbaInstructions->SetVisible(false);
}