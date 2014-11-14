
var types = {
	"UNKNOWN":-1,
	"IDENTIFIER":0,
	"KEYWORD_OTHER":1,
	"KEYWORD_STORAGE":2,
	"SEMICOLON":3,
	"OPEN_BRACKET":4,
	"CLOSE_BRACKET":5,
	"OPEN_PAREN":6,
	"CLOSE_PAREN":7,
	"OPERATORS_BEFORE_EXP":8,
};

//increments or decrements parenLevel
function countParens(token)
{
	if(token.type === types.OPEN_PAREN)
		return 1;
	else if(token.type === types.CLOSE_PAREN)
		return -1;
	return 0;
}

//increments or decrements bracketLevel
function countBrackets(token)
{
	if(token.type === types.OPEN_BRACKET)
		return 1;
	else if(token.type === types.CLOSE_BRACKET)
		return -1;
	return 0;
}

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

//returns the token of the matching close bracket for an opening statement
function matchBracket(statements, open)
{
	var level = 1;

	//loop until the paren level returns to zero
	for(var s = open+1; s < statements.length; s++)
	{
		var statement = statements[s];
		for(var t = 0; t < statement.length; t++)
		{
			var token = statement[t];
			level += countBrackets(token);
			if(level === 0) return token;
		}
	}
}


module.exports.types         = types;
module.exports.countParens   = countParens;
module.exports.countBrackets = countBrackets;
module.exports.matchParen    = matchParen;
module.exports.matchBracket  = matchBracket;
