#ifndef LIBWIIGUI_IMAGEDATA_H
#define LIBWIIGUI_IMAGEDATA_H

//!Converts image data into GX-useable RGBA8. Currently designed for use only with PNG files
class GuiImageData {
public:
	//!Constructor
	//!Converts the image data to RGBA8 - expects PNG format
	//!\param i Image data
	//!\param w Max image width (0 = not set)
	//!\param h Max image height (0 = not set)
	GuiImageData(const u8 * i, int w = 0, int h = 0);
	//!Destructor
	~GuiImageData();
	//!Gets a pointer to the image data
	//!\return pointer to image data
	u8 * GetImage();
	//!Gets the image width
	//!\return image width
	int GetWidth();
	//!Gets the image height
	//!\return image height
	int GetHeight();
protected:
	u8 * data; //!< Image data
	int height; //!< Height of image
	int width; //!< Width of image
};

#endif
