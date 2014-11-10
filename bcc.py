#!/usr/bin/env python2

"""
Utility to generate function call graphs of C projects
replace CC=gcc with this python file, and 
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






class FuncDefVisitor(c_ast.NodeVisitor):
	def visit_FuncDef(self, node):
		print('%s at %s' % (node.decl.name, node.decl.coord))


# each file gets turned into a .go (graph-object) file
for f in files:
	print "\nFile ================= [%s]" % f
	ast = parse_file(f, use_cpp=True, \
						cpp_path='gcc', \
						cpp_args=['-E', r'-I' '/home/brendan/cgraph/fake_libc_include/'])
	v = FuncDefVisitor()
	v.visit(ast)

