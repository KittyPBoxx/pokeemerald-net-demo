#include "global.h"
#include "string_util.h"
#include "text.h"
#include "menu.h"
#include "main.h"
#include "task.h"
#include "link.h"
#include "data.h"
#include "event_data.h"
#include "script.h"
#include "field_message_box.h"
#include "libgcnmultiboot.h"
#include "gpu_regs.h"
#include "net_conn.h"
#include "constants/network.h"
#include "battle_tower.h"
#include "constants/trainers.h"
#include "constants/moves.h"
#include "shop.h"
#include "constants/items.h"
#include "field_message_box.h"
#include "easy_chat.h"
#include "mail.h"
#include "item_menu.h"
#include "overworld.h"

// Player name + 1 + Gender + Special Warp Flag + Trainer ID)
#define PLAYER_INFO_LENGTH (PLAYER_NAME_LENGTH + 1 + 1 + 1 + TRAINER_ID_LENGTH)

#define WELCOME_MSG_LENGTH 48

#define NET_GAME_NAME_LENGTH 20
static const u8 sNetGameName[] = _("Emerald Net 0.1.3   ");

#define NET_SERVER_ADDR_LENGTH 14
static const u8 sNetServerAddr[] = _("127.0.0.1:9000");

#define SERVER_NAME_LENGTH 13
static const u8 sServerName[] = _("INCOMMING...\n");

#define DOWNLOAD_TRAINER_PARTY_SIZE 3
#define DOWNLOAD_TRAINER_POKEMON_SIZE 16

#define DOWNLOAD_MART_SIZE 6

static const u8 sDot[] = _("·");
static const u8 sWaitingMessage[] = _("Connecting To Server:");
static const u8 sExchangeMessage[] = _("Partner Found! Link starting:");

static const u8 trainerName[] = _("NET");

static const u16 sLinkProfileWords[EASY_CHAT_BATTLE_WORDS_COUNT - 4] = {
    EC_WORD_FRIEND,
    EC_WORD_LINK
};

static void Task_StartNetworkTask(u8 taskId);
static void Task_NetworkTaskLoop(u8 taskId);
static bool32 CheckLinkCanceled(u8 taskId);
static void NetConnResetSerial(void);
static void NetConnEnableSerial(void);
static void NetConnDisableSerial(void);

// NET_CONN_START_LINK_FUNC
static void SetupForLinkTask();
static void Task_LinkupCancel(u8 taskId);
static void Task_LinkupProcess(u8 taskId);
static void Task_EndLinkupConnection(u8 taskId);

// NET_CONN_START_BATTLE_FUNC <---- This example has some comments to explain what is happening 
static void SetupForDownloadBattleTask();
static void Task_DownloadBattleCancel(u8 taskId);
static void Task_DownloadBattleProcess(u8 taskId);
static void Task_EndDownloadBattleConnection(u8 taskId);

// NET_CONN_START_MART_FUNC
static void SetupForOnlineMartTask();
static void Task_OnlineMartCancel(u8 taskId);
static void Task_OnlineMartProcess(u8 taskId);
static void Task_EndOnlineMartConnection(u8 taskId);

// NET_CONN_START_EGG_FUNC
static void SetupForGiftEggTask();
static void Task_GiftEggCancel(u8 taskId);
static void Task_GiftEggProcess(u8 taskId);
static void Task_EndGiftEggConnection(u8 taskId);

// NET_CONN_TRADE_FUNC
static void SetupForTradeTask();
static void Task_TradeCancel(u8 taskId);
static void Task_TradeProcess(u8 taskId);
static void Task_EndTradeConnection(u8 taskId);

// NET_CONN_RETRY_TRADE_FUNC
static void SetupRetryTradeTask();

// NET_CONN_POST_MAIL
static void SetupForPostMailTask();
static void Task_PostMailCancel(u8 taskId);
static void Task_PostMailProcess(u8 taskId);
static void Task_EndPostMailConnection(u8 taskId);

// NET_CONN_READ_MAIL
static void SetupForReadMailTask();
static void Task_ReadMailCancel(u8 taskId);
static void Task_ReadMailProcess(u8 taskId);
static void Task_EndReadMailConnection(u8 taskId);

static void DoTransferDataBlock(u8 taskId);
static void DoReceiveDataBlock(u8 taskId);

void xfer16(u16 data1, u16 data2, u8 taskId);
void xfer32(u32 data, u8 taskId);
u32 recv32(u8 taskId);
void waitForTransmissionFinish(u8 taskId, u16 readOrWriteFlag); // i.e JOY_READ or JOY_WRITE

// WARNING! configureSendRecvMgrChunked has only been tested sending multiples of 16 bytes. 
// It should work correctly sending any amount of data, this is just and FYI you will be running untested code if you don't send mutiples of 16 

/*
* In the chunked version messages are split into chunks and verified separately. This adds some overhead 
* as more verification messages need to be sent. However it reduces the amount of data we need to discard if there is an issue.
* As a rule of thumb if you are sending 16 bytes or less don't use chunked. If you are sending more, then chunk to 16 byte blocks.
*/
void configureSendRecvMgr(u16 cmd, vu32 * dataStart, u16 length, u8 state, u8 nextProcessStep);
void configureSendRecvMgrChunked(u16 cmd, vu32 * dataStart, u16 length, u8 state, u8 nextProcessStep, u8 chunkSize);

enum {
    NET_CONN_STATE_INIT = 0,
    NET_CONN_STATE_SEND,
    NET_CONN_STATE_RECEIVE,
    NET_CONN_STATE_PROCESS,
    NET_CONN_STATE_ERROR,
    NET_CONN_STATE_DONE
};

struct SendRecvMgr
{
    u8 state;              // The state of the current connection (e.g is is sending data, receiving data e.t.c)
    vu32 *dataStart;       // Payload source or destination
    u16 length;            // Length of payload
    u16 cmd;               // The command to send to the wii
    bool8 allowCancel;     // If 'B' can be pressed to end the current conneciton
    TaskFunc onProcess;    // The connection loop will branch to this after each action to check what to do next
    TaskFunc onCancel;     // What to do if the player cancels the connection (or there is an error/connection lost)
    TaskFunc onFinish;     // What to do when the connection ends in the expected way
    u8 nextProcessStep;    // State specific to the current network task that's running i.e (so onProcess change behaviour depending on the current step) 
    s8 retriesLeft;        // Number of times left to retry the current connection
    u8 retryPoint;         // Where to pick up from when doing a retry 
    bool8 disableChecks;   // If true all msg check bytes will be ignored. Turning this off is a bad idea unless you're A) only sending a 32 bit value /  B) need speed over accuracy and can ignore junk
    u8 repeatedStepCount;  // Times we've sucessfully sequentially done a process step. Allows for steps the need to run x many times / large transfers that need to be spit 
};
static struct SendRecvMgr sSendRecvMgr;

static void (* const sNetConnFunctions[])(void) =
{
    [NET_CONN_START_LINK_FUNC]    = SetupForLinkTask,
    [NET_CONN_START_BATTLE_FUNC]  = SetupForDownloadBattleTask,
    [NET_CONN_START_MART_FUNC]    = SetupForOnlineMartTask,
    [NET_CONN_START_EGG_FUNC]     = SetupForGiftEggTask,
    [NET_CONN_TRADE_FUNC]         = SetupForTradeTask,
    [NET_CONN_RETRY_TRADE_FUNC]   = SetupRetryTradeTask,
    [NET_CONN_POST_MAIL]          = SetupForPostMailTask,
    [NET_CONN_READ_MAIL]          = SetupForReadMailTask
};

void CallNetworkFunction(void)
{
    if (sSendRecvMgr.state == 0)
        CpuFill32(0, &sSendRecvMgr, sizeof(sSendRecvMgr));

    sNetConnFunctions[gSpecialVar_0x8004]();

    if (FindTaskIdByFunc(Task_NetworkTaskLoop) == TASK_NONE)
        CreateTask(Task_NetworkTaskLoop, 80);
}

