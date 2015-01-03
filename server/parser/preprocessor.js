
/*
	Warning: Any alterations to the source MUST MAINTAIN LINE NUMBERS
	so that they can be referenced after parsing
*/

function matchAll(re, str)
{
	re = RegExp(re.source, 'g'); //ensure that exec will return null at some point
	var matches = [];
	var m;

	while(m = re.exec(str))
	{
		m.end = m.index + m[0].length;
		matches.push(m);
	}

	return matches;
}

//converts all characters except for newlines to spaces (preserves line spacing)
function stripAll(str)
{
	var output = "";
	for(var i = 0; i < str.length; i++)
	{
		if(str.charAt(i) === '\n')
			output += '\n';
		else
			output += ' ';
	}
	return output;
}

function replaceWith(str, start, stop, replacement)
{
	return str.substr(0, start) + replacement + str.substr(stop);
}

//preprocessor
module.exports = function(c) {
	c = c.replace(/\".*\"/g, "\"\""); //remove strings
	c = c.replace(/\/\/.*/g, ""); //remove single line comments

	var matches = matchAll(/\/\*[\s\S]*?\*\//, c); //multiline comments

	//delete all the comment chars EXCEPT for newlines
	matches.forEach(function(m) {
		var stripped = stripAll(m[0]);
		c = replaceWith(c, m.index, m.end, stripped);
	});

	return c;
};
