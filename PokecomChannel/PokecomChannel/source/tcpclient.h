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
#include "connectors.h"

// TODO: take a look at access. a bunch of things are currently public that shouldn't be so the static connection thread can access them
class TCPClient {
public:
	//!Constructor
    TCPClient();
    //!Destructor
	~TCPClient();
    //!Tests the connection to the server without needing a serial linked
    void TestConnection(char * addr);
    //!Connect to the server
    //!\param addr IP + Port string i.e 127.0.0.1:9000
	void Connect(char * addr);
	//!Disconnect from the server
	void Disconnect();
    //!Send data to the server
	void SendData(char * toSend);
    //!Returns the response from the server
	char* GetResponse();
    //!Returns the name we got from a server
    char* GetServerName();
    //! Returns the error or success state of the current connection
    u8 GetConnectionResult();

    lwp_t httd_handle; //!< Handle for the thread doing the connection

    TCPConnector connector; //!< Struct to handle the connection information that can be passed to the thread

    // TODO: Add a cache map in here. So the wii can pull common requests when idel and use that to send instant responses
};




#endif
