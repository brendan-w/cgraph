
/*
	Warning: Any alterations to the source MUST MAINTAIN LINE NUMBERS
	so that they can be referened after parsing
*/

//preprocessor
module.exports = function(c) {
	c = c.replace(/\".*\"/, "\"\""); //remove strings
	c = c.replace(/\/\/.*$/m, ""); //remove single line comments

	return c;
};