#include "global.h"
#include "gflib.h"
#include "berry.h"
#include "battle_tower.h"
#include "easy_chat.h"
#include "event_data.h"
#include "mail_data.h"
#include "mystery_event_script.h"
#include "pokedex.h"
#include "pokemon_size_record.h"
#include "script.h"
#include "strings.h"
#include "util.h"
#include "mystery_event_msg.h"
#include "pokemon_storage_system.h"

extern ScrCmdFunc gMysteryEventScriptCmdTable[];
extern ScrCmdFunc gMysteryEventScriptCmdTableEnd[];

#define LANGUAGE_MASK 0x1
#if defined(FIRERED)
#define VERSION_MASK 0x1
#elif defined(LEAFGREEN)
#define VERSION_MASK 0x2
#endif

EWRAM_DATA static struct ScriptContext sMysteryEventScriptContext = {0};

static bool32 CheckCompatibility(u16 a1, u32 a2, u16 a3, u32 a4)
{
    if (!(a1 & LANGUAGE_MASK))
        return FALSE;

    if (!(a2 & LANGUAGE_MASK))
        return FALSE;

    if (!(a3 & 0x1))
        return FALSE;

    if (!(a4 & VERSION_MASK))
        return FALSE;

    return TRUE;
}

static void SetIncompatible(void)
{
    StringExpandPlaceholders(gStringVar4, gText_MysteryGiftCantBeUsed);
    SetMysteryEventScriptStatus(3);
}

static void InitMysteryEventScript(struct ScriptContext *ctx, u8 *script)
{
    InitScriptContext(ctx, gMysteryEventScriptCmdTable, gMysteryEventScriptCmdTableEnd);
    SetupBytecodeScript(ctx, script);
    ctx->data[0] = (u32)script;
    ctx->data[1] = 0;
    ctx->data[2] = 0;
    ctx->data[3] = 0;
}

static bool32 RunMysteryEventScriptCommand(struct ScriptContext *ctx)
{
    if (RunScriptCommand(ctx) && ctx->data[3])
        return TRUE;
    else
        return FALSE;
}

void MEventScript_InitContext(u8 *script)
{
    InitMysteryEventScript(&sMysteryEventScriptContext, script);
}

bool32 MEventScript_Run(u32 *a0)
{
    bool32 ret = RunMysteryEventScriptCommand(&sMysteryEventScriptContext);
    *a0 = sMysteryEventScriptContext.data[2];

    return ret;
}

u32 RunMysteryEventScript(u8 *script)
{
    u32 ret;
    MEventScript_InitContext(script);
    while (MEventScript_Run(&ret));

    return ret;
}

void SetMysteryEventScriptStatus(u32 val)
{
    sMysteryEventScriptContext.data[2] = val;
}

bool8 MEScrCmd_end(struct ScriptContext *ctx)
{
    StopScript(ctx);
    return TRUE;
}

bool8 MEScrCmd_checkcompat(struct ScriptContext *ctx)
{
    u16 v1;
    u32 v2;
    u16 v3;
    u32 v4;

    ctx->data[1] = ScriptReadWord(ctx);
    v1 = ScriptReadHalfword(ctx);
    v2 = ScriptReadWord(ctx);
    v3 = ScriptReadHalfword(ctx);
    v4 = ScriptReadWord(ctx);

    if (CheckCompatibility(v1, v2, v3, v4) == TRUE)
        ctx->data[3] = 1;
    else
        SetIncompatible();

    return TRUE;
}

bool8 MEScrCmd_nop(struct ScriptContext *ctx)
{
    return FALSE;
}

bool8 MEScrCmd_setstatus(struct ScriptContext *ctx)
{
    u8 value = ScriptReadByte(ctx);
    ctx->data[2] = value;
    return FALSE;
}

bool8 MEScrCmd_setmsg(struct ScriptContext *ctx)
{
    u8 value = ScriptReadByte(ctx);
    u8 *str = (u8 *)(ScriptReadWord(ctx) - ctx->data[1] + ctx->data[0]);
    if (value == 0xFF || value == ctx->data[2])
        StringExpandPlaceholders(gStringVar4, str);
    return FALSE;
}

bool8 MEScrCmd_runscript(struct ScriptContext *ctx)
{
    u8 *script = (u8 *)(ScriptReadWord(ctx) - ctx->data[1] + ctx->data[0]);
    RunScriptImmediately(script);
    return FALSE;
}

bool8 MEScrCmd_setenigmaberry(struct ScriptContext *ctx)
{
    u8 *str;
    const u8 *message;
    bool32 haveBerry = IsEnigmaBerryValid();
    u8 *berry = (u8 *)(ScriptReadWord(ctx) - ctx->data[1] + ctx->data[0]);
    StringCopyN(gStringVar1, gSaveBlock1Ptr->enigmaBerry.berry.name, BERRY_NAME_LENGTH + 1);
    SetEnigmaBerry(berry);
    StringCopyN(gStringVar2, gSaveBlock1Ptr->enigmaBerry.berry.name, BERRY_NAME_LENGTH + 1);

    if (!haveBerry)
    {
        str = gStringVar4;
        message = gText_MysteryGiftBerry;
    }
    else if (StringCompare(gStringVar1, gStringVar2))
    {
        str = gStringVar4;
        message = gText_MysteryGiftBerryTransform;
    }
    else
    {
        str = gStringVar4;
        message = gText_MysteryGiftBerryObtained;
    }

    StringExpandPlaceholders(str, message);

    ctx->data[2] = 2;

    if (IsEnigmaBerryValid() == TRUE)
        VarSet(VAR_ENIGMA_BERRY_AVAILABLE, 1);
    else
        ctx->data[2] = 1;

    return FALSE;
}

