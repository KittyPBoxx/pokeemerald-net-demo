/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * linkcableclient.cpp
 * Client that connections to the GBA via gamecube port on wii
 ***************************************************************************/

#include <linkcableclient.h>
#include <seriallink.h>
#include <pokestring.h>
#include "tcpclient.h"
#include <stdio.h>
#include <string>

#define IP_BUFFER_SIZE 32

static void *seriald (SerialConnector *connector); //!<  Function that handles the connection loop

/**
* Constructor for the GuiSound class.
* !\param gcport an number from 0-3 corrisponding to the game cube ports on the wii
*/
LinkCableClient::LinkCableClient(u8 gcport, Logger * LOGGER)
{
    this->connector.gcport = gcport;
	this->connector.LOGGER = LOGGER;
}

/**
 * Destructor for the GuiSound class.
 */
LinkCableClient::~LinkCableClient()
{
}

void LinkCableClient::Start()
{
    this->connector.requestSend = 0;
    this->connector.requestReceive = 0;
    this->connector.requestStop = 0;
	this->connector.internalState = SERIAL_STATE_SEARCHING_FOR_GBA;
	this->connector.connectionResult = CONNECTION_NO_GBA;

    serd_handle = (lwp_t)NULL;
    
	LWP_CreateThread(&serd_handle,	             /* thread handle */
					 (void* (*)(void*)) seriald, /* code */
					 &this->connector,           /* arg pointer for thread */
					 NULL,			             /* stack base */
					 16*1024,		             /* stack size */
					 255    		             /* thread priority */ );
}

u8 LinkCableClient::GetConnectionResult() 
{
	return this->connector.connectionResult;
}

bool LinkCableClient::HasPlayerName()
{
	return this->connector.playerData.playerName[0] != 0;
}

char * LinkCableClient::GetPlayerName()
{
	return this->connector.playerData.playerName;
}

bool LinkCableClient::HasServerName()
{
	return this->connector.serverName[0] != 0;
}

char * LinkCableClient::GetServerName()
{
	return this->connector.serverName;
}

