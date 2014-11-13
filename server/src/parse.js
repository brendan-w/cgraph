
var fs        = require("fs");
var preproc   = require("./preprocessor.js");
var tokenizer = require("./tokenizer.js");





var c = fs.readFileSync("./tests/hello/hello.c").toString("utf8");





var tokens = tokenizer.run(preproc(c));






//chunker (split tokens into statements by brackets and semicolons)

var statements = [];
var current = [];
var parenLevel = 0; //prevents semicolons from chunk while in for(;;) loops

//increments or decrements parenLevel
function countParens(token)
{
	if(token.type === tokenizer.types.OPEN_PAREN)
		return 1;
	else if(token.type === tokenizer.types.CLOSE_PAREN)
		return -1;
	return 0;
}

function push()
{
	statements.push(current);
	current = [];
}

for(var i = 0; i < tokens.length; i++)
{
	var token = tokens[i];
	current.push(token);

	parenLevel += countParens(token);

	//decide whether the current token string is a statement chunk
	if(token.type === tokenizer.types.OPEN_BRACKET)
		push();
	else if(token.type === tokenizer.types.CLOSE_BRACKET) //end brackets get there own statements
		push();
	else if((parenLevel === 0) && (token.type === tokenizer.types.SEMICOLON))
		push();
}


// console.log(statements);




//returns the index of the matching close paren in a statement
function matchParen(statement, open)
{
	var level = 1;

	//loop until the paren level returns to zero
	for(var t = open+1; t < statement.length; t++)
	{
		var token = statement[t];
		level += countParens(token);
		if(level === 0) return t;
	}
}


//test for a function definition at the given token index
function testFuncDef(statement, start)
{
	if(statement[t].type === tokenizer.types.IDENTIFIER) //function name
	{
		if(statement[t+1].type === tokenizer.types.OPEN_PAREN) //open paren
		{
			//find matching paren
			var close = matchParen(statement, t+1);
			
			if(close !== -1) //close paren
			{
				if(statement[close+1].type === tokenizer.types.OPEN_BRACKET)
				{
					console.log("---------->", statement[t]);
				}
			}
		}
	}
}



//find function definitions
for(var i = 0; i < statements.length; i++)
{
	var statement = statements[i];
	console.log(i, "========");

	//minimum number of tokens needed to form function DEFINITION
	// void main ( ) {
	if(statement.length >= 5)
	{
		for(var t = 0; t < statement.length - 3; t++)
		{
			// console.log(statement[t]);
			//test using this position as a starting point
			var test = testFuncDef(statement, t);
		}
	}
}