bool8 MEScrCmd_giveribbon(struct ScriptContext *ctx)
{
    u8 index = ScriptReadByte(ctx);
    u8 ribbonId = ScriptReadByte(ctx);
    GiveGiftRibbonToParty(index, ribbonId);
    StringExpandPlaceholders(gStringVar4, gText_MysteryGiftSpecialRibbon);
    ctx->data[2] = 2;
    return FALSE;
}

bool8 MEScrCmd_initramscript(struct ScriptContext *ctx)
{
    u8 mapGroup = ScriptReadByte(ctx);
    u8 mapNum = ScriptReadByte(ctx);
    u8 objectId = ScriptReadByte(ctx);
    u8 *script = (u8 *)(ScriptReadWord(ctx) - ctx->data[1] + ctx->data[0]);
    u8 *scriptEnd = (u8 *)(ScriptReadWord(ctx) - ctx->data[1] + ctx->data[0]);
    InitRamScript(script, scriptEnd - script, mapGroup, mapNum, objectId);
    return FALSE;
}

bool8 MEScrCmd_givenationaldex(struct ScriptContext *ctx)
{
    EnableNationalPokedex();
    StringExpandPlaceholders(gStringVar4, gText_MysteryGiftNationalDex);
    ctx->data[2] = 2;
    return FALSE;
}

bool8 MEScrCmd_addrareword(struct ScriptContext *ctx)
{
    EnableRareWord(ScriptReadByte(ctx));
    StringExpandPlaceholders(gStringVar4, gText_MysteryGiftRareWord);
    ctx->data[2] = 2;
    return FALSE;
}

bool8 MEScrCmd_setrecordmixinggift(struct ScriptContext *ctx)
{
    SetIncompatible();
    ctx->data[3] = 0;
    return TRUE;
}

bool8 MEScrCmd_givepokemon(struct ScriptContext *ctx)
{
    struct Mail mail;
    struct Pokemon pokemon;
    u16 species;
    u16 heldItem;
    u32 data = ScriptReadWord(ctx) - ctx->data[1] + ctx->data[0];
    void *pokemonPtr = (void *)data;
    void *mailPtr = (void *)(data + sizeof(struct Pokemon));

    pokemon = *(struct Pokemon *)pokemonPtr;
    species = GetMonData(&pokemon, MON_DATA_SPECIES_OR_EGG);

    if (species == SPECIES_EGG)
        StringCopyN(gStringVar1, gText_EggNickname, POKEMON_NAME_LENGTH + 1);
    else
        StringCopyN(gStringVar1, gText_MenuPokemon, POKEMON_NAME_LENGTH + 1);

    if (gPlayerPartyCount == PARTY_SIZE)
    {
        StringExpandPlaceholders(gStringVar4, gText_MysteryGiftFullParty);
        ctx->data[2] = 3;
    }
    else
    {
        memcpy(&gPlayerParty[5], pokemonPtr, sizeof(struct Pokemon));
        memcpy(&mail, mailPtr, sizeof(struct Mail));

        if (species != SPECIES_EGG)
        {
            u16 pokedexNum = SpeciesToNationalPokedexNum(species);
            GetSetPokedexFlag(pokedexNum, FLAG_SET_SEEN);
            GetSetPokedexFlag(pokedexNum, FLAG_SET_CAUGHT);
        }

        heldItem = GetMonData(&gPlayerParty[5], MON_DATA_HELD_ITEM);
        if (ItemIsMail(heldItem))
            GiveMailToMon2(&gPlayerParty[5], &mail);
        CompactPartySlots();
        CalculatePlayerPartyCount();
        StringExpandPlaceholders(gStringVar4, gText_MysteryGiftSentOver);
        ctx->data[2] = 2;
    }

    return FALSE;
}

bool8 MEScrCmd_addtrainer(struct ScriptContext *ctx)
{
    u32 data = ScriptReadWord(ctx) - ctx->data[1] + ctx->data[0];
    memcpy(&gSaveBlock2Ptr->battleTower.ereaderTrainer, (void *)data, sizeof(struct BattleTowerEReaderTrainer));
    ValidateEReaderTrainer();
    StringExpandPlaceholders(gStringVar4, gText_MysteryGiftNewTrainer);
    ctx->data[2] = 2;
    return FALSE;
}

bool8 MEScrCmd_enableresetrtc(struct ScriptContext *ctx)
{
    SetIncompatible();
    ctx->data[3] = 0;
    return TRUE;
}

bool8 MEScrCmd_checksum(struct ScriptContext *ctx)
{
    int checksum = ScriptReadWord(ctx);
    u8 *data = (u8 *)(ScriptReadWord(ctx) - ctx->data[1] + ctx->data[0]);
    u8 *dataEnd = (u8 *)(ScriptReadWord(ctx) - ctx->data[1] + ctx->data[0]);
    if (checksum != CalcByteArraySum(data, dataEnd - data))
    {
        ctx->data[3] = 0;
        ctx->data[2] = 1;
    }
    return TRUE;
}

bool8 MEScrCmd_crc(struct ScriptContext *ctx)
{
    int crc = ScriptReadWord(ctx);
    u8 *data = (u8 *)(ScriptReadWord(ctx) - ctx->data[1] + ctx->data[0]);
    u8 *dataEnd = (u8 *)(ScriptReadWord(ctx) - ctx->data[1] + ctx->data[0]);
    if (crc != CalcCRC16(data, dataEnd - data))
    {
        ctx->data[3] = 0;
        ctx->data[2] = 1;
    }
    return TRUE;
}
