/****************************************************************************
 * libwiigui
 *
 * KittyPBoxx 2023
 *
 * gui_numpad.cpp
 *
 * GUI class definitions
 ***************************************************************************/

#include "gui.h"

#define NUMPAD_FONTSIZE 20

static char tmptxt[MAX_NUMPAD_DISPLAY+1];

static const char * GetDisplayText(const char * t)
{
	if(!t)
		return nullptr;

	strncpy(tmptxt, t, MAX_NUMPAD_DISPLAY);
	tmptxt[MAX_NUMPAD_DISPLAY] = '\0';
	return &tmptxt[0];
}

/**
 * Constructor for the GuiNumpad class.
 */

GuiNumpad::GuiNumpad(const char * numpadPromptTxt, char * t, u32 max)
{
    width = 200;
    height = 300;
	prompt = new GuiText(numpadPromptTxt, 16, (GXColor){255, 255, 255, 255});
	storedValue = t;

	alignmentHor = ALIGN_H::CENTRE;
	alignmentVert = ALIGN_V::MIDDLE;
	snprintf(numpadtextstr, max - 1, "%s", t);
	numpadtextmaxlen = max - 1;

    keys[0][0] = {'1'};
    keys[0][1] = {'2'};
    keys[0][2] = {'3'};
	keys[0][3] = {'.'};
	keys[0][4] = {'<'};

    keys[1][0] = {'4'};
    keys[1][1] = {'5'};
    keys[1][2] = {'6'};
	keys[1][3] = {':'};
	keys[1][4] = {'\0'};

    keys[2][0] = {'7'};
    keys[2][1] = {'8'};
    keys[2][2] = {'9'};
	keys[2][3] = {'0'};
	keys[2][4] = {'\0'};

    
	prompt->SetParent(this);
	prompt->SetPosition(18, -50);


	keyTextbox = new GuiImageData(keyboard_textbox_png);
	keyTextboxImg = new GuiImage(keyTextbox);
	keyTextboxImg->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::TOP);
	keyTextboxImg->SetPosition(100, 120);
    keyTextboxImg->SetParent(this);

	kbText = new GuiText(GetDisplayText(numpadtextstr), NUMPAD_FONTSIZE, (GXColor){0, 0, 0, 0xff});
	kbText->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::TOP);
	kbText->SetPosition(100, 133);
    kbText->SetParent(this);

	key = new GuiImageData(keyboard_key_png);
	keyOver = new GuiImageData(keyboard_key_over_png);

	keyTall = new GuiImageData(keyboard_key_tall_png);
	keyTallOver = new GuiImageData(keyboard_key_tall_over_png);

	keySoundOver = new GuiSound(button_over_pcm, button_over_pcm_size, SOUND::PCM);
	keySoundOver->SetVolume(10);
	keySoundClick = new GuiSound(keystroke_pcm, keystroke_pcm_size, SOUND::PCM);
	keySoundClick->SetVolume(10);

	trigA = new GuiTrigger;
	trigA->SetSimpleTrigger(-1, WPAD_BUTTON_A | WPAD_CLASSIC_BUTTON_A, PAD_BUTTON_A, WIIDRC_BUTTON_A);
	trig2 = new GuiTrigger;
	trig2->SetSimpleTrigger(-1, WPAD_BUTTON_2);

	char txt[1] = { 0 };

	for(int i=0; i<NUMPAD_ROWS; i++)
	{
		for(int j=0; j<NUMPAD_COLUMNS; j++)
		{

			if(keys[i][j] == '<')
			{
				txt[0] = keys[i][j];
				keyImg[i][j] = new GuiImage(keyTall);
				keyImgOver[i][j] = new GuiImage(keyTallOver);
				keyTxt[i][j] = new GuiText(" ", NUMPAD_FONTSIZE, (GXColor){0, 0, 0, 0xff});
				keyTxt[i][j]->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::MIDDLE);
				keyTxt[i][j]->SetPosition(0, 0);
				keyBtn[i][j] = new GuiButton(key->GetWidth(), key->GetHeight() * 3);
				keyBtn[i][j]->SetParent(this);
				keyBtn[i][j]->SetImage(keyImg[i][j]);
				keyBtn[i][j]->SetImageOver(keyImgOver[i][j]);
				keyBtn[i][j]->SetSoundOver(keySoundOver);
				keyBtn[i][j]->SetSoundClick(keySoundClick);
				keyBtn[i][j]->SetTrigger(trigA);
				keyBtn[i][j]->SetTrigger(trig2);
				keyBtn[i][j]->SetLabel(keyTxt[i][j]);
				keyBtn[i][j]->SetPosition(j*42+40+58, i*42+80+100);
				keyBtn[i][j]->SetEffectGrow();
			}
			else if(keys[i][j] != '\0')
			{
				txt[0] = keys[i][j];
				keyImg[i][j] = new GuiImage(key);
				keyImgOver[i][j] = new GuiImage(keyOver);
				keyTxt[i][j] = new GuiText(txt, NUMPAD_FONTSIZE, (GXColor){0, 0, 0, 0xff});
				keyTxt[i][j]->SetAlignment(ALIGN_H::CENTRE, ALIGN_V::BOTTOM);
				keyTxt[i][j]->SetPosition(0, -10);
				keyBtn[i][j] = new GuiButton(key->GetWidth(), key->GetHeight());
				keyBtn[i][j]->SetParent(this);
				keyBtn[i][j]->SetImage(keyImg[i][j]);
				keyBtn[i][j]->SetImageOver(keyImgOver[i][j]);
				keyBtn[i][j]->SetSoundOver(keySoundOver);
				keyBtn[i][j]->SetSoundClick(keySoundClick);
				keyBtn[i][j]->SetTrigger(trigA);
				keyBtn[i][j]->SetTrigger(trig2);
				keyBtn[i][j]->SetLabel(keyTxt[i][j]);
				keyBtn[i][j]->SetPosition(j*42+40+58, i*42+80+100);
				keyBtn[i][j]->SetEffectGrow();
			}
		}
	}
}

