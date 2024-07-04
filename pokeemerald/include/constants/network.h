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
* Communicating with the wii while the game is running presents a number of challenges. 
* - Timings are hard
* - Despite driving connections from the gba the wii is has 'master' in the link
* - If you try and use the link at full speed the game will lag.  
* Any message larger than 4 bytes has a change of getting messed up, so all main instructions should be restricted to that size.
* For any messages larger we need to be able to verify against the returned check bytes and retry. 
* I've made a system to handle this but it's 'very custom' to the limitations/issues I've encountered so I'm giving a big overview here.
* 
* 'virtual channels' are just what I've dubbed 16 byte sections of data in the wii memory. They are sequential in memory so writing past the end of one will go into the next. This is safe.
* NET_CONN commands are special commands that the pokecom channel will recognise. The first byte defines the command, the other 3 bytes are basically parameters 
*
* The pokecom channel allocates an array 4096 bytes of data per gba. 
* This array can be read/written to by the gba and the server
* In future the gba will be able query the arrays of other gbas pugged into the same wii (but not write to them). This is not implimented yet.
*
* Sending the data to the wii, and transmitting that to the server are two separate operations 
* e.g if I want to send data to the server I need to:
*   1. send a 0x15YY (NET_CONN_SEND_REQ) with some data to wii to store
*   2. send a 0x13YY (NET_CONN_TCH1_REQ) so the wii will send it's stored data to the server
*
* Virtual Channels: 
* When sending a 0x1500 data wil be stored at the beginning of the array 0x1501, 0x1502... 0x15YY e.t.c All data writen will be offset by 16*(YY)
* i.e 0x1500 begins writing at the 0th element of the array, 0x1502 begins writing at the 32nd element  
* This lets you write multiple chunks of data to the wii so you can transmit those chunks when ready
* Transmission commands work the same way with 0x1300 transmitting data from the start and 0x1303 starts transmitting with an offset of 48
* (TLDR: the last 2 bytes of the command is multiplied by 16 to get the offset it's stored at on the wii)
* 
* For the reasons listed bellow it's typically better to do several 0x15 requests, get all the data you need in the wii's buffer then request one big 0x13
* to send all the data to the server (even if that means sending a lot of empty data to the server) 
* 1. Transmitting data between the gba and the wii is expensive (very slow but low latency). 
* 2. Manipulating data on the gba can be hard because of the limited space.
* 3. Most slow down is caused checksum failures/retries so sending several small msgs to the wii is better than one big one   
* 4. Transmitting data between the wii and the server is much faster but may have a high latency. 
*/

// Special Commands Recognised by the wii

#define NET_CONN_LIFN_REQ 0x2005 // Return information about this devices network connection 
// Result Value bytes 2005 XX YY IF XX = 0 means tcp connection still busy doing something YY is the state of the connector as seen on the next line)
// CONNECTION_INIT = 0, CONNECTION_SUCCESS, CONNECTION_STARTING, CONNECTION_ERROR_INVALID_IP, CONNECTION_ERROR_COULD_NOT_RESOLVE_IPV4, CONNECTION_ERROR_NO_NETWORK_DEVICE, CONNECTION_ERROR_CONNECTION_FAILED, CONNECTION_ERROR_INVALID_RESPONSE

#define NET_CONN_RECV_REQ 0x2500 // Tell wii to send us data from the buffer for this devices port | msg bytes 25 YY XX XX (X is the 16bit size of msg to receive, YY is the virtual channel)  
#define NET_CONN_RCHF0_REQ 0x25F0  
#define NET_CONN_RCHF1_REQ 0x25F1

#define NET_CONN_SEND_REQ 0x1500 // Tell wii you want to send it data              | msg bytes 15 YY XX XX (X is the 16bit size of msg to send, YY is the virtual channel)
#define NET_CONN_SCH1_REQ 0x1501
#define NET_CONN_SCH2_REQ 0x1502
#define NET_CONN_SCH3_REQ 0x1503

#define NET_CONN_TRAN_REQ 0x1300 // Tell wii to send it current data to the server | msg bytes 13 YY XX XX (last 16 bits are size of message to transsmit, YY is the virtual channel)
#define NET_CONN_TCH1_REQ 0x1301 
#define NET_CONN_TCH2_REQ 0x1302 
#define NET_CONN_TCH3_REQ 0x1303 
#define NET_CONN_TCHF0_REQ 0x13F0 

// DO NOT USE THIS! There's a memory allocation issue in the wii channel so you start gettting weird resutls back 
// #define NET_CONN_BCLR_REQ 0x1200 // Tell wii to clear the whole message buffer     | msg bytes 12 00 XX XX (last 16 bits are unused)

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
#define MAX_CONNECTION_RETRIES 20
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
#define NET_CONN_TRADE_FUNC             4
#define NET_CONN_RETRY_TRADE_FUNC       5
#define NET_CONN_POST_MAIL              6
#define NET_CONN_READ_MAIL              7

#endif //GUARD_CONSTANTS_NETWORK_H