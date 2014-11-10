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
		self.funcs = []
		self.stack = []
		self.descend(ast)

	def buildFunc(self, node):
		return {
			"name": node.decl.name,
			"line": node.decl.coord.line,
			"public": ('static' not in node.decl.storage),
			"calls": [],
		}

	def buildCall(self, node):
		return {
			"name": node.name.name,
			"line": node.coord.line,
		}

	def descend(self, node):
		isDef  = (node.__class__.__name__ == "FuncDef")
		isCall = (node.__class__.__name__ == "FuncCall")

		if isDef:
			func = self.buildFunc(node)

			self.stack.append(func)
			self.funcs.append(func)
		
		elif isCall and len(self.stack) > 0:
			call = self.buildCall(node)

			self.stack[-1]["calls"].append(call)

		# recurse
		for c_name, c in node.children():
			self.descend(c)

		if isDef:
			self.stack.pop()



# each file gets turned into a .go (graph-object) file
for f in files:
	print "\nFile ================= [%s]" % f

	# parse it! uses GCC as C-preprocessor fake libc includes provided by pycparser
	ast = parse_file(f, use_cpp=True, \
						cpp_path='gcc', \
						cpp_args=['-E', '-I', '/home/brendan/cgraph/fake_libc_include/'])

	r = Recurser(ast)

	print "\t%d Functions" % len(r.funcs)

	with open("%s.go"%f, "w") as out_file:
		j = json.dumps(r.funcs, indent=4)
		print j
		#out_file.write(j)
