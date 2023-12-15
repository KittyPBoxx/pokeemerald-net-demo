/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * gclinkstates.h
 * Hide all the nasty communication callback stuff for async transmission
 ***************************************************************************/
#include <ogcsys.h>
#include <gccore.h>
#include <string.h>

/**
* Be aware we are using SIO_MULTI_MODE (SIOMULTI) with (i.e 16-bit multiplayer comms)
* Each gamecube to gba link is a seperate multi player connection with the wii acting as master
*/
// Serial Data Commands
#define SI_STATUS 0x00
#define SI_READ 0x14
#define SI_WRITE 0x15
#define SI_RESET 0xFF

#define SI_TRANS_DELAY 50 // Minimum delay between data transfers (any faster and data might be missed)


volatile u32 ch0DeviceType = 0;
volatile u32 ch1DeviceType = 0;
volatile u32 ch2DeviceType = 0;
volatile u32 ch3DeviceType = 0;

static void ch0TypeCallback(s32 res, u32 val)
{
    (void)(res);
	ch0DeviceType = val;
}

static void ch1TypeCallback(s32 res, u32 val)
{
    (void)(res);
	ch1DeviceType = val;
}

static void ch2TypeCallback(s32 res, u32 val)
{
    (void)(res);
	ch2DeviceType = val;
}

static void ch3TypeCallback(s32 res, u32 val)
{
    (void)(res);
	ch3DeviceType = val;
}

static SICallback SL_getDeviceTypeCallback(u8 channel)
{
    if (channel == 3)
    {
        return ch3TypeCallback;
    }
    else if (channel == 2)
    {
        return ch2TypeCallback;
    }
    else if (channel == 1)
    {
        return ch1TypeCallback;
    }

    return ch0TypeCallback;
}

static void SL_resetDeviceType(u8 channel)
{
    if (channel == 3)
    {
        ch3DeviceType = 0;
    }
    else if (channel == 2)
    {
        ch2DeviceType = 0;
    }
    else if (channel == 1)
    {
        ch1DeviceType = 0;
    }

    ch0DeviceType = 0;
}

static u32 SL_getDeviceType(u8 channel)
{
    if (channel == 3)
    {
        return ch3DeviceType;
    }
    else if (channel == 2)
    {
        return ch2DeviceType;
    }
    else if (channel == 1)
    {
        return ch1DeviceType;
    }

    return ch0DeviceType;
}

volatile u32 ch0TransmissionFinished = 0;
volatile u32 ch1TransmissionFinished = 0;
volatile u32 ch2TransmissionFinished = 0;
volatile u32 ch3TransmissionFinished = 0;

static void ch0TransmissionFinishedCallback(s32 res, u32 val)
{
    (void)(res);
	ch0TransmissionFinished = 1;
}

static void ch1TransmissionFinishedCallback(s32 res, u32 val)
{
    (void)(res);
	ch1TransmissionFinished = 1;
}

static void ch2TransmissionFinishedCallback(s32 res, u32 val)
{
    (void)(res);
	ch2TransmissionFinished = 1;
}

static void ch3TransmissionFinishedCallback(s32 res, u32 val)
{
    (void)(res);
	ch3TransmissionFinished = 1;
}

static SICallback SL_getTransmissionFinishedCallback(u8 channel)
{
    if (channel == 3)
    {
        return ch3TransmissionFinishedCallback;
    }
    else if (channel == 2)
    {
        return ch2TransmissionFinishedCallback;
    }
    else if (channel == 1)
    {
        return ch1TransmissionFinishedCallback;
    }

    return ch0TransmissionFinishedCallback;
}

static void SL_resetTransmissionFinished(u8 channel)
{
    if (channel == 3)
    {
        ch3TransmissionFinished = 0;
    }
    else if (channel == 2)
    {
        ch2TransmissionFinished = 0;
    }
    else if (channel == 1)
    {
        ch1TransmissionFinished = 0;
    }

    ch0TransmissionFinished = 0;
}

static u32 SL_isTransmissionFinished(u8 channel)
{
    if (channel == 3)
    {
        return ch3TransmissionFinished;
    }
    else if (channel == 2)
    {
        return ch2TransmissionFinished;
    }
    else if (channel == 1)
    {
        return ch1TransmissionFinished;
    }

    return ch0TransmissionFinished;
}

static void SL_recv(u8 channel, char * sendMsgBuffer, char * receivedMsgBuffer)
{
	memset(receivedMsgBuffer,0,32);
	sendMsgBuffer[0]=SI_READ;
	SL_resetTransmissionFinished(channel);
	SI_Transfer(channel,                                     // Channel (which gc port)
                sendMsgBuffer,                               // Out buffer 
                1,                                           // Out msg length
                receivedMsgBuffer,                           // In buffer
                5,                                           // In msg length
                SL_getTransmissionFinishedCallback(channel), // transfer finished callback
                SI_TRANS_DELAY);                             // Delay between transfers 
	while(SL_isTransmissionFinished(channel) == 0) usleep(SI_TRANS_DELAY);
}

static void SL_send(u8 channel, char * sendMsgBuffer, char * receivedMsgBuffer)
{
	sendMsgBuffer[0]=SI_WRITE; 
    // cmdbuf[1]=(msg>>0)&0xFF; 
    // cmdbuf[2]=(msg>>8)&0xFF;
	// cmdbuf[3]=(msg>>16)&0xFF; 
    // cmdbuf[4]=(msg>>24)&0xFF;
	SL_resetTransmissionFinished(channel);
	receivedMsgBuffer[0] = 0;
	SI_Transfer(channel,
                sendMsgBuffer,
                5,
                receivedMsgBuffer,
                1,
                SL_getTransmissionFinishedCallback(channel),
                SI_TRANS_DELAY);
	while(SL_isTransmissionFinished(channel) == 0) usleep(SI_TRANS_DELAY);
}


static void SL_reset(u8 channel, char * sendMsgBuffer, char * receivedMsgBuffer)
{
	sendMsgBuffer[0] = SI_RESET;
	SL_resetTransmissionFinished(channel);
	SI_Transfer(channel,
                sendMsgBuffer,
                1,
                receivedMsgBuffer,
                3,
                SL_getTransmissionFinishedCallback(channel),
                SI_TRANS_DELAY);
	while(SL_isTransmissionFinished(channel) == 0) usleep(SI_TRANS_DELAY);
}

static void SL_getstatus(u8 channel, char * sendMsgBuffer, char * receivedMsgBuffer)
{
	sendMsgBuffer[0] = SI_STATUS;
	SL_resetTransmissionFinished(channel);
	SI_Transfer(channel,
                sendMsgBuffer,
                1,
                receivedMsgBuffer,
                3,
                SL_getTransmissionFinishedCallback(channel),
                SI_TRANS_DELAY); 
	while(SL_isTransmissionFinished(channel) == 0) usleep(SI_TRANS_DELAY);
}

