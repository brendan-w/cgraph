#!/usr/bin/env python2

"""
Utility to generate function call graphs of C projects
replace CC=gcc with this python file, and 
"""

import os
import sys
import re

from subprocess import call

# transparently run gcc
args = list(sys.argv)
args[0] = 'gcc'
call(args)

# collect file list
files = []

for a in sys.argv[1:]:
	
	# filter out flags
	if a[0] in ['-']:
		continue

	# check the extension
	parts = os.path.splitext(a)
	
	if len(parts) < 2:
		continue

	if parts[1] not in ['.c', '.C']:
		continue

	# check that this is a real file
	f = os.path.abspath(a)
	if os.path.isfile(f):
		files.append(f)


print files

# each file gets turned into a .go (graph-object) file
