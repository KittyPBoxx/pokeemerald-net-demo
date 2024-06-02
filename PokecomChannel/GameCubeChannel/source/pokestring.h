/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * pokestring.h
 * Util for converting string representations from pokemon to c strings
 ***************************************************************************/

/* Special pokemon symbols like Lv (for level) will be converted to ? */
 static inline char byteToChar(char byte)
 {
    switch (byte) 
    {
        case 0x00: return ' ';
        case 0x01: return 'A'; //À
        case 0x02: return 'A'; //Á
        case 0x03: return 'A'; //Â
        case 0x04: return 'C'; //Ç
        case 0x05: return 'E'; //È
        case 0x06: return 'E'; //É
        case 0x07: return 'E'; //Ê
        case 0x08: return 'E'; //Ë
        case 0x09: return 'I'; //Ì
        case 0x0B: return 'I'; //Î
        case 0x0C: return 'I'; //Ï
        case 0x0D: return 'O'; //Ò
        case 0x0E: return 'O'; //Ó
        case 0x0F: return 'O'; //Ô
        case 0x10: return 'C'; //Œ
        case 0x11: return 'U'; //Ù
        case 0x12: return 'U'; //Ú
        case 0x13: return 'U'; //Û
        case 0x14: return 'N'; //Ñ
        case 0x15: return 'B'; //ß
        case 0x16: return 'a'; //à
        case 0x17: return 'a'; //á
        case 0x19: return 'c'; //ç
        case 0x1A: return 'e'; //è
        case 0x1B: return 'e'; //é
        case 0x1C: return 'e'; //ê
        case 0x1D: return 'e'; //ë
        case 0x1E: return 'i'; //ì
        case 0x20: return 'i'; //î
        case 0x21: return 'i'; //ï
        case 0x22: return 'o'; //ò
        case 0x23: return 'o'; //ó
        case 0x24: return 'o'; //ô
        case 0x25: return 'o'; //œ
        case 0x26: return 'u'; //ù
        case 0x27: return 'u'; //ú
        case 0x28: return 'u'; //û
        case 0x29: return 'n'; //ñ
        case 0x2A: return 'o'; //º
        case 0x2B: return 'a';  //ª
        case 0x2D: return '&';
        case 0x2E: return '+';
        case 0x34: return '?'; //Lv
        case 0x35: return '=';
        case 0x36: return ';';
        case 0x51: return '?'; //¿
        case 0x52: return '!'; //¡
        case 0x53: return '?'; //pk
        case 0x54: return '?'; //mn
        case 0x55: return '?'; //po
        case 0x56: return '?'; //ke
        case 0x57: return '?'; //bl
        case 0x58: return '?'; //oc
        case 0x59: return 'k';
        case 0x5A: return 'I'; //Í
        case 0x5B: return '%';
        case 0x5C: return '(';
        case 0x5D: return ')';
        case 0x68: return 'a'; //â
        case 0x6F: return 'i'; //í
        case 0x79: return 'U';
        case 0x7A: return 'D';
        case 0x7B: return 'L';
        case 0x7C: return 'R';
        case 0x85: return '<';
        case 0x86: return '>';
        case 0xA1: return '0';
        case 0xA2: return '1';
        case 0xA3: return '2';
        case 0xA4: return '3';
        case 0xA5: return '4';
        case 0xA6: return '5';
        case 0xA7: return '6';
        case 0xA8: return '7';
        case 0xA9: return '8';
        case 0xAA: return '9';
        case 0xAB: return '!';
        case 0xAC: return '?';
        case 0xAD: return '.';
        case 0xAE: return '-';
        case 0xAF: return '.'; //·
        case 0xB0: return '.';
        case 0xB1: return '\'';
        case 0xB2: return '\'';
        case 0xB3: return '\'';
        case 0xB4: return '\'';
        case 0xB5: return 'm';
        case 0xB6: return 'f';
        case 0xB7: return '$';
        case 0xB8: return ',';
        case 0xB9: return 'x';
        case 0xBA: return '/';
        case 0xBB: return 'A';
        case 0xBC: return 'B';
        case 0xBD: return 'C';
        case 0xBE: return 'D';
        case 0xBF: return 'E';
        case 0xC0: return 'F';
        case 0xC1: return 'G';
        case 0xC2: return 'H';
        case 0xC3: return 'I';
        case 0xC4: return 'J';
        case 0xC5: return 'K';
        case 0xC6: return 'L';
        case 0xC7: return 'M';
        case 0xC8: return 'N';
        case 0xC9: return 'O';
        case 0xCA: return 'P';
        case 0xCB: return 'Q';
        case 0xCC: return 'R';
        case 0xCD: return 'S';
        case 0xCE: return 'T';
        case 0xCF: return 'U';
        case 0xD0: return 'V';
        case 0xD1: return 'W';
        case 0xD2: return 'X';
        case 0xD3: return 'Y';
        case 0xD4: return 'Z';
        case 0xD5: return 'a';
        case 0xD6: return 'b';
        case 0xD7: return 'c';
        case 0xD8: return 'd';
        case 0xD9: return 'e';
        case 0xDA: return 'f';
        case 0xDB: return 'g';
        case 0xDC: return 'h';
        case 0xDD: return 'i';
        case 0xDE: return 'j';
        case 0xDF: return 'k';
        case 0xE0: return 'l';
        case 0xE1: return 'm';
        case 0xE2: return 'n';
        case 0xE3: return 'o';
        case 0xE4: return 'p';
        case 0xE5: return 'q';
        case 0xE6: return 'r';
        case 0xE7: return 's';
        case 0xE8: return 't';
        case 0xE9: return 'u';
        case 0xEA: return 'v';
        case 0xEB: return 'w';
        case 0xEC: return 'x';
        case 0xED: return 'y';
        case 0xEE: return 'z';
        case 0xEF: return '>';
        case 0xF0: return ':';
        case 0xF1: return 'A'; //Ä
        case 0xF2: return 'O'; //Ö
        case 0xF3: return 'U'; //Ü
        case 0xF4: return 'a'; //ä
        case 0xF5: return 'o'; //ö
        case 0xF6: return 'u'; //ü
        case 0xF7: return 'u'; 
        case 0xF8: return 'd';
        case 0xF9: return 'l';
        case 0xFE: return '\\';
        case 0xFF: return '\0'; // EOS
        default: return '~'; // We don't know what the character is
    }
 }

 /* Replaces pokemon char bytes in char array with ascii equivilents */
static void bytesToChars(char* bytes, u16 offset, u16 length)
{
    u16 i;
    for (i = offset; i < (length + offset); i++)
    {
        bytes[i] = byteToChar(bytes[i]);
    }
}

/* Checks that the string contains only expected characters */
static int validatePokeStringMsg(char* bytes, u16 offset, u16 length)
{
    u16 i;
    for (i = offset; i < (length + offset); i++)
    {
        if (byteToChar(bytes[i]) == '~')
            return 0;
    }

    return 1;
}