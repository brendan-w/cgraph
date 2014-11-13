
var fs        = require("fs");
var preproc   = require("./preprocessor.js");
var tokenizer = require("./tokenizer.js");

var c = fs.readFileSync("./tests/hello/hello.c").toString("utf8");

var tokens = tokenizer.run(preproc(c));






//chunker (split tokens into statements by close_brackets and semicolons)

var statements = [];
var current = [];
var parenLevel = 0; //prevents semicolons from chunk while in for(;;) loops

//increments or decrements parenLevel
function manageParens(t)
{
	if(t.type === tokenizer.types.OPEN_PAREN)
		parenLevel++;
	else if(t.type === tokenizer.types.CLOSE_PAREN)
		parenLevel--;
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

	manageParens(token);

	//decide whether the current token string is a statement chunk
	if(token.type === tokenizer.types.OPEN_BRACKET)
		push();
	else if(token.type === tokenizer.types.CLOSE_BRACKET) //end brackets get there own statements
		push();
	else if((parenLevel === 0) && (token.type === tokenizer.types.SEMICOLON))
		push();
}

//console.log(statements);






//interpretter (finds function definitions)


for(var i = 0; i < statements.length; i++)
{
	var statement = statements[i];
	
	parenLevel = 0;

	console.log("========");

	for(var t = 0; t < statement.length; t++)
	{
		var token = statement[t];
		manageParens(token);
		console.log(parenLevel, token);
	}
}
