/* String to Pokemon Hex String conversion */
var charHex = new Map();
charHex.set(" "    , 0x00);
charHex.set("À"    , 0x01);
charHex.set("Á"    , 0x02);
charHex.set("Â"    , 0x03);
charHex.set("Ç"    , 0x04);
charHex.set("È"    , 0x05);
charHex.set("É"    , 0x06);
charHex.set("Ê"    , 0x07);
charHex.set("Ë"    , 0x08);
charHex.set("Ì"    , 0x09);
charHex.set("Î"    , 0x0B);
charHex.set("Ï"    , 0x0C);
charHex.set("Ò"    , 0x0D);
charHex.set("Ó"    , 0x0E);
charHex.set("Ô"    , 0x0F);
charHex.set("Œ"    , 0x10);
charHex.set("Ù"    , 0x11);
charHex.set("Ú"    , 0x12);
charHex.set("Û"    , 0x13);
charHex.set("Ñ"    , 0x14);
charHex.set("ß"    , 0x15);
charHex.set("à"    , 0x16);
charHex.set("á"    , 0x17);
charHex.set("ç"    , 0x19);
charHex.set("è"    , 0x1A);
charHex.set("é"    , 0x1B);
charHex.set("ê"    , 0x1C);
charHex.set("ë"    , 0x1D);
charHex.set("ì"    , 0x1E);
charHex.set("î"    , 0x20);
charHex.set("ï"    , 0x21);
charHex.set("ò"    , 0x22);
charHex.set("ó"    , 0x23);
charHex.set("ô"    , 0x24);
charHex.set("œ"    , 0x25);
charHex.set("ù"    , 0x26);
charHex.set("ú"    , 0x27);
charHex.set("û"    , 0x28);
charHex.set("ñ"    , 0x29);
charHex.set("º"    , 0x2A);
charHex.set("ª"    , 0x2B);
charHex.set("&"    , 0x2D);
charHex.set("+"    , 0x2E);
charHex.set("Lv"   , 0x34);
charHex.set("="    , 0x35);
charHex.set(";"    , 0x36);
charHex.set("¿"    , 0x51);
charHex.set("¡"    , 0x52);
charHex.set("pk"   , 0x53);
charHex.set("mn"   , 0x54);
charHex.set("po"   , 0x55);
charHex.set("ké"   , 0x56);
charHex.set("bl"   , 0x57);
charHex.set("oc"   , 0x58);
charHex.set("k"    , 0x59);
charHex.set("Í"    , 0x5A);
charHex.set("%"    , 0x5B);
charHex.set("("    , 0x5C);
charHex.set(")"    , 0x5D);
charHex.set("â"    , 0x68);
charHex.set("í"    , 0x6F);
charHex.set("U"    , 0x79);
charHex.set("D"    , 0x7A);
charHex.set("L"    , 0x7B);
charHex.set("R"    , 0x7C);
charHex.set("<"    , 0x85);
charHex.set(">"    , 0x86);
charHex.set("0"    , 0xA1);
charHex.set("1"    , 0xA2);
charHex.set("2"    , 0xA3);
charHex.set("3"    , 0xA4);
charHex.set("4"    , 0xA5);
charHex.set("5"    , 0xA6);
charHex.set("6"    , 0xA7);
charHex.set("7"    , 0xA8);
charHex.set("8"    , 0xA9);
charHex.set("9"    , 0xAA);
charHex.set("!"    , 0xAB);
charHex.set("?"    , 0xAC);
charHex.set("."    , 0xAD);
charHex.set("-"    , 0xAE);
charHex.set("·"    , 0xAF);
charHex.set("."    , 0xB0);
charHex.set("''"   , 0xB1);
charHex.set("'"    , 0xB2);
charHex.set("'"    , 0xB3);
charHex.set("'"    , 0xB4);
charHex.set("m"    , 0xB5);
charHex.set("f"    , 0xB6);
charHex.set("$"    , 0xB7);
charHex.set(","    , 0xB8);
charHex.set("x"    , 0xB9);   
charHex.set("/"    , 0xBA);
charHex.set("A"    , 0xBB);
charHex.set("B"    , 0xBC);
charHex.set("C"    , 0xBD);
charHex.set("D"    , 0xBE);
charHex.set("E"    , 0xBF);
charHex.set("F"    , 0xC0);
charHex.set("G"    , 0xC1);
charHex.set("H"    , 0xC2);
charHex.set("I"    , 0xC3);
charHex.set("J"    , 0xC4);
charHex.set("K"    , 0xC5);
charHex.set("L"    , 0xC6);
charHex.set("M"    , 0xC7);
charHex.set("N"    , 0xC8);
charHex.set("O"    , 0xC9);
charHex.set("P"    , 0xCA);
charHex.set("Q"    , 0xCB);
charHex.set("R"    , 0xCC);
charHex.set("S"    , 0xCD);
charHex.set("T"    , 0xCE);
charHex.set("U"    , 0xCF);
charHex.set("V"    , 0xD0);
charHex.set("W"    , 0xD1);
charHex.set("X"    , 0xD2);
charHex.set("Y"    , 0xD3);
charHex.set("Z"    , 0xD4);
charHex.set("a"    , 0xD5);
charHex.set("b"    , 0xD6);
charHex.set("c"    , 0xD7);
charHex.set("d"    , 0xD8);
charHex.set("e"    , 0xD9);
charHex.set("f"    , 0xDA);
charHex.set("g"    , 0xDB);
charHex.set("h"    , 0xDC);
charHex.set("i"    , 0xDD);
charHex.set("j"    , 0xDE);
charHex.set("k"    , 0xDF);
charHex.set("l"    , 0xE0);
charHex.set("m"    , 0xE1);
charHex.set("n"    , 0xE2);
charHex.set("o"    , 0xE3);
charHex.set("p"    , 0xE4);
charHex.set("q"    , 0xE5);
charHex.set("r"    , 0xE6);
charHex.set("s"    , 0xE7);
charHex.set("t"    , 0xE8);
charHex.set("u"    , 0xE9);
charHex.set("v"    , 0xEA);
charHex.set("w"    , 0xEB);
charHex.set("x"    , 0xEC);
charHex.set("y"    , 0xED);
charHex.set("z"    , 0xEE);
charHex.set(">"    , 0xEF);
charHex.set(":"    , 0xF0);
charHex.set("Ä"    , 0xF1);
charHex.set("Ö"    , 0xF2);
charHex.set("Ü"    , 0xF3);
charHex.set("ä"    , 0xF4);
charHex.set("ö"    , 0xF5);
charHex.set("ü"    , 0xF6);
//charHex.set("u"    , 0xF7);
//charHex.set("d"    , 0xF8);
//charHex.set("-"    , 0xF9); 
charHex.set("\\"   , 0xFA); // Scroll Prompt
charHex.set("\n"   , 0xFE); // New Line
charHex.set("END"  , 0xFF); // End of String


class StringHelper {

    static convertMessageToHex(message) {

        let hex = []
        message.split("").forEach(char => (charHex.get(char) != undefined) && hex.push(charHex.get(char)))
        hex.push(charHex.get("END"));
        return hex;
    
    }

    static asciiToByteArray(string) {
        return [...string].map(c => c.charCodeAt(0));
    }

    static byteArrayToAscii(arr) {
        return [...arr].map(c => String.fromCharCode(c)).join("");
    }
    
}

module.exports = StringHelper;