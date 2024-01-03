# Celio Server

## Install

To run the server you need NodeJS installed. 

Run `npm run start` to start the server

Run `npm run prod` to build the release executables

## 30 Second Overview

Celio Server runs two servers. A TCP server on port 9000 and an Express Web Server on port 8081. 

TCP request are passed into tcpRequestManager.js

HTTP requests are passed into webserver.js

The web page is a basic js/css/html site using `fomantic-ui` for the visuals. It can be found in web-src. Fetch API is used to communicate with the express server.  

## Attribution 

Most graphics is loaded remotely from pokeapi. 

The trainer sprite is loaded remotely from pokemonshowdown.