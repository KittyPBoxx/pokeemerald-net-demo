/****************************************************************************
 * libwiigui Template
 * Tantric 2009
 *
 * filebrowser.h
 *
 * Generic file routines - reading, writing, browsing
 ****************************************************************************/

#ifndef _FILEBROWSER_H_
#define _FILEBROWSER_H_

#include <unistd.h>
#include <gccore.h>
#define MAXPATHLEN 1024
#define MAXJOLIET 255
#define MAXDISPLAY 45

typedef struct
{
	char dir[MAXPATHLEN]; // directory path of browserList
	int numEntries; // # of entries in browserList
	int selIndex; // currently selected index of browserList
	int pageIndex; // starting index of browserList page display
} BROWSERINFO;

typedef struct
{
	char isdir; // 0 - file, 1 - directory
	char filename[MAXJOLIET + 1]; // full filename
	char displayname[MAXDISPLAY + 1]; // name for browser display
} BROWSERENTRY;

extern BROWSERINFO browser;
extern BROWSERENTRY * browserList;
extern char rootdir[10];

int UpdateDirName(int method);
int FileSortCallback(const void *f1, const void *f2);
void ResetBrowser();
int BrowserChangeFolder();
int BrowseDevice();

#endif
