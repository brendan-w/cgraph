
function callInFunc(call, func)
{
	return (call.token.id > func.token.id) && (call.token.id < func.endToken.id);
}

module.exports = function(definitions, calls) {

	for(var f = 0; f < definitions.length; f++)
	{
		var func = definitions[f];

		//search for calls in this function, and add them to the calls array
		for(var c = 0; c < calls.length; c++)
		{
			var call = calls[c];
			if(callInFunc(call, func))
				func.calls.push(call);
		}
	}

	return definitions;
};
