/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * linkcableclient.h
 * Client that connections to the GBA via gamecube port on wii
 ***************************************************************************/

#ifndef _LINKCABLECLIENT_H_
#define _LINKCABLECLIENT_H_

#include <malloc.h>
#include <ogcsys.h>
#include <gccore.h>
#include <network.h>
#include <unistd.h>

/**
* Unlike a gc controller, plugging in a GBA will not immediately make it show up when scanning ports
* instead you will often not see any device is plugged in at all. However when powering on it will 
* predictably show up as SI_GBA then SI_GBA_BIOS before returning to 'no device'
*/
// Selection of serial input identifier codes
#define SI_ERROR_UNDER_RUN      0x0001
#define SI_ERROR_OVER_RUN       0x0002
#define SI_ERROR_COLLISION      0x0004
#define SI_ERROR_NO_RESPONSE    0x0008
#define SI_ERROR_WRST           0x0010
#define SI_ERROR_RDST           0x0020
#define SI_ERROR_UNKNOWN        0x0040
#define SI_ERROR_BUSY           0x0080
#define SI_TYPE_N64             0x00000000u
// #define SI_TYPE_GC              0x08000000u // This is now already defined in libogc
#define SI_GBA                  (SI_TYPE_N64 | 0x00040000)
#define SI_GBA_BIOS             (SI_TYPE_N64 | 0x00040800)
#define SI_GC_CONTROLLER        (SI_TYPE_GC | SI_GC_STANDARD)

#define SI_STATUS_CONNECTED 0x10


// Client Connector state (lifecycle state in the connection loop)
enum {
    SERIAL_STATE_SEARCHING_FOR_GBA,
	SERIAL_STATE_INIT,
	SERIAL_STATE_WAITING,
	SERIAL_STATE_SENDING,
	SERIAL_STATE_RECEIVING,
	SERIAL_STATE_DONE
};

// Connection states 
enum {
    CONNECTION_NO_GBA, // When no gba has been detected in the gc port yet
    CONNECTION_STARTING, // When a new conneciton is detected and preparing to connect
    CONNECTION_CONNECTED // When a connection has been established with the gba
};

typedef struct {
	u8 connectionResult; //!< State the (externally visible) client is in i.e if it's connected or has had an error 
    u8 internalState; //!<  State the (internal) current connection is in i.e sending data, waiting e.t.c

    bool requestSend; //!< If there is data waiting to be sent
    bool requestReceive; //!< If we are waiting to fetch data
    bool requestStop; //!< If we are waiting to stop

    u8 gcport; //!< the gamecube port we are listening on (starting from 0)
    char receivedMsgBuffer[1024]; //!< Where we store data that has been recived
    char sendMsgBuffer[1024]; //!< Where we store data that we want to send when ready
} SerialConnector;

static void *seriald (SerialConnector *connector); //!<  Function that handles the connection loop

// TODO: take a look at access. a bunch of things are currently public that shouldn't be so the static connection thread can access them
class LinkCableClient {
public:
	//!Constructor
	//!\param port Which gamecube port to listen on (a number from 0-3)
    LinkCableClient(u8 gcport);
    //!Destructor
	~LinkCableClient();
    //!Starts listening on a port and will auto connect if device detected
	void Start();
    //!Send data to the GBA
	// void SerialSend(char * toSend);
    // //!Read data from the GBA
	// char* SerialReceive();
    //! Returns the state of the current connection (i.e if the gba is connected or not)
    u8 GetConnectionResult();
    //!Reset the serial connection
	// void SerialReset();
    // //!Query the status of the serial conneciton (with the results written to the message buffer)
	// void SerialStatus();

    lwp_t serd_handle; //!< Handle for the thread doing the connection

    SerialConnector connector; //!< Struct to handle the connection information that can be passed to the thread

};















#endif