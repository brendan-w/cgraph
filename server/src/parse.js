
var fs = require("fs");
var c = fs.readFileSync("./tests/hello/hello.c").toString("utf8");


//preprocessor

c = c.replace(/\".*\"/, "\"\""); //remove strings
//remove comments


//rules
var identifier = /^([a-zA-Z_$][0-9a-zA-Z_$]*)$/;
var keywords = ["auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","int","long","register","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while"];
var operators = ["=","<",">"];
var type = {
	"UNKNOWN":-1,
	"IDENTIFIER":0,
	"KEYWORD":1,
	"SEMICOLON":2,
	"OPEN_BRACKET":3,
	"CLOSE_BRACKET":4,
	"OPEN_PAREN":5,
	"CLOSE_PAREN":6,
	"OPERATOR":7,
};


//tokenizer (splits the text into classified tokens)

function Token(name, line, id)
{
	this.name = name;
	this.line = line;
	this.type = type.UNKNOWN;

	if(id)
	{
		//search the keywords list for possible match
		if(keywords.indexOf(this.name) >= 0)
			this.type = type.KEYWORD;
		else
			this.type = type.IDENTIFIER;
	}
	else
	{
		switch(this.name)
		{
			case "(": this.type = type.OPEN_PAREN;    break;
			case ")": this.type = type.CLOSE_PAREN;   break;
			case "{": this.type = type.OPEN_BRACKET;  break;
			case "}": this.type = type.CLOSE_BRACKET; break;
			case ";": this.type = type.SEMICOLON;     break;
		}
	}
}

var tokens = [];
var lineCounter = 1;
var buffer = "";

//Note: this mechanism really only works because the only tokens of relevance are:
//	-parenthesis
//	-brackets
//	-semicolons
//	-keywords/identifiers
for(var i = 0; i < c.length; i++)
{
	var k = c.charAt(i);


	if(buffer.length !== 0)
	{
		if(!identifier.test(buffer)) //the buffer does NOT hold an identifier
		{
			tokens.push(new Token(buffer, lineCounter, false));
			buffer = "";
		}
		else //the buffer DOES hold an identifier
		{
			if(!identifier.test(buffer + k)) //if the next char isn't part of the ident, dump token
			{
				tokens.push(new Token(buffer, lineCounter, true));
				buffer = "";
			}
		}
	}
	
	if(k === '\n') lineCounter++;
	if(!/\s/.test(k))
	{
		buffer += k;
	}
}

//console.log(tokens);



//chunker (split tokens into statements by close_brackets and semicolons)

var statements = [];
var current = [];
var parenLevel = 0; //prevents semicolons from chunk while in for(;;) loops

//increments or decrements parenLevel
function manageParens(t)
{
	if(t.type === type.OPEN_PAREN)
		parenLevel++;
	else if(t.type === type.CLOSE_PAREN)
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
	if(token.type === type.OPEN_BRACKET)
		push();
	else if(token.type === type.CLOSE_BRACKET) //end brackets get there own statements
		push();
	else if((parenLevel === 0) && (token.type === type.SEMICOLON))
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