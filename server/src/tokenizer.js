
var types = require("./util.js").types;

//rules
var identifier = /^([a-zA-Z_$][0-9a-zA-Z_$]*)$/;
//keywords by class
var keywords_other = ["void","char","short","int","long","float","double","signed","unsigned","_Bool","_Complex","struct","union","const","restrict","volatile","sizeof","enum","inline","case","default","if","else","switch","while","do","for","goto","continue","break","return"];
var keywords_storage = ["typedef","extern","static","auto","register"];

var operators = ["=","<",">"];


//token class
function Token(name, line, id)
{
	this.name = name;
	this.line = line;
	this.type = types.UNKNOWN;

	if(id)
	{
		//search the keywords list for possible match
		if(keywords_other.indexOf(this.name) >= 0)
			this.type = types.KEYWORD_OTHER;
		else if(keywords_storage.indexOf(this.name) >= 0)
			this.type = types.KEYWORD_STORAGE;			
		else
			this.type = types.IDENTIFIER;
	}
	else
	{
		switch(this.name)
		{
			case "(": this.type = types.OPEN_PAREN;    break;
			case ")": this.type = types.CLOSE_PAREN;   break;
			case "{": this.type = types.OPEN_BRACKET;  break;
			case "}": this.type = types.CLOSE_BRACKET; break;
			case ";": this.type = types.SEMICOLON;     break;
		}
	}
}


//tokenizer (splits the text into classified tokens)
module.exports = function(c)
{


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

	return tokens;
}
