/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * tcpclient.h
 * Tcp Client to connect bind to remote servers
 ***************************************************************************/

#ifndef _TCPCLIENT_H_
#define _TCPCLIENT_H_

#include <malloc.h>
#include <ogcsys.h>
#include <gccore.h>
#include <network.h>
#include <unistd.h>

// Client Connector state (lifecycle state in the connection loop)
enum {
	TCP_STATE_INIT,
	TCP_STATE_WAITING,
	TCP_STATE_SENDING,
	TCP_STATE_FETCHING,
	TCP_STATE_DONE
};

// Connection states 
enum {
    CONNECTION_SUCCESS, // Bind to remote address
    CONNECTION_READY, // Ready to start a connection
	CONNECTION_ERROR_INVALID_IP, // Not a valid IPv4 Addr
    CONNECTION_ERROR_NO_NETWORK_DEVICE, // No network device (e.g wifi card or ethernet) could be found. The may be an emulator that has no support or a wii mini (which has no wifi)
    CONNECTION_ERROR_CONNECTION_FAILED, // Failed to bind the the address
    CONNECTION_ERROR_INVALID_RESPONSE // Handshake failed when we send RUBY_SAPPHIRE we expect a response SN_<NAME_OF_SERVER>
};

typedef struct {
	u8 connectionResult; //!< State the (externally visible) client is in i.e if it's connected or has had an error 
    u8 internalState; //!<  State the (internal) current connection is in i.e sending data, waiting e.t.c

    bool requestSend; //!< If there is data waiting to be sent
    bool requestFetch; //!< If we are waiting to fetch data
    bool requestStop; //!< If we are waiting to stop

    char *remoteAddressAndPort; //!< the address we are connecting to
    char fetchedMsgBuffer[1024]; //!< Where we store data that has been recived
    char sendMsgBuffer[1024]; //!< Where we store data that we want to send when ready
} Connector;

static void *httpd (Connector *connector); //!<  Function that handles the connection loop

// TODO: take a look at access. a bunch of things are currently public that shouldn't be so the static connection thread can access them
class TCPClient {
public:
	//!Constructor
	//!\param addr IP + Port string i.e 127.0.0.1:9000
    TCPClient(char * addr);
    //!Destructor
	~TCPClient();
    //!Connect to the server
	void Connect();
	//!Disconnect from the server
	void Disconnect();
    //!Send data to the server
	void SendData(char * toSend);
    //!Returns the response from the server
	char* GetResponse();
    //! Returns the error or success state of the current connection
    u8 GetConnectionResult();

    lwp_t httd_handle; //!< Handle for the thread doing the connection

    Connector connector; //!< Struct to handle the connection information that can be passed to the thread

    // TODO: Add a cache map in here. So the wii can pull common requests when idel and use that to send instant responses
};




#endif
