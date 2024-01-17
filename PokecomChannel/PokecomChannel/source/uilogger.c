#include "uilogger.h"
#include <string.h>

static char Logger[MAX_LOGS][MAX_LOG_MSG_LENGTH] = { {"-"}, {"-"}, {"-"}, {"-"}, {"-"}, {"-"}, {"-"}, {"-"}, {"-"}, {"-"}, {"-"}, {"-"}, {"-"}, {"-"} };

int QueuePos = 0;

void print_ui_log(const char* string)
{
   if (sizeof(string) > MAX_LOG_MSG_LENGTH)
   {
        strncpy(Logger[QueuePos++], string, MAX_LOG_MSG_LENGTH);
   }
   else
   {
        memcpy(Logger[QueuePos++], string, 25);
   } 
   

   if (QueuePos == MAX_LOGS) QueuePos = 0;
}

char * read_ui_log(int position)
{
     return Logger[position % MAX_LOGS];
}