
#include "header.h"



int main()
{
	int (*getFunc())(int, int);

	int foo();
	int x = foo();

	int i = bazz();
	return x+i;
}

int foo()
{
	return 1;
}
