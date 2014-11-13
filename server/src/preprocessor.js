
/*
	Warning: Any alterations to the source MUST MAINTAIN LINE NUMBERS
	so that they can be referened after parsing
*/

//preprocessor
function preproc(c)
{

	c = c.replace(/\".*\"/, "\"\""); //remove strings
	//remove comments


	return c;
}

module.exports = preproc;
