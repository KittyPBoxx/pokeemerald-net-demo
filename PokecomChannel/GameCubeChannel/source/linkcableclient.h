/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * linkcableclient.h
 * Client that connections to the GBA via gamecube port on wii
 ***************************************************************************/

#ifndef _LINKCABLECLIENT_H_
#define _LINKCABLECLIENT_H_

#include <gccore.h>

// Connection states 
enum {
	CONNECTION_INIT = 0,
    CONNECTION_SUCCESS, // Bind to remote address
    CONNECTION_STARTING, // Ready to start a connection
	CONNECTION_ERROR_INVALID_IP, // Not a valid IPv4 Addr
	CONNECTION_ERROR_COULD_NOT_RESOLVE_IPV4, // DNS resolution returned no valid ip addresses
    CONNECTION_ERROR_NO_NETWORK_DEVICE, // No network device (e.g wifi card or ethernet) could be found. The may be an emulator that has no support or a wii mini (which has no wifi)
    CONNECTION_ERROR_CONNECTION_FAILED, // Failed to bind the the address
    CONNECTION_ERROR_INVALID_RESPONSE // Handshake failed when we send RUBY_SAPPHIRE we expect a response SN_<NAME_OF_SERVER>
};

void setupGBAConnectors();

u32 hasServerName();
char* getServerName();

u32 isConnected(u32 port);

u32 hasPlayerName(u32 port);
char* getPlayerName(u32 port);

u32 testTCPConnection(char* ipv4);
void setOverrideAddress(char* ipv4);

#endif