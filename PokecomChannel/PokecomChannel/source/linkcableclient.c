/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * linkcableclient.cpp
 * Client that connections to the GBA via gamecube port on wii
 ***************************************************************************/

#include "linkcableclient.h"

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <gccore.h>
#include <string.h>
#include <malloc.h>
#include <ogcsys.h>
#include <network.h>
#include <debug.h>
#include <errno.h>
#include <wiiuse/wpad.h>
#include "seriallink.h"
#include "pokestring.h"
#include "uilogger.h"

#define ENABLE_DEBUG_LOG   // enable ERROR_LOG

/*
* Logging in areas where timing is critical means you get different behaviour when logging vs not logging
* To try and keep the behaviour constant there are macros for regular logging + logging that will be replaced with constant delays
*/
#ifdef ENABLE_DEBUG_LOG
#define LOG_N(x)  { printf(x); }
#define LOG_A(x, ...) { printf(x,## __VA_ARGS__); }
#define LOG_NS(x)  { printf(x); }
#define LOG_AS(x, ...) { printf(x, ## __VA_ARGS__); }
#else
#define LOG_N(x) { /*Nothing*/ }
#define LOG_A(x, ...) { /*Nothing*/ }
#define LOG_NS(x) { usleep(10000); }
#define LOG_AS(x, ...) { usleep(10000); }
#endif

#define SERVER_NAME_REQUEST "NR_"
#define WELCOME_REQUEST "WR_"
#define SEND_PLAYER_DATA "PD_"

#define NET_CONN_HANDSHAKE_REQ 0xCAD0 // Sent by the gba to handshake
#define NET_CONN_HANDSHAKE_RES_NO_INTERNET 0xCAD1 // Response to the gba if we have no internet
#define NET_CONN_HANDSHAKE_RES_ONLINE 0xCAD2 // Response to the gba if we have internet

#define MAX_MSG_SIZE 4096
#define VIRTUAL_CHANNEL_SIZE 16

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
// #define SI_TYPE_GC              0x08000000u
#define SI_GBA                  (SI_TYPE_N64 | 0x00040000)
#define SI_GBA_BIOS             (SI_TYPE_N64 | 0x00040800)
#define SI_GC_CONTROLLER        (SI_TYPE_GC | SI_GC_STANDARD)

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


// Serial Data Commands
#define SI_STATUS 0x00
#define SI_READ 0x14
#define SI_WRITE 0x15
#define SI_RESET 0xFF
#define SI_COMMAND_LENGTH 1 // The first byte is the command
// The GBA has multiple transfer modes. Normally it would be in 32 bit mode i.e size 4
// However we are using it in SIO_MULTI_MODE where 16 bits are send and 16 bits are receive
// This gives the buffer a length of 2. Then we have to prepend the command byte, so length 3
#define SI_DATA_LENGTH 5

#define SI_STATUS_CONNECTED 0x10

#define MAX_TRANS_SIZE 1024
#define TCP_FLAGS 0

#define SERVER_NAME_SIZE 32

/*
* Honestly, I give up... trying to get get a good speed on a real wii with a ton of latency and dolphin with no latency 
* is impossible. So we just detect if they are running dolphin and prevent the slow down fallback option.
*/
#define SPR_ECID_U        924
#define __stringify_1(x)        #x
#define __stringify(x)          __stringify_1(x)

#define mfspr(rn)       ({unsigned long rval; \
                    asm volatile("mfspr %0," __stringify(rn) \
                            : "=r" (rval)); rval; })
bool IsDolphin(void)
{        
    return (mfspr(SPR_ECID_U) == 0x0d96e200);
}

// ======================= GBA LINK STUFF ======================================================

enum {
    SERIAL_STATE_SEARCHING_FOR_GBA,
	SERIAL_STATE_INIT,
	SERIAL_STATE_WAITING,
	SERIAL_STATE_SENDING,
	SERIAL_STATE_RECEIVING,
	SERIAL_STATE_DONE,
	SERIAL_STATE_ERROR
};

// GC port connection states 
enum {
    SERIAL_NO_GBA, // When no gba has been detected in the gc port yet
    SERIAL_CONNECTED // When a connection has been established with the gba
};

typedef struct {
	char playerName[8];
	u16 trainerId;
	u8 gender;
	char gameName[20];
} PlayerData;

typedef struct {
	PlayerData playerData; //!< game data for player connected to the port

	u8 connectionResult; //!< State the (externally visible) client is in i.e if it's connected or has had an error 
    u8 internalState; //!<  State the (internal) current connection is in i.e sending data, waiting e.t.c

    u8 requestSend; //!< If there is data waiting to be sent
    u8 requestReceive; //!< If we are waiting to fetch data
    u8 requestStop; //!< If we are waiting to stop

    u8 gcport; //!< the gamecube port we are listening on (starting from 0)
    char receivedMsgBuffer[MAX_MSG_SIZE]; //!< Where we store data that has been recived from the gba/server
} SerialConnector;

