#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <gccore.h>
#include <string.h>
#include <malloc.h>
#include <ogcsys.h>
#include <gccore.h>
#include <network.h>
#include <debug.h>
#include <errno.h>
#include <wiiuse/wpad.h>
#include "seriallink.h"
#include "pokestring.h"

#define SERVER_NAME_REQUEST "NR_"
#define WELCOME_REQUEST "WR_"
#define SEND_PLAYER_DATA "PD_"

#define SI_TRANS_DELAY 50 // Minimum delay between data transfers

#define NET_CONN_HANDSHAKE_REQ 0xCAD0 // Sent by the gba to handshake
#define NET_CONN_HANDSHAKE_RES_NO_INTERNET 0xCAD1 // Response to the gba if we have no internet
#define NET_CONN_HANDSHAKE_RES_ONLINE 0xCAD2 // Response to the gba if we have internet

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

static void *xfb = NULL;
static GXRModeObj *rmode = NULL;

enum {
    SERIAL_STATE_SEARCHING_FOR_GBA,
	SERIAL_STATE_INIT,
	SERIAL_STATE_WAITING,
	SERIAL_STATE_SENDING,
	SERIAL_STATE_RECEIVING,
	SERIAL_STATE_DONE,
	SERIAL_STATE_ERROR
};

typedef struct {
	char playerName[8];
	u16 trainerId;
	u8 gender;
	char gameName[20];
} PlayerData;


// TODO: I feel like something is zeroing past the end of the receivedMsgBuffer but not sure...
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
	TCP_STATE_INIT,
	TCP_STATE_WAITING,
	TCP_STATE_SENDING,
	TCP_STATE_FETCHING,
	TCP_STATE_DONE
};

// Connection states 
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
} TCPConnector;


// ======================= Functions ======================================================

void *initialise();
static void *httpd (TCPConnector *connector);
static void *seriald (SerialConnector *connector);

static	lwp_t httd_handle = (lwp_t)LWP_THREAD_NULL;
static	lwp_t serd_handle = (lwp_t)LWP_THREAD_NULL;

// Connection states 
enum {
    CONNECTION_NO_GBA, // When no gba has been detected in the gc port yet
    CONNECTION_STARTING, // When a new conneciton is detected and preparing to connect
    CONNECTION_CONNECTED // When a connection has been established with the gba
};

static void startNetworkThread(TCPConnector *httpArgs)
{
	// TODO: If we lost connection to the network we need to kill the old thread and start a new one...

	printf ("Http Handle is %x\n", httd_handle);
	if (httd_handle != LWP_THREAD_NULL && httpArgs->threadActive == 1)
	{
		httpArgs->requestReset = 1;
		printf ("Thread already exists. Reseting to init\n");
		return;
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
		printf ("Network configured, ip: %s, gw: %s, mask %s\n", localip, gateway, netmask);
		httpArgs->connectionResult = CONNECTION_READY;
		httpArgs->internalState = TCP_STATE_INIT;
		LWP_CreateThread(&httd_handle,	             /* thread handle */
						 (void* (*)(void*))  httpd,  /* code */
						 httpArgs,                   /* arg pointer for thread */
						 NULL,			             /* stack base */
						 16*1024,	                 /* stack size */
						 50				             /* thread priority */ );
	} 
    else 
    {
		printf ("Network configuration failed!\n");
		httpArgs->internalState = CONNECTION_ERROR_NO_NETWORK_DEVICE;
	}
}


