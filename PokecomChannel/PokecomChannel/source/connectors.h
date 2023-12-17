/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * connectors.h
 * Contains the strucs used the the connector clients 
 ***************************************************************************/

#ifndef _CONNECTORS_H_
#define _CONNECTORS_H_

#include "logger.h"

#define MAX_LINK_MSG_SIZE 4096
#define VIRTUAL_CHANNEL_SIZE 16

#define NET_MSG_SIZE 1024

typedef struct {
	char playerName[8];
	u16 trainerId;
	u8 gender;
	char gameName[20];
} PlayerData;

// Client Connector state (internalState) (lifecycle state in the connection loop)
enum {
    SERIAL_STATE_SEARCHING_FOR_GBA,
	SERIAL_STATE_INIT,
	SERIAL_STATE_WAITING,
	SERIAL_STATE_SENDING,
	SERIAL_STATE_RECEIVING,
	SERIAL_STATE_DONE,
	SERIAL_STATE_ERROR
};

// Connection states (connectionResult)
enum {
    CONNECTION_NO_GBA, // When no gba has been detected in the gc port yet
    CONNECTION_STARTING, // When a new conneciton is detected and preparing to connect
    CONNECTION_CONNECTED // When a connection has been established with the gba
};

typedef struct {
	PlayerData playerData; //!< game data for player connected to the port

    u8 internalState; //!<  State the (internal) current connection is in i.e sending data, waiting e.t.c
	u8 connectionResult; //!< State the (externally visible) client is in i.e if it's connected or has had an error 

    u8 requestSend; //!< If there is data waiting to be sent
    u8 requestReceive; //!< If we are waiting to fetch data
    u8 requestStop; //!< If we are waiting to stop

    u8 gcport; //!< the gamecube port we are listening on (starting from 0)
    char receivedMsgBuffer[MAX_LINK_MSG_SIZE]; //!< Where we store data that has been recived from the gba/server
    Logger * LOGGER; //!< to help debug
} SerialConnector;

// Client Connector state (internalState) (lifecycle state in the connection loop)
enum {
	TCP_STATE_INIT,
	TCP_STATE_WAITING,
	TCP_STATE_SENDING,
	TCP_STATE_FETCHING,
	TCP_STATE_DONE
};

// Connection states (connectionResult)
enum {
	CONNECTION_INIT,
    CONNECTION_SUCCESS, // Bind to remote address
    CONNECTION_READY, // Ready to start a connection
	CONNECTION_ERROR_INVALID_IP, // Not a valid IPv4 Addr
    CONNECTION_ERROR_NO_NETWORK_DEVICE, // No network device (e.g wifi card or ethernet) could be found. The may be an emulator that has no support or a wii mini (which has no wifi)
    CONNECTION_ERROR_CONNECTION_FAILED, // Failed to bind the the address
    CONNECTION_ERROR_INVALID_RESPONSE // Handshake failed when we send RUBY_SAPPHIRE we expect a response SN_<NAME_OF_SERVER>
};

typedef struct {
    u8 internalState; //!<  State the (internal) current connection is in i.e sending data, waiting e.t.c
	u8 connectionResult; //!< State the (externally visible) client is in i.e if it's connected or has had an error 

    char serverName[32];

    bool requestSend; //!< If there is data waiting to be sent
    bool requestFetch; //!< If we are waiting to fetch data
    bool requestStop; //!< If we are waiting to stop
	bool requestReset; //!< If we need to reconnect to the socket

	bool threadActive; //!< If the thread using the connector is active

	u8  trVitrualChannel; //!< The virtual channel we start transmitting from
	u16 trSize; //!< The size of the data we are transmitting

    char *remoteAddressAndPort; //!< the address we are connecting to
    char fetchedMsgBuffer[NET_MSG_SIZE]; //!< Where we store data that has been recived
    char sendMsgBuffer[NET_MSG_SIZE]; //!< Where we store data that we want to send when ready
	SerialConnector *serialConnector; //!< A Reference serial connector so we can write data directly to its buffer
} TCPConnector;


#endif