// ======================= HTTP STUFF ======================================================

// Client Connector state (lifecycle state in the connection loop)
enum {
	TCP_STATE_INIT = 0,
	TCP_STATE_WAITING,
	TCP_STATE_SENDING,
	TCP_STATE_FETCHING,
	TCP_STATE_DONE
};

typedef struct {
	u8 connectionResult; //!< State the (externally visible) client is in i.e if it's connected or has had an error 
    u8 internalState; //!<  State the (internal) current connection is in i.e sending data, waiting e.t.c

    bool requestSend; //!< If there is data waiting to be sent
    bool requestFetch; //!< If we are waiting to fetch data
    bool requestStop; //!< If we are waiting to stop
	bool requestReset; //!< If we need to reconnect to the socket

	bool threadActive; //!< If the thread using the connector is active

	u8  trVitrualChannel; //!< The virtual channel we start transmitting from
	u16 trSize; //!< The size of the data we are transmitting

    char *remoteAddressAndPort; //!< the address we are connecting to
    char fetchedMsgBuffer[1024]; //!< Where we store data that has been recived
    char sendMsgBuffer[1024]; //!< Where we store data that we want to send when ready
	SerialConnector *serialConnector; //!< A Reference serial connector so we can write data directly to its buffer
	int sock; //!< The socket we are currently connected to
	bool waitingForServer; //!< If we need to reconnect to the socket
} TCPConnector;

// ======================= Vars ======================================================
static char overrideAddress[32]; // = "192.168.1.10:9000"; // = "127.0.0.1:9000"; // Some examples of what you might want to use testing locally or on dolphin
static char serverName[SERVER_NAME_SIZE];
static char playerNames[4][10];
static u32 isPlayerConnected[4];

// ======================= Functions ======================================================

static void *httpd (TCPConnector *connector);
static void *seriald (void * port);

u32 hasServerName()
{
	return serverName[0] != 0;
}

char* getServerName()
{
	return serverName;
}

u32 isConnected(u32 port)
{
	return isPlayerConnected[port];
}

u32 hasPlayerName(u32 port)
{
	return playerNames[port][0] != 0;
}

char* getPlayerName(u32 port)
{
	return playerNames[port];
}

void setOverrideAddress(char* ipv4)
{
	strcpy(overrideAddress, ipv4);
}

u32 testTCPConnection(char* ipv4)
{
	s32 ret;

	char localip[16] = {0};
	char gateway[16] = {0};
	char netmask[16] = {0};

	ret = if_config ( localip, netmask, gateway, TRUE, 20);


	if (ret < 0) 
    {
		return CONNECTION_ERROR_NO_NETWORK_DEVICE;
	}

	char addrCopy[64];
	strcpy(addrCopy, ipv4);
	char * ipOrDomainName; 
	char * portString; 
	char * token = strtok(addrCopy, ":");
	int port = 80;
	if(token != NULL) 
	{
		ipOrDomainName = token;
		portString = strtok(NULL, ":");
		if (portString != NULL && portString[0] != '\0')
		{
			char *temp;
			port = strtol(portString, &temp, 10);
		}
	}
	else
	{
		return CONNECTION_ERROR_INVALID_IP;
	}

	struct sockaddr_in server;
	struct in_addr ipTest;

	memset (&server, 0, sizeof (server));
	memset (&ipTest, 0, sizeof (ipTest));

	if (inet_aton(ipOrDomainName, &ipTest))
	{
		server.sin_family= AF_INET;
		server.sin_len = sizeof (struct sockaddr_in); 
		server.sin_port= htons (port);
		server.sin_addr.s_addr = inet_addr(ipOrDomainName);
	}
	else
	{
		return CONNECTION_ERROR_CONNECTION_FAILED;
	}

	int sock = -1;
	sock = net_socket (AF_INET, SOCK_STREAM, IPPROTO_IP);
	s32 conn = net_connect(sock, (struct sockaddr *) &server, sizeof server);
	if (conn < 0) 
	{
		return CONNECTION_ERROR_CONNECTION_FAILED;
	}

	char msgBuffer[100];
	memset (&msgBuffer, 0, 100);
	conn = net_recv (sock, msgBuffer, 100, TCP_FLAGS);
	conn = net_send(sock, SERVER_NAME_REQUEST, strlen(SERVER_NAME_REQUEST), TCP_FLAGS);

	memset (msgBuffer, 0, 100);
	conn = net_recv(sock, msgBuffer, 100, TCP_FLAGS);

	net_close(sock);

	if (msgBuffer[0] == 'S' && msgBuffer[1] == 'N' && msgBuffer[2] == '_') 
	{
		if (!hasServerName())
		{
			for (int i = 3; i < SERVER_NAME_SIZE - 1; i++)
			{
				serverName[i - 3] = msgBuffer[i];
			}
		}
		return CONNECTION_SUCCESS;
	} 

	return CONNECTION_ERROR_INVALID_RESPONSE;
}