static u8 DoWaitTextAnimation(u16 duration, const u8 message[])
{
    if (sSendRecvMgr.repeatedStepCount == 0)
    {
        LoadMessageBoxAndFrameGfx(0, TRUE);
        VBlankIntrWait(); VBlankIntrWait();
        AddTextPrinterParameterized(0, FONT_NORMAL, message, 0, 1, 0, NULL);
        sSendRecvMgr.repeatedStepCount++;
    }
    else if (sSendRecvMgr.repeatedStepCount <= duration)
    {
        VBlankIntrWait(); VBlankIntrWait();
        if (sSendRecvMgr.repeatedStepCount % 10 == 0)
        {
            AddTextPrinterParameterized(0, FONT_NORMAL, sDot, ((sSendRecvMgr.repeatedStepCount - 1) * 8) / 10, 16, 0, NULL);
        }
        sSendRecvMgr.repeatedStepCount++;
    }
    else
    {
        sSendRecvMgr.repeatedStepCount = 0;
        return 1;
    }
    return 0;
}


static void Task_NetworkTaskLoop(u8 taskId)
{
    if (CheckLinkCanceled(taskId) == TRUE)
        sSendRecvMgr.state = NET_CONN_STATE_ERROR;

    switch (sSendRecvMgr.state)
    {
        case NET_CONN_STATE_INIT:
            if (REG_RCNT != R_JOYBUS)
                NetConnResetSerial();

            SetSuppressLinkErrorMessage(TRUE);
            sSendRecvMgr.state = NET_CONN_STATE_PROCESS;
            break;
        case NET_CONN_STATE_SEND:
            DoTransferDataBlock(taskId);
            break;
        case NET_CONN_STATE_RECEIVE:
            DoReceiveDataBlock(taskId);
            break;
        case NET_CONN_STATE_PROCESS: 
            gTasks[taskId].func = sSendRecvMgr.onProcess;
            break;
        case NET_CONN_STATE_ERROR:
            JOY_TRANS = 0;
            if (--sSendRecvMgr.retriesLeft < 0)
            {
                gTasks[taskId].func = sSendRecvMgr.onCancel;
            }
            else
            {   
                sSendRecvMgr.state = 0;
                sSendRecvMgr.nextProcessStep = sSendRecvMgr.retryPoint;
                if (sSendRecvMgr.repeatedStepCount > 0) sSendRecvMgr.repeatedStepCount--;
                NetConnResetSerial();
            }
            break;
        case NET_CONN_STATE_DONE:
        default:
            gTasks[taskId].func = sSendRecvMgr.onFinish;
            break;
    }
}

static bool32 CheckLinkCanceled(u8 taskId)
{
    if (((JOY_NEW(B_BUTTON)) || JOY_HELD(B_BUTTON)) && sSendRecvMgr.allowCancel == TRUE)
    {
        sSendRecvMgr.retriesLeft = RETRIES_LEFT_CANCEL + 1;
        gTasks[taskId].func = sSendRecvMgr.onCancel;
        return TRUE;
    }
    return FALSE;
}

static void NetConnDisableSerial(void)
{
    sSendRecvMgr.state = NET_CONN_STATE_INIT;

    // I have no idea if his is the proper way to end the link  ¯\_(ツ)_/¯
    DisableInterrupts(INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL);
    REG_SIOCNT = SIO_MULTI_MODE;
    REG_TMCNT_H(3) = 0;
    REG_IF = INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL;
    JOY_TRANS = 0;

    // This seems to cause a moment of lag with mgba in TCP mode but not integrated. So possibly a latency issue.  
    REG_RCNT = 0; 
}

static void NetConnEnableSerial(void)
{
    DisableInterrupts(INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL);
    REG_RCNT = R_JOYBUS;
    EnableInterrupts(INTR_FLAG_VBLANK | INTR_FLAG_VCOUNT | INTR_FLAG_TIMER3 | INTR_FLAG_SERIAL); // These may not all be needed? needs checking
}

static void NetConnResetSerial(void) 
{
    NetConnDisableSerial();
    NetConnEnableSerial();
}

static void DoTransferDataBlock(u8 taskId)
{
    u32 i = 0;
    u8 * dataStart;
    u16 checkBytes = 0xFFFF;
    u8 transBuff[4];
    u32 resBuff = 0;

    JOY_CNT |= JOY_RW;
    for (i = 0; JOY_CNT&JOY_READ && i <= MAX_CONNECTION_LOOPS; i++) 
    { 
        /* Wait for the connection to become ready */ 
        if (CheckLinkCanceled(taskId) == TRUE || i == MAX_CONNECTION_LOOPS)
        {
            sSendRecvMgr.state = NET_CONN_STATE_ERROR;
            return;
        }

    }

    xfer16(sSendRecvMgr.cmd, sSendRecvMgr.length, taskId);
    checkBytes ^= sSendRecvMgr.cmd;
    checkBytes ^= sSendRecvMgr.length;

    if (sSendRecvMgr.state == NET_CONN_STATE_ERROR)
        return;

    dataStart = (u8 *) sSendRecvMgr.dataStart;

    for(i = 0; i < sSendRecvMgr.length; i+=4)
    {
        transBuff[0] = dataStart[i];
        transBuff[1] = i + 1 < sSendRecvMgr.length ? dataStart[i + 1] : 0;
        transBuff[2] = i + 2 < sSendRecvMgr.length ? dataStart[i + 2] : 0;
        transBuff[3] = i + 3 < sSendRecvMgr.length ? dataStart[i + 3] : 0;

        xfer32((u32) (transBuff[0] + (transBuff[1] << 8) + (transBuff[2] << 16) + (transBuff[3] << 24)), taskId);

        if (sSendRecvMgr.state == NET_CONN_STATE_ERROR)
            return;

        checkBytes ^= (u16) (transBuff[0] + (transBuff[1] << 8));
        checkBytes ^= (u16) (transBuff[2] + (transBuff[3] << 8));

    }
    
    resBuff = recv32(taskId);

    if (sSendRecvMgr.disableChecks || (resBuff ^ (u32) ((NET_CONN_CHCK_RES << 16) | (checkBytes & 0xFFFF))) == 0)
    {
        JOY_TRANS = 0;
        sSendRecvMgr.state = NET_CONN_STATE_PROCESS;
    }
    else
    {
        for (i = 0; i < 300; i++) {}
    }
}

static void DoReceiveDataBlock(u8 taskId)
{
    u32 i = 0;
    u8 * dataStart;
    u16 checkBytes = 0xFFFF;
    u8 transBuff[4];
    u32 resBuff = 0;

    JOY_CNT |= JOY_RW;
    for (i = 0; JOY_CNT&JOY_READ && i <= MAX_CONNECTION_LOOPS; i++) 
    { 
        /* Wait for the connection to become ready */ 
        if (CheckLinkCanceled(taskId) == TRUE || i == MAX_CONNECTION_LOOPS)
        {
            sSendRecvMgr.state = NET_CONN_STATE_ERROR;
            return;
        }

    }

    xfer16(sSendRecvMgr.cmd, (u16) sSendRecvMgr.length, taskId);

    if (sSendRecvMgr.state == NET_CONN_STATE_ERROR)
        return;

    dataStart = (u8 *) sSendRecvMgr.dataStart;

    for(i = 0; i < sSendRecvMgr.length; i+=4)
    {
        resBuff = recv32((u32) (taskId));

        transBuff[0] = (resBuff >> 24) & 0xFF;
        transBuff[1] = (resBuff >> 16) & 0xFF;
        transBuff[2] = (resBuff >> 8) & 0xFF;
        transBuff[3] = resBuff & 0xFF;

        dataStart[i] = transBuff[0];
        if (i + 1 < sSendRecvMgr.length) dataStart[i + 1] = transBuff[1];
        if (i + 2 < sSendRecvMgr.length) dataStart[i + 2] = transBuff[2];
        if (i + 3 < sSendRecvMgr.length) dataStart[i + 3] = transBuff[3];

        if (sSendRecvMgr.state == NET_CONN_STATE_ERROR)
            return;

        checkBytes ^= (u16) (transBuff[0] + (transBuff[1] << 8));
        checkBytes ^= (u16) (transBuff[2] + (transBuff[3] << 8));

    }

    resBuff = recv32(taskId);

    if (sSendRecvMgr.disableChecks || (resBuff ^ (u32) ((NET_CONN_CHCK_RES << 16) | (checkBytes & 0xFFFF))) == 0)
    {
        JOY_RECV = 0;
        sSendRecvMgr.state = NET_CONN_STATE_PROCESS;
    }
    else
    {
        for (i = 0; i < 300; i++) {}
    }
}

