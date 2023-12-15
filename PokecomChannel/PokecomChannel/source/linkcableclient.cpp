/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * linkcableclient.cpp
 * Client that connections to the GBA via gamecube port on wii
 ***************************************************************************/

#include <linkcableclient.h>
#include <seriallink.h>

/**
* Constructor for the GuiSound class.
* !\param gcport an number from 0-3 corrisponding to the game cube ports on the wii
*/
LinkCableClient::LinkCableClient(u8 gcport)
{
    this->connector.gcport = gcport;
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

    serd_handle = (lwp_t)NULL;
    
	LWP_CreateThread(&serd_handle,	             /* thread handle */
					 (void* (*)(void*)) seriald, /* code */
					 &this->connector,           /* arg pointer for thread */
					 NULL,			             /* stack base */
					 16*1024,		             /* stack size */
					 50				             /* thread priority */ );
}

// void LinkCableClient::SerialSend()
// {
    
// }

// void LinkCableClient::SerialReceive()
// {
    
// }

// void LinkCableClient::GetConnectionResult()
// {
    
// }

// void LinkCableClient::GetConnectionResult()
// {
    
// }

// void LinkCableClient::SerialReset()
// {
    
// }

// void LinkCableClient::SerialStatus()
// {
    
// }

static void *seriald (SerialConnector *connector)
{
    SL_resetDeviceType(connector->gcport);
    SL_resetTransmissionFinished(connector->gcport);
    int active = 1;

    SI_GetTypeAsync(connector->gcport, SL_getDeviceTypeCallback(connector->gcport));

    while(active) {

        switch (connector->internalState) 
        {

            case SERIAL_STATE_SEARCHING_FOR_GBA: 
			{
                // SI_GBA_BIOS is also covered by this case
                if (SL_getDeviceType(connector->gcport) & SI_GBA)
                {
                    connector->receivedMsgBuffer[2] = 0; // Reset status byte
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
                    usleep(3000000); // If there's nothing in the port only check for changes every 3 seconds
                }

            } break;
            case SERIAL_STATE_INIT: 
            {
                SL_reset(connector->gcport, connector->sendMsgBuffer, connector->receivedMsgBuffer);
                SL_getstatus(connector->gcport, connector->sendMsgBuffer, connector->receivedMsgBuffer);
                
                if (connector->receivedMsgBuffer[2]&SI_STATUS_CONNECTED)
                {
                    connector->internalState = SERIAL_STATE_WAITING;
                }
                else
                {
                    VIDEO_WaitVSync();
                }

            } break;
            case SERIAL_STATE_WAITING:
            {
                if (connector->requestSend == 1)
                {
                    connector->internalState = SERIAL_STATE_SENDING;
                }
                else if (connector->requestReceive == 1)
                {
                    connector->internalState = SERIAL_STATE_RECEIVING;
                }
                else if (connector->requestStop == 1)
                {
                    connector->internalState = SERIAL_STATE_DONE;
                }
                else 
                {
                    VIDEO_WaitVSync();
                }

            } break;
            case SERIAL_STATE_SENDING:
            {
                SL_send(connector->gcport, connector->sendMsgBuffer, connector->receivedMsgBuffer);
                connector->requestSend = 0;
                connector->internalState = SERIAL_STATE_WAITING;
            } break;
            case SERIAL_STATE_RECEIVING:
            {
                memset (connector->receivedMsgBuffer, 0, 1024);
                SL_recv(connector->gcport, connector->sendMsgBuffer, connector->receivedMsgBuffer);
                connector->requestReceive = 0;
                connector->internalState = SERIAL_STATE_WAITING;
            } break;
            case SERIAL_STATE_DONE:
            {
              connector->internalState = SERIAL_STATE_SEARCHING_FOR_GBA;
              active = 0;
            } break;
            

        }

    }

   return NULL;
}