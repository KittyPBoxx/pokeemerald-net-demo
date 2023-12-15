# Pokecom Channel

This project contains two channels. 

1. Main Pokecom Channel
2. A test channel with minimal networking code, no ui and fewer dependencies. 

# Build

1. Install devkitpro (https://devkitpro.org/wiki/Getting_Started) and all the various wii development packages (if you get a build error you're probably missing a package)
2. `cd PokecomChannel`
3. `make`

#  Banner / WAD editing

To create/modify the wad you can use CustomizeMii (https://wiibrew.org/wiki/CustomizeMii)

To modify banner animations you can use Benzin (https://github.com/HACKERCHANNEL/benzin)

TODO: as there are no in-date instructions on these tools I should probably make some sort of guide

# Licence 

The Pokecom Channel uses libgui 1.06 (https://github.com/dborth/libwiigui) and is therefore licenced under GPL-3. 
The NoUITestChannel shares the MIT licence with the other projects.

# Resource Attribution

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