/**
* The way joybus coms work is that the wii is always master and the GBA always slave
* This means that the GBA cannot initiate a transfer, only respond with up to 4 bytes
* each time the wii sends a 4 byte message
*/
void xfer16(u16 data1, u16 data2, u8 taskId) 
{
    JOY_CNT |= JOY_RW;
    JOY_TRANS_L = data1;
    JOY_TRANS_H = data2;
    waitForTransmissionFinish(taskId, JOY_READ);
}

void xfer32(u32 data, u8 taskId) 
{
    JOY_CNT |= JOY_RW;
    JOY_TRANS = data;
    waitForTransmissionFinish(taskId, JOY_READ);
}

u32 recv32(u8 taskId) 
{
    JOY_CNT |= JOY_RW;
    waitForTransmissionFinish(taskId, JOY_WRITE);
    return JOY_RECV;
}

void waitForTransmissionFinish(u8 taskId, u16 readOrWriteFlag)
{
    u32 i = 0;

    for (i = 0; (JOY_CNT&readOrWriteFlag) == 0; i++)
    {
        if (i > MAX_CONNECTION_LOOPS || CheckLinkCanceled(taskId) == TRUE)
        {
            sSendRecvMgr.state = NET_CONN_STATE_ERROR;
            return;
        }
    }
}

void configureSendRecvMgr(u16 cmd, vu32 * dataStart, u16 length, u8 state, u8 nextProcessStep)
{
    sSendRecvMgr.cmd             = cmd;
    sSendRecvMgr.dataStart       = dataStart;
    sSendRecvMgr.length          = length; 
    sSendRecvMgr.state           = state;
    
    if (sSendRecvMgr.nextProcessStep == nextProcessStep)
    {
        sSendRecvMgr.repeatedStepCount++;
    } 
    else 
    {
        sSendRecvMgr.repeatedStepCount = 0;
    }
    
    sSendRecvMgr.nextProcessStep = nextProcessStep;
}   

void configureSendRecvMgrChunked(u16 cmd, vu32 * dataStart, u16 length, u8 state, u8 nextProcessStep, u8 chunkSize)
{
    if (length <= chunkSize || chunkSize <= 0)
    {
        configureSendRecvMgr(cmd, dataStart, length, state, nextProcessStep);
    }
    else if (chunkSize * (sSendRecvMgr.repeatedStepCount + 1) < length)
    {
        configureSendRecvMgr(cmd + ((chunkSize * sSendRecvMgr.repeatedStepCount)/MINIMUM_CHUNK_SIZE), (vu32 *) dataStart + (chunkSize/4 * sSendRecvMgr.repeatedStepCount), chunkSize, state, sSendRecvMgr.nextProcessStep);
    }
    else if (chunkSize * (sSendRecvMgr.repeatedStepCount + 1) == length)
    {
        configureSendRecvMgr(cmd + ((chunkSize * sSendRecvMgr.repeatedStepCount)/MINIMUM_CHUNK_SIZE), (vu32 *) dataStart + (chunkSize/4 * sSendRecvMgr.repeatedStepCount), chunkSize, state, nextProcessStep);
    }
    else
    {
        configureSendRecvMgr(cmd + ((chunkSize * sSendRecvMgr.repeatedStepCount)/MINIMUM_CHUNK_SIZE), (vu32 *) dataStart + (chunkSize/4 * sSendRecvMgr.repeatedStepCount), length % chunkSize, state, nextProcessStep);
    }
}


/**
*   =====================================================================
*   === NET_CONN_START_LINK_FUNC                                      ===
*   =====================================================================
*/
enum {
    LINKUP_SEND_PLAYER_DATA = 0,
    LINKUP_APPEND_GAME_NAME,
    LINKUP_USE_DATA_AS_PLAYER_INFO,
    LINKUP_SEND_NETWORK_INFO,
    LINKUP_USE_DATA_AS_NETWORK_INFO,
    LINKUP_WAIT_FOR_SERVER_TO_CONNECT,
    LINKUP_REQUEST_NETWORK_STATUS,
    LINKUP_HANDLE_NETWORK_STATUS_OUTCOME,
    LINKUP_RECEIVE_WELCOME_MESSAGE,
    LINKUP_FINISH
};

static void SetupForLinkTask()
{
    sSendRecvMgr.allowCancel       = TRUE;
    sSendRecvMgr.retriesLeft       = MAX_CONNECTION_RETRIES;
    sSendRecvMgr.onFinish          = Task_EndLinkupConnection;
    sSendRecvMgr.onCancel          = Task_LinkupCancel;
    sSendRecvMgr.onProcess         = Task_LinkupProcess;
    sSendRecvMgr.nextProcessStep   = LINKUP_SEND_PLAYER_DATA;
    sSendRecvMgr.disableChecks     = FALSE;
    sSendRecvMgr.repeatedStepCount = 0;
}

static void Task_LinkupCancel(u8 taskId)
{
    gSpecialVar_0x8003 = NET_STAT_OFFLINE;
    Task_EndLinkupConnection(taskId);
}

