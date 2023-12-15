/****************************************************************************
 * libwiigui
 *
 * KittyPBoxx 2023
 *
 * gui_loader.cpp
 *
 * GUI class definitions
 ***************************************************************************/

#include "gui.h"

// Clamp a colour to 0 - 255
static int ClampColor(int col)
{
	if (col > 255)
		return 255;

	if (col < 0)
		return 0;

	return col;
}


GuiLoader::GuiLoader()
{
    width = 100;
    height = 100;

	alignmentHor = ALIGN_H::CENTRE;
	alignmentVert = ALIGN_V::MIDDLE;

    dot = new GuiImageData(loading_dot_png);

    for(int i=0; i<3; i++)
	{
		for(int j=0; j<3; j++)
		{

            dots[i][j] = new GuiImage(dot);
            dots[i][j]->SetPosition(j*15+5, i*15+5);
            dots[i][j]->SetAlpha(ClampColor((255 - (14*i)) - (26*j)));
            dots[i][j]->Tint(-15, -5, -2);
            dots[i][j]->SetEffect(EFFECT::PLUSE, -5, 100);
            dots[i][j]->SetParent(this);

        }

    }

}

void GuiLoader::Draw()
{
	if(!this->IsVisible())
		return;

	for(int i=0; i<3; i++)
	{
		for(int j=0; j<3; j++)
		{
			dots[i][j]->Draw();
		}
	}

	this->UpdateEffects();
}


GuiLoader::~GuiLoader()
{
	delete dot;

	for(int i=0; i<3; i++)
	{
		for(int j=0; j<3; j++)
		{
			delete dots[i][j];
		}
	}
}

void GuiLoader::Update(GuiTrigger * t)
{
    (void) t;
}