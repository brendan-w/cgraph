
//models

/*
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

function JSONCall(name, fileID, func_ID)
{
	return {
		"name": name,
		"linked": true,
		"file_ID": fileID,
		"func_ID": func_ID,
	};
}

function JSONUnlinkedCall(name)
{
	return {
		"name": name,
		"linked": false,
	};
}
*/


function node(name, id, group, line)
{
	return {
		"name": name,
		"id": id,
		"group": group,
		"line": line,
	};
}

function link(source, target, value)
{
	return {
		"source":source,
		"target":target,
		"value":value,
	};
}


module.exports = function(maps) {

	//lookup object for mapping public names to files and functions
	var publicIdents = {}; //publicIdents[func_name] = function (node) ID
	var fileIdents = []; //fileIdents[file_ID][func_name] = function (node) ID

	//the output structure
	var groups = [];
	var nodes  = [];
	var links  = [];

	/*
		First pass

		populate groups and nodes
		assemble the tables that link function names to IDs
	*/

	var func_ID = 0; //counter used for IDing nodes accross files (maps)
	for(var m = 0; m < maps.length; m++)
	{
		var map = maps[m];
		fileIdents.push({});
		groups.push(map.filename);

		for(var f = 0; f < maps[m].functions.length; f++)
		{
			var func = map.functions[f];
			var func_name = func.token.name;
			var func_line = func.token.line;
			var func_public = !((func.storage !== null) && (func.storage.name === "static"));

			nodes.push(node(func_name, func_ID, m, func_line));

			if(func_public)
			{
				//store the coordinates of this identifier as its function ID
				if(publicIdents[func_name] === undefined)
					publicIdents[func_name] = func_ID;
				else
					console.log("Error, multiple public function declarations");
			}
			else //private function
			{
				if(fileIdents[m][func_name] === undefined)
					fileIdents[m][func_name] = func_ID;
				else
					console.log("Error, multiple private function declarations");
			}

			func_ID++;
		}
	}


	/*
		Second pass

		populate links
		resolve call names to function IDs
	*/

	func_ID = 0;
	for(var m = 0; m < maps.length; m++)
	{

		for(var f = 0; f < maps[m].functions.length; f++)
		{
			var func = maps[m].functions[f];

			var calls = {} //key = target, value = occurences

			for(var c = 0; c < func.calls.length; c++)
			{
				var callName = func.calls[c].token.name;

				//resolve this call name to an ID
				var inPrivate = fileIdents[m][callName];
				var inPublic  = publicIdents[callName];

				if(inPrivate) //the called function exists in static scope
				{
					if(calls[inPrivate] === undefined)
						calls[inPrivate] = 0;
					calls[inPrivate]++;
				}
				else if(inPublic) //the called function exists in the global scope
				{
					if(calls[inPublic] === undefined)
						calls[inPublic] = 0;
					calls[inPublic]++;
				}
				else //the call does not exist in the project (probably an external library)
				{
					console.log("unlinked call: " + callName);
				}
			}

			for(var target in calls)
			{
				links.push(link(func_ID, target, calls[target]));
			}

			func_ID++;
		}
	}

	return {
		"groups":groups,
		"nodes":nodes,
		"links":links,
	};
};