static void Task_LinkupProcess(u8 taskId)
{
    switch (sSendRecvMgr.nextProcessStep)
    {
        case LINKUP_SEND_PLAYER_DATA:
            configureSendRecvMgr(NET_CONN_SEND_REQ, (vu32 *) &gSaveBlock2Ptr->playerName[0], PLAYER_INFO_LENGTH, NET_CONN_STATE_SEND, LINKUP_APPEND_GAME_NAME);
            break;

        case LINKUP_APPEND_GAME_NAME:
            configureSendRecvMgr(NET_CONN_SCH2_REQ, (vu32 *) &sNetGameName[0], NET_GAME_NAME_LENGTH, NET_CONN_STATE_SEND, LINKUP_USE_DATA_AS_PLAYER_INFO);
            break;

        case LINKUP_USE_DATA_AS_PLAYER_INFO:
            configureSendRecvMgr(NET_CONN_PINF_REQ, 0, 0, NET_CONN_STATE_SEND, LINKUP_SEND_NETWORK_INFO);
            break;

        case LINKUP_SEND_NETWORK_INFO:
            sSendRecvMgr.retryPoint = LINKUP_SEND_NETWORK_INFO;
            configureSendRecvMgr(NET_CONN_SEND_REQ, (vu32 *) &sNetServerAddr[0], NET_SERVER_ADDR_LENGTH, NET_CONN_STATE_SEND, LINKUP_USE_DATA_AS_NETWORK_INFO);
            break;

        case LINKUP_USE_DATA_AS_NETWORK_INFO:
            configureSendRecvMgr(NET_CONN_CINF_REQ, 0, 0, NET_CONN_STATE_SEND, LINKUP_WAIT_FOR_SERVER_TO_CONNECT);
            break;

        case LINKUP_WAIT_FOR_SERVER_TO_CONNECT:
            if (DoWaitTextAnimation(60, sWaitingMessage) > 0)
                sSendRecvMgr.nextProcessStep = LINKUP_REQUEST_NETWORK_STATUS;
            break;

        case LINKUP_REQUEST_NETWORK_STATUS:
            sSendRecvMgr.disableChecks = TRUE; 
            sSendRecvMgr.retryPoint = LINKUP_REQUEST_NETWORK_STATUS;
            configureSendRecvMgr(NET_CONN_LIFN_REQ, (vu32 *) &gStringVar3[0], 4, NET_CONN_STATE_RECEIVE, LINKUP_HANDLE_NETWORK_STATUS_OUTCOME);
            break;

        case LINKUP_HANDLE_NETWORK_STATUS_OUTCOME:
            if (!(NET_CONN_LIFN_REQ >> 8 == gStringVar3[0] && (NET_CONN_LIFN_REQ & 0x00FF) == gStringVar3[1]))
            {
                sSendRecvMgr.nextProcessStep = LINKUP_WAIT_FOR_SERVER_TO_CONNECT;
            }
            else if (gStringVar3[3] >= NETWORK_MIN_ERROR)
            {
                gSpecialVar_0x8003 = NET_STAT_ATTACHED_NO_INTERNET;
                sSendRecvMgr.nextProcessStep = LINKUP_FINISH;
            }
            else if (gStringVar3[3] == NETWORK_CONNECTION_SUCCESS && gStringVar3[2] == NETWORK_STATE_WAITING)
            {
                gSpecialVar_0x8003 = NET_STAT_ONLINE;
                sSendRecvMgr.nextProcessStep = LINKUP_RECEIVE_WELCOME_MESSAGE;
            }
            else
            {
                sSendRecvMgr.nextProcessStep = LINKUP_WAIT_FOR_SERVER_TO_CONNECT;
            }
            break;

        case LINKUP_RECEIVE_WELCOME_MESSAGE:
            sSendRecvMgr.disableChecks = FALSE;
            if (sSendRecvMgr.repeatedStepCount == 0)
            {
                sSendRecvMgr.retryPoint = LINKUP_RECEIVE_WELCOME_MESSAGE;
                StringCopy(gStringVar3, sServerName);
            }
            configureSendRecvMgrChunked(NET_CONN_RCHF0_REQ, (vu32 *) &gStringVar3[SERVER_NAME_LENGTH], WELCOME_MSG_LENGTH, NET_CONN_STATE_RECEIVE, LINKUP_FINISH, MINIMUM_CHUNK_SIZE);
            break;

        case LINKUP_FINISH:
        default:
            gStringVar3[SERVER_NAME_LENGTH + WELCOME_MSG_LENGTH] = 0xFF; // Force the message to end if they never never terminated it 
            sSendRecvMgr.state = NET_CONN_STATE_DONE;
            break;
    }

    gTasks[taskId].func = Task_NetworkTaskLoop;
}

static void Task_EndLinkupConnection(u8 taskId) 
{
    gSpecialVar_Result = 5;
    NetConnDisableSerial();
    StopFieldMessage();
    ScriptContext_Enable();
    DestroyTask(taskId);
}

/**
*   =====================================================================
*   === NET_CONN_DOWNLOAD_BATTLE                                      ===
*   =====================================================================
*/
enum {
    DOWNLOAD_BATTLE_SEND_REQUEST = 0,
    DOWNLOAD_BATTLE_TRANSMIT_REQUEST,
    DOWNLOAD_BATTLE_WAIT_FOR_SERVER,
    DOWNLOAD_BATTLE_RECIEVE_DATA,
    DOWNLOAD_BATTLE_FINISH
};

static void SetupForDownloadBattleTask()
{
    sSendRecvMgr.allowCancel       = TRUE; 
    sSendRecvMgr.retriesLeft       = MAX_CONNECTION_RETRIES;
    sSendRecvMgr.onFinish          = Task_EndDownloadBattleConnection;
    sSendRecvMgr.onCancel          = Task_DownloadBattleCancel;
    sSendRecvMgr.onProcess         = Task_DownloadBattleProcess;
    sSendRecvMgr.nextProcessStep   = DOWNLOAD_BATTLE_SEND_REQUEST;
    sSendRecvMgr.disableChecks     = FALSE;
    sSendRecvMgr.repeatedStepCount = 0;
    gSpecialVar_0x8003 = 0;
}

static void Task_DownloadBattleCancel(u8 taskId)
{
    Task_EndDownloadBattleConnection(taskId);
}

static void Task_DownloadBattleProcess(u8 taskId)
{
    switch (sSendRecvMgr.nextProcessStep)
    {
        case DOWNLOAD_BATTLE_SEND_REQUEST: // Puts request data on the wii  (at address channel 2)
            gStringVar3[0] = 'B'; gStringVar3[1] = 'A'; gStringVar3[2] = '_'; gStringVar3[3] = '1'; // The '1' at the end is for if we want multiple downloadable trainers
            configureSendRecvMgr(NET_CONN_SCH2_REQ, (vu32 *) &gStringVar3[0], 4, NET_CONN_STATE_SEND, DOWNLOAD_BATTLE_TRANSMIT_REQUEST);
            break;

        case DOWNLOAD_BATTLE_TRANSMIT_REQUEST: // Sends request data to the server (from address channel 2)
            sSendRecvMgr.disableChecks = TRUE; // The wii code currently dosn't support transmit checks so they need to be off for transmit
            sSendRecvMgr.retryPoint = DOWNLOAD_BATTLE_TRANSMIT_REQUEST;
            CpuFill32(0, &gStringVar3, sizeof(gStringVar3));  
            configureSendRecvMgr(NET_CONN_TCH2_REQ, 0, 4, NET_CONN_STATE_SEND, DOWNLOAD_BATTLE_WAIT_FOR_SERVER);
            break;

        case DOWNLOAD_BATTLE_WAIT_FOR_SERVER: // Wait for data to be pulled from the server
            // TODO: This is just a delay, and hopes the wii has pulled all the data by the time the delay ends
            // We need a way to query the wii and find out if it's actually finished pulling data from the server
            if (DoWaitTextAnimation(60, sWaitingMessage) > 0)
                sSendRecvMgr.nextProcessStep = DOWNLOAD_BATTLE_RECIEVE_DATA;
            break;

        case DOWNLOAD_BATTLE_RECIEVE_DATA: // Pull back the data from the wii (reading at address chanel 0x0F and writing to gStringVar3)
            sSendRecvMgr.disableChecks = FALSE;
            if (sSendRecvMgr.repeatedStepCount == 0)
            {
                sSendRecvMgr.retryPoint = DOWNLOAD_BATTLE_RECIEVE_DATA;
            }
            configureSendRecvMgrChunked(NET_CONN_RCHF0_REQ, (vu32 *) &gStringVar3[0], DOWNLOAD_TRAINER_POKEMON_SIZE * DOWNLOAD_TRAINER_PARTY_SIZE, NET_CONN_STATE_RECEIVE, DOWNLOAD_BATTLE_FINISH, MINIMUM_CHUNK_SIZE);
            break;


        case DOWNLOAD_BATTLE_FINISH: // Process the data (create the ereader data from what is now stored in gStringVar3)
        default:
        {
            u32 i;
            u32 offset = 0;

            FillEReaderTrainerWithPlayerData();
            StringFill(gSaveBlock2Ptr->frontier.ereaderTrainer.name, CHAR_SPACER, PLAYER_NAME_LENGTH);
            StringCopy_PlayerName(gSaveBlock2Ptr->frontier.ereaderTrainer.name, trainerName);
            gSaveBlock2Ptr->frontier.ereaderTrainer.facilityClass = FACILITY_CLASS_RS_BRENDAN;           

            gSpecialVar_0x8003 = 1;

            for (i = 0; i < PARTY_SIZE; i++)
            {
                if (i < DOWNLOAD_TRAINER_PARTY_SIZE) 
                {
                    offset = DOWNLOAD_TRAINER_POKEMON_SIZE * i;

                    gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].species  = (u16) (gStringVar3[ 0 + offset] | gStringVar3[ 1 + offset] << 8);
                    gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].level    =        gStringVar3[ 2 + offset]                                 ;
                    gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].heldItem = (u16) (gStringVar3[ 3 + offset] | gStringVar3[ 4 + offset] << 8);
                    gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].moves[0] = (u16) (gStringVar3[ 5 + offset] | gStringVar3[ 6 + offset] << 8);
                    gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].moves[1] = (u16) (gStringVar3[ 7 + offset] | gStringVar3[ 8 + offset] << 8);
                    gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].moves[2] = (u16) (gStringVar3[ 9 + offset] | gStringVar3[10 + offset] << 8);
                    gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].moves[3] = (u16) (gStringVar3[11 + offset] | gStringVar3[12 + offset] << 8);

                    StringFill(gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].nickname, CHAR_SPACER, POKEMON_NAME_LENGTH);

                    gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].nickname[0] = gStringVar3[13 + offset];
                    gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].nickname[1] = gStringVar3[14 + offset];
                    gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].nickname[2] = gStringVar3[15 + offset];
                    gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].nickname[3] = 0xFF;

                    // Basic validation to make sure we got something sensible back from the server/wii (ideally this would be a checksum from the server)
                    if (gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].species > NUM_SPECIES || 
                        gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].level > MAX_LEVEL || 
                        gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].heldItem > ITEMS_COUNT || 
                        gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].moves[0] > MOVES_COUNT || 
                        gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].moves[1] > MOVES_COUNT || 
                        gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].moves[2] > MOVES_COUNT || 
                        gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].moves[3] > MOVES_COUNT )
                    {
                        gSpecialVar_0x8003 = 0;
                    }
                }
                else
                {
                    gSaveBlock2Ptr->frontier.ereaderTrainer.party[i].species = 0;
                }

                // Basic validation to make sure we got something sensible back from the server/wii
                if (gSaveBlock2Ptr->frontier.ereaderTrainer.party[0].species == 0)
                    gSpecialVar_0x8003 = 0;

            }


            sSendRecvMgr.state = NET_CONN_STATE_DONE;
            break;
        }
    }

    gTasks[taskId].func = Task_NetworkTaskLoop;
}

