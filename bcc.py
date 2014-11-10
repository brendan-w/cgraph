#!/usr/bin/env python2

"""
Utility to generate function call graphs of C projects
replace CC=gcc with this python file, and 
"""

import os
import sys
import re

from subprocess import call


print("Running GCC")

# transparently run gcc
args = list(sys.argv)
args[0] = 'gcc'
call(args)

print("Parsing for functions")

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

print "Files:"
for f in files:
	print("\t%s" % f)







re_identifier = r"([_a-zA-Z][_a-zA-Z0-9]*)"

#                 function name     lookahead for (...){
re_function_def = re_identifier + r"(?=\s*\(([\s_a-zA-Z0-9*&,])*\)\s*\{)"

# each file gets turned into a .go (graph-object) file
for f in files:
	print "\nFile ================= [%s]" % f
	with open(f, 'r') as source:
		code = source.read()
		r = re.compile(re_function_def, re.MULTILINE)
		
		for match in r.finditer(code):
			pos = match.start()
			name = match.group()

			line = code[:pos].count('\n') + 1
			print line

