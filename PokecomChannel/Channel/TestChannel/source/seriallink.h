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

#define MAX_MSG_SIZE 4096

#define VIRTUAL_CHANNEL_SIZE 16

#define MAX_CONNECTION_LOOPS 1000

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

static int SL_recv(u8 channel, u8 pktIn[4])
{
    u8 pktOut[1];
    pktOut[0] = SI_READ;
    SL_resetTransmissionFinished(channel);

    SI_Transfer(channel,                                     // Channel (which gc port)
                pktOut,                                      // Out buffer 
                1,                                           // Out msg length
                pktIn,                                       // In buffer
                4,                                           // In msg length
                SL_getTransmissionFinishedCallback(channel), // transfer finished callback
                SI_TRANS_DELAY);                             // Delay between transfers 

    for (int i = 0; SL_isTransmissionFinished(channel) == 0; i++)
    {
        if (i > MAX_CONNECTION_LOOPS)
        {
            return -1;
        }
        usleep(SI_TRANS_DELAY);
    }
    return 0;
}

static int SL_send(u8 channel, u32 msg)
{
    u8 pktOut[5];
    u8 pktIn[1];
    pktIn[0] = 0;

	pktOut[0]=SI_WRITE; 
    pktOut[1]=(msg>>0)&0xFF; 
    pktOut[2]=(msg>>8)&0xFF;
    pktOut[3]=(msg>>16)&0xFF; 
    pktOut[4]=(msg>>24)&0xFF;
	SL_resetTransmissionFinished(channel);
	
	SI_Transfer(channel,
                pktOut,
                5,
                pktIn,
                1,
                SL_getTransmissionFinishedCallback(channel),
                SI_TRANS_DELAY);

	for (int i = 0; SL_isTransmissionFinished(channel) == 0; i++)
    {
        if (i > MAX_CONNECTION_LOOPS)
        {
            return -1;
        }
        usleep(SI_TRANS_DELAY);
    }
    return 0;
}


static int SL_reset(u8 channel)
{
    u8 pktIn[4];
    u8 pktOut[1];
    pktOut[0] = SI_RESET;

	SL_resetTransmissionFinished(channel);
	SI_Transfer(channel,
                pktOut,
                1,
                pktIn,
                4,
                SL_getTransmissionFinishedCallback(channel),
                SI_TRANS_DELAY);

	for (int i = 0; SL_isTransmissionFinished(channel) == 0; i++)
    {
        if (i > MAX_CONNECTION_LOOPS)
        {
            return -1;
        }
        usleep(SI_TRANS_DELAY);
    }
    return 0;
}

static int SL_getstatus(u8 channel, u8 pktIn[4])
{
    u8 pktOut[1];
    pktOut[0] = SI_STATUS;

	SL_resetTransmissionFinished(channel);
	SI_Transfer(channel,
                pktOut,
                1,
                pktIn,
                4,
                SL_getTransmissionFinishedCallback(channel),
                SI_TRANS_DELAY); 

	for (int i = 0; SL_isTransmissionFinished(channel) == 0; i++)
    {
        if (i > MAX_CONNECTION_LOOPS)
        {
            return -1;
        }
        usleep(SI_TRANS_DELAY);
    }
    return 0;
}

