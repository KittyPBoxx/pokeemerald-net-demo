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

#define TCP_HANDSHAKE "RUBY_SAPPHIRE"

 /**
 * Constructor for the GuiSound class.
 */
TCPClient::TCPClient(char * addr)
{
	this->connector.remoteAddressAndPort = addr;
}

/**
 * Destructor for the GuiSound class.
 */
TCPClient::~TCPClient()
{
}

void TCPClient::Connect()
{
    s32 ret;

    char localip[16] = {0};
	char gateway[16] = {0};
	char netmask[16] = {0};

    this->connector.requestSend = 0;
    this->connector.requestFetch = 0;
    this->connector.requestStop = 0;
	this->connector.internalState = SERIAL_STATE_SEARCHING_FOR_GBA;
	this->connector.connectionResult = CONNECTION_NO_GBA;

    ret = if_config(localip, netmask, gateway, TRUE, 20);

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

u8 TCPClient::GetConnectionResult()
{
	return this->connector.connectionResult;
}

static void *httpd (Connector *connector)
{
	char addrCopy[32];
	
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
		// TODO: in future support domain names but for now just throw an error
		connector->connectionResult = CONNECTION_ERROR_INVALID_IP;
		return NULL;

		// struct hostent *hp = net_gethostbyname(ipOrDomainName);
		
		// if (!hp || !(hp->h_addrtype == PF_INET)) 
        // {
		// 	printf ("net_gethostbyname failed: %d\n", errno);
		// 	return CONNECTION_ERROR_INVALID_IP;
		// }

		// memset (&server, 0, sizeof (server));
		// server.sin_family= PF_INET;
		// server.sin_len = sizeof (struct sockaddr_in);
		// server.sin_port= htons (9000);
		// memcpy ((char *) &server.sin_addr, hp->h_addr_list[0], hp->h_length);
	} 

	int sock;
    int active = 1;
	sock = net_socket (AF_INET, SOCK_STREAM, IPPROTO_IP);

	while(active) {
		switch (connector->internalState) 
		{
			case TCP_STATE_INIT: 
			{
				s32 conn = net_connect(sock, (struct sockaddr *) &server, sizeof server);
				if (conn < 0) 
                {
					connector->connectionResult = CONNECTION_ERROR_CONNECTION_FAILED;
					return NULL;
				}

                // Send the string RUBY_SAPPHIRE to the server
				net_send(sock, TCP_HANDSHAKE, strlen(TCP_HANDSHAKE), 0);

                // Read response (which should be server name like SN_<NAME_OF_SERVER>)
				memset (connector->fetchedMsgBuffer, 0, 1024);
				conn = net_recv (sock, connector->fetchedMsgBuffer, 1024, 0);

				if (connector->fetchedMsgBuffer[0] == 'S' && 
                    connector->fetchedMsgBuffer[1] == 'N' && 
                    connector->fetchedMsgBuffer[2] == '_') 
                {
                    connector->connectionResult = CONNECTION_SUCCESS;
					connector->internalState = TCP_STATE_WAITING;
				} 
                else 
                {
					connector->connectionResult = CONNECTION_ERROR_INVALID_RESPONSE;
					connector->internalState = TCP_STATE_DONE;
				}
			}	break;
    		case TCP_STATE_WAITING:
			{
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
                    usleep(1000);
                }
			}	break;
			case TCP_STATE_SENDING:
			{
                net_send(sock, connector->sendMsgBuffer, 1024, 0);
                connector->requestSend = 0;
                connector->internalState = TCP_STATE_WAITING;
			}	break;
            case TCP_STATE_FETCHING: 
			{
            	memset (connector->fetchedMsgBuffer, 0, 1024);
				net_recv (sock, connector->fetchedMsgBuffer, 1024, 0);
                connector->requestFetch = 0;
                connector->internalState = TCP_STATE_WAITING;
			}	break;
    		case TCP_STATE_DONE:
			{
                net_close (sock);
				connector->internalState = TCP_STATE_INIT;
                active = 0;
			}	break;
		}
	}

	//free(addrCopy);

	return NULL;
}