static void *seriald (SerialConnector *connector)
{
	std::string connectLog = "Searching For GBA on port ";
	connectLog.append(std::to_string(1 + connector->gcport));
	connector->LOGGER->Log((char *) connectLog.c_str());

    SL_resetDeviceType(connector->gcport);
    SL_resetTransmissionFinished(connector->gcport);

    TCPClient* tcpClient = new TCPClient();

    char ipv4Port[IP_BUFFER_SIZE];
	tcpClient->connector.serialConnector = connector;

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
					std::string foundGBALog = "Found A GBA on port ";
					foundGBALog.append(std::to_string(1 + connector->gcport));
					connector->LOGGER->Log((char *) foundGBALog.c_str());

					connector->connectionResult = CONNECTION_STARTING;
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
                SL_reset(connector->gcport);

                commResult = SL_getstatus(connector->gcport, pkt);
				if (commResult < 0)
				{
					connector->LOGGER->Log((char *) "ERROR connecting");
					connector->internalState = SERIAL_STATE_ERROR;
				}
                else if (pkt[2]&SI_STATUS_CONNECTED)
                {
					connector->LOGGER->Log((char *) "Connected");
					connector->connectionResult = CONNECTION_CONNECTED;
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

				if (commResult < 0)
				{
					connector->LOGGER->Log((char *) "ERROR Waiting");
					connector->internalState = SERIAL_STATE_ERROR;
				}
				else if (NET_CONN_SEND_ANY == pkt[1] && pkt[0] < (MAX_MSG_SIZE/VIRTUAL_CHANNEL_SIZE)) // We are reciving data from the GBA
                {
					msgBytesCount = (u16) (pkt[2] | pkt[3] << 8);

					msgBytesOffset = pkt[0] * VIRTUAL_CHANNEL_SIZE;
					
					msgCheckBytes = 0xFFFF;
					msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
					msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);
					
					SL_reset(connector->gcport);
                    connector->internalState = SERIAL_STATE_RECEIVING;
                }
                else if (NET_CONN_RECV_ANY == pkt[1] && pkt[0] < (MAX_MSG_SIZE/VIRTUAL_CHANNEL_SIZE))  // We are sending data to the GBA
                {
					msgBytesCount = (u16) (pkt[2] | pkt[3] << 8);

					msgBytesOffset = pkt[0] * VIRTUAL_CHANNEL_SIZE;

					SL_reset(connector->gcport);
                    connector->internalState = SERIAL_STATE_SENDING;
                }
				else if ((u16) (pkt[0] | pkt[1] << 8) == NET_CONN_BCLR_REQ)
				{
					memset(connector->receivedMsgBuffer,0,MAX_MSG_SIZE);
					memset(tcpClient->connector.fetchedMsgBuffer,0,NET_MSG_SIZE);
					usleep(50000);
				}
				else if (NET_CONN_PINF_REQ == (u16) (pkt[0] | pkt[1] << 8))
				{
					msgCheckBytes = 0xFFFF;
					msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
					msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);


					if (validatePokeStringMsg(connector->receivedMsgBuffer, 0, 8))
					{
						bytesToChars(connector->receivedMsgBuffer, 0, 8);

						for (int i = 0; i < 8; i++) 
							connector->playerData.playerName[i] = connector->receivedMsgBuffer[i];


						if (connector->receivedMsgBuffer[8] % 2 == 0)
						{
							connector->playerData.gender = 0;
						}
						else 
						{
							connector->playerData.gender = 1;
						}

						connector->playerData.trainerId = (u16) (connector->receivedMsgBuffer[10] + (connector->receivedMsgBuffer[11] << 8));

					}

					if (validatePokeStringMsg(connector->receivedMsgBuffer, 32, 20))
					{
						bytesToChars(connector->receivedMsgBuffer, 32, 20);

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
						if (msgBytesCount < MAX_MSG_SIZE)
						{
							bytesToChars(connector->receivedMsgBuffer, 0, msgBytesCount);
							connector->receivedMsgBuffer[msgBytesCount + 1]  = '\0'; // Make sure the string is actually terminated
						}
						else
						{
							bytesToChars(connector->receivedMsgBuffer, 0, MAX_MSG_SIZE);
							connector->receivedMsgBuffer[MAX_MSG_SIZE - 1]  = '\0'; // Make sure the string is actually terminated
						}

                        memset(ipv4Port, 0, IP_BUFFER_SIZE);
						if (connector->overrideAddress[0] == 0)
						{
							strcpy(ipv4Port, connector->receivedMsgBuffer);
						}
						else
						{
                        	strcpy(ipv4Port, connector->overrideAddress);
						}
						tcpClient->Connect(ipv4Port);
					}

					SL_send(connector->gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));
					usleep(1000);
				}
				else if (NET_CONN_TRAN_ANY == pkt[1] && pkt[0] < (MAX_MSG_SIZE/VIRTUAL_CHANNEL_SIZE))
				{
					msgCheckBytes = 0xFFFF;
					msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
					msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);


					tcpClient->connector.trVitrualChannel = pkt[0];

					if (((u16) (pkt[2] | pkt[3] << 8)) + (VIRTUAL_CHANNEL_SIZE * tcpClient->connector.trVitrualChannel) <= MAX_TRANS_SIZE) 
					{
						tcpClient->connector.trSize = (u16) (pkt[2] | pkt[3] << 8);
					}
					else
					{
						tcpClient->connector.trVitrualChannel = 0;
						tcpClient->connector.trSize = MAX_TRANS_SIZE;
					}


					SL_send(connector->gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));
					tcpClient->connector.requestSend  = 1;
					usleep(1000);
				}
				else if (NET_CONN_LIFN_REQ == (u16) (pkt[0] | pkt[1] << 8))
				{
					SL_send(connector->gcport, (u32) (NET_CONN_LIFN_REQ << 16) | ((u16) (tcpClient->connector.connectionResult | tcpClient->connector.internalState << 8)));
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
				if (!((msgBytesCount + msgBytesOffset) > MAX_MSG_SIZE || msgBytesCount == 0))
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

						usleep(5000);

						if (commResult < 0)
						{
							msgBytesCount = 0;
						}

						msgCheckBytes ^= (u16) (pkt[0] | pkt[1] << 8);
						msgCheckBytes ^= (u16) (pkt[2] | pkt[3] << 8);

					}
					

					usleep(500);
					commResult = SL_send(connector->gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));

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
				if (!((msgBytesCount + msgBytesOffset) > MAX_MSG_SIZE || msgBytesCount == 0))
				{
					for(int i = 0; i <= msgBytesCount - 1; i+=4)
					{
						// Timeing can be quite precise so we give a generous delay to avoid duplicate messages
						usleep(500);

						commResult = SL_recv(connector->gcport, pkt);

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

					}
					
					commResult = SL_send(connector->gcport, (u32) (NET_CONN_CHCK_RES << 16) | (msgCheckBytes & 0xFFFF));

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
			  SL_resetDeviceType(connector->gcport);
    		  SL_resetTransmissionFinished(connector->gcport);
			  pkt[0] = 0;
			  pkt[1] = 0;
			  pkt[2] = 0;
			  pkt[3] = 0;
			  commResult = 0;
			  SI_GetTypeAsync(connector->gcport, SL_getDeviceTypeCallback(connector->gcport));
              connector->internalState = SERIAL_STATE_INIT;
            } break;
            
            

        }

    }

   return NULL;
}