#!/usr/bin/env python2

"""
Utility to generate function call graphs of C projects
replace CC=gcc with this python file, and run as normal
"""

import os
import sys
import re
import json

from subprocess import call
from pycparser import c_parser, c_ast, parse_file

print("====================  Running GCC  =====================")

# transparently run gcc
args = list(sys.argv)
args[0] = 'gcc'

# command line option for preprocessor choice
use_gcc_cpp = ('-nogcc' not in args)
try:
    args.remove('-nogcc')
except ValueError:
    pass

# run gcc as the make file would have it
call(args)

print("===============  Parsing for functions  ================")

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



print "All Files:"
for f in files:
	print("\t%s" % f)





class Recurser():

	def __init__(self, ast):
		self.funcs = [] # list of all function definitions in this tree
		self.stack = [] # the function that the recurser is currently in (all call statements will be logged to top function)
		self.descend(ast) # start!

	# pull out relevant information and store in json friendly format
	def buildFunc(self, node):
		return {
			"name": node.decl.name,
			"line": node.decl.coord.line,
			"public": ('static' not in node.decl.storage),
			"calls": [],
		}

	# pull out relevant information and store in json friendly format
	def buildCall(self, node):
		return {
			"name": node.name.name,
			"line": node.coord.line,
		}

	# the tree recurser
	def descend(self, node):
		isDef  = (node.__class__.__name__ == "FuncDef")
		isCall = (node.__class__.__name__ == "FuncCall")

		if isDef:
			# if it a definition, build a new object for it, and push it on the stack
			func = self.buildFunc(node)

			self.stack.append(func)
			self.funcs.append(func)
		
		elif isCall and len(self.stack) > 0:
			call = self.buildCall(node)

			# log this call in the top function on the stack
			self.stack[-1]["calls"].append(call)

		# recurse
		for c_name, c in node.children():
			self.descend(c)

		if isDef:
			# now that the recurse for loop has finished, we can pop the current location form the stack
			self.stack.pop()



# each file gets turned into a .go (graph-object) file
for f in files:
	print "\nFile ================= [%s]" % f

	# parse it using GCC for its C-preprocessor
	# fake libc includes provided by pycparser
	if use_gcc_cpp:
		ast = parse_file(f, use_cpp=True, \
							cpp_path='gcc', \
							cpp_args=['-E', '-I', '/home/brendan/cgraph/fake_libc_include/'])
	else:
		ast = parse_file(f, use_cpp=False)

	r = Recurser(ast)

	print "\t%d Functions" % len(r.funcs)

	with open("%s.go"%f, "w") as out_file:
		j = json.dumps(r.funcs, indent=4)
		#print j
		out_file.write(j)