void GuiNumpad::Draw()
{
	if(!this->IsVisible())
		return;

    prompt->Draw();
    keyTextboxImg->Draw();
    kbText->Draw();

	for(int i=0; i<NUMPAD_ROWS; i++)
	{
		for(int j=0; j<NUMPAD_COLUMNS; j++)
		{
			if(keys[i][j] != '\0')
			{
				keyBtn[i][j]->Draw();
			}
		}
	}

	this->UpdateEffects();
}


/**
 * Destructor for the GuiKeyboard class.
 */
GuiNumpad::~GuiNumpad()
{
	delete prompt;
	delete kbText;
	delete keyTextbox;
	delete keyTextboxImg;
	delete key;
	delete keyOver;
	delete keyTall;
	delete keyTallOver;
	delete keyLarge;
	delete keyLargeOver;
	delete keySoundOver;
	delete keySoundClick;
	delete trigA;
	delete trig2;

	for(int i=0; i<NUMPAD_ROWS; i++)
	{
		for(int j=0; j<NUMPAD_COLUMNS; j++)
		{
			if(keys[i][j] != '\0')
			{
				delete keyImg[i][j];
				delete keyImgOver[i][j];
				delete keyTxt[i][j];
				delete keyBtn[i][j];
			}
		}
	}
}

void GuiNumpad::Update(GuiTrigger * t)
{
	for(int i=0; i<NUMPAD_ROWS; i++)
	{
		for(int j=0; j<NUMPAD_COLUMNS; j++)
		{
			if(keys[i][j] != '\0' && keys[i][j] != '<')
			{
				keyBtn[i][j]->Update(t);
				if(keyBtn[i][j]->GetState() == STATE::CLICKED)
				{
					size_t len = strlen(numpadtextstr);

					if(len < numpadtextmaxlen-1)
					{
						numpadtextstr[len] = keys[i][j];
						numpadtextstr[len+1] = '\0';
					}
					kbText->SetText(GetDisplayText(numpadtextstr));
					keyBtn[i][j]->ResetState();

					strncpy(storedValue, numpadtextstr, 31);
				}
			}
            else if (keys[i][j] == '<')
            {
				keyBtn[i][j]->Update(t);
				if(keyBtn[i][j]->GetState() == STATE::CLICKED)
				{
					size_t len = strlen(numpadtextstr);
					if(len > 0)
					{
						numpadtextstr[len-1] = '\0';
						kbText->SetText(GetDisplayText(numpadtextstr));
					}
					keyBtn[i][j]->ResetState();
					
					strncpy(storedValue, numpadtextstr, 31);
				}
            }
		}
	}

}
