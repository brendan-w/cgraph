
/*

	Welcome to the C "parser" written in Javascript

	Please... I can explain...

	If you're wondering why on Earth I wrote my own parser, I tried 3 other
	parsers/approaches, and they each got ditched for one of the following
	reasons:

		- didn't provide line numbers
		- didn't handle linking correctly
		- required running gcc (not a great idea for a server...)
		- requires headers for all dependencies

	That last one is the kicker. In order to make this dynamic, I can never
	gaurantee that I will have all of the headers for random dependencies.
	Because of that, I needed a parser that could find function definitions/calls
	without knowing types. This is my attempt.

*/

var parseFile = require('./parseFile.js');
var link      = require('./linker.js');


function run(files) {
	var maps = [];

	//parse the C for each file, and produce individual call graphs
	files.forEach(function(f) {
		maps.push(parseFile(f));
	});

	//link and return the file maps

	var output = link(maps);

	return JSON.stringify(output, function(k, v){return v;}, 4);
}

module.exports = run;

//test
console.log(run([
	"./tests/hello/hello.c",
	"./tests/hello/other.c",
]));
