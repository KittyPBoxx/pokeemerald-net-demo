/****************************************************************************
 * libwiigui Template
 * Tantric 2009
 *
 * filebrowser.cpp
 *
 * Generic file routines - reading, writing, browsing
 ***************************************************************************/

#include <gccore.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <wiiuse/wpad.h>
#include <sys/dir.h>
#include <malloc.h>

#include "filebrowser.h"
#include "menu.h"

BROWSERINFO browser;
BROWSERENTRY * browserList = nullptr; // list of files/folders in browser

char rootdir[10];

/****************************************************************************
 * ResetBrowser()
 * Clears the file browser memory, and allocates one initial entry
 ***************************************************************************/
void ResetBrowser()
{
	browser.numEntries = 0;
	browser.selIndex = 0;
	browser.pageIndex = 0;

	// Clear any existing values
	if(browserList != nullptr)
	{
		free(browserList);
		browserList = nullptr;
	}
	// set aside space for 1 entry
	browserList = (BROWSERENTRY *)malloc(sizeof(BROWSERENTRY));
	memset(browserList, 0, sizeof(BROWSERENTRY));
}

/****************************************************************************
 * UpdateDirName()
 * Update curent directory name for file browser
 ***************************************************************************/
int UpdateDirName()
{
	int size=0;
	char * test;
	char temp[1024];

	/* current directory doesn't change */
	if (strcmp(browserList[browser.selIndex].filename,".") == 0)
	{
		return 0;
	}
	/* go up to parent directory */
	else if (strcmp(browserList[browser.selIndex].filename,"..") == 0)
	{
		/* determine last subdirectory namelength */
		sprintf(temp,"%s",browser.dir);
		test = strtok(temp,"/");
		while (test != nullptr)
		{
			size = strlen(test);
			test = strtok(nullptr,"/");
		}

		/* remove last subdirectory name */
		size = strlen(browser.dir) - size - 1;
		browser.dir[size] = 0;

		return 1;
	}
	/* Open a directory */
	else
	{
		/* test new directory namelength */
		if ((strlen(browser.dir)+1+strlen(browserList[browser.selIndex].filename)) < MAXPATHLEN)
		{
			/* update current directory name */
			strcat(browser.dir, "/");
			strcat(browser.dir, browserList[browser.selIndex].filename);
			return 1;
		}
		else
		{
			return -1;
		}
	}
}

/****************************************************************************
 * FileSortCallback
 *
 * Quick sort callback to sort file entries with the following order:
 *   .
 *   ..
 *   <dirs>
 *   <files>
 ***************************************************************************/
int FileSortCallback(const void *f1, const void *f2)
{
	/* Special case for implicit directories */
	if(((BROWSERENTRY *)f1)->filename[0] == '.' || ((BROWSERENTRY *)f2)->filename[0] == '.')
	{
		if(strcmp(((BROWSERENTRY *)f1)->filename, ".") == 0) { return -1; }
		if(strcmp(((BROWSERENTRY *)f2)->filename, ".") == 0) { return 1; }
		if(strcmp(((BROWSERENTRY *)f1)->filename, "..") == 0) { return -1; }
		if(strcmp(((BROWSERENTRY *)f2)->filename, "..") == 0) { return 1; }
	}

	/* If one is a file and one is a directory the directory is first. */
	if(((BROWSERENTRY *)f1)->isdir && !(((BROWSERENTRY *)f2)->isdir)) return -1;
	if(!(((BROWSERENTRY *)f1)->isdir) && ((BROWSERENTRY *)f2)->isdir) return 1;

	return strcasecmp(((BROWSERENTRY *)f1)->filename, ((BROWSERENTRY *)f2)->filename);
}

/***************************************************************************
 * Browse subdirectories
 **************************************************************************/
int
ParseDirectory()
{
	DIR *dir = nullptr;
	char fulldir[MAXPATHLEN];
	struct dirent *entry;

	// reset browser
	ResetBrowser();

	// add currentDevice to path
	strcpy(fulldir, rootdir);
	strcat(fulldir, browser.dir);
	// open the directory
	dir = opendir(fulldir);

	// if we can't open the dir, try opening the root dir
	if (dir == nullptr)
	{
		sprintf(browser.dir,"/");
		dir = opendir(rootdir);
		if (dir == nullptr)
		{
			return -1;
		}
	}

	// index files/folders
	int entryNum = 0;

	while((entry = readdir(dir)))
	{
		if(strcmp(entry->d_name,".") == 0)
			continue;
		
		BROWSERENTRY * newBrowserList = (BROWSERENTRY *)realloc(browserList, (entryNum+1) * sizeof(BROWSERENTRY));

		if(!newBrowserList) // failed to allocate required memory
		{
			ResetBrowser();
			entryNum = -1;
			break;
		}
		else
		{
			browserList = newBrowserList;
		}
		memset(&(browserList[entryNum]), 0, sizeof(BROWSERENTRY)); // clear the new entry

		memcpy(browserList[entryNum].filename, entry->d_name, strnlen(entry->d_name, MAXJOLIET - 1)); 
		browserList[entryNum].filename[MAXJOLIET] = '\0';

		if(strcmp(entry->d_name,"..") == 0)
		{
			strcpy(browserList[entryNum].displayname, "Up One Level");
			browserList[entryNum].isdir = 1; // flag this as a dir
		}
		else
		{
			memcpy(browserList[entryNum].displayname, entry->d_name, strnlen(entry->d_name, MAXDISPLAY - 1)); // crop name for display
			browserList[entryNum].displayname[MAXDISPLAY] = '\0';

			if(entry->d_type==DT_DIR)
				browserList[entryNum].isdir = 1; // flag this as a dir
		}

		entryNum++;
	}

	// close directory
	closedir(dir);

	// Sort the file list
	qsort(browserList, entryNum, sizeof(BROWSERENTRY), FileSortCallback);

	browser.numEntries = entryNum;
	return entryNum;
}

/****************************************************************************
 * BrowserChangeFolder
 *
 * Update current directory and set new entry list if directory has changed
 ***************************************************************************/
int BrowserChangeFolder()
{
	if(!UpdateDirName())
		return -1;

	ParseDirectory();

	return browser.numEntries;
}

/****************************************************************************
 * BrowseDevice
 * Displays a list of files on the selected device
 ***************************************************************************/
int BrowseDevice()
{
	sprintf(browser.dir, "/");
	sprintf(rootdir, "sd:/");
	ParseDirectory(); // Parse root directory
	return browser.numEntries;
}
