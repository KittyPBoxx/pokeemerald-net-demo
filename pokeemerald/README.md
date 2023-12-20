# Pokémon Emerald - Net Demo

This is a decompilation of Pokémon Emerald.

To set up the repository, see [INSTALL.md](INSTALL.md).

## Creating Network Tasks

This version of pokeemerald has been modified to allow creation of special tasks that connect to the internet via a wii channel.

I've written a small guide bellow, but if you want to jump right into the code the best places to start are:
- `network.h`  *(which includes some documentation on how the communication works)*
- `net_conn.c` *(which has some example tasks. Look at NET_CONN_START_BATTLE_FUNC for a commented example)*
- `Lilycove_GTS_2F/scrips.inc` *(to see how I start the task from a scrip)*

## Quick guide to making a new task (in 5 ''''simple'''' steps)

1. In `network.h` define a value for your task e.g. `#define NET_CONN_START_MART_FUNC 2` 
2. In `net_conn.h` add an entry to the `sNetConnFunctions` array  e.g `[NET_CONN_START_MART_FUNC] = SetupForOnlineMartTask`
3. In `net_conn.h` define 4 functions for your task (Setup, Cancel, Process, EndConnection).  e.g 
```
static void SetupForOnlineMartTask();
static void Task_OnlineMartCancel(u8 taskId);
static void Task_OnlineMartProcess(u8 taskId);
static void Task_EndOnlineMartConnection(u8 taskId);
```

I'll explain these more in a sec.

4. In your script.inc start the network task like this
```
setvar VAR_0x8004, NET_CONN_START_MART_FUNC
special CallNetworkFunction
waitstate
```
5. Implement the 4 functions.

> SetupFunction - This runs before the other tasks and is mostly used to configure the sSendRecvMgr. Copy and modify a existing one. 

> CancelFunction - This is what runs when a user cancels mid connection (by pressing 'B'). Normally this just calls the EndConnectionFunction.

> EndConnectionFunction - This runs after everything. Copy and modify a existing one. Typically it should a) End the serial tranmission b) Destroy the task.  

> ProcessFunction - This is where you cycle through your tasks states. 
> 
> While running the network task will loop between your process function and Task_NetworkTaskLoop. Normally each loop your Function will increment it's state, setup the sSendRecvMgr for the next operation or process some data. A simple task would have 5 states (SEND, TRANSMIT, WAIT, RECEIVE, FINISH). Here's a simple example of what a process function might look like: 

```
static void Task_MyProcessFunction(u8 taskId)
{
    switch (sSendRecvMgr.nextProcessStep)
    {
        case MY_SEND_STATE: // Send some data from somewhere in the GBAs memory to the wii
            break;
        case MY_TRANSMIT_STATE: // Ask the wii to send that data to the server 
            break;
        case MY_WAIT_STATE: // Wait for the server to send the wii data and play some animation
            break;
        case MY_RECEIVE_STATE: // Read data from the wii to somewhere in the GBA's memory
            break;
        case MY_FINISH_STATE: // Process the data we got back
            sSendRecvMgr.state = NET_CONN_STATE_DONE; // This will cause the task to end
            break;
    }

    gTasks[taskId].func = Task_NetworkTaskLoop;
}
```

⚠️ CAUTION! Be careful of the following things:

- Don't directly kill the task inside your Process() method. Set sSendRecvMgr state to done e.g. `sSendRecvMgr.state = NET_CONN_STATE_DONE;` So the connection will finish properly. (Although you will still need to call `NetConnDisableSerial();` in your EndConnectionFunction if you want serial transmission to stop)

- ALWAYS validate the data you got back from the server before using it. If the network connection drops at the wrong point the GBA could pull back bad data from the wii. I strongly recommend setting a special var e.g `gSpecialVar_0x8003` to `0` during setup and only setting it to `1` once you have made sure the data is ok. If it is still when the task ends `0` then branch to an error message in your script.inc  