static void Task_EndDownloadBattleConnection(u8 taskId) 
{
    NetConnDisableSerial();
    StopFieldMessage();
    ScriptContext_Enable();
    DestroyTask(taskId);
}

/**
*   =====================================================================
*   === NET_CONN_ONLINE_MART                                          ===
*   =====================================================================
*/
enum {
    DOWNLOAD_MART_SEND_REQUEST = 0,
    DOWNLOAD_MART_TRANSMIT_REQUEST,
    DOWNLOAD_MART_WAIT_FOR_SERVER,
    DOWNLOAD_MART_RECEIVE_DATA,
    DOWNLOAD_MART_FINISH
};

static void SetupForOnlineMartTask()
{
    sSendRecvMgr.allowCancel       = TRUE;
    sSendRecvMgr.retriesLeft       = MAX_CONNECTION_RETRIES;
    sSendRecvMgr.onFinish          = Task_EndOnlineMartConnection;
    sSendRecvMgr.onCancel          = Task_OnlineMartCancel;
    sSendRecvMgr.onProcess         = Task_OnlineMartProcess;
    sSendRecvMgr.nextProcessStep   = DOWNLOAD_MART_SEND_REQUEST;
    sSendRecvMgr.disableChecks     = FALSE;
    sSendRecvMgr.repeatedStepCount = 0;
    gSpecialVar_0x8003 = 0;
}

static void Task_OnlineMartCancel(u8 taskId)
{
    Task_EndLinkupConnection(taskId);
}

static void Task_OnlineMartProcess(u8 taskId)
{
    switch (sSendRecvMgr.nextProcessStep)
    {
        case DOWNLOAD_MART_SEND_REQUEST:
            gStringVar3[0] = 'M'; gStringVar3[1] = 'A'; gStringVar3[2] = '_'; gStringVar3[3] = '1';
            configureSendRecvMgr(NET_CONN_SCH2_REQ, (vu32 *) &gStringVar3[0], 4, NET_CONN_STATE_SEND, DOWNLOAD_MART_TRANSMIT_REQUEST);
            break;

        case DOWNLOAD_MART_TRANSMIT_REQUEST:
            sSendRecvMgr.disableChecks = TRUE; 
            sSendRecvMgr.retryPoint = DOWNLOAD_MART_TRANSMIT_REQUEST;
            CpuFill32(0, &gStringVar3, sizeof(gStringVar3)); 
            configureSendRecvMgr(NET_CONN_TCH2_REQ, 0, 4, NET_CONN_STATE_SEND, DOWNLOAD_MART_WAIT_FOR_SERVER);
            break;

        case DOWNLOAD_MART_WAIT_FOR_SERVER:
            if (DoWaitTextAnimation(40, sWaitingMessage) > 0)
                sSendRecvMgr.nextProcessStep = DOWNLOAD_MART_RECEIVE_DATA;
            break;

        case DOWNLOAD_MART_RECEIVE_DATA:
            sSendRecvMgr.disableChecks = FALSE;
            if (sSendRecvMgr.repeatedStepCount == 0)
            {
                sSendRecvMgr.retryPoint = DOWNLOAD_MART_RECEIVE_DATA;
            }
            configureSendRecvMgrChunked(NET_CONN_RCHF0_REQ, (vu32 *) &gStringVar3[0], 16, NET_CONN_STATE_RECEIVE, DOWNLOAD_MART_FINISH, MINIMUM_CHUNK_SIZE);
            break;

        case DOWNLOAD_MART_FINISH:
        default:
        {
            u32 i;
            gSpecialVar_0x8003 = 1;
            for (i = 0; i < DOWNLOAD_MART_SIZE; i++)
            {
                if ((u16) (gStringVar3[i*2] | gStringVar3[(i*2) + 1] << 8) > ITEMS_COUNT)
                    gSpecialVar_0x8003 = 0;
            }
            sSendRecvMgr.state = NET_CONN_STATE_DONE;
            break;
        }

    }

    gTasks[taskId].func = Task_NetworkTaskLoop;
}

static void Task_EndOnlineMartConnection(u8 taskId) 
{
    HideFieldMessageBox();
    NetConnDisableSerial();
    ScriptContext_Enable();

    if (gSpecialVar_0x8003 == 1)
    {
        gStringVar3[12] = 0;
        gStringVar3[13] = 0; 
        CreatePokemartMenu((u16 *) &gStringVar3[0]);
        ScriptContext_Stop();
    }

    DestroyTask(taskId);
}

/**
*   =====================================================================
*   === NET_CONN_EGG_FUNC                                             ===
*   =====================================================================
*/
enum {
    DOWNLOAD_GIFT_EGG_SEND_REQUEST = 0,
    DOWNLOAD_GIFT_EGG_TRANSMIT_REQUEST,
    DOWNLOAD_GIFT_EGG_WAIT_FOR_SERVER,
    DOWNLOAD_GIFT_EGG_RECEIVE_DATA,
    DOWNLOAD_GIFT_EGG_FINISH
};

static void SetupForGiftEggTask()
{
    sSendRecvMgr.allowCancel       = TRUE;
    sSendRecvMgr.retriesLeft       = MAX_CONNECTION_RETRIES;
    sSendRecvMgr.onFinish          = Task_EndGiftEggConnection;
    sSendRecvMgr.onCancel          = Task_GiftEggCancel;
    sSendRecvMgr.onProcess         = Task_GiftEggProcess;
    sSendRecvMgr.nextProcessStep   = DOWNLOAD_GIFT_EGG_SEND_REQUEST;
    sSendRecvMgr.disableChecks     = FALSE;
    sSendRecvMgr.repeatedStepCount = 0;
    gSpecialVar_0x8003 = 0;
}

static void Task_GiftEggCancel(u8 taskId)
{
    Task_EndLinkupConnection(taskId);
}

