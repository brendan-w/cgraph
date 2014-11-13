
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

var util = require("./util.js");
var types         = util.types;
var countParens   = util.countParens;
var matchParen    = util.matchParen;

var preproc       = require("./preprocessor.js");
var tokenizer     = require("./tokenizer.js");
var statementer   = require("./statementer.js");


var c = fs.readFileSync("./tests/hello/hello.c").toString("utf8");

c = preproc(c);
var tokens = tokenizer(c);
var statements = statementer(tokens);





//test for a function definition at the given token index
function testFuncDef(statement, start)
{
	if(statement[t].type === types.IDENTIFIER) //function name
	{
		if(statement[t+1].type === types.OPEN_PAREN) //open paren
		{
			//find matching paren
			var close = matchParen(statement, t+1);

			if(close !== -1) //close paren
			{
				if(statement[close+1].type === types.OPEN_BRACKET) //open bracket
				{
					//ghostbusters: "weeee GOT ONE!!!"
					//console.log("---------->", statement[t]);
					return true;
				}
			}
		}
	}
	return false;
}


definitions = [];

function func(token, name, line, storage)
{
	this.token = token;
	this.name = token.name;
	this.line = token.line;
	this.storage = storage;
}

//find function definitions
for(var i = 0; i < statements.length; i++)
{
	var statement = statements[i];

	//minimum number of tokens needed to form function DEFINITION
	// void main ( ) {
	if(statement.length >= 5)
	{
		var storage = "extern"; //all functions are extern by default
		for(var t = 0; t < statement.length - 3; t++)
		{
			var token = statement[t];

			//record the last occurence of storage modifiers
			if(token.type === types.KEYWORD_STORAGE)
			{
				storage = token.name;
			}
			else
			{
				//test using this position as a starting point
				if(testFuncDef(statement, t))
				{
					//oh boy oh boy oh boy!!
					var f = new func(token, storage);
					definitions.push(f);
				}
			}
		}
	}
}

//console.log(definitions);













calls = [];

function call(token)
{
	this.token = token;
	this.name = token.name;
	this.line = token.line;
}

function testFuncDecl(statement, start, parenLevel)
{
	if(statement[t].type === types.IDENTIFIER) //function name
	{
		if(statement[t+1].type === types.OPEN_PAREN) //open paren
		{
			//find matching paren
			var close = matchParen(statement, t+1);

			if(close !== -1) //close paren
			{	
				if(start === 0) //if its got nothing before it, it gauranteed to be a call (not a prototyp)
				{
					//ghostbusters: "weeee GOT ONE!!!"
					return true;
				}
				else if(parenLevel > 0)
				{
					return true;
				}
				else
				{
					//look at previous tokens to see if there was an assignment
					for(var p = 0; p < start; p++)
					{
						if(statement[p].type === types.OPERATOR_ASSIGN)
							return true;
					}
				}
			}
		}
	}
	return false;
}

//find function definitions
for(var i = 0; i < statements.length; i++)
{
	var statement = statements[i];
	var parenLevel = 0;

	//minimum number of tokens needed to form function DECLARATION
	// main ( ) ;
	if(statement.length >= 3)
	{
		for(var t = 0; t < statement.length - 3; t++)
		{
			var token = statement[t];
			parenLevel += countParens(token);

			//test using this position as a starting point
			if(testFuncDecl(statement, t, parenLevel))
			{
				//oh boy oh boy oh boy!!
				var c = new call(token);
				calls.push(c);
			}
		}
	}
}



console.log(calls);
