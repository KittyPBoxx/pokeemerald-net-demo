/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * tcpclient.h
 * Tcp Client to connect bind to remote servers
 ***************************************************************************/

#include <string.h>
#include <tcpclient.h>
#include <stdlib.h>

#define TCP_FLAGS 0
#define SERVER_NAME_REQUEST "NR_"
#define WELCOME_REQUEST "WR_"
#define SEND_PLAYER_DATA "PD_"

static void *httpd (TCPConnector *connector); //!<  Function that handles the connection loop

 /**
 * Constructor for the GuiSound class.
 */
TCPClient::TCPClient()
{
}

/**
 * Destructor for the GuiSound class.
 */
TCPClient::~TCPClient()
{
}

void TCPClient::Connect(char * addr)
{
	this->connector.remoteAddressAndPort = addr;

	if (httd_handle != LWP_THREAD_NULL && this->connector.threadActive == 1)
	{
		this->connector.requestReset = 1;
		return;
	}

	this->connector.threadActive = 1;

	s32 ret;

	char localip[16] = {0};
	char gateway[16] = {0};
	char netmask[16] = {0};

    this->connector.requestSend = 0;
    this->connector.requestFetch = 0;
    this->connector.requestStop = 0;
	this->connector.requestReset = 0;
	this->connector.connectionResult = CONNECTION_INIT;

	ret = if_config ( localip, netmask, gateway, TRUE, 20);

	httd_handle = (lwp_t)NULL;

	if (ret>=0) 
    {
		this->connector.connectionResult = CONNECTION_READY;
		this->connector.internalState = TCP_STATE_INIT;
		LWP_CreateThread(&httd_handle,	             /* thread handle */
						 (void* (*)(void*))  httpd,  /* code */
						 &this->connector,           /* arg pointer for thread */
						 NULL,			             /* stack base */
						 16*1024,	                 /* stack size */
						 50				             /* thread priority */ );
	} 
    else 
    {
		this->connector.internalState = CONNECTION_ERROR_NO_NETWORK_DEVICE;
	}
}

void TCPClient::Disconnect()
{
    this->connector.requestStop = 1;
}

void TCPClient::SendData(char * toSend)
{
    memset (connector.sendMsgBuffer, 0, 1024);
    strncpy(connector.sendMsgBuffer, toSend, sizeof(connector.sendMsgBuffer)-1);
    connector.sendMsgBuffer[sizeof(connector.sendMsgBuffer)-1] = '\0';
    connector.requestSend = 1;
}

char* TCPClient::GetResponse()
{
    return this->connector.fetchedMsgBuffer;
}

char* TCPClient::GetServerName()
{
	return this->connector.serverName;
}

u8 TCPClient::GetConnectionResult()
{
	return this->connector.connectionResult;
}

void TCPClient::TestConnection(char * addr)
{
	this->connector.serialConnector = (SerialConnector*) malloc(sizeof(SerialConnector));;
	memset(&(this->connector.serialConnector->playerData), 0, sizeof(this->connector.serialConnector->playerData));
	this->Connect(addr);
}

static void *httpd (TCPConnector *connector)
{
	char addrCopy[64];

	// If there's no playerData at the time of connection we fill it with test data
	if (connector->serialConnector->playerData.playerName[0] == 0)
	{
		char name[] = "Test";
		char game[] = "PkcmChnl Test";
		strcpy(connector->serialConnector->playerData.playerName, name);
		strcpy(connector->serialConnector->playerData.gameName, game);
	}

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
		connector->connectionResult = CONNECTION_ERROR_INVALID_IP;
		connector->threadActive = 0;
		return NULL;
	} 

	int sock = -1;
	int active = 1;
	s32 conn = 0;

	while(active) {
		switch (connector->internalState) 
		{
			case TCP_STATE_INIT: 
			{
				sock = net_socket (AF_INET, SOCK_STREAM, IPPROTO_IP);
				s32 conn = net_connect(sock, (struct sockaddr *) &server, sizeof server);
				if (conn < 0) 
                {
					connector->connectionResult = CONNECTION_ERROR_CONNECTION_FAILED;
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

					strcpy(connector->serverName, connector->fetchedMsgBuffer + 3);
					
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

					for (unsigned int i = 0; i < strlen(SEND_PLAYER_DATA); i++) 
						connector->sendMsgBuffer[i] = SEND_PLAYER_DATA[i];

					memcpy(&(connector->sendMsgBuffer)[strlen(SEND_PLAYER_DATA)], &connector->serialConnector->playerData, sizeof(connector->serialConnector->playerData));

					conn = net_send(sock, connector->sendMsgBuffer, strlen(SEND_PLAYER_DATA) + sizeof connector->serialConnector->playerData, TCP_FLAGS);

				} 
                else 
                {
					connector->fetchedMsgBuffer[64] = '\0';
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
				memset (connector->sendMsgBuffer, 0, 1024);
				memcpy(connector->sendMsgBuffer, &(connector->serialConnector->receivedMsgBuffer)[connector->trVitrualChannel * VIRTUAL_CHANNEL_SIZE], connector->trSize);
                conn = net_send(sock, connector->sendMsgBuffer, connector->trSize, TCP_FLAGS);
				if (conn < 0) 
                {
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
            	memset (connector->fetchedMsgBuffer, 0, 1024);
				conn = net_recv (sock, connector->fetchedMsgBuffer, 1024, TCP_FLAGS);
				if (conn < 0) 
                {
					connector->threadActive = 0;
					return NULL;
				} 

				if (connector->fetchedMsgBuffer[0] == 0x25)
				{
					u16 msgSize = (u16) (connector->fetchedMsgBuffer[3] | connector->fetchedMsgBuffer[2] << 8);
					u16 msgBytesOffset = connector->fetchedMsgBuffer[1] * VIRTUAL_CHANNEL_SIZE;
					
					for (int i = 0; i < msgSize; i++)
					{
						connector->serialConnector->receivedMsgBuffer[msgBytesOffset + i] = connector->fetchedMsgBuffer[i + 5];
					}
					
				}
				else if (connector->fetchedMsgBuffer[0] == 0x00)
				{
					// We generally get only 0's when the server goes offline. 
					// If we try fetching more data then dolphin (any maybe a wii) can crash (for some reason?) so the safest things seems to be to stop the thread
					connector->threadActive = 0;
					return NULL;
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

	usleep(50000);
	connector->threadActive = 0;
	return NULL;
}