//---------------------------------------------------------------------------------
int main(int argc, char **argv) {
//---------------------------------------------------------------------------------


	xfb = initialise();

	printf ("\nStarting Pokecom Channel\n");
	// printf("Starting in DEBUG mode UI disabled.\n");
	// printf("Configuring network ...\n");

	// Configure the network interface

	SerialConnector gbaArgs;
	gbaArgs.gcport = 1;
    gbaArgs.requestSend = 0;
    gbaArgs.requestReceive = 0;
    gbaArgs.requestStop = 0;
	gbaArgs.internalState = TCP_STATE_INIT;
	gbaArgs.internalState = SERIAL_STATE_SEARCHING_FOR_GBA;
	gbaArgs.connectionResult = CONNECTION_NO_GBA;

	LWP_CreateThread(&serd_handle,	                /* thread handle */
					 (void* (*)(void*)) seriald,   	/* code */
					 &gbaArgs,		                /* arg pointer for thread */
					 NULL,			                /* stack base */
					 16*1024,		                /* stack size */
					 50				                /* thread priority */ );

	while(1) {

		VIDEO_WaitVSync();
		WPAD_ScanPads();

		int buttonsDown = WPAD_ButtonsDown(0);

		if (buttonsDown & WPAD_BUTTON_HOME) {
			exit(0);
		}
	}

	return 0;
}


