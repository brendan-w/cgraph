
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

	//create shallow clone of the array (so we can pop elements without affecting the parent)
	calls = calls.slice();

	//list of functions, each with their own list of calls
	var outputJSON = [];

	for(var f = 0; f < definitions.length; f++)
	{
		//construct the output JSON for this function
		var funcJSON = funcToJSON(definitions[f]);

		//for each call in this function, add it to the calls array
		while((calls.length > 0) && callInFunc(calls[0], definitions[f]))
		{
			var callJSON = callToJSON(calls.shift());
			funcJSON.calls.push(callJSON);
		}

		outputJSON.push(funcJSON);
	}

	//return string json
	return JSON.stringify(outputJSON, function(k,v){return v;}, 4);
};
