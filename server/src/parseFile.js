
/*

	Welcome to the C "parser" written in Javascript

	Please... I can explain...

	If you're wondering why on Earth I wrote my own parser, I tried 3 other
	parsers, and they each got ditched for one of the following reasons:

		- didn't provide line numbers
		- didn't handle linking correctly
		- required running gcc (not a great idea for a server...)
		- requires headers for all dependencies

	That last one is the kicker. In order to make this dynamic, I can never
	gaurantee that I will have all of the headers for random dependencies.
	Because of that, I needed a parser that could find function definitions/calls
	without knowing types. This is my attempt.

	Finding definitions is easy, just look for the brackets.
	Finding calls is hard, because you need to weed out the prototypes.

*/

var fs = require("fs");

var preproc      = require("./preprocessor.js");
var tokenizer    = require("./tokenizer.js");
var statementer  = require("./statementer.js");
var detect_defs  = require("./detect_defs.js");
var detect_calls = require("./detect_calls.js");
var loadCalls    = require("./loadCalls.js");


//here we go

function parseFile(filename)
{
	var raw_c       = fs.readFileSync(filename).toString("utf8");
	var c           = preproc(raw_c); //returns string of cleaned C code
	var tokens      = tokenizer(c); //returns array of 'token' objects
	var statements  = statementer(tokens); //returns array of statements (which are arrays of 'token' objects)
	var definitions = detect_defs(statements); //returns array of 'func' objects
	var calls       = detect_calls(statements); //returns array of 'call' objects
	var output      = loadCalls(definitions, calls); //returns array of 'func' objects, matched with the functions they call

	console.log(output);

	var outfile = filename + ".go";
	//fs.writeFileSync(outfile, output);
	return output;
}

parseFile("./tests/hash.c");
