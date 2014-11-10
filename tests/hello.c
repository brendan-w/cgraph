
#include "header.h"

//-------------start------------
int GLOBAL;
typedef struct { int x; } S;

int main()
{
	int i = bazz();
	return 0;
}

int foo ()
{
	S s;
	s.x++;
	GLOBAL++;
}

int bar ()
{

	int x = test();
	S s;

	x = GLOBAL;
	x = s.x;
}

int zoo ()
{

	if(1)
	{

	}

	S s;

	!GLOBAL;
	GLOBAL = 12;
	s.x = GLOBAL;
	GLOBAL = s.x;
}