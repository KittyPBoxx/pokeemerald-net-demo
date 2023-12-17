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
#include "connectors.h"
#include "logger.h"

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

#define MAX_TRANS_SIZE 1024
// Special Commands Recognised by the wii
#define NET_CONN_SEND_REQ 0x1500 // Tell wii you want to send it data              | msg bytes 15 YY XX XX (X is the 16bit size of msg to send, YY is the virtual channel)
#define NET_CONN_SEND_ANY 0x15
#define NET_CONN_RECV_REQ 0x2500 // Tell wii to send us data from the buffer for this devices port | msg bytes 25 YY XX XX (X is the 16bit size of msg to receive, YY is the virtual channel)
#define NET_CONN_RECV_ANY 0x25 
#define NET_CONN_TRAN_ANY 0x13
#define NET_CONN_BCLR_REQ 0x1200 // Tell wii to clear the whole message buffer     | msg bytes 12 00 XX XX (last 16 bits are unused)
#define NET_CONN_PINF_REQ 0x1201 // Tell wii to use current data as player info    | msg bytes 12 01 XX XX (last 16 bits are unused)
#define NET_CONN_CINF_REQ 0x1202 // Tell wii to use current data as server info    | msg bytes 12 02 XX XX (last 16 bits are unused)
// Special Commands Comming from the wii
#define NET_CONN_CHCK_RES 0x1101 // Returning check bytes for the last data sent   | msg bytes 12 01 XX XX (X are the 16bit check bytes, made by XORing each seq 16bits of the msg)
#define NET_CONN_LIFN_REQ 0x2005 // Return information about this devices network connection 

// TODO: take a look at access. a bunch of things are currently public that shouldn't be so the static connection thread can access them
class LinkCableClient {
public:
	//!Constructor
	//!\param port Which gamecube port to listen on (a number from 0-3)
    LinkCableClient(u8 gcport, Logger * LOGGER);
    //!Destructor
	~LinkCableClient();
    //!Starts listening on a port and will auto connect if device detected
	void Start();
    //! Returns the state of the current connection (i.e if the gba is connected or not)
    u8 GetConnectionResult();
    //! Returns true if the player name is populated
    bool HasPlayerName();
    //! Returns the name of the player
    char * GetPlayerName();
    //! Returns true if client has a namer for the server
    bool HasServerName();
    //! Returns the name of the server
    char * GetServerName();

    lwp_t serd_handle; //!< Handle for the thread doing the connection

    SerialConnector connector; //!< Struct to handle the connection information that can be passed to the thread
};

#endif