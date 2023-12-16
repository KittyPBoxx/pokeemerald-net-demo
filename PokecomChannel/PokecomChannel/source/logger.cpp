/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * logger.cpp
 * Holdes log messages
 ***************************************************************************/
#include "logger.h"
#include <stdio.h>
#include <string.h>

Logger::Logger()
{
    this->msgCount = 0;
}

Logger::~Logger()
{
}

void Logger::Log(char *msg)
{
    char* copyString = new char[strlen(msg)];
	strcpy(copyString, msg);

    msgs[this->msgCount % MAX_LOGS] = copyString;

    this->msgCount++;

    if (this->msgCount > 5000)
    {
       this->msgCount  = this->msgCount % MAX_LOGS;
    }
}

const char * Logger::GetMsgs(int index)
{
    if (index >= this->msgCount)
    {
        return "-";
    }

    return this->msgs[index % MAX_LOGS];
}