#ifndef LIBWIIGUI_SOUND_H
#define LIBWIIGUI_SOUND_H

//!Sound conversion and playback. A wrapper for other sound libraries - ASND, libmad, ltremor, etc
class GuiSound {
public:
	//!Constructor
	//!\param s Pointer to the sound data
	//!\param l Length of sound data
	//!\param t Sound format type (PCM)
	GuiSound(const u8 * s, s32 l, SOUND t);
	//!Destructor
	~GuiSound();
	//!Start sound playback
	void Play();
	//!Stop sound playback
	void Stop();
	//!Pause sound playback
	void Pause();
	//!Resume sound playback
	void Resume();
	//!Checks if the sound is currently playing
	//!\return true if sound is playing, false otherwise
	bool IsPlaying();
	//!Set sound volume
	//!\param v Sound volume (0-100)
	void SetVolume(int v);
	//!Set the sound to loop playback (unused)
	//!\param l Loop (true to loop)
	void SetLoop(bool l);
	void Loop(void);
	s32 GetVolume();
protected:
	const u8 * sound; //!< Pointer to the sound data
	SOUND type; //!< Sound format type (PCM)
	s32 length; //!< Length of sound data
	s32 voice; //!< Currently assigned ASND voice channel
	s32 volume; //!< Sound volume (0-100)
	bool loop; //!< Loop sound playback
};

#endif
