/****************************************************************************
 * Pokecom Channel
 * KittyPBoxx 2023
 *
 * logger.h
 * To help logging things out to the ui
 ***************************************************************************/

#ifndef _LOGGER_H_
#define _LOGGER_H_

#define MAX_LOGS 14

class Logger {
public:
	//!Constructor
    Logger();
    //!Destructor
	~Logger();
    //!Records some text to the log
    //!\param the message to log
	void Log(char *msg);
    //!Returns the log message at an index
    const char * GetMsgs(int index);
    //! All log msgs as messages are added old ones are removed
    int msgCount;
    int length;
    char * msgs[MAX_LOGS];
};

#endif