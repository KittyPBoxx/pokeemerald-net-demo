### GAMECUBE  CHANNEL

This is a more experimental build of the channel for use on Gamecube (with a network adapter) rather than Wii. As gamecube network adapters hard to get hold of I, personally won't be testing this on authentic hardware. 

This version cannot perform DNS resolution so an ipv4 address must always be provided. If you are emulating be aware that, unlike with the wii, dolphin HLE will not reach a server running on the same machine by connecting to localhost (i.e you'll need to use the pc's address on the network).

The channel only provides support for 2 GBA's connected at once in port 2 and 3. Port 1 is reserved for a gamecube pad to allow controlling the channel. Port 4 is ignored. 'Y'  on the main menu will bring up the debug screen.


## libwiigui 1.06

This project uses libwiigui however there are a lot of modifications to make everything work nicely on gamecube.

https://github.com/dborth/libwiigui (Under GPL License)

libwiigui is a GUI library for the Wii, created to help structure the
design of a complicated GUI interface, and to enable an author to create
a sophisticated, feature-rich GUI. It was originally conceived and written
after I started to design a GUI for Snes9x GX, and found libwiisprite and
GRRLIB inadequate for the purpose. It uses GX for drawing, and makes use
of PNGU for displaying images and FreeTypeGX for text. It was designed to
be flexible and is easy to modify - don't be afraid to change the way it
works or expand it to suit your GUI's purposes! If you do, and you think
your changes might benefit others, please share them so they might be
added to the project!

### Credits

The original library was wholly designed and written by Tantric. 
Some modifications have been made by KittyPBoxx mostly for mp3 support,
and the ui for the numeric number pad.  
Thanks to the authors of PNGU and FreeTypeGX, of which this library makes use. 
Thanks also to the authors of GRRLIB and libwiisprite for laying the foundations.
Thanks to mvit for the artwork and Peter de Man for the music used in the
template.

## Resource Attribution

All graphics in the project are either part of libwiigui or created by me.

The following audio files are are from pixabay.com with the free non-commercial licence
- intro.wav (the banner screen jingle)
- connecting.mp3 
- fail.mp3
- keystroke.mp3
- success.mp3
- swish.mp3

The main background audio loop (bg_music.mp3) is the royalty free track 'Farty Mcsty' by Eric Matyas
(https://soundimage.org/)

