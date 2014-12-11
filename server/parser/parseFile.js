
/*
	This function parses a single C file into a function call map.
	The return data should look something like this:

	{
		//file that this function map represents
		filename: "./tests/hello/hello.c",

		//main list of function definitions in the file
		functions: [

			//each function definition gets an object
			{
				//identifier token for this function
				token: { name: 'main', line: 6, id: 6, type: 0 },

				//storage modifier token ('extern' if null)
				storage: null,

				//end bracket token for this function
				endToken: { name: '}', line: 13, id: 41, type: 5 },

				//list of calls this function makes
				calls: [
					//each call is an object with the identifier token with the function name
					{ token: { name: 'bar',  line: 9,  id: 15, type: 0 } },
					{ token: { name: 'foo',  line: 10, id: 22, type: 0 } },
					{ token: { name: 'bar',  line: 10, id: 24, type: 0 } },
					{ token: { name: 'bazz', line: 11, id: 32, type: 0 } },
					{ token: { name: 'zoo',  line: 12, id: 37, type: 0 } }
				]
			},
			etc...
		]
	}

	Finding definitions is easy, just look for the brackets.
	Finding calls is hard, because you need to weed out the prototypes.

*/

var preproc      = require("./preprocessor.js");
var tokenizer    = require("./tokenizer.js");
var statementer  = require("./statementer.js");
var detect_defs  = require("./detect_defs.js");
var detect_calls = require("./detect_calls.js");
var loadCalls    = require("./loadCalls.js");

/*
	Accepts an object of the following format

	{
		filename: "main.c"
		content: "#include <iostream> ..."
	}
*/
module.exports = function(file, callback) {

	var raw_c       = file.content;
	var c           = preproc(raw_c); //returns string of cleaned C code
	var tokens      = tokenizer(c); //returns array of 'token' objects
	var statements  = statementer(tokens); //returns array of statements (which are arrays of 'token' objects)
	var definitions = detect_defs(statements); //returns array of 'func' objects
	var calls       = detect_calls(statements); //returns array of 'call' objects
	var map         = loadCalls(definitions, calls); //returns array of 'func' objects, matched with the functions they call

	var output = {
		"filename": file.filename,
		"functions": map
	};

	callback(false, output);
};