static void Task_GiftEggProcess(u8 taskId)
{
    switch (sSendRecvMgr.nextProcessStep)
    {
        case DOWNLOAD_GIFT_EGG_SEND_REQUEST:
            gStringVar3[0] = 'G'; gStringVar3[1] = 'E'; gStringVar3[2] = '_'; gStringVar3[3] = '1';
            configureSendRecvMgr(NET_CONN_SCH2_REQ, (vu32 *) &gStringVar3[0], 4, NET_CONN_STATE_SEND, DOWNLOAD_GIFT_EGG_TRANSMIT_REQUEST);
            break;

        case DOWNLOAD_GIFT_EGG_TRANSMIT_REQUEST:
            sSendRecvMgr.disableChecks = TRUE; 
            sSendRecvMgr.retryPoint = DOWNLOAD_GIFT_EGG_TRANSMIT_REQUEST;
            CpuFill32(0, &gStringVar3, sizeof(gStringVar3)); 
            configureSendRecvMgr(NET_CONN_TCH2_REQ, 0, 4, NET_CONN_STATE_SEND, DOWNLOAD_GIFT_EGG_WAIT_FOR_SERVER);
            break;

        case DOWNLOAD_GIFT_EGG_WAIT_FOR_SERVER:
            if (DoWaitTextAnimation(40, sWaitingMessage) > 0)
                sSendRecvMgr.nextProcessStep = DOWNLOAD_GIFT_EGG_RECEIVE_DATA;
            break;

        case DOWNLOAD_GIFT_EGG_RECEIVE_DATA:
            sSendRecvMgr.disableChecks = FALSE;
            if (sSendRecvMgr.repeatedStepCount == 0)
            {
                sSendRecvMgr.retryPoint = DOWNLOAD_MART_RECEIVE_DATA;
            }
            configureSendRecvMgrChunked(NET_CONN_RCHF0_REQ, (vu32 *) &gStringVar3[0], 4, NET_CONN_STATE_RECEIVE, DOWNLOAD_GIFT_EGG_FINISH, MINIMUM_CHUNK_SIZE);
            break;

        case DOWNLOAD_GIFT_EGG_FINISH:
        default:
            sSendRecvMgr.state = NET_CONN_STATE_DONE;
            gSpecialVar_0x8003 = (u16) (gStringVar3[0] | gStringVar3[1] << 8);
            gSpecialVar_0x8005 = (u16) (gStringVar3[2] | gStringVar3[3] << 8);
            
            if (gSpecialVar_0x8003 > SPECIES_EGG) 
            {
                gSpecialVar_0x8003 = 0;
            }
            if (gSpecialVar_0x8005 >= MOVES_COUNT)
            {
                gSpecialVar_0x8005 = MOVE_NONE;
            }
            break;
    }

    gTasks[taskId].func = Task_NetworkTaskLoop;
}

static void Task_EndGiftEggConnection(u8 taskId) 
{
    NetConnDisableSerial();
    StopFieldMessage();
    ScriptContext_Enable();
    DestroyTask(taskId);
}

/**
*   =====================================================================
*   === NET_CONN_TRADE_FUNC                                           ===
*   =====================================================================
*/
enum {
    TRADE_CLEAR_LAST_PARTNER = 0,
    TRADE_SEND_REQUEST,
    TRADE_APPEND_MON_DATA, 
    TRADE_TRANSMIT_REQUEST, 
    TRADE_WAIT_LONG_FOR_SERVER, 
    TRADE_RECEIVE_NAME_DATA, 
    TRADE_VERIFY_PARTNER_FOUND,
    TRADE_WAIT_SHORT_FOR_SERVER, 
    TRADE_RECEIVE_FULL_DATA, 
    TRADE_FINISH 
};

static void SetupForTradeTask()
{
    sSendRecvMgr.allowCancel       = TRUE;
    sSendRecvMgr.retriesLeft       = MAX_CONNECTION_RETRIES + 20; // because when the connection is dodgy these fail way to much
    sSendRecvMgr.onFinish          = Task_EndTradeConnection;
    sSendRecvMgr.onCancel          = Task_TradeCancel;
    sSendRecvMgr.onProcess         = Task_TradeProcess;
    sSendRecvMgr.nextProcessStep   = TRADE_CLEAR_LAST_PARTNER;
    sSendRecvMgr.disableChecks     = FALSE;
    sSendRecvMgr.repeatedStepCount = 0;
    gSpecialVar_0x8003 = 0;
}

static void SetupRetryTradeTask()
{
    SetupForTradeTask();
    sSendRecvMgr.nextProcessStep   = TRADE_TRANSMIT_REQUEST;
}

static void Task_TradeCancel(u8 taskId)
{
    Task_EndLinkupConnection(taskId);
}

static void Task_TradeProcess(u8 taskId)
{
    switch (sSendRecvMgr.nextProcessStep)
    {
        case TRADE_CLEAR_LAST_PARTNER:
            // We need to clear the wii data here so we don't pull stale trade data
            // Normally we'd use the NET_CONN_BCLR_REQ command but I'm currently getting weird issues
            gStringVar3[0] = 0; gStringVar3[1] = 0; gStringVar3[2] = 0; gStringVar3[3] = 0;
            configureSendRecvMgr(0x15F0, (vu32 *) &gStringVar3[0], 4, NET_CONN_STATE_SEND, TRADE_SEND_REQUEST);
            break;

        case TRADE_SEND_REQUEST:
        {
            u32 i;
            bool8 useFriendLink = TRUE;
            gStringVar3[0] = 'T'; gStringVar3[1] = 'R'; gStringVar3[2] = '_';

            // If the trainer profile starts with 'FRIEND LINK' 

            for (i = 0; i < ARRAY_COUNT(sLinkProfileWords); i++)
                useFriendLink = useFriendLink && gSaveBlock1Ptr->easyChatProfile[i] == sLinkProfileWords[i];

            if (useFriendLink)
            {
                gStringVar3[3] = '1';
                gStringVar3[4] = gSaveBlock1Ptr->easyChatProfile[2] >> 8;
                gStringVar3[5] = gSaveBlock1Ptr->easyChatProfile[2] & 0xFF;
                gStringVar3[6] = gSaveBlock1Ptr->easyChatProfile[3] >> 8;
                gStringVar3[7] = gSaveBlock1Ptr->easyChatProfile[3] & 0xFF;
                configureSendRecvMgrChunked(NET_CONN_SEND_REQ, (vu32 *) &gStringVar3[0], 8, NET_CONN_STATE_SEND, TRADE_APPEND_MON_DATA, MINIMUM_CHUNK_SIZE);
            }
            else
            {
                gStringVar3[3] = '0';
                configureSendRecvMgr(NET_CONN_SEND_REQ, (vu32 *) &gStringVar3[0], 4, NET_CONN_STATE_SEND, TRADE_APPEND_MON_DATA);
            }
            break;
        }
        case TRADE_APPEND_MON_DATA:
            sSendRecvMgr.retryPoint = TRADE_APPEND_MON_DATA;
            configureSendRecvMgrChunked(NET_CONN_SCH1_REQ, (vu32 *) &gPlayerParty[gSpecialVar_0x8005], sizeof(struct Pokemon), NET_CONN_STATE_SEND, TRADE_TRANSMIT_REQUEST, MINIMUM_CHUNK_SIZE);
            break;

        case TRADE_TRANSMIT_REQUEST:
            sSendRecvMgr.disableChecks = TRUE; 
            sSendRecvMgr.retryPoint = TRADE_TRANSMIT_REQUEST;
            sSendRecvMgr.allowCancel = FALSE;
            configureSendRecvMgr(NET_CONN_TRAN_REQ, 0, 16 + sizeof(struct Pokemon), NET_CONN_STATE_SEND, TRADE_WAIT_LONG_FOR_SERVER);
            break;

        case TRADE_WAIT_LONG_FOR_SERVER:
            if (DoWaitTextAnimation(80, sWaitingMessage) > 0)
                sSendRecvMgr.nextProcessStep = TRADE_RECEIVE_NAME_DATA;
            break;

        case TRADE_RECEIVE_NAME_DATA:
            // We don't know when the other player connected to us (or if there is a connection at all). 
            // So wait. Pull a little bit of data. If we got some data wait again. Then pull the whole thing  
            sSendRecvMgr.disableChecks = FALSE;
            if (sSendRecvMgr.repeatedStepCount == 0)
            {
                sSendRecvMgr.retryPoint = TRADE_RECEIVE_NAME_DATA;
            }
            configureSendRecvMgrChunked(NET_CONN_RCHF0_REQ, (vu32 *) &gStringVar3[0], 16, NET_CONN_STATE_RECEIVE, TRADE_VERIFY_PARTNER_FOUND, MINIMUM_CHUNK_SIZE);
            break;

        case TRADE_VERIFY_PARTNER_FOUND:
        {
            u32 i;
            gSpecialVar_0x8003 = 1; // No partner found
            sSendRecvMgr.nextProcessStep = TRADE_FINISH;
            for (i = 0; i < 4; i++)
            {
                if (gStringVar3[i] != 0)
                {
                    gSpecialVar_0x8003 = 0; // Back to error state
                    sSendRecvMgr.nextProcessStep = TRADE_WAIT_SHORT_FOR_SERVER;
                }
            }
            break;
        }

        case TRADE_WAIT_SHORT_FOR_SERVER:
            if (DoWaitTextAnimation(40, sExchangeMessage) > 0)
                sSendRecvMgr.nextProcessStep = TRADE_RECEIVE_FULL_DATA;
            break;

        case TRADE_RECEIVE_FULL_DATA:
            if (sSendRecvMgr.repeatedStepCount == 0)
            {
                CpuFill32(0, &gEnemyParty, sizeof(gEnemyParty));     
                sSendRecvMgr.retryPoint = TRADE_RECEIVE_FULL_DATA;
                sSendRecvMgr.retriesLeft = MAX_CONNECTION_RETRIES + 20;
            }
            configureSendRecvMgrChunked(NET_CONN_RCHF1_REQ, (vu32 *) &gEnemyParty[0], sizeof(struct Pokemon), NET_CONN_STATE_RECEIVE, TRADE_FINISH, MINIMUM_CHUNK_SIZE);
            break;

        case TRADE_FINISH:
        default:
        {
            u16 species = GetMonData(&gEnemyParty[0], MON_DATA_SPECIES);

            if (gSpecialVar_0x8003 != 1)
            {
                if (!(gEnemyParty[0].box.isBadEgg) && !(species > SPECIES_EGG))
                {
                    gSpecialVar_0x8003 = 2;
                    gStringVar3[PLAYER_NAME_LENGTH + 1] = 0xFF;
                    gSpecialVar_0x8004 = 100; // This makes the in game trade use special values for name
                    sSendRecvMgr.state = NET_CONN_STATE_DONE;
                }
                else
                {
                    sSendRecvMgr.allowCancel = TRUE;
                    sSendRecvMgr.state = TRADE_WAIT_SHORT_FOR_SERVER;
                }
            }
            else
            {
                sSendRecvMgr.state = NET_CONN_STATE_DONE;
            }
            break;
        }
    }

    gTasks[taskId].func = Task_NetworkTaskLoop;
}

