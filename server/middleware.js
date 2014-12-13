
var fs      = require('fs');
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
};
