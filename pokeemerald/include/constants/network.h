#ifndef GUARD_CONSTANTS_NETWORK_H
#define GUARD_CONSTANTS_NETWORK_H

#define NET_STAT_OFFLINE 0
#define NET_STAT_ATTACHED_NO_INTERNET 1 
#define NET_STAT_ONLINE 2

#define NET_CONN_LINF_BUSY 3
#define NET_CONN_LINF_READY 2

#define NETWORK_STATE_WAITING 1
#define NETWORK_CONNECTION_SUCCESS 1
#define NETWORK_MIN_ERROR 3

#define MINIMUM_CHUNK_SIZE 16

/**
* Understanding the msg buffer, commands and virtual channels: 
* 
* NET_CONN commands are special commands that the pokecom channel will recognise
*
* The pokecom channel allocates an array 8192 bytes of data per gba. 
* This array can be read/written to by the gba and the server
* Additionally the gba can query the arrays of other gbas pugged into the same wii (but not write to them)
*
* Sending the data to the wii, and transmitting that to the server are two separate operations 
* e.g if I want to send data to the server I need to:
*   1. send a 0x15YY (NET_CONN_SEND_REQ) with some data to wii to store
*   2. send a 0x13YY (NET_CONN_TCH1_REQ) so the wii will send it's stored data
*
* Virtual Channels: 
* When sending a 0x1500 data wil be stored at the beginning of the array 0x1501, 0x1502... 0x15YY e.t.c All data writen will be offset by 32*(YY)
* i.e 0x1500 begins writing at the 0th element of the array, 0x1502 begins writing at the 64th element  
* This lets you write multiple chunks of data to the wii so you can transmit those chunks when ready
* Transmission commands work the same way with 0x1300 transmitting data from the start and 0x1303 starts transmitting with an offset of 96
*/

// Special Commands Recognised by the wii

#define NET_CONN_LIFN_REQ 0x2005 // Return information about this devices network connection 

#define NET_CONN_RECV_REQ 0x2500 // Tell wii to send us data from the buffer for this devices port | msg bytes 25 YY XX XX (X is the 16bit size of msg to receive, YY is the virtual channel)
#define NET_CONN_RCHF0_REQ 0x25F0  

#define NET_CONN_SEND_REQ 0x1500 // Tell wii you want to send it data              | msg bytes 15 YY XX XX (X is the 16bit size of msg to send, YY is the virtual channel)
#define NET_CONN_SCH1_REQ 0x1501
#define NET_CONN_SCH2_REQ 0x1502
#define NET_CONN_SCH3_REQ 0x1503

#define NET_CONN_TRAN_REQ 0x1300 // Tell wii to send it current data to the server | msg bytes 13 YY XX XX (last 16 bits are unused, YY is the virtual channel)
#define NET_CONN_TCH1_REQ 0x1301 
#define NET_CONN_TCH2_REQ 0x1302 
#define NET_CONN_TCH3_REQ 0x1303 
#define NET_CONN_TCHF0_REQ 0x13F0 

#define NET_CONN_BCLR_REQ 0x1200 // Tell wii to clear the whole message buffer     | msg bytes 12 00 XX XX (last 16 bits are unused)
#define NET_CONN_PINF_REQ 0x1201 // Tell wii to use current data as player info    | msg bytes 12 01 XX XX (last 16 bits are unused)
#define NET_CONN_CINF_REQ 0x1202 // Tell wii to use current data as server info    | msg bytes 12 02 XX XX (last 16 bits are unused)

// Special Commands Comming from the wii
#define NET_CONN_CHCK_RES 0x1101 // Returning check bytes for the last data sent   | msg bytes 12 01 XX XX (X are the 16bit check bytes, made by XORing each seq 16bits of the msg)

/**
*
* The following commands are reserved for 'local-to-local' communication between GBA's plugged into the same Wii but have not been implemented 
*
* #define NET_CONN_LINF_REQ 0x2000 // Return information about the local state e.g which port we are connected to / how many players
* #define NET_CONN_LIF1_REQ 0x2001 // Return information about device in port 1
* #define NET_CONN_LIF2_REQ 0x2002 // port 2
* #define NET_CONN_LIF3_REQ 0x2003 // port 3
* #define NET_CONN_LIF4_REQ 0x2004 // port 4
*
* #define NET_CONN_LRE1_REQ 0x2100 // Tell wii to send us data from the buffer for device in port 1  | msg bytes 21 01 XX XX (X is the 16bit size of msg to receive, YY is the virtual channel)
* #define NET_CONN_LRE2_REQ 0x2200 // port 2
* #define NET_CONN_LRE3_REQ 0x2300 // port 3
* #define NET_CONN_LRE3_REQ 0x2400 // port 4
**/

#define MAX_CONNECTION_LOOPS 20000
#define MAX_CONNECTION_RETRIES 8
#define RETRIES_LEFT_CANCEL -2

#define R_JOYBUS  0xC000
#define JOY_WRITE 0x2
#define JOY_READ  0x4
#define JOY_RW    0x6

// The list of network functions that are available to call
#define NET_CONN_START_LINK_FUNC        0
#define NET_CONN_START_BATTLE_FUNC      1
#define NET_CONN_START_MART_FUNC        2
#define NET_CONN_START_EGG_FUNC         3

#endif //GUARD_CONSTANTS_NETWORK_H