static	lwp_t httd_handles[4] = { (lwp_t)LWP_THREAD_NULL, (lwp_t)LWP_THREAD_NULL, (lwp_t)LWP_THREAD_NULL, (lwp_t)LWP_THREAD_NULL };
static	lwp_t serd_handles[4] = { (lwp_t)LWP_THREAD_NULL, (lwp_t)LWP_THREAD_NULL, (lwp_t)LWP_THREAD_NULL, (lwp_t)LWP_THREAD_NULL };

static void startNetworkThread(TCPConnector *httpArgs)
{
	LOG_AS("Http Handle is %x\n", httd_handles[httpArgs->serialConnector->gcport]);
	if (httd_handles[httpArgs->serialConnector->gcport] != LWP_THREAD_NULL && httpArgs->threadActive == 1)
	{
		if (httpArgs->waitingForServer)
		{
			LOG_NS("Thread already exists but is stuck. We need to recreate it.\n");
			LWP_SuspendThread(httd_handles[httpArgs->serialConnector->gcport]);
			usleep(10000);
			net_close (httpArgs->sock);
			usleep(10000);
			httpArgs->requestStop = 1;
			LWP_ResumeThread(httd_handles[httpArgs->serialConnector->gcport]);
			LWP_JoinThread(httd_handles[httpArgs->serialConnector->gcport], NULL);
			httpArgs->waitingForServer = 0;
		}
		else 
		{
			LOG_NS("Thread already exists. Reseting to init\n");
			httpArgs->requestReset = 1;
			return;
		}
	}

	httpArgs->threadActive = 1;

	s32 ret;

	char localip[16] = {0};
	char gateway[16] = {0};
	char netmask[16] = {0};

    httpArgs->requestSend = 0;
    httpArgs->requestFetch = 0;
    httpArgs->requestStop = 0;
	httpArgs->requestReset = 0;
	httpArgs->connectionResult = CONNECTION_INIT;

	ret = if_config ( localip, netmask, gateway, TRUE, 20);

	if (ret>=0) 
    {
		LOG_AS("Network configured, ip: %s, gw: %s, mask %s\n", localip, gateway, netmask);

		httpArgs->internalState = TCP_STATE_INIT;

		LWP_CreateThread(&httd_handles[httpArgs->serialConnector->gcport], /* thread handle */
			            (void* (*)(void*))  httpd,                         /* code */
			            httpArgs,                                          /* arg pointer for thread */
			            NULL,			                                   /* stack base */
			            8*1024,	                                           /* stack size */
			            200				                                   /* thread priority */ );

	} 
    else 
    {
		LOG_NS("Network configuration failed!\n");
		httpArgs->internalState = CONNECTION_ERROR_NO_NETWORK_DEVICE;
	}
}

void setupGBAConnectors() 
{
	LOG_N("\nStarting Pokecom Channel\n");

	u8 *port0 = malloc(sizeof(*port0));
	*port0 = 0;
	LWP_CreateThread(&serd_handles[0],	            /* thread handle */
			         seriald,                       /* code */
			         (void *) port0,		        /* arg pointer for thread */
			         NULL,			                /* stack base */
			         16*1024,		                /* stack size */
			         250          			        /* thread priority */ );

				
	u8 *port1 = malloc(sizeof(*port1));
	*port1 = 1;
	LWP_CreateThread(&serd_handles[1],	            /* thread handle */
			         seriald,                       /* code */
			         (void *) port1,		        /* arg pointer for thread */
			         NULL,			                /* stack base */
			         16*1024,		                /* stack size */
			         240          			        /* thread priority */ );

	u8 *port2 = malloc(sizeof(*port2));
	*port2 = 2;
	LWP_CreateThread(&serd_handles[2],	            /* thread handle */
			         seriald,                       /* code */
			         (void *) port2,		        /* arg pointer for thread */
			         NULL,			                /* stack base */
			         16*1024,		                /* stack size */
			         230          			        /* thread priority */ );

	u8 *port3 = malloc(sizeof(*port3));
	*port3 = 3;
	LWP_CreateThread(&serd_handles[3],	            /* thread handle */
			         seriald,                       /* code */
			         (void *) port3,		        /* arg pointer for thread */
			         NULL,			                /* stack base */
			         16*1024,		                /* stack size */
			         220          			        /* thread priority */ );

}