## Quick guide to sending/fetching data from the server

### Background reading 

Before we get started there are few important things to understand so you know what is going on under the hood.

1..  How is the joybus connection working?

- The wii is master in this connection and is basically polling the gba for data. It does this frequently after it when the gba reports itself when loading the bios (this is why you need to reset to start the connection)
- By configuring REG_RCNT we can make it so that any data written to JOY_TRANS_L or JOY_TRANS_H is sent to the wii. So when talking to the wii we send 4 bytes at a time.
- By reading from JOY_RECV we can get data back (also 4 bytes). 
- Read and write opperations cannot happen at the same time.
- Any time we want to send more than 4 bytes at a time we need to be careful. So we try and keep importaint instructions to 4 bytes.  

2.. How does the implementation work?

- When the gba is detected the wii allocated a 4kb array in memory for that gba
- The gba can read and write data to that 4kb array using commands
- The gba can request a section of that array be sent to the server using another command
- The server can also write data to that array while the connection is open
- When the gba sends 12 02 00 00 it will start a tcp server using the first 14 bytes of the array as the ip and port 
- Messages between the wii and the TCP server are capped at 1kb in size 
- If you write/read past the end of the memory the wii may ignore the request completely or return no response

There are a few special commands but the main ones to be aware of are:

Receive data from the wii's memory array:
> RECV | 25 YY XX XX | YY * 16 is the starting offset to receive data from in the array | XX XX is the length of data to receive
> 
> Example: 0x25F00004 = please send me 4 bytes of data from your array, starting from 3840 (0xf0 * 16). i.e array[3840],array[3841],array[3842] and array[3844]

Send data to the wii's memory array:
> SEND | 15 YY XX XX | YY * 16 is the starting offset to write data to in the array | XX XX is the length of data to write
>
> Example: 0x15000008 = the next  bytes you read from me should be written to the very start of your array 

Ask the wii to send data from its array to the server:
> TRAN | 13 YY XX XX | YY * 16 is the starting offset to transmit data from | XX XX is the length of data to send to the server 
>
> Example 0x13010010 = please send all the data from index 16 (01 * 16) to index 32 (16 + 0x10) to the server   

⚠️ TRAN (send from wii to server), BCLR (reset the wii data) and LIFN (return wii network info) currently have broken validation so you need to `disableChecks` when using these commands and enable them again after.

For more info on why its setup like this you can see the docs in `network.h`

### Cool but, like, how do I actually use that in the code?

Fortunately there are a couple of simple methods you can call to setup the next opperation in your ProcessFunction

```
void configureSendRecvMgr(u16 cmd, vu32 * dataStart, u16 length, u8 state, u8 nextProcessStep);
void configureSendRecvMgrChunked(u16 cmd, vu32 * dataStart, u16 length, u8 state, u8 nextProcessStep, u8 chunkSize);
```

These methods both do basically the same thing. The difference being that `configureSendRecvMgr` validated the data once at the end whereas `configureSendRecvMgrChunked` validates sections of the data as it's sent. This means `configureSendRecvMgrChunked` has a larger overhead (as it needs to send a bunch more validation messages) but unlike `configureSendRecvMgr` if a transmission fails it won't have to start from scratch. 

Basically if you are sending less than 16 bytes use `configureSendRecvMgr` if you are sending more then use `configureSendRecvMgrChunked`. The minimum and recommended chunk size is 16 because the transfer commands don't allow writing data at a more granular level.

Let's take a look at a simplified example of the ProcessFunction steps to download a custom mart:

#### Step 1 - Send
Here some chars are written into gStringVar3[0]

0x1502 means we are sending data to position 16*2 in the wii's array.

The data we are sending is gStringVar3 and we are sending 4 bytes