static void Task_EndTradeConnection(u8 taskId) 
{
    NetConnDisableSerial();
    StopFieldMessage();
    ScriptContext_Enable();
    DestroyTask(taskId);
}

/**
*   =====================================================================
*   === NET_CONN_POST_MAIL                                            ===
*   =====================================================================
*/
enum {
    POST_MAIL_SEND_REQUEST = 0,
    POST_MAIL_TRANSMIT_REQUEST,
    POST_MAIL_WAIT_FOR_SERVER,
    POST_MAIL_RECEIVE_DATA,
    POST_MAIL_FINISH
};

static void SetupForPostMailTask()
{
    sSendRecvMgr.allowCancel       = TRUE;
    sSendRecvMgr.retriesLeft       = MAX_CONNECTION_RETRIES;
    sSendRecvMgr.onFinish          = Task_EndPostMailConnection;
    sSendRecvMgr.onCancel          = Task_PostMailCancel;
    sSendRecvMgr.onProcess         = Task_PostMailProcess;
    sSendRecvMgr.nextProcessStep   = POST_MAIL_SEND_REQUEST;
    sSendRecvMgr.disableChecks     = FALSE;
    sSendRecvMgr.repeatedStepCount = 0;
    gSpecialVar_0x8003 = 0;
}

static void Task_PostMailCancel(u8 taskId)
{
    Task_EndLinkupConnection(taskId);
}

static void Task_PostMailProcess(u8 taskId)
{
    switch (sSendRecvMgr.nextProcessStep)
    {
        case POST_MAIL_SEND_REQUEST:
        {
            u32 i;
            u8 mailId;
            bool8 useFriendLink = TRUE;
            gStringVar3[0] = 'P'; gStringVar3[1] = 'M'; gStringVar3[2] = '_';

            for (i = 0; i < ARRAY_COUNT(sLinkProfileWords); i++)
                useFriendLink = useFriendLink && gSaveBlock1Ptr->easyChatProfile[i] == sLinkProfileWords[i];

            if (useFriendLink)
            {
                gStringVar3[3] = '1';
                gStringVar3[4] = gSaveBlock1Ptr->easyChatProfile[2] >> 8;
                gStringVar3[5] = gSaveBlock1Ptr->easyChatProfile[2] & 0xFF;
                gStringVar3[6] = gSaveBlock1Ptr->easyChatProfile[3] >> 8;
                gStringVar3[7] = gSaveBlock1Ptr->easyChatProfile[3] & 0xFF;
            }
            else
            {
                gStringVar3[3] = '0';
            }

            mailId = GetMonData(&gPlayerParty[gSpecialVar_0x8005], MON_DATA_MAIL);

            if (mailId == MAIL_NONE)
            {
                gSpecialVar_0x8003 = 1;
                sSendRecvMgr.state = NET_CONN_STATE_DONE;
            }
            else 
            {
                gStringVar3[8] = gSaveBlock1Ptr->mail[mailId].itemId >> 8;
                gStringVar3[9] = gSaveBlock1Ptr->mail[mailId].itemId & 0xFF;

                for (i = 0; i < MAIL_WORDS_COUNT; i++)
                {
                    gStringVar3[8 + 2 + (2 * i)] = gSaveBlock1Ptr->mail[mailId].words[i] >> 8;
                    gStringVar3[8 + 2 + (2 * i) + 1] = gSaveBlock1Ptr->mail[mailId].words[i] & 0xFF;
                }

                configureSendRecvMgrChunked(NET_CONN_SCH2_REQ, (vu32 *) &gStringVar3[0], 8 + 2 + (2 * 9), NET_CONN_STATE_SEND, POST_MAIL_TRANSMIT_REQUEST, MINIMUM_CHUNK_SIZE);
            }

            break;
        }
        case POST_MAIL_TRANSMIT_REQUEST:
            sSendRecvMgr.disableChecks = TRUE; 
            sSendRecvMgr.retryPoint = POST_MAIL_TRANSMIT_REQUEST;
            CpuFill32(0, &gStringVar3, sizeof(gStringVar3)); 
            configureSendRecvMgr(NET_CONN_TCH2_REQ, 0, 8 + 2 + (2 * 9), NET_CONN_STATE_SEND, POST_MAIL_WAIT_FOR_SERVER);
            break;

        case POST_MAIL_WAIT_FOR_SERVER:
            if (DoWaitTextAnimation(40, sWaitingMessage) > 0)
                sSendRecvMgr.nextProcessStep = POST_MAIL_RECEIVE_DATA;
            break;

        case POST_MAIL_RECEIVE_DATA:
            sSendRecvMgr.disableChecks = FALSE;
            if (sSendRecvMgr.repeatedStepCount == 0)
            {
                sSendRecvMgr.retryPoint = POST_MAIL_RECEIVE_DATA;
            }
            configureSendRecvMgrChunked(NET_CONN_RCHF0_REQ, (vu32 *) &gStringVar3[0], 2, NET_CONN_STATE_RECEIVE, POST_MAIL_FINISH, MINIMUM_CHUNK_SIZE);
            break;

        case POST_MAIL_FINISH:
        default:
        {
            u32 i;
            gSpecialVar_0x8003 = 2;
            if (gStringVar3[0] != 200)
            {
                gSpecialVar_0x8003 = 0;
            }
            sSendRecvMgr.state = NET_CONN_STATE_DONE;
            break;
        }

    }

    gTasks[taskId].func = Task_NetworkTaskLoop;
}