// --------------------------------------------------------------------------------
static void *seriald (void * port)
{
	SerialConnector connector;
	connector.gcport = *(u8 *) port;
	connector.requestSend = 0;
	connector.requestReceive = 0;
	connector.requestStop = 0;
	connector.internalState = SERIAL_STATE_INIT;
	connector.connectionResult = SERIAL_NO_GBA;

	print_ui_log("STARTING GBA CONN");

	LOG_AS("Waiting for a GBA (via DOL-011) in port %x...\n", connector.gcport);

	TCPConnector tcpConnector;
	tcpConnector.remoteAddressAndPort = "127.0.0.1:9000";
	tcpConnector.serialConnector = &connector;

    int active = 1;    
	u16 msgBytesCount = 0;
	u8 pkt[4];
	int commResult = 0;
	u16 msgCheckBytes = 0xFFFF;
	u16 msgBytesOffset = 0;

    while(active) {

        switch (connector.internalState) 
        {
            case SERIAL_STATE_INIT: 
            {
                SL_reset(connector.gcport);
				SL_resetDeviceType(connector.gcport);
				usleep(10000);
                commResult = SL_getstatus(connector.gcport, pkt);
				SI_GetTypeAsync(connector.gcport, SL_getDeviceTypeCallback(connector.gcport));
				usleep(10000);
				
				if (commResult < 0)
				{
					connector.internalState = SERIAL_STATE_ERROR;
				}
                else if (pkt[2]&SI_STATUS_CONNECTED && SL_getDeviceType(connector.gcport) & SI_GBA)
                {
					LOG_AS("Connection Established port %x\n", connector.gcport);
                    connector.internalState = SERIAL_STATE_WAITING;
					connector.connectionResult = SERIAL_CONNECTED;
					isPlayerConnected[connector.gcport] = 1;
                }
                else
                {
                    usleep(10000);
                }

            } break;
            case SERIAL_STATE_WAITING:
            {
                commResult = SL_recv(connector.gcport, pkt);

				//LOG_AS("Reading %x with first %x and second %x\n", (u16) (pkt[0] | pkt[1] << 8), pkt[0], pkt[1]);

				if (commResult < 0)
				{
					connector.internalState = SERIAL_STATE_WAITING;
				}
				else if (NET_CONN_SEND_ANY == pkt[1]) // We are reciving data from the GBA
                {
					msgBytesCount = (u16) (pkt[2] | pkt[3] << 8);

					msgBytesOffset = pkt[0] * VIRTUAL_CHANNEL_SIZE;
					
					LOG_AS("Got Cmd %02X %02X %02X %02X\n", pkt[0], pkt[1], pkt[2], pkt[3]);
					LOG_NS("Receiving message \n");

					msgCheckBytes = 0xFFFF;
					msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
					msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);

					LOG_AS("Check after CMD %x\n", msgCheckBytes);
                    connector.internalState = SERIAL_STATE_RECEIVING;
                }
                else if (NET_CONN_RECV_ANY == pkt[1])  // We are sending data to the GBA
                {
					msgBytesCount = (u16) (pkt[2] | pkt[3] << 8);

					msgBytesOffset = pkt[0] * VIRTUAL_CHANNEL_SIZE;
					
					LOG_AS("Got Cmd %02X %02X %02X %02X\n", pkt[0], pkt[1], pkt[2], pkt[3]);
					LOG_AS("Check after CMD %x\n", msgCheckBytes);
					LOG_NS("Sending message \n");
                    connector.internalState = SERIAL_STATE_SENDING;
                }
				else if ((u16) (pkt[0] | pkt[1] << 8) == NET_CONN_BCLR_REQ)
				{
					LOG_NS("Resetting MSG Buffer\n");
					memset(connector.receivedMsgBuffer,0,MAX_MSG_SIZE);
					memset(tcpConnector.fetchedMsgBuffer,0,1024);
					usleep(1000);
				}
				else if (NET_CONN_PINF_REQ == (u16) (pkt[0] | pkt[1] << 8))
				{
					msgCheckBytes = 0xFFFF;
					msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
					msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);


					if (validatePokeStringMsg(connector.receivedMsgBuffer, 0, 8))
					{
						bytesToChars(connector.receivedMsgBuffer, 0, 8);
						LOG_AS("\n----- PLAYER INFO -----\nNAME: %s\n", &connector.receivedMsgBuffer[0]);

						for (int i = 0; i < 8; i++) 
						{
							connector.playerData.playerName[i] = connector.receivedMsgBuffer[i];
							playerNames[connector.gcport][i] = connector.receivedMsgBuffer[i];
						}


						if (connector.receivedMsgBuffer[8] % 2 == 0)
						{
							LOG_NS("GENDER: BOY\n");
							connector.playerData.gender = 0;
						}
						else 
						{
							LOG_NS("GENDER: GIRL\n");
							connector.playerData.gender = 1;
						}

						LOG_AS("TRAINER ID: %d\n", (u16) (connector.receivedMsgBuffer[10] + (connector.receivedMsgBuffer[11] << 8)));
						connector.playerData.trainerId = (u16) (connector.receivedMsgBuffer[10] + (connector.receivedMsgBuffer[11] << 8));

					}

					if (validatePokeStringMsg(connector.receivedMsgBuffer, 32, 20))
					{
						bytesToChars(connector.receivedMsgBuffer, 32, 20);
						LOG_AS("GAME: %s\n\n", &connector.receivedMsgBuffer[32]);

						for (int i = 0; i < 20; i++) 
							connector.playerData.gameName[i] = connector.receivedMsgBuffer[32+i];

					}

					SL_send(connector.gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));
					usleep(1000);
				}
				else if (NET_CONN_CINF_REQ == (u16) (pkt[0] | pkt[1] << 8))
				{
					msgCheckBytes = 0xFFFF;
					msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
					msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);

					if (validatePokeStringMsg(connector.receivedMsgBuffer, 0, msgBytesCount))
					{
						bytesToChars(connector.receivedMsgBuffer, 0, msgBytesCount);
						connector.receivedMsgBuffer[msgBytesCount + 1]  = '\0'; // Make sure the string is actually terminated
						strcpy(tcpConnector.remoteAddressAndPort, connector.receivedMsgBuffer);
						LOG_AS("\n----- SERVER INFO -----\nADDRESS: %s\n", &connector.receivedMsgBuffer[0]);
						startNetworkThread(&tcpConnector);
					}

					SL_send(connector.gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));
					usleep(1000);
				}
				else if (NET_CONN_TRAN_ANY == pkt[1])
				{
					msgCheckBytes = 0xFFFF;
					msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
					msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);


					tcpConnector.trVitrualChannel = pkt[0];

					if (((u16) (pkt[2] | pkt[3] << 8)) + (VIRTUAL_CHANNEL_SIZE * tcpConnector.trVitrualChannel) <= MAX_TRANS_SIZE) 
					{
						LOG_AS("Setting tr size to %x \n", ((u16) (pkt[2] | pkt[3] << 8)));
						tcpConnector.trSize = (u16) (pkt[2] | pkt[3] << 8);
					}
					else
					{
						LOG_NS("WARNING - A request was made to transmit more than the max about of data\n");
						tcpConnector.trVitrualChannel = 0;
						tcpConnector.trSize = MAX_TRANS_SIZE;
					}


					SL_send(connector.gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));
					tcpConnector.requestSend  = 1;
					usleep(1000);
				}
				else if (NET_CONN_LIFN_REQ == (u16) (pkt[0] | pkt[1] << 8))
				{
					//LOG_NS("\n----- GBA REQUESTING NETWORK INFO------ \n");
					u8 networkBusyState = 0; // Not_Ready 

					if (tcpConnector.internalState == TCP_STATE_WAITING && 
					    tcpConnector.requestStop == 0 && 
						tcpConnector.requestReset == 0 && 
						tcpConnector.requestSend == 0 &&
						tcpConnector.requestFetch == 0)
					{
						networkBusyState = 1; // Ready
					}

					SL_send(connector.gcport, (u32) (NET_CONN_LIFN_REQ << 16) | ((u16) (tcpConnector.connectionResult | networkBusyState << 8)));
					usleep(1000);
				}
                else 
                {
                    //VIDEO_WaitVSync();
					usleep(1000);
                }

            } break;
            case SERIAL_STATE_SENDING:
            {
				if (msgBytesCount > MAX_MSG_SIZE || msgBytesCount == 0)
				{
					LOG_AS("Skipping message too long %x \n", msgBytesCount);
				}
				else
				{
					msgCheckBytes = 0xFFFF;

					for(int i = 0; i <= msgBytesCount - 1; i+=4)
					{
						// Timeing can be quite precise so we give a generous delay to avoid duplicate messages
						usleep(500);

						if (i <= MAX_MSG_SIZE)
						{
							pkt[0] = connector.receivedMsgBuffer[msgBytesOffset + i];
						}
						else 
						{
							pkt[0] = 0;
						}

						if (i + 1 <= MAX_MSG_SIZE)
						{
							pkt[1] = connector.receivedMsgBuffer[msgBytesOffset + i + 1];
						}
						else 
						{
							pkt[1] = 0;
						}

						if (i + 2 <= MAX_MSG_SIZE)
						{
							pkt[2] = connector.receivedMsgBuffer[msgBytesOffset + i + 2];
						}
						else
						{
							pkt[2] = 0;
						}

						if (i + 3 <= MAX_MSG_SIZE)
						{
							pkt[3] = connector.receivedMsgBuffer[msgBytesOffset + i + 3];
						}
						else
						{
							pkt[3] = 0;
						}

						commResult = SL_send(connector.gcport, (pkt[0] << 24) | (pkt[1] << 16) | (pkt[2]<< 8) | pkt[3]);

						LOG_AS("Written To GBA %x %02X %02X %02X %02X\n", i, pkt[0], pkt[1], pkt[2], pkt[3]);

						if (commResult < 0)
						{
							msgBytesCount = 0;
						}

						msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
						msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);

						LOG_AS("Check after %d %x\n", i, msgCheckBytes);

					}

					usleep(500);

					commResult = SL_send(connector.gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));
					LOG_AS("MSG CHECK: %x\n", msgCheckBytes);

					usleep(50000);


					if (commResult < 0)
					{
						connector.internalState = SERIAL_STATE_SENDING;
					}
					else 
					{
						connector.requestSend = 0;
						connector.internalState = SERIAL_STATE_WAITING;
					}
				}

            } break;
            case SERIAL_STATE_RECEIVING:
            {
				if (msgBytesCount > MAX_MSG_SIZE || msgBytesCount == 0)
				{
					LOG_AS("Skipping message too long %x \n", msgBytesCount);
				}
				else
				{
					for(int i = 0; i <= msgBytesCount - 1; i+=4)
					{
						// Timeing can be quite precise so we give a generous delay to avoid duplicate messages
						usleep(500);

						commResult = SL_recv(connector.gcport, pkt);
						LOG_AS("Read From GBA %x %02X %02X %02X %02X\n", i, pkt[0], pkt[1], pkt[2], pkt[3]);

						if (i <= MAX_MSG_SIZE)
							connector.receivedMsgBuffer[msgBytesOffset + i]     =  pkt[0];

						if (i + 1 <= MAX_MSG_SIZE)
							connector.receivedMsgBuffer[msgBytesOffset + i + 1] =  pkt[1];

						if (i + 2 <= MAX_MSG_SIZE)
							connector.receivedMsgBuffer[msgBytesOffset + i + 2] =  pkt[2];

						if (i + 3 <= MAX_MSG_SIZE)
							connector.receivedMsgBuffer[msgBytesOffset + i + 3] =  pkt[3];


						if (commResult < 0)
						{
							msgBytesCount = 0;
						}

						msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
						msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);

						LOG_AS("Check after %d %x\n", i, msgCheckBytes);

					}
					
					commResult = SL_send(connector.gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));
					LOG_AS("MSG CHECK: %x\n", msgCheckBytes);

					usleep(500);

					if (commResult < 0)
					{
						connector.internalState = SERIAL_STATE_RECEIVING;
					}
					else
					{
						connector.requestReceive = 1;
						connector.internalState = SERIAL_STATE_WAITING;
					}
				}

            } break;
            case SERIAL_STATE_DONE:
            {
              connector.internalState = SERIAL_STATE_INIT;
              active = 0;
            } break;
			case SERIAL_STATE_ERROR:
            {
			  print_ui_log("SERIAL ERROR");
			  LOG_NS("Connection Error Resetting...\n");

			  if (!IsDolphin())
				switchToSlowTransfer();

			  connector.requestSend = 0;
			  connector.requestReceive = 0;
			  connector.requestStop = 0;
			  connector.internalState = SERIAL_STATE_INIT;
			  connector.connectionResult = SERIAL_NO_GBA;

			  if (tcpConnector.internalState != TCP_STATE_INIT)
			  {
				tcpConnector.internalState = TCP_STATE_WAITING;
				tcpConnector.requestReset = 1;
			  }

			  msgBytesCount = 0;
			  pkt[0] = 0;
			  pkt[1] = 0;
			  pkt[2] = 0;
			  pkt[3] = 0;
			  commResult = 0;
			  msgCheckBytes = 0xFFFF;
			  msgBytesOffset = 0;
            } break;
            
        }

    }

   free(port);
   return NULL;
}

