
var fs      = require('fs.extra');
var path    = require('path');
var util    = require('./util.js');
var config  = require('./config.js');



//checks for valid 'user' and 'repo' values in the query string
module.exports.hasUserRepo = function(req, res, next) {
	var user = req.query.user;
	var repo = req.query.repo;

	if(!user || !repo)
		return res.redirect('/');

	var tmp_path = path.join(config.tmp_dir, user, repo);
	if(!util.securePath(tmp_path, config.tmp_dir))
		return res.redirect('/');

	if(!fs.existsSync(tmp_path))
		return res.redirect('/');

	req.tmp_path = tmp_path;
	return next();
}


//checks for valid 'user', 'repo' and 'filename' values in the query string
module.exports.hasFile = function(req, res, next) {
	var filename = req.query.filename;

	if(!filename)
		return res.status(404).send("File not found");

	var file_path = path.join(req.tmp_path, filename);
	if(!util.securePath(file_path, req.tmp_path))
		return res.status(404).send("File not found");

	if(!fs.existsSync(file_path))
		return res.status(404).send("File not found");

	req.file_path = file_path;
	return next();
};

module.exports.hasFiles = function(req, res, next) {
	//get the filenames from the query string
	req.graph_file_names = [];
	req.graph_file_paths = [];
	for(var key in req.query)
	{
		//all other keys should be filenames
		if(['user', 'repo'].indexOf(key) === -1)
		{
			var file_name = key;
			var file_path = path.join(req.tmp_path, file_name);

			if(util.securePath(file_path, req.tmp_path))
			{
				req.graph_file_names.push(file_name);
				req.graph_file_paths.push(file_path);
			}
			//else
				//nothing, exclude unsafe files
		}
	}

	return next();
};