
var path = require('path');


module.exports.securePath = function(dirty_path, root_dir)
{
	//null bytes
	if(dirty_path.indexOf('\0') !== -1)
		return false;

	//only allow the following characters
	if (!/^[a-zA-Z0-9_\/\-\.]+$/.test(dirty_path))
		return false;

	//if a root directory is specified, it MUST appear
	if(root_dir)
	{
		resolved_path = path.resolve(dirty_path);
		if(resolved_path.indexOf(root_dir) !== 0)
			return false;
	}

	return true;
}

module.exports.printFloat = function(num, decimals) {
	var pow = Math.pow(10, decimals);
	return parseFloat(Math.round(num * pow) / pow).toFixed(decimals);
}