//---------------------------------------------------------------------------------
void *httpd (TCPConnector *connector) {
//---------------------------------------------------------------------------------

	LOG_NS("Starting Network Thread\n");
	usleep(100000);

	char addrCopy[64];

	connector->internalState = TCP_STATE_INIT;

	if (connector->remoteAddressAndPort[0] == '\0')
	{
		connector->connectionResult = CONNECTION_ERROR_INVALID_IP;
		connector->threadActive = 0;
		return NULL;
	}
	
	connector->remoteAddressAndPort[63] = '\0'; // Make sure the string is actually terminated
	if (overrideAddress[0] != 0)
	{
		strcpy(addrCopy, overrideAddress);
	}
	else
	{
		strcpy(addrCopy, connector->remoteAddressAndPort);
	}

	usleep(100000);

    char * ipOrDomainName; 
    char * portString; 
    char * token = strtok(addrCopy, ":");
	int port = 80;
    if(token != NULL) 
    {
        ipOrDomainName = token;
        portString = strtok(NULL, ":");
		if (portString != NULL  && portString[0] != '\0')
		{
			char *temp;
			port = strtol(portString, &temp, 10);
		}
    }
	else 
	{
		connector->connectionResult = CONNECTION_ERROR_INVALID_IP;
		connector->threadActive = 0;
		return NULL;
	}

	usleep(100000);

	struct sockaddr_in server;
	struct in_addr ipTest;

	memset (&server, 0, sizeof (server));
	memset (&ipTest, 0, sizeof (ipTest));

    if (inet_aton(ipOrDomainName, &ipTest))
	{
		server.sin_family= AF_INET;
		server.sin_len = sizeof (struct sockaddr_in); 
		usleep(100000);
		server.sin_port= htons (port);
		usleep(100000);
		server.sin_addr.s_addr = inet_addr(ipOrDomainName);
		LOG_AS("Creating Connection port %s at address %s\n\n", portString, ipOrDomainName);
	}
	else 
    {
		LOG_NS("Resolving host name\n");
		usleep(100000);

		struct hostent *hp = net_gethostbyname(ipOrDomainName);
		
		if (!(hp->h_addrtype == PF_INET)) 
        {
			LOG_AS("Failed - IPV4 returned for address %s (may only be ipv6)", addrCopy);
			connector->connectionResult = CONNECTION_ERROR_COULD_NOT_RESOLVE_IPV4;
			connector->threadActive = 0;
			return NULL;
		} 

		memset (&server, 0, sizeof (struct sockaddr_in));
		server.sin_family = AF_INET;
		server.sin_len = sizeof (struct sockaddr_in); 
		server.sin_port = htons (port);

		struct in_addr **addr_list;
		addr_list = (struct in_addr **)hp->h_addr_list;
		char* resolvedIP = inet_ntoa(*addr_list[0]);
		server.sin_addr.s_addr = inet_addr(resolvedIP);
		LOG_AS("Creating Connection port %s at address %s using ip (%s)\n\n", portString, ipOrDomainName, resolvedIP);
	} 

	connector->connectionResult = CONNECTION_STARTING;

	connector->sock = -1;
	int active = 1;
	s32 conn = 0;

	while(active) {
		switch (connector->internalState) 
		{
			case TCP_STATE_INIT: 
			{
				LOG_NS("Trying to start connection\n");
				connector->sock = net_socket (AF_INET, SOCK_STREAM, IPPROTO_IP);
				s32 conn = net_connect(connector->sock, (struct sockaddr *) &server, sizeof server);
				if (conn < 0) 
                {
					connector->connectionResult = CONNECTION_ERROR_CONNECTION_FAILED;
					LOG_NS("Connection Failed - Connection To Socket\n");
					connector->threadActive = 0;
					return NULL;
				}

				usleep(5000);

				connector->waitingForServer = 1;

				// Make sure we've already read data that was sent when starting the connection
				conn = net_recv (connector->sock, connector->fetchedMsgBuffer, 100, TCP_FLAGS);

                // Send the string SERVER_NAME_REQUEST to the server
				conn = net_send(connector->sock, SERVER_NAME_REQUEST, strlen(SERVER_NAME_REQUEST), TCP_FLAGS);

                // Read response (which should be server name like SN_<NAME_OF_SERVER>)
				memset (connector->fetchedMsgBuffer, 0, 1024);
				conn = net_recv (connector->sock, connector->fetchedMsgBuffer, 1024, TCP_FLAGS);

				connector->waitingForServer = 0;

				if (!hasServerName())
				{
					for (int i = 3; i < SERVER_NAME_SIZE - 1; i++)
					{
						serverName[i - 3] = connector->fetchedMsgBuffer[i];
					}
				}

				if (connector->fetchedMsgBuffer[0] == 'S' && 
                    connector->fetchedMsgBuffer[1] == 'N' && 
                    connector->fetchedMsgBuffer[2] == '_') 
                {
					LOG_AS("Connected to %s\n", connector->fetchedMsgBuffer + 3);

					connector->waitingForServer = 1;

					conn = net_send(connector->sock, WELCOME_REQUEST, strlen(WELCOME_REQUEST), TCP_FLAGS);
					conn = net_recv (connector->sock, connector->fetchedMsgBuffer, 1024, TCP_FLAGS);

					connector->waitingForServer = 0;

					if (connector->fetchedMsgBuffer[0] == 0x25)
					{
						u16 msgSize = (u16) (connector->fetchedMsgBuffer[3] | connector->fetchedMsgBuffer[2] << 8);
						u16 msgBytesOffset = connector->fetchedMsgBuffer[1] * VIRTUAL_CHANNEL_SIZE;
						
						for (int i = 0; i < msgSize; i++)
						{
							connector->serialConnector->receivedMsgBuffer[msgBytesOffset + i] = connector->fetchedMsgBuffer[i + 5];
						}

					}
					else
					{
						LOG_NS("Error Reading Welcome message\n");
					}

					for (unsigned int i = 0; i < strlen(SEND_PLAYER_DATA); i++) 
						connector->sendMsgBuffer[i] = SEND_PLAYER_DATA[i];

					memcpy(&(connector->sendMsgBuffer)[strlen(SEND_PLAYER_DATA)], &connector->serialConnector->playerData, sizeof(connector->serialConnector->playerData));

					connector->waitingForServer = 1;
					conn = net_send(connector->sock, connector->sendMsgBuffer, strlen(SEND_PLAYER_DATA) + sizeof connector->serialConnector->playerData, TCP_FLAGS);
					connector->waitingForServer = 0;
					connector->connectionResult = CONNECTION_SUCCESS;
					connector->internalState = TCP_STATE_WAITING;

				} 
                else 
                {
					connector->fetchedMsgBuffer[64] = '\0';
					LOG_AS("Handshake Failed got response:\n%s\n", connector->fetchedMsgBuffer);
					connector->connectionResult = CONNECTION_ERROR_INVALID_RESPONSE;
					connector->internalState = TCP_STATE_DONE;
				}
			}	break;
    		case TCP_STATE_WAITING:
			{

				if (connector->requestReset == 1)
				{
					if (connector->sock >= 0)
					{
						net_close (connector->sock);
					}
					
					connector->internalState = TCP_STATE_INIT;
					connector->requestSend = 0;
					connector->requestFetch = 0;
					connector->requestReset = 0;
					connector->requestStop = 0;
				}
                else if (connector->requestSend == 1)
                {
                    connector->internalState = TCP_STATE_SENDING;
                }
                else if (connector->requestFetch == 1)
                {
                    connector->internalState = TCP_STATE_FETCHING;
                }
                else if (connector->requestStop == 1)
                {
                    connector->internalState = TCP_STATE_DONE;
                }
                else 
                {
                    usleep(5000);
                }
			}	break;
			case TCP_STATE_SENDING:
			{
				LOG_AS("Doing Transmission of size %x from ch %x\n", connector->trSize, connector->trVitrualChannel);
				memset (connector->sendMsgBuffer, 0, 1024);
				memcpy(connector->sendMsgBuffer, &(connector->serialConnector->receivedMsgBuffer)[connector->trVitrualChannel * VIRTUAL_CHANNEL_SIZE], connector->trSize);
				connector->waitingForServer = 1;
                conn = net_send(connector->sock, connector->sendMsgBuffer, connector->trSize, TCP_FLAGS);
				connector->waitingForServer = 0;
				LOG_AS("Sending Server Message %02X %02X %02X %02X\n", connector->sendMsgBuffer[0], connector->sendMsgBuffer[1], connector->sendMsgBuffer[2], connector->sendMsgBuffer[3]);
				if (conn < 0) 
                {
					LOG_NS("Connection Failed - Sending Data\n");
					connector->threadActive = 0;
					return NULL;
				} 
				else
				{
					connector->requestFetch = 1;
				}

                connector->requestSend = 0;
				connector->internalState = TCP_STATE_WAITING;
			}	break;
            case TCP_STATE_FETCHING: 
			{
				LOG_NS("Doing Fetch\n");
            	memset (connector->fetchedMsgBuffer, 0, 1024);
				connector->waitingForServer = 1;
				conn = net_recv (connector->sock, connector->fetchedMsgBuffer, 1024, TCP_FLAGS);
				connector->waitingForServer = 0;
				if (conn < 0) 
                {
					LOG_NS("Connection Failed - Fetching Data\n");
					connector->threadActive = 0;
					return NULL;
				} 

				if (connector->fetchedMsgBuffer[0] == 0x25)
				{
					u16 msgSize = (u16) (connector->fetchedMsgBuffer[3] | connector->fetchedMsgBuffer[2] << 8);
					u16 msgBytesOffset = connector->fetchedMsgBuffer[1] * VIRTUAL_CHANNEL_SIZE;

					LOG_AS("Copying server response of size %x to v chan %x (offset %x)\n", msgSize, connector->fetchedMsgBuffer[1], msgBytesOffset);
					
					for (int i = 0; i < msgSize; i++)
					{
						connector->serialConnector->receivedMsgBuffer[msgBytesOffset + i] = connector->fetchedMsgBuffer[i + 5];
					}

					LOG_AS("Before Copied Data %02X %02X %02X %02X\n", connector->fetchedMsgBuffer[0 + 5], 
					                                                   connector->fetchedMsgBuffer[1 + 5], 
																	   connector->fetchedMsgBuffer[2 + 5], 
																	   connector->fetchedMsgBuffer[3 + 5]);

					LOG_AS("Final Copied Data %02X %02X %02X %02X\n", connector->serialConnector->receivedMsgBuffer[msgBytesOffset + 0], 
					                                                  connector->serialConnector->receivedMsgBuffer[msgBytesOffset + 1], 
																	  connector->serialConnector->receivedMsgBuffer[msgBytesOffset + 2], 
																	  connector->serialConnector->receivedMsgBuffer[msgBytesOffset + 3]);
					
				}
				else if (connector->fetchedMsgBuffer[0] == 0x00)
				{
					LOG_NS("No Response From Server/Unknown Command Sent\n");
					// We generally get only 0's when the server goes offline. 
					// If we try fetching more data then dolphin (any maybe a wii) can crash (for some reason?) so the safest things seems to be to stop the thread
					connector->threadActive = 0;
					return NULL;
				}
				else
				{
					LOG_NS("Error Reading message\n");
				}

                connector->requestFetch = 0;
                connector->internalState = TCP_STATE_WAITING;
			}	break;
    		case TCP_STATE_DONE:
			{
                net_close (connector->sock);
				active = 0;
				connector->internalState = TCP_STATE_INIT;
			}	break;
		}
		usleep(50000);
	}

	LOG_NS("Stopping Network Thread");
	usleep(50000);
	connector->threadActive = 0;
	return NULL;
}