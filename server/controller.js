
var fs      = require('fs');
var path    = require('path');
var util    = require('./util.js');
var config  = require('./config.js');
var parse   = require('./parser');


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

	if(user === "torvalds" && repo === "linux")
	{
		return sendError(res, "I'm sorry, Dave. I'm afraid I can't do that.");
	}

	util.getRepo(user, repo, function(err) {
		if(err)
		{
			console.log(err);
			return sendError(res, "Not a valid github repository");
		}
		else
		{
			return sendSuccess(res, "/select?user=" + user + "&repo=" + repo);
		}
	});
};

module.exports.selectPage = function(req, res) {
	var user = req.query.user;
	var repo = req.query.repo;

	util.listC(req.tmp_path, function(err, files) {
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

	//get the filenames from the query string
	var filenames = [];
	for(var key in req.query)
	{
		//all other keys should be filenames
		if(['user', 'repo'].indexOf(key) === -1)
			filenames.push(key);
	}

	//load the C files
	util.loadC(req.tmp_path, filenames, function(err, files) {
		if(err)
		{
			console.log(err);
			return sendError(res, "Failed to load the requested files from disk");
		}
		else
		{
			//parse the C files into a call graph
			parse(files, function(err, data) {

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