static void Task_EndPostMailConnection(u8 taskId) 
{
    NetConnDisableSerial();
    StopFieldMessage();
    ScriptContext_Enable();
    DestroyTask(taskId);
}

/**
*   =====================================================================
*   === NET_CONN_READ_MAIL                                            ===
*   =====================================================================
*/
enum {
    READ_MAIL_CLEAR_LAST_MESSAGE = 0,
    READ_MAIL_SEND_REQUEST,
    READ_MAIL_TRANSMIT_REQUEST,
    READ_MAIL_WAIT_FOR_SERVER,
    READ_MAIL_RECEIVE_DATA,
    READ_MAIL_FINISH
};

static void SetupForReadMailTask()
{
    sSendRecvMgr.allowCancel       = TRUE;
    sSendRecvMgr.retriesLeft       = MAX_CONNECTION_RETRIES;
    sSendRecvMgr.onFinish          = Task_EndReadMailConnection;
    sSendRecvMgr.onCancel          = Task_ReadMailCancel;
    sSendRecvMgr.onProcess         = Task_ReadMailProcess;
    sSendRecvMgr.nextProcessStep   = READ_MAIL_CLEAR_LAST_MESSAGE;
    sSendRecvMgr.disableChecks     = FALSE;
    sSendRecvMgr.repeatedStepCount = 0;
    gSpecialVar_0x8003 = 0;
}

static void Task_ReadMailCancel(u8 taskId)
{
    Task_EndLinkupConnection(taskId);
}

static void Task_ReadMailProcess(u8 taskId)
{
    switch (sSendRecvMgr.nextProcessStep)
    {
        case READ_MAIL_CLEAR_LAST_MESSAGE:
            gStringVar3[0] = 0; gStringVar3[1] = 0; gStringVar3[2] = 0; gStringVar3[3] = 0;
            configureSendRecvMgr(0x15F0, (vu32 *) &gStringVar3[0], 4, NET_CONN_STATE_SEND, READ_MAIL_SEND_REQUEST);
            break;
        case READ_MAIL_SEND_REQUEST:
        {
            u32 i;
            bool8 useFriendLink = TRUE;
            gStringVar3[0] = 'R'; gStringVar3[1] = 'M'; gStringVar3[2] = '_';

            // If the trainer profile starts with 'FRIEND LINK' 

            for (i = 0; i < ARRAY_COUNT(sLinkProfileWords); i++)
                useFriendLink = useFriendLink && gSaveBlock1Ptr->easyChatProfile[i] == sLinkProfileWords[i];

            if (useFriendLink)
            {
                gStringVar3[3] = '1';
                gStringVar3[4] = gSaveBlock1Ptr->easyChatProfile[2] >> 8;
                gStringVar3[5] = gSaveBlock1Ptr->easyChatProfile[2] & 0xFF;
                gStringVar3[6] = gSaveBlock1Ptr->easyChatProfile[3] >> 8;
                gStringVar3[7] = gSaveBlock1Ptr->easyChatProfile[3] & 0xFF;

                configureSendRecvMgrChunked(NET_CONN_SCH2_REQ, (vu32 *) &gStringVar3[0], 8, NET_CONN_STATE_SEND, READ_MAIL_TRANSMIT_REQUEST, MINIMUM_CHUNK_SIZE);
            }
            else
            {
                gStringVar3[3] = '0';
                configureSendRecvMgr(NET_CONN_SCH2_REQ, (vu32 *) &gStringVar3[0], 4, NET_CONN_STATE_SEND, READ_MAIL_TRANSMIT_REQUEST);
            }
            break;
        }
        case READ_MAIL_TRANSMIT_REQUEST:
            sSendRecvMgr.disableChecks = TRUE; 
            sSendRecvMgr.retryPoint = DOWNLOAD_MART_TRANSMIT_REQUEST;
            CpuFill32(0, &gStringVar3, sizeof(gStringVar3)); 
            configureSendRecvMgr(NET_CONN_TCH2_REQ, 0, 4, NET_CONN_STATE_SEND, READ_MAIL_WAIT_FOR_SERVER);
            break;

        case READ_MAIL_WAIT_FOR_SERVER:
            if (DoWaitTextAnimation(40, sWaitingMessage) > 0)
                sSendRecvMgr.nextProcessStep = READ_MAIL_RECEIVE_DATA;
            break;

        case READ_MAIL_RECEIVE_DATA:
            sSendRecvMgr.disableChecks = FALSE;
            if (sSendRecvMgr.repeatedStepCount == 0)
            {
                sSendRecvMgr.retryPoint = DOWNLOAD_MART_RECEIVE_DATA;
            }
            // 8 byte player name + mail type + 9 * 16-bit easy chat words
            configureSendRecvMgrChunked(NET_CONN_RCHF0_REQ, (vu32 *) &gStringVar3[0], 8 + 2 + (9 * 2), NET_CONN_STATE_RECEIVE, READ_MAIL_FINISH, MINIMUM_CHUNK_SIZE);
            break;

        case READ_MAIL_FINISH:
        default:
        {
            u32 i;

            if (gStringVar3[0] == 0 && gStringVar3[1] == 0)
            {
                // gSpecialVar_0x8003 = 0 - Connection Error
                gSpecialVar_0x8003 = 0;
            } 
            else if (gStringVar3[0] == 0xFF && gStringVar3[1] == 0xFF)
            {
                // gSpecialVar_0x8003 = 1 - No New Mail
                gSpecialVar_0x8003 = 1;
            }
            else 
            {
                // gSpecialVar_0x8003 = 2 - New Mail Message
                gSpecialVar_0x8003 = 2;

                for (i = 0; i < (0x20 + 1); i++)
                    gStringVar4[i] = 0;

                // /*0x00*/ u16 words[MAIL_WORDS_COUNT];
                // /*0x12*/ u8 playerName[PLAYER_NAME_LENGTH + 1];
                // /*0x1A*/ u8 trainerId[TRAINER_ID_LENGTH];
                // /*0x1E*/ u16 species;
                // /*0x20*/ u16 itemId;

                // Use gStringVar4 to store the mail data then cast it to the mail struct 
                for (i = 0; i < MAIL_WORDS_COUNT; i++)
                {
                    gStringVar4[(2 * i)] = gStringVar3[8 + 2 + (2 * i) + 1];
                    gStringVar4[(2 * i) + 1] = gStringVar3[8 + 2 + (2 * i)];

                }

                for (i = 0; i < PLAYER_NAME_LENGTH; i++)
                    gStringVar4[i + 0x12] = gStringVar3[i];

                gStringVar4[i + 0x12 + 1] = EOS;
                
                gStringVar4[0x20] = gStringVar3[8 + 1];
                gStringVar4[0x20 + 1] = gStringVar3[8];
            }

            sSendRecvMgr.state = NET_CONN_STATE_DONE;
            break;
        }

    }

    gTasks[taskId].func = Task_NetworkTaskLoop;
}

static void Task_EndReadMailConnection(u8 taskId) 
{
    NetConnDisableSerial();
    StopFieldMessage();
    ScriptContext_Enable();
    DestroyTask(taskId);

    if (gSpecialVar_0x8003 == 2)
        ReadMail((struct Mail *) &gStringVar4[0], CB2_ReturnToField, TRUE);
}