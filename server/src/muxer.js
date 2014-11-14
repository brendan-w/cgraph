
function funcToJSON(parsed_func)
{
	return {
		"name": parsed_func.name,
		"line": parsed_func.line,
		"public": (parsed_func.storage !== "static"),
		"calls": [],
	};
}

function callToJSON(parsed_call)
{
	return {
		"name": parsed_call.name,
		"line":parsed_call.line,
	};
}


function callInFunc(call, func)
{
	return (call.token.id > func.token.id) && (call.token.id < func.endToken.id);
}

module.exports = function(definitions, calls) {

	//list of functions, each with their own list of calls
	var outputJSON = [];

	for(var f = 0; f < definitions.length; f++)
	{
		var definition = definitions[f];
		//construct the output JSON for this function
		var funcJSON = funcToJSON(definition);

		//search for calls in this function, and add them to the calls array
		for(var c = 0; c < calls.length; c++)
		{
			if(callInFunc(calls[c], definition))
			{
				//jsonify and add the call to this function's array
				funcJSON.calls.push(callToJSON(calls[c]));
			}
		}

		outputJSON.push(funcJSON);
	}

	//return string json
	return JSON.stringify(outputJSON, function(k,v){return v;}, 4);
};
