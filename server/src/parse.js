
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

var preproc       = require("./preprocessor.js");
var tokenizer     = require("./tokenizer.js");
var statementer   = require("./statementer.js");
var detect_defs   = require("./detect_defs.js");
var detect_calls  = require("./detect_calls.js");


//here we go
var raw_c = fs.readFileSync("./tests/hello/hello.c").toString("utf8");
var c = preproc(raw_c);
var tokens = tokenizer(c);
var statements = statementer(tokens);
var definitions = detect_defs(statements);
var calls = detect_calls(statements);

//done
console.log(tokens);
console.log("defs ========");
console.log(definitions);
console.log("calls =======");
console.log(calls);