When the task is done the state should update to DOWNLOAD_MART_TRANSMIT_REQUEST
```
case DOWNLOAD_MART_SEND_REQUEST:
    gStringVar3[0] = 'M'; gStringVar3[1] = 'A'; gStringVar3[2] = '_'; gStringVar3[3] = '1';
    configureSendRecvMgr(0x1502, (vu32 *) &gStringVar3[0], 4, NET_CONN_STATE_SEND, DOWNLOAD_MART_TRANSMIT_REQUEST);
    break;
```

#### Step 2 - Transmit
Note we are setting `disableChecks` because the don't work for transmit requests

We then update the retryPoint (so if the connection fails we don't go back to DOWNLOAD_MART_SEND_REQUEST)

0x1302 means we are asking the wii to transmit data starting from 16*2 (where we wrote to before). We are asking transmit bytes

When the task is done it should update the state to DOWNLOAD_MART_WAIT_FOR_SERVER
```
case DOWNLOAD_MART_TRANSMIT_REQUEST:
    sSendRecvMgr.disableChecks = TRUE; 
    sSendRecvMgr.retryPoint = DOWNLOAD_MART_TRANSMIT_REQUEST;
    configureSendRecvMgr(0x1302, 0, 4, NET_CONN_STATE_SEND, DOWNLOAD_MART_WAIT_FOR_SERVER);
    break;
```

#### Step 3 - Wait
The network wait checks don't actually work yet. Currently we just play an animation that lasts a few seconds and hope it's finished by the time we try and read data 🤞

When the wait is done is should move to DOWNLOAD_MART_RECEIVE_DATA
```
case DOWNLOAD_MART_WAIT_FOR_SERVER:
    // Some waiting animation code here
    sSendRecvMgr.nextProcessStep = DOWNLOAD_MART_RECEIVE_DATA;
    break;
```

#### Step 4 - Receive
First we need to remember to re-enable check (as we disabled them for the transmit)

Then we clear gStringVar3 because we are setting it as the address to receive data to

0x25F0 means we are asing the wii to send us data in it's array starting from 0xF0 * 16 (the is where the server wrote data to). We are asking for 16 bytes of data
```
case DOWNLOAD_MART_RECEIVE_DATA:
    sSendRecvMgr.disableChecks = FALSE;
    CpuFill32(0, &gStringVar3, sizeof(gStringVar3)); 
    configureSendRecvMgrChunked(0x25F0, (vu32 *) &gStringVar3[0], 16, NET_CONN_STATE_RECEIVE, DOWNLOAD_MART_FINISH, MINIMUM_CHUNK_SIZE);
    break;
```


🗒️ I strongly recommend always making `chunkSize` 16. And alway making sure you are transmitting a multiple of 4 bytes as nothing else has really been tested 

## For other Decomp/Disassembly projects see:

Other disassembly and/or decompilation projects:
* [**Pokémon Red and Blue**](https://github.com/pret/pokered)
* [**Pokémon Gold and Silver (Space World '97 demo)**](https://github.com/pret/pokegold-spaceworld)
* [**Pokémon Yellow**](https://github.com/pret/pokeyellow)
* [**Pokémon Trading Card Game**](https://github.com/pret/poketcg)
* [**Pokémon Pinball**](https://github.com/pret/pokepinball)
* [**Pokémon Stadium**](https://github.com/pret/pokestadium)
* [**Pokémon Gold and Silver**](https://github.com/pret/pokegold)
* [**Pokémon Crystal**](https://github.com/pret/pokecrystal)
* [**Pokémon Ruby and Sapphire**](https://github.com/pret/pokeruby)
* [**Pokémon Pinball: Ruby & Sapphire**](https://github.com/pret/pokepinballrs)
* [**Pokémon FireRed and LeafGreen**](https://github.com/pret/pokefirered)
* [**Pokémon Mystery Dungeon: Red Rescue Team**](https://github.com/pret/pmd-red)


## Contacts (For issues/help with the vanilla decomp project, don't message them about bugs in my network code)

You can find us on [Discord](https://discord.gg/d5dubZ3) and [IRC](https://web.libera.chat/?#pret).
