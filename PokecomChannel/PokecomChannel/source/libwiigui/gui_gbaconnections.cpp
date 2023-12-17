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
    p3GBA = new GuiImageData(p3_gba_png);
    p4GBA = new GuiImageData(p4_gba_png);
    p1Link = new GuiImageData(p1_link_png);
    p2Link = new GuiImageData(p2_link_png);
    p3Link = new GuiImageData(p3_link_png);
    p4Link = new GuiImageData(p4_link_png);
    ports = new GuiImageData(port_png);
    globe = new GuiImageData(globe_png);

    playerTagImg[0] = new GuiImage(playerTag);
    playerTagImg[0]->SetPosition(8, 260);
    playerTagImg[0]->SetParent(this);
    playerTagImg[0]->Tint(-150,-150,-150);

    playerTagText[0] = new GuiText(gettext("connectionsUI.playerWaiting"), 12, (GXColor){230, 230, 230, 0xff});
	playerTagText[0]->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	playerTagText[0]->SetPosition(0, 0);
    playerTagText[0]->SetParent(playerTagImg[0]);

    HidePlayerTag(1);

    playerTagImg[1] = new GuiImage(playerTag);
    playerTagImg[1]->SetPosition(145, 260);
    playerTagImg[1]->SetParent(this);

    playerTagText[1] = new GuiText(gettext("connectionsUI.playerWaiting"), 12, (GXColor){230, 230, 230, 0xff});
	playerTagText[1]->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	playerTagText[1]->SetPosition(0, 0);
    playerTagText[1]->SetParent(playerTagImg[1]);

    HidePlayerTag(2);

    playerTagImg[2] = new GuiImage(playerTag);
    playerTagImg[2]->SetPosition(303, 260);
    playerTagImg[2]->SetParent(this);

    playerTagText[2] = new GuiText(gettext("connectionsUI.playerWaiting"), 12, (GXColor){230, 230, 230, 0xff});
	playerTagText[2]->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	playerTagText[2]->SetPosition(0, 0);
    playerTagText[2]->SetParent(playerTagImg[2]);

    HidePlayerTag(3);

    playerTagImg[3] = new GuiImage(playerTag);
    playerTagImg[3]->SetPosition(435, 260);
    playerTagImg[3]->SetParent(this);
    
    playerTagText[3] = new GuiText(gettext("connectionsUI.playerWaiting"), 12, (GXColor){230, 230, 230, 0xff});
	playerTagText[3]->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	playerTagText[3]->SetPosition(0, 0);
    playerTagText[3]->SetParent(playerTagImg[3]);

    HidePlayerTag(4);

    p1GBAImg = new GuiImage(p1GBA);
    p1GBAImg->SetPosition(20, 185);
    p1GBAImg->SetParent(this);
    p1GBAImg->SetAlpha(50);

    p2GBAImg = new GuiImage(p2GBA);
    p2GBAImg->SetPosition(155, 185);
    p2GBAImg->SetParent(this);
    p2GBAImg->SetAlpha(50);

    p3GBAImg = new GuiImage(p3GBA);
    p3GBAImg->SetPosition(313, 185);
    p3GBAImg->SetParent(this);
    p3GBAImg->SetAlpha(50);

    p4GBAImg = new GuiImage(p4GBA);
    p4GBAImg->SetPosition(442, 185);
    p4GBAImg->SetParent(this);
    p4GBAImg->SetAlpha(50);

    p1LinkImg = new GuiImage(p1Link);
    p1LinkImg->SetPosition(60, 115);
    p1LinkImg->SetParent(this);
    p1LinkImg->SetAlpha(50);

    p2LinkImg = new GuiImage(p2Link);
    p2LinkImg->SetPosition(195, 115);
    p2LinkImg->SetParent(this);
    p2LinkImg->SetAlpha(50);

    p3LinkImg = new GuiImage(p3Link);
    p3LinkImg->SetPosition(285, 115);
    p3LinkImg->SetParent(this);
    p3LinkImg->SetAlpha(50);

    p4LinkImg = new GuiImage(p4Link);
    p4LinkImg->SetPosition(305, 115);
    p4LinkImg->SetParent(this);
    p4LinkImg->SetAlpha(50);

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

    p3Screen = new GuiImage(32, 25, (GXColor){240, 240, 240, 255});
    p3Screen->ApplyBackgroundPattern();
    p3Screen->SetPosition(28, 29);
    p3Screen->SetParent(p3GBAImg);
    p3Screen->Tint(120,120,120);
    p3Screen->SetAlpha(0);

    p4Screen = new GuiImage(32, 25, (GXColor){240, 240, 240, 255});
    p4Screen->ApplyBackgroundPattern();
    p4Screen->SetPosition(28, 29);
    p4Screen->SetParent(p4GBAImg);
    p4Screen->Tint(120,120,120);
    p4Screen->SetAlpha(0);

    globeImg = new GuiImage(globe);
    globeImg->SetPosition(245, 35);
    globeImg->SetAlpha(200);
    globeImg->SetParent(this);


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

    instructionsText = new GuiText(gettext("connectionsUI.connectInstructions"), 24, (GXColor){70, 130, 180, 0xff});
    instructionsText->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
	instructionsText->SetPosition(0, 210);
    instructionsText->SetParent(globeImg);
    instructionsText->SetEffect(EFFECT::PLUSE, -3, 100);

}

