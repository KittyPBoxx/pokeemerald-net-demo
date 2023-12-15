/****************************************************************************
 * libwiigui
 *
 * Tantric 2009
 *
 * gui_image.cpp
 *
 * GUI class definitions
 ***************************************************************************/

#include "gui.h"
/**
 * Constructor for the GuiImage class.
 */
GuiImage::GuiImage()
{
	image = nullptr;
	width = 0;
	height = 0;
	imageangle = 0;
	tile = -1;
	stripe = 0;
	imgType = IMAGE::DATA;
}

GuiImage::GuiImage(GuiImageData * img)
{
	image = nullptr;
	width = 0;
	height = 0;
	if(img)
	{
		image = img->GetImage();
		width = img->GetWidth();
		height = img->GetHeight();
	}
	imageangle = 0;
	tile = -1;
	stripe = 0;
	imgType = IMAGE::DATA;
}

GuiImage::GuiImage(u8 * img, int w, int h)
{
	image = img;
	width = w;
	height = h;
	imageangle = 0;
	tile = -1;
	stripe = 0;
	imgType = IMAGE::TEXTURE;
}

GuiImage::GuiImage(int w, int h, GXColor c)
{
	image = (u8 *)memalign (32, w * h << 2);
	width = w;
	height = h;
	imageangle = 0;
	tile = -1;
	stripe = 0;
	imgType = IMAGE::COLOR;

	if(!image)
		return;

	int x, y;

	for(y=0; y < h; ++y)
	{
		for(x=0; x < w; ++x)
		{
			this->SetPixel(x, y, c);
		}
	}
	int len = w * h << 2;
	if(len%32) len += (32-len%32);
	DCFlushRange(image, len);
}

/**
 * Destructor for the GuiImage class.
 */
GuiImage::~GuiImage()
{
	if(imgType == IMAGE::COLOR && image)
		free(image);
}

// Clamp a colour to 0 - 255
static int ClampColor(int col)
{
	if (col > 255)
		return 255;

	if (col < 0)
		return 0;

	return col;
}


u8 * GuiImage::GetImage()
{
	return image;
}

void GuiImage::SetImage(GuiImageData * img)
{
	image = nullptr;
	width = 0;
	height = 0;
	if(img)
	{
		image = img->GetImage();
		width = img->GetWidth();
		height = img->GetHeight();
	}
	imgType = IMAGE::DATA;
}

void GuiImage::SetImage(u8 * img, int w, int h)
{
	image = img;
	width = w;
	height = h;
	imgType = IMAGE::TEXTURE;
}

void GuiImage::SetAngle(float a)
{
	imageangle = a;
}

void GuiImage::SetTile(int t)
{
	tile = t;
}

GXColor GuiImage::GetPixel(int x, int y)
{
	if(!image || this->GetWidth() <= 0 || x < 0 || y < 0)
		return (GXColor){0, 0, 0, 0};

	u32 offset = (((y >> 2)<<4)*this->GetWidth()) + ((x >> 2)<<6) + (((y%4 << 2) + x%4 ) << 1);
	GXColor color;
	color.a = *(image+offset);
	color.r = *(image+offset+1);
	color.g = *(image+offset+32);
	color.b = *(image+offset+33);
	return color;
}

void GuiImage::SetPixel(int x, int y, GXColor color)
{
	if(!image || this->GetWidth() <= 0 || x < 0 || y < 0)
		return;

	u32 offset = (((y >> 2)<<4)*this->GetWidth()) + ((x >> 2)<<6) + (((y%4 << 2) + x%4 ) << 1);
	*(image+offset) = color.a;
	*(image+offset+1) = color.r;
	*(image+offset+32) = color.g;
	*(image+offset+33) = color.b;
}

void GuiImage::SetStripe(int s)
{
	stripe = s;
}

void GuiImage::ApplyBackgroundPattern()
{
	GXColor color;
	int x, y=0;
	int alt = 0;
	int normY=0;
	
	int thisHeight =  this->GetHeight();
	int thisWidth =  this->GetWidth();

	for(; y < thisHeight; ++y)
	{

		for(x=0; x < thisWidth; ++x)
		{

			// Apply a fade to top and bottom of the image
			if (y < (thisHeight / 2))
			{
				normY = (y * 255) / thisHeight;
			}
			else 
			{
				normY = ((thisHeight - y) * 255) / thisHeight;
			}

			
			// Add the stripe
			if(y % 4 == 0)
				alt ^= 1;

			if (alt)
			{
				normY -= 5;
			}
			else 
			{
				normY += 5;
			}

			// clamp the values within a range
			if (alt != 0)
			{
				if (normY > 25)
					normY = 25;
			} 
			else
			{
				if (normY > 30)
					normY = 30;
			}

			if (normY < 5)
				normY = 5;

			color = GetPixel(x, y);
			color.r = normY;
			color.g = normY;
			color.b = normY + 3; // Slight blue tint
			color.a = 255;
			SetPixel(x, y, color);

		}
	}
}

void GuiImage::Tint(int r, int g, int b)
{
	GXColor color;
	int x, y=0;
	
	int thisHeight =  this->GetHeight();
	int thisWidth =  this->GetWidth();

	for(; y < thisHeight; ++y)
	{

		for(x=0; x < thisWidth; ++x)
		{
			color = GetPixel(x, y);
			color.r = ClampColor(color.r + r);
			color.g = ClampColor(color.g + g);
			color.b = ClampColor(color.b + b);
			color.a = color.a;
			SetPixel(x, y, color);

		}
	}
}

/**
 * Draw the button on screen
 */
void GuiImage::Draw()
{
	if(!image || !this->IsVisible() || tile == 0)
		return;

	float currScaleX = this->GetScaleX();
	float currScaleY = this->GetScaleY();
	int currLeft = this->GetLeft();
	int thisTop = this->GetTop();

	if(tile > 0)
	{
		int alpha = this->GetAlpha();
		for(int i=0; i<tile; ++i)
		{
			Menu_DrawImg(currLeft+width*i, thisTop, width, height, image, imageangle, currScaleX, currScaleY, alpha);
		}
	}
	else
	{
		Menu_DrawImg(currLeft, thisTop, width, height, image, imageangle, currScaleX, currScaleY, this->GetAlpha());
	}

	if(stripe > 0)
	{
		int thisHeight = this->GetHeight();
		int thisWidth = this->GetWidth();
		for(int y=0; y < thisHeight; y+=6)
			Menu_DrawRectangle(currLeft,thisTop+y,thisWidth,3,(GXColor){0, 0, 0, (u8)stripe},1);
	}
	this->UpdateEffects();
}