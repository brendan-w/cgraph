
//models

function JSONFile(file)
{
	return {
		"filename": file.filename,
		"functions": [],
	};
}

function JSONFunc(func)
{
	return {
		"name": func.token.name,
		"public": !((func.storage !== null) && (func.storage.name === "static")),
		"line": func.token.line,
		"calls": [],
	};
}

function JSONCall(name, fileID, funcID)
{
	return {
		"name": name,
		"linked": true,
		"file_ID": fileID,
		"func_ID": funcID,
	};
}

function JSONUnlinkedCall(name)
{
	return {
		"name": name,
		"linked": false,
	};
}


module.exports = function(maps) {
	
	//lookup object for mapping public names to files and functions
	var publicIdents = {}; //publicIdents[func_name] = JSONCall
	var fileIdents = []; //fileIdents[file_ID][func_name] = JSONCall

	//the output structure
	var output = [];

	/*
		First pass

		create call objects in publicIdents and fileIdents namespaces
		build File and Function objects in output structure
	*/
	for(var m = 0; m < maps.length; m++)
	{
		var map = maps[m];
		fileIdents.push({});
		var jsonFile = new JSONFile(map);

		for(var f = 0; f < maps[m].functions.length; f++)
		{
			var func = map.functions[f];
			var jsonFunc = JSONFunc(func);

			if(jsonFunc.public)
			{
				//store the coordinates of this identifier as its call object
				if(publicIdents[jsonFunc.name] === undefined)
					publicIdents[jsonFunc.name] = new JSONCall(jsonFunc.name, m, f);
				else
					console.log("Error, multiple public function declarations");
			}
			else //private function
			{
				if(fileIdents[m][jsonFunc.name] === undefined)
					fileIdents[m][jsonFunc.name] = new JSONCall(jsonFunc.name, m, f);
				else
					console.log("Error, multiple private function declarations");
			}

			jsonFile.functions.push(jsonFunc);
		}

		output.push(jsonFile);
	}
	

	/*
		Second pass

		resolve call names to file and function IDs
		create nodes for unlinked calls
	*/
	for(var m = 0; m < maps.length; m++)
	{
		for(var f = 0; f < maps[m].functions.length; f++)
		{
			var func = maps[m].functions[f];
			var jsonFunc = output[m].functions[f];

			for(var c = 0; c < func.calls.length; c++)
			{
				var callName = func.calls[c].token.name;

				var inPrivate = fileIdents[m][callName];
				var inPublic  = publicIdents[callName];

				if(inPrivate) //the called function exists in static scope
					jsonFunc.calls.push(inPrivate);
				else if(inPublic) //the called function exists in the public scope
					jsonFunc.calls.push(inPublic);
				else //the call does not exist in the project (probably an external library)
					jsonFunc.calls.push(new JSONUnlinkedCall(callName));
			}
		}
	}

	return output;
};
