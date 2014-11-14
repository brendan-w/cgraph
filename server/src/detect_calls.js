
var util = require("./util.js");
var types         = util.types;
var countParens   = util.countParens;
var matchParen    = util.matchParen;
var inArray       = util.inArray;

var operators_before_exp = ["=","<",">","."];



function call(token)
{
	this.token = token;
	this.name = token.name;
	this.line = token.line;
}

//test for a function call starting at the given token index
function testFuncDecl(statement, start, parenLevel)
{
	if(statement[start].type === types.IDENTIFIER) //function name
	{
		if(statement[start+1].type === types.OPEN_PAREN) //open paren
		{
			//find matching paren
			var close = matchParen(statement, start+1);

			if(close !== -1) //close paren
			{	
				if(start === 0) //if its got nothing before it, it gauranteed to be a call (not a prototyp)
				{
					return true;
				}
				else if(parenLevel > 0) //if it's inside parens, it can't be a prototype, it must be a call
				{
					return true;
				}
				else
				{
					//look at previous tokens to see if there were tokens that indicate expression or function call
					//as opposed to a prototype
					for(var p = 0; p < start; p++)
					{
						var prev = statement[p];
						if((prev.type === types.UNKNOWN) && inArray(prev.name, operators_before_exp))
							return true;
						else if((prev.type === types.KEYWORD_OTHER) && (prev.name === "return"))
							return true;
					}
				}
			}
		}
	}
	return false;
}


module.exports = function(statements) {
	var calls = [];

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

	return calls;
};
