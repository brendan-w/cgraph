
var fs         = require('fs.extra');
var path       = require('path');
var util       = require('./util.js');
var config     = require('./config.js');
var parse      = require('./parser');
var repo_util  = require('./repo_util.js');
var fs_limiter = require('./fs_limiter.js');



function sendError(res, message)
{
	return res.json({
		success:false,
		error:message,
	});
}

function sendSuccess(res, redirect)
{
	return res.json({
		success:true,
		redirect:redirect,
	});
}


module.exports.homePage = function(req, res) {
	res.render('index');
};

module.exports.getRepo = function(req, res) {
	var user = req.body.user;
	var repo = req.body.repo;

	if(!user || !repo)
	{
		return sendError(res, "Both fields are required");
	}

	repo_util.validRepo(user, repo, function(err) {
		if(err)
		{
			console.log(err);
			return sendError(res, err);
		}
		else
		{
			repo_util.getRepo(user, repo, function(err) {
				if(err)
				{
					console.log(err);
					return sendError(res, "Failed to read repository");
				}
				else
				{
					fs_limiter.access(user, repo);
					return sendSuccess(res, "/select?user=" + user + "&repo=" + repo);
				}
			});
		}
	});
};

module.exports.selectPage = function(req, res) {
	var user = req.query.user;
	var repo = req.query.repo;

	repo_util.listC(req.tmp_path, function(err, files) {
		if(err)
		{
			console.log(err);
			sendError(res, err);
		}
		else
		{
			res.render('select', { user:user, repo:repo, files:files });
		}
	});
};

module.exports.cgraphPage = function(req, res) {

	var user = req.query.user;
	var repo = req.query.repo;

	//load the C files
	repo_util.loadC(req.graph_file_paths, req.graph_file_names, function(err, files) {
		if(err)
		{
			console.log(err);
			return sendError(res, "Failed to load the requested files from disk");
		}
		else
		{
			//parse the C files into a call graph
			parse(files, function(err, data) {

				fs_limiter.access(user, repo);

				var json_data = "";
				if(config.human_readable)
					json_data = JSON.stringify(data, function(k, v){return v;}, 4);
				else
					json_data = JSON.stringify(data);

				res.render('cgraph', {
					user:      user,
					repo:      repo,
					data:      json_data,
					num_files: data.groups.length,
					num_funcs: data.nodes.length,
					num_calls: data.links.length,
				});
			});
		}
	});
};

//bouncing these off the server to avoid some cross domain errors when developing locally
module.exports.getFile = function(req, res) {
	fs.readFile(req.file_path, function(err, data) {
		if(err)
		{
			console.log(err);
			res.status(404).send("File not found");
		}
		else
		{
			res.send(data.toString('utf8'));
		}
	});
};


module.exports.statusPage = function(req, res) {
	//get listing of repos

	var all_repos = [];

	var users = fs.readdirSync(config.tmp_dir);
	for(var u = 0; u < users.length; u++)
	{
		var repos = fs.readdirSync(path.join(config.tmp_dir, users[u]));
		for(var r = 0; r < repos.length; r++)
		{
			all_repos.push({
				user: users[u],
				repo: repos[r],
				access: fs_limiter.getTime(users[u], repos[r]),
			});
		}
	}

	all_repos.sort(function(a, b) {
		return b.access - a.access;
	});

	res.render('status', {
		repos: all_repos,
	});
};