//---------------------------------------------------------------------------------
void *httpd (TCPConnector *connector) {
//---------------------------------------------------------------------------------

	char addrCopy[64];

	connector->internalState = TCP_STATE_INIT;

	if (connector->remoteAddressAndPort[0] == '\0')
	{
		connector->connectionResult = CONNECTION_ERROR_INVALID_IP;
		connector->threadActive = 0;
		return NULL;
	}
	
	connector->remoteAddressAndPort[63] = '\0'; // Make sure the string is actually terminated
	strcpy(addrCopy, connector->remoteAddressAndPort);

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
		printf("Failed - Invalid IP");
		connector->connectionResult = CONNECTION_ERROR_INVALID_IP;
		connector->threadActive = 0;
		return NULL;
	}

	struct sockaddr_in server;

	struct in_addr ipTest;
    if (inet_aton(ipOrDomainName, &ipTest))
	{
		memset (&server, 0, sizeof (server));
		server.sin_family= AF_INET;
		server.sin_len = sizeof (struct sockaddr_in); 
		server.sin_port= htons (port);
		server.sin_addr.s_addr = inet_addr(ipOrDomainName);
	}
	else 
    {
		printf("Failed - Invalid IP");
		connector->connectionResult = CONNECTION_ERROR_INVALID_IP;
		connector->threadActive = 0;
		return NULL;
	} 

	printf("Creating Connection port %s at address %s\n\n", portString, ipOrDomainName);


	int sock = -1;
	int active = 1;
	s32 conn = 0;

	while(active) {
		switch (connector->internalState) 
		{
			case TCP_STATE_INIT: 
			{
				printf("Trying to start connection\n");
				sock = net_socket (AF_INET, SOCK_STREAM, IPPROTO_IP);
				s32 conn = net_connect(sock, (struct sockaddr *) &server, sizeof server);
				if (conn < 0) 
                {
					connector->connectionResult = CONNECTION_ERROR_CONNECTION_FAILED;
					printf("Connection Failed - Connection To Socket\n");
					connector->threadActive = 0;
					return NULL;
				}

				// Make sure we've already read data that was sent when starting the conenction
				conn = net_recv (sock, connector->fetchedMsgBuffer, 100, TCP_FLAGS);

                // Send the string RUBY_SAPPHIRE to the server
				conn = net_send(sock, SERVER_NAME_REQUEST, strlen(SERVER_NAME_REQUEST), TCP_FLAGS);

                // Read response (which should be server name like SN_<NAME_OF_SERVER>)
				memset (connector->fetchedMsgBuffer, 0, 1024);
				conn = net_recv (sock, connector->fetchedMsgBuffer, 1024, TCP_FLAGS);

				if (connector->fetchedMsgBuffer[0] == 'S' && 
                    connector->fetchedMsgBuffer[1] == 'N' && 
                    connector->fetchedMsgBuffer[2] == '_') 
                {
                    connector->connectionResult = CONNECTION_SUCCESS;
					connector->internalState = TCP_STATE_WAITING;
					printf("Connected to %s\n", connector->fetchedMsgBuffer + 3);

					conn = net_send(sock, WELCOME_REQUEST, strlen(WELCOME_REQUEST), TCP_FLAGS);

					conn = net_recv (sock, connector->fetchedMsgBuffer, 1024, TCP_FLAGS);

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
						printf("Error Reading Welcome message\n");
					}

					for (int i = 0; i < strlen(SEND_PLAYER_DATA); i++) 
						connector->sendMsgBuffer[i] = SEND_PLAYER_DATA[i];

					memcpy(&(connector->sendMsgBuffer)[strlen(SEND_PLAYER_DATA)], &connector->serialConnector->playerData, sizeof(connector->serialConnector->playerData));

					conn = net_send(sock, connector->sendMsgBuffer, strlen(SEND_PLAYER_DATA) + sizeof connector->serialConnector->playerData, TCP_FLAGS);

				} 
                else 
                {
					connector->fetchedMsgBuffer[64] = '\0';
					printf("Handshake Failed got response:\n%s\n", connector->fetchedMsgBuffer);
					connector->connectionResult = CONNECTION_ERROR_INVALID_RESPONSE;
					connector->internalState = TCP_STATE_DONE;
				}
			}	break;
    		case TCP_STATE_WAITING:
			{

				if (connector->requestReset == 1)
				{
					if (sock >= 0)
					{
						net_close (sock);
					}
					
					connector->internalState = TCP_STATE_INIT;
					connector->requestReset = 0;
				}
                if (connector->requestSend == 1)
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
				printf("Doing Transmission of size %x from ch %x\n", connector->trSize, connector->trVitrualChannel);
				memset (connector->sendMsgBuffer, 0, 1024);
				memcpy(connector->sendMsgBuffer, &(connector->serialConnector->receivedMsgBuffer)[connector->trVitrualChannel * VIRTUAL_CHANNEL_SIZE], connector->trSize);
                conn = net_send(sock, connector->sendMsgBuffer, connector->trSize, TCP_FLAGS);
				printf("Sending Server Message %02X %02X %02X %02X\n", connector->sendMsgBuffer[0], connector->sendMsgBuffer[1], connector->sendMsgBuffer[2], connector->sendMsgBuffer[3]);
				if (conn < 0) 
                {
					printf("Connection Failed - Sending Data\n");
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
				printf("Doing Fetch\n");
            	memset (connector->fetchedMsgBuffer, 0, 1024);
				conn = net_recv (sock, connector->fetchedMsgBuffer, 1024, TCP_FLAGS);
				if (conn < 0) 
                {
					printf("Connection Failed - Fetching Data\n");
					connector->threadActive = 0;
					return NULL;
				} 

				if (connector->fetchedMsgBuffer[0] == 0x25)
				{
					u16 msgSize = (u16) (connector->fetchedMsgBuffer[3] | connector->fetchedMsgBuffer[2] << 8);
					u16 msgBytesOffset = connector->fetchedMsgBuffer[1] * VIRTUAL_CHANNEL_SIZE;

					printf("Copying server response of size %x to v chan %x (offset %x)\n", msgSize, connector->fetchedMsgBuffer[1], msgBytesOffset);
					
					for (int i = 0; i < msgSize; i++)
					{
						connector->serialConnector->receivedMsgBuffer[msgBytesOffset + i] = connector->fetchedMsgBuffer[i + 5];
					}

					printf("Before Copied Data %02X %02X %02X %02X\n", connector->fetchedMsgBuffer[0 + 5], 
					                                                   connector->fetchedMsgBuffer[1 + 5], 
																	   connector->fetchedMsgBuffer[2 + 5], 
																	   connector->fetchedMsgBuffer[3 + 5]);

					printf("Final Copied Data %02X %02X %02X %02X\n", connector->serialConnector->receivedMsgBuffer[msgBytesOffset + 0], 
					                                                  connector->serialConnector->receivedMsgBuffer[msgBytesOffset + 1], 
																	  connector->serialConnector->receivedMsgBuffer[msgBytesOffset + 2], 
																	  connector->serialConnector->receivedMsgBuffer[msgBytesOffset + 3]);
					
				}
				else if (connector->fetchedMsgBuffer[0] == 0x00)
				{
					printf("No Response From Server/Unknown Command Sent\n");
					// We generally get only 0's when the server goes offline. 
					// If we try fetching more data then dolphin (any maybe a wii) can crash (for some reason?) so the safest things seems to be to stop the thread
					connector->threadActive = 0;
					return NULL;
				}
				else
				{
					printf("Error Reading message\n");
				}

                connector->requestFetch = 0;
                connector->internalState = TCP_STATE_WAITING;
			}	break;
    		case TCP_STATE_DONE:
			{
                net_close (sock);
				active = 0;
				connector->internalState = TCP_STATE_INIT;
			}	break;
		}
		usleep(50000);
	}

	printf("Stopping Network Thread");
	usleep(50000);
	connector->threadActive = 0;
	return NULL;
}


