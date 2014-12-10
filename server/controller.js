
var fs      = require('fs');
var url     = require('url');
var path    = require('path');
var mkdirp  = require('mkdirp');
var git     = require('gift');
var util    = require('./util.js');
var config  = require('./config.js');


function sendError(res, message)
{
	return res.status(400).json({error:message}).send();
}

function parseRepo(tpm_path, done)
{
	console.log("Parse");
	done();
}

function updateRepo(res, git_url, tmp_path, done)
{
	//var dot_git = path.join(tmp_path, ".git");
	repo = git(tmp_path);
	repo.git("pull", {}, ["origin", "master"], function(err) {
		if(err)
		{
			console.log(err);
			return sendError(res, "Failed to pull new updates for repo");
		}
		else
		{
			return done();
		}
	});
}

//new repo, must be cloned down
function newRepo(res, git_url, tmp_path, done)
{
	mkdirp(tmp_path, function(err) {
		if(err)
		{
			return sendError(res, 'Failed to make tmp directory. Invalid path?');
		}
		else
		{
			//clone the repo into the temp directory
			git.clone(git_url, tmp_path, function(err, repo) {
				if(err)
				{
					console.log(err);
					return sendError(res, "Failed to clone repository");
				}
				else
				{
					return done();
				}
			});
		}
	});
}

//submission of new git URL
module.exports.cloneAndParse = function(req, res) {
	var user_repo = req.body.url;

	if(!user_repo)
		user_repo = "brendanwhitfield/senna";

	var tmp_path = path.join(config.tmp_dir, user_repo);

	if(!util.securePath(tmp_path, config.tmp_dir))
		return sendError('Please specifiy valid path');

	var git_url = url.resolve("git://github.com/", user_repo);
	
	fs.exists(tmp_path, function(exists) {

		function done()
		{
			res.redirect("/cgraph?repo=" + user_repo);
		}

		if(exists)
			updateRepo(res, git_url, tmp_path, done);
		else
			newRepo(res, git_url, tmp_path, done);
	});
};


//serves the JSON
module.exports.getData = function(req, res) {


};

//serves the C files
module.exports.getFile = function(req, res) {
	//nah, this isn't a giant security hole or anything...
	var filename = 'tmp/' + req.param("filename");
	
	fs.readFile(filename, 'utf-8', function(err, data) {
		if(err)
		{
			console.log(err);
			res.status(404).send("File not found");
		}
		else
		{
			res.send(data); //yup, totaly secure
		}
	});
};

module.exports.homePage = function(req, res) {
	res.render('index');
};

module.exports.cgraphPage = function(req, res) {
	res.render('cgraph');
};