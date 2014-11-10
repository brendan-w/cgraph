#!/usr/bin/env python2

"""
Utility to generate function call graphs of C projects
replace CC=gcc with this python file, and run as normal
"""

import os
import sys
import re

from subprocess import call
from pycparser import c_parser, c_ast, parse_file


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




class Function():
	def __init__(self, node):
		# the def for this function
		self.node = node
		# other functions that this one calls
		self.calls = []

	def __str__(self):
		out = "Def: %s: %d" % (self.node.decl.name, self.node.decl.coord.line)
		for call in self.calls:
			out += "\n\tCalls: %s: %d" % (call.name.name, call.coord.line)
		return out



class Recurser():

	def __init__(self, ast):
		self.funcs = []
		self.stack = []
		self.descend(ast)

	def descend(self, node):
		isDef  = (node.__class__.__name__ == "FuncDef")
		isCall = (node.__class__.__name__ == "FuncCall")

		if isDef:
			func = Function(node)
			self.stack.append(func)
			self.funcs.append(func)
		elif isCall and len(self.stack) > 0:
			self.stack[-1].calls.append(node)

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

	for func in r.funcs:
		print str(func)