// --------------------------------------------------------------------------------
static void *seriald (SerialConnector *connector)
{
    SL_resetDeviceType(connector->gcport);
    SL_resetTransmissionFinished(connector->gcport);

	printf("Waiting for a GBA (via DOL-011) in port %x...\n", connector->gcport);

	TCPConnector tcpConnector;
	tcpConnector.remoteAddressAndPort = "127.0.0.1:9000";
	tcpConnector.serialConnector = connector;

    int active = 1;    
	u16 msgBytesCount = 0;
	u8 pkt[4];
	int commResult = 0;
	u16 msgCheckBytes = 0xFFFF;
	u16 msgBytesOffset = 0;

	SI_GetTypeAsync(connector->gcport, SL_getDeviceTypeCallback(connector->gcport));

    while(active) {

        switch (connector->internalState) 
        {

            case SERIAL_STATE_SEARCHING_FOR_GBA: 
			{
                // SI_GBA_BIOS is also covered by this case
                if (SL_getDeviceType(connector->gcport) & SI_GBA)
                {
					printf("GBA Found: Waiting on BIOS\n");
                    connector->internalState = SERIAL_STATE_INIT;
                }
                else if(SL_getDeviceType(connector->gcport) == 0x80 || SL_getDeviceType(connector->gcport) & 8)
                {
                    SI_GetTypeAsync(connector->gcport, SL_getDeviceTypeCallback(connector->gcport));
                    PAD_ScanPads();
                    VIDEO_WaitVSync();
                }
                else
                {
                    PAD_ScanPads();
                    VIDEO_WaitVSync();
                    usleep(3000000);
                }

            } break;
            case SERIAL_STATE_INIT: 
            {
				printf("GBA Found: Connected\n");

                SL_reset(connector->gcport);
				printf("Reset Finished\n");

                commResult = SL_getstatus(connector->gcport, pkt);
				if (commResult < 0)
				{
					connector->internalState = SERIAL_STATE_ERROR;
				}
                else if (pkt[2]&SI_STATUS_CONNECTED)
                {
					printf("Connection Established\n");
                    connector->internalState = SERIAL_STATE_WAITING;
                }
                else
                {
                    VIDEO_WaitVSync();
                }

            } break;
            case SERIAL_STATE_WAITING:
            {
                commResult = SL_recv(connector->gcport, pkt);

				//printf("Reading %x with first %x and second %x\n", (u16) (pkt[0] | pkt[1] << 8), pkt[0], pkt[1]);

				if (commResult < 0)
				{
					connector->internalState = SERIAL_STATE_ERROR;
				}
				else if (NET_CONN_SEND_ANY == pkt[1] && pkt[0] < (MAX_MSG_SIZE/VIRTUAL_CHANNEL_SIZE)) // We are reciving data from the GBA
                {
					msgBytesCount = (u16) (pkt[2] | pkt[3] << 8);

					msgBytesOffset = pkt[0] * VIRTUAL_CHANNEL_SIZE;
					
					printf("Got Cmd %02X %02X %02X %02X\n", pkt[0], pkt[1], pkt[2], pkt[3]);

					msgCheckBytes = 0xFFFF;
					msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
					msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);

					printf("Check after CMD %x\n", msgCheckBytes);
					
					SL_reset(connector->gcport);
					printf("Receiving message \n");
                    connector->internalState = SERIAL_STATE_RECEIVING;
                }
                else if (NET_CONN_RECV_ANY == pkt[1] && pkt[0] < (MAX_MSG_SIZE/VIRTUAL_CHANNEL_SIZE))  // We are sending data to the GBA
                {
					msgBytesCount = (u16) (pkt[2] | pkt[3] << 8);

					msgBytesOffset = pkt[0] * VIRTUAL_CHANNEL_SIZE;
					
					printf("Got Cmd %02X %02X %02X %02X\n", pkt[0], pkt[1], pkt[2], pkt[3]);

					printf("Check after CMD %x\n", msgCheckBytes);

					SL_reset(connector->gcport);
					printf("Sending message \n");
                    connector->internalState = SERIAL_STATE_SENDING;
                }
				else if ((u16) (pkt[1] | pkt[0] << 8) == NET_CONN_BCLR_REQ)
				{
					printf("Resetting MSG Buffer\n");
					memset(connector->receivedMsgBuffer,0,MAX_MSG_SIZE);
					usleep(1000);
				}
				else if (NET_CONN_PINF_REQ == (u16) (pkt[0] | pkt[1] << 8))
				{
					msgCheckBytes = 0xFFFF;
					msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
					msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);


					if (validatePokeStringMsg(connector->receivedMsgBuffer, 0, 8))
					{
						bytesToChars(connector->receivedMsgBuffer, 0, 8);
						printf("\n----- PLAYER INFO -----\nNAME: %s\n", &connector->receivedMsgBuffer[0]);

						for (int i = 0; i < 8; i++) 
							connector->playerData.playerName[i] = connector->receivedMsgBuffer[i];


						if (connector->receivedMsgBuffer[8] % 2 == 0)
						{
							printf("GENDER: BOY\n");
							connector->playerData.gender = 0;
						}
						else 
						{
							printf("GENDER: GIRL\n");
							connector->playerData.gender = 1;
						}

						printf("TRAINER ID: %d\n", (u16) (connector->receivedMsgBuffer[10] + (connector->receivedMsgBuffer[11] << 8)));
						connector->playerData.trainerId = (u16) (connector->receivedMsgBuffer[10] + (connector->receivedMsgBuffer[11] << 8));

					}

					if (validatePokeStringMsg(connector->receivedMsgBuffer, 32, 20))
					{
						bytesToChars(connector->receivedMsgBuffer, 32, 20);
						printf("GAME: %s\n\n", &connector->receivedMsgBuffer[32]);

						for (int i = 0; i < 20; i++) 
							connector->playerData.gameName[i] = connector->receivedMsgBuffer[32+i];

					}

					SL_send(connector->gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));
					usleep(1000);
				}
				else if (NET_CONN_CINF_REQ == (u16) (pkt[0] | pkt[1] << 8))
				{
					msgCheckBytes = 0xFFFF;
					msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
					msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);

					if (validatePokeStringMsg(connector->receivedMsgBuffer, 0, msgBytesCount))
					{
						bytesToChars(connector->receivedMsgBuffer, 0, msgBytesCount);
						connector->receivedMsgBuffer[msgBytesCount + 1]  = '\0'; // Make sure the string is actually terminated
						strcpy(tcpConnector.remoteAddressAndPort, connector->receivedMsgBuffer);
						printf("\n----- SERVER INFO -----\nADDRESS: %s\n", &connector->receivedMsgBuffer[0]);
						startNetworkThread(&tcpConnector);
					}

					SL_send(connector->gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));
					usleep(1000);
				}
				else if (NET_CONN_TRAN_ANY == pkt[1] && pkt[0] < (MAX_MSG_SIZE/VIRTUAL_CHANNEL_SIZE))
				{
					msgCheckBytes = 0xFFFF;
					msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
					msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);


					tcpConnector.trVitrualChannel = pkt[0];

					if (((u16) (pkt[2] | pkt[3] << 8)) + (VIRTUAL_CHANNEL_SIZE * tcpConnector.trVitrualChannel) <= MAX_TRANS_SIZE) 
					{
						printf("Setting tr size to %x \n", ((u16) (pkt[2] | pkt[3] << 8)));
						tcpConnector.trSize = (u16) (pkt[2] | pkt[3] << 8);
					}
					else
					{
						printf("WARNING - A request was made to transmit more than the max about of data\n");
						tcpConnector.trVitrualChannel = 0;
						tcpConnector.trSize = MAX_TRANS_SIZE;
					}


					SL_send(connector->gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));
					tcpConnector.requestSend  = 1;
					usleep(1000);
				}
				else if (NET_CONN_LIFN_REQ == (u16) (pkt[0] | pkt[1] << 8))
				{
					//printf("\n----- GBA REQUESTING NETWORK INFO------ \n");
					SL_send(connector->gcport, (u32) (NET_CONN_LIFN_REQ << 16) | ((u16) (tcpConnector.connectionResult | tcpConnector.internalState << 8)));
					usleep(1000);
				}
                else 
                {
                    VIDEO_WaitVSync();
					usleep(100000);
                }

            } break;
            case SERIAL_STATE_SENDING:
            {
				if (msgBytesCount > MAX_MSG_SIZE || msgBytesCount == 0)
				{
					printf("Skipping message too long %x \n", msgBytesCount);
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
							pkt[0] = connector->receivedMsgBuffer[msgBytesOffset + i];
						}
						else 
						{
							pkt[0] = 0;
						}

						if (i + 1 <= MAX_MSG_SIZE)
						{
							pkt[1] = connector->receivedMsgBuffer[msgBytesOffset + i + 1];
						}
						else 
						{
							pkt[1] = 0;
						}

						if (i + 2 <= MAX_MSG_SIZE)
						{
							pkt[2] = connector->receivedMsgBuffer[msgBytesOffset + i + 2];
						}
						else
						{
							pkt[2] = 0;
						}

						if (i + 3 <= MAX_MSG_SIZE)
						{
							pkt[3] = connector->receivedMsgBuffer[msgBytesOffset + i + 3];
						}
						else
						{
							pkt[3] = 0;
						}

						commResult = SL_send(connector->gcport, (pkt[0] << 24) | (pkt[1] << 16) | (pkt[2]<< 8) | pkt[3]);

						printf("Written To GBA %x %02X %02X %02X %02X\n", i, pkt[0], pkt[1], pkt[2], pkt[3]);

						if (commResult < 0)
						{
							msgBytesCount = 0;
						}

						msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
						msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);

						printf("Check after %d %x\n", i, msgCheckBytes);

					}

					usleep(500);
					// if (connector->receivedMsgBuffer[msgBytesOffset] != 0)
					// {
						commResult = SL_send(connector->gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));
						printf("MSG CHECK: %x\n", msgCheckBytes);
					// }

					usleep(50000);


					if (commResult < 0)
					{
						connector->internalState = SERIAL_STATE_ERROR;
					}
					else 
					{
						connector->requestSend = 0;
						connector->internalState = SERIAL_STATE_WAITING;
					}
				}

            } break;
            case SERIAL_STATE_RECEIVING:
            {
				if (msgBytesCount > MAX_MSG_SIZE || msgBytesCount == 0)
				{
					printf("Skipping message too long %x \n", msgBytesCount);
				}
				else
				{
					for(int i = 0; i <= msgBytesCount - 1; i+=4)
					{
						// Timeing can be quite precise so we give a generous delay to avoid duplicate messages
						usleep(500);

						commResult = SL_recv(connector->gcport, pkt);
						printf("Read From GBA %x %02X %02X %02X %02X\n", i, pkt[0], pkt[1], pkt[2], pkt[3]);

						if (i <= MAX_MSG_SIZE)
							connector->receivedMsgBuffer[msgBytesOffset + i]     =  pkt[0];

						if (i + 1 <= MAX_MSG_SIZE)
							connector->receivedMsgBuffer[msgBytesOffset + i + 1] =  pkt[1];

						if (i + 2 <= MAX_MSG_SIZE)
							connector->receivedMsgBuffer[msgBytesOffset + i + 2] =  pkt[2];

						if (i + 3 <= MAX_MSG_SIZE)
							connector->receivedMsgBuffer[msgBytesOffset + i + 3] =  pkt[3];


						if (commResult < 0)
						{
							msgBytesCount = 0;
						}

						msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
						msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);

						printf("Check after %d %x\n", i, msgCheckBytes);

					}
					
					if (connector->receivedMsgBuffer[msgBytesOffset] != 0)
					{
						commResult = SL_send(connector->gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));

						printf("MSG CHECK: %x\n", msgCheckBytes);
						printf("Got Msg: \n%02X %02X %02X %02X %02X %02X %02X %02X\n %02X %02X %02X %02X %02X %02X %02X %02X\n", 
						connector->receivedMsgBuffer[msgBytesOffset + 0] , connector->receivedMsgBuffer[msgBytesOffset + 1] , connector->receivedMsgBuffer[msgBytesOffset + 2] , connector->receivedMsgBuffer[msgBytesOffset + 3],
						connector->receivedMsgBuffer[msgBytesOffset + 4] , connector->receivedMsgBuffer[msgBytesOffset + 5] , connector->receivedMsgBuffer[msgBytesOffset + 6] , connector->receivedMsgBuffer[msgBytesOffset + 7],
						connector->receivedMsgBuffer[msgBytesOffset + 8] , connector->receivedMsgBuffer[msgBytesOffset + 9] , connector->receivedMsgBuffer[msgBytesOffset + 10], connector->receivedMsgBuffer[msgBytesOffset + 11],
						connector->receivedMsgBuffer[msgBytesOffset + 12], connector->receivedMsgBuffer[msgBytesOffset + 13], connector->receivedMsgBuffer[msgBytesOffset + 14], connector->receivedMsgBuffer[msgBytesOffset + 15]);
					}

					usleep(500);

					if (commResult < 0)
					{
						connector->internalState = SERIAL_STATE_ERROR;
					}
					else
					{
						connector->requestReceive = 1;
						connector->internalState = SERIAL_STATE_WAITING;
					}
				}

            } break;
            case SERIAL_STATE_DONE:
            {
              connector->internalState = SERIAL_STATE_SEARCHING_FOR_GBA;
              active = 0;
            } break;
			case SERIAL_STATE_ERROR:
            {
			  printf("Connection Error Resetting...\n");	
			  SL_resetDeviceType(connector->gcport);
    		  SL_resetTransmissionFinished(connector->gcport);
			  pkt[0] = 0;
			  pkt[1] = 0;
			  pkt[2] = 0;
			  pkt[3] = 0;
			  commResult = 0;
			  SI_GetTypeAsync(connector->gcport, SL_getDeviceTypeCallback(connector->gcport));
              connector->internalState = SERIAL_STATE_SEARCHING_FOR_GBA;
            } break;
            
            

        }

    }

   return NULL;
}

//---------------------------------------------------------------------------------
void *initialise() {
//---------------------------------------------------------------------------------

	void *framebuffer;

	VIDEO_Init();
	WPAD_Init();

	rmode = VIDEO_GetPreferredMode(NULL);
	framebuffer = MEM_K0_TO_K1(SYS_AllocateFramebuffer(rmode));
	console_init(framebuffer,20,20,rmode->fbWidth,rmode->xfbHeight,rmode->fbWidth*VI_DISPLAY_PIX_SZ);

	VIDEO_Configure(rmode);
	VIDEO_SetNextFramebuffer(framebuffer);
	VIDEO_SetBlack(FALSE);
	VIDEO_Flush();
	VIDEO_WaitVSync();
	if(rmode->viTVMode&VI_NON_INTERLACE) VIDEO_WaitVSync();

	return framebuffer;

}
