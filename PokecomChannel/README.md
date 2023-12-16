# Pokecom Channel

This project contains two channels. 

1. Main Pokecom Channel
2. A test channel with minimal networking code, no ui, printf to screen and fewer dependencies. 

In the Main channel debug logs are limited to the logging UI which can be accessed with the minus button on the wii remote.

## Build

1. Install devkitpro (https://devkitpro.org/wiki/Getting_Started)
2. Install all the various wii development packages like `libogc` (if you get a build error you're probably missing a package). 
3. `cd PokecomChannel`
4. `make`

##  Banner / WAD editing

To create/modify the wad you can use CustomizeMii (https://wiibrew.org/wiki/CustomizeMii)

To modify banner animations you can use Benzin (https://github.com/HACKERCHANNEL/benzin)

TODO: as there are no in-date instructions on these tools I should probably make some sort of guide

## Converting audio

The following command can be used to convert and mp3 to a pcm. 
This may alter the speed, it's easiest just to modify the mp3 speed before conversion to compensate. 


`ffmpeg -i connecting.mp3 -f s16le -acodec pcm_s16be connecting.pcm`

## Licence 

The Pokecom Channel uses libgui 1.06 (https://github.com/dborth/libwiigui) and is therefore licenced under GPL-3. 

The NoUITestChannel shares the MIT licence with the other projects.

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

## TODO: 

- Domain Name Lookup. Currently only ipv4 addresses are supported. I wrote some code in tcpclient.cpp to resolve domain names but it's commented out because it crashed dolphin. 

