
//preprocessor
function preproc(c)
{

	c = c.replace(/\".*\"/, "\"\""); //remove strings
	//remove comments


	return c;
}

module.exports = preproc;
