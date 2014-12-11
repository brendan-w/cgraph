
var path = require('path');

module.exports.securePath = function(dirty_path, root_dir)
{
	//null bytes
	if (dirty_path.indexOf('\0') !== -1)
		return false;

	//only allow the following characters
	/*
	if (!/^[a-z0-9\/_]+$/.test(dirty_path))
		return false;
	*/

	//if a root directory is specified, it MUST appear 
	if(root_dir)
	{
		if(dirty_path.indexOf(root_dir) !== 0)
			return false;
	}

	return true;
}


module.exports.treeToC = function(tree) {
	//find all C files in the given tree

	var files = [];

	for(var i = 0; i < tree.tree.length; i++)
	{
		var item = tree.tree[i];
		if(item.type === 'blob')
		{
			var ext = path.extname(item.path).toLowerCase();
			
			if(ext === '.c')
			{
				files.push(item.path);
			}
		}
	}

	return files;
};