/****************************************************************************
 * libwiigui Template
 * Tantric 2009
 *
 * audio.cpp
 * Audio support
 ***************************************************************************/

#include <gccore.h>
#include <ogcsys.h>
#include <asndlib.h>
#include <mp3player.h>

/****************************************************************************
 * InitAudio
 *
 * Initializes the Wii's audio subsystem
 ***************************************************************************/
void InitAudio()
{
	ASND_Init();
	ASND_Pause(0);
}

/****************************************************************************
 * ShutdownAudio
 *
 * Shuts down audio subsystem. Useful to avoid unpleasant sounds if a
 * crash occurs during shutdown.
 ***************************************************************************/
void ShutdownAudio()
{
	ASND_Pause(1);
	ASND_End();
}
