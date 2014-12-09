
var path  = require('path');

module.exports.securePath = function(dirty_path, root_dir)
{
	//null bytes
	if (dirty_path.indexOf('\0') !== -1)
		return false;

	//only allow the following characters
	if (!/^[a-z0-9\/]+$/.test(dirty_path))
		return false;

	//if a root directory is specified, it MUST appear 
	if(root_dir)
	{
		if(dirty_path.indexOf(root_dir) !== 0)
			return false;
	}

	return true;
}
