
var util    = require("./util.js");
var types   = util.types;
var inArray = util.inArray;

//rules
var identifier = /^([a-zA-Z_][0-9a-zA-Z_]*)$/;
//keywords by class
var keywords_other = ["void","char","short","int","long","float","double","signed","unsigned","_Bool","_Complex","struct","union","const","restrict","volatile","sizeof","enum","inline","case","default","if","else","switch","while","do","for","goto","continue","break","return"];
var keywords_storage = ["typedef","extern","static","auto","register"];


//token class
function Token(name, line, id)
{
	var type = types.UNKNOWN;

	//classify this token
	if(identifier.test(name))
	{
		//search the keywords list for possible match
		if(inArray(name, keywords_other))
			type = types.KEYWORD_OTHER;
		else if(inArray(name, keywords_storage))
			type = types.KEYWORD_STORAGE;
		else
			type = types.IDENTIFIER;
	}
	else
	{
		switch(name)
		{
			case "(": type = types.OPEN_PAREN;    break;
			case ")": type = types.CLOSE_PAREN;   break;
			case "{": type = types.OPEN_BRACKET;  break;
			case "}": type = types.CLOSE_BRACKET; break;
			case ";": type = types.SEMICOLON;     break;
		}
	}

	//save data
	this.name = name;
	this.line = line;
	this.id   = id;
	this.type = type;
}


//tokenizer (splits the text into classified tokens)
module.exports = function(c)
{

	var tokens = [];
	var lineCounter = 1;
	var buffer = "";

	function push()
	{
		tokens.push(new Token(buffer, lineCounter, tokens.length));
		buffer = "";
	}

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
				push();
			}
			else //the buffer DOES hold an identifier
			{
				if(!identifier.test(buffer + k)) //if the next char isn't part of the ident, dump token
					push();
			}
		}
		
		//advance
		if(k === '\n') lineCounter++;
		if(!/\s/.test(k)) buffer += k;
	}

	//push whatever's left
	if(buffer.length !== 0)
		push();

	return tokens;
};