void GuiGbaConnections::ConnectPlayer(int player) 
{
    instructionsText->SetVisible(false);

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

    if (player == 3)
    {
        p3GBAImg->SetAlpha(255);
        p3LinkImg->SetAlpha(255);
        p3LinkImg->Tint(-10, -10, 20);
        ShowPlayerTag(player);
        p3Screen->SetAlpha(220);
    }

    if (player == 4)
    {
        p4GBAImg->SetAlpha(255);
        p4LinkImg->SetAlpha(255);
        p4LinkImg->Tint(-10, -10, 20);
        ShowPlayerTag(player);
        p4Screen->SetAlpha(220);
    }
}

void GuiGbaConnections::SetPlayerName(int playerNo, char * name) 
{
    if (playerNo > 4 || playerNo < 1)
        return;

    playerTagText[playerNo - 1]->SetText(name);
}

void GuiGbaConnections::Draw()
{
	if(!this->IsVisible())
		return;

    playerTagImg[0]->Draw();
    playerTagImg[1]->Draw();
    playerTagImg[2]->Draw();
    playerTagImg[3]->Draw();

    playerTagText[0]->Draw();
    playerTagText[1]->Draw();
    playerTagText[2]->Draw();
    playerTagText[3]->Draw();

    p1GBAImg->Draw();
    p2GBAImg->Draw();
    p3GBAImg->Draw();
    p4GBAImg->Draw();

    p1LinkImg->Draw();
    p2LinkImg->Draw();
    p3LinkImg->Draw();
    p4LinkImg->Draw();

    p1Screen->Draw();
    p2Screen->Draw();
    p3Screen->Draw();
    p4Screen->Draw();

    globeImg->Draw();
    portsImg->Draw();

    serverTagText->Draw();

    instructionsText->Draw();

	this->UpdateEffects();
}

GuiGbaConnections::~GuiGbaConnections()
{
    delete playerTag;
    delete p1GBA;
    delete p2GBA;
    delete p3GBA;
    delete p4GBA;
    delete p1Link;
    delete p2Link;
    delete p3Link;
    delete p4Link;
    delete ports;
    delete globe;

    delete playerTagImg[0];
    delete playerTagImg[1];
    delete playerTagImg[2];
    delete playerTagImg[3];

    delete p1GBAImg;
    delete p2GBAImg;
    delete p3GBAImg;
    delete p4GBAImg;

    delete p1LinkImg;
    delete p2LinkImg;
    delete p3LinkImg;
    delete p4LinkImg;

    delete p1Screen;
    delete p2Screen;
    delete p3Screen;
    delete p4Screen;

    delete globeImg;
    delete portsImg;

}

void GuiGbaConnections::Update(GuiTrigger * t)
{
    (void) t;
}

void GuiGbaConnections::HidePlayerTag(int playerNo)
{
    if (playerNo > 4 || playerNo < 1)
        return;

    playerTagImg[playerNo - 1]->SetVisible(false);
    playerTagText[playerNo - 1]->SetVisible(false);
}

void GuiGbaConnections::ShowPlayerTag(int playerNo)
{
    if (playerNo > 4 || playerNo < 1)
        return;

    playerTagImg[playerNo - 1]->SetVisible(true);
    playerTagText[playerNo - 1]->SetVisible(true);

    instructionsText->SetVisible(false);
}