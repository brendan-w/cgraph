
//rules
var identifier = /^([a-zA-Z_$][0-9a-zA-Z_$]*)$/;
var keywords = ["auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","int","long","register","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while"];
var operators = ["=","<",">"];
var types = {
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

//token class
function Token(name, line, id)
{
	this.name = name;
	this.line = line;
	this.type = types.UNKNOWN;

	if(id)
	{
		//search the keywords list for possible match
		if(keywords.indexOf(this.name) >= 0)
			this.type = types.KEYWORD;
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
function run(c)
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

	//console.log(tokens);
	return tokens;
}

module.exports.run = run;
module.exports.types = types;
