
var fs        = require('fs');
var url       = require('url');
var path      = require('path');
var mkdirp    = require('mkdirp');
var GitHubApi = require('github');
var util      = require('./util.js');
var config    = require('./config.js');


function sendError(res, message)
{
	return res.status(400).json({error:message}).send();
}


function getC(user, repo, callback)
{
	var github = new GitHubApi({ version: "3.0.0" });
	github.authenticate(config.github_auth);

	github.repos.getBranch({
		user: user,
		repo: repo,
		branch: "master",
	}, function(err, branch) {
		if(err)
		{
			console.log(err);
			return callback("Error looking up master branch");
		}
		else
		{
			github.gitdata.getTree({
				user: user,
				repo: repo,
				sha: branch.commit.sha,
				recursive: true,
			}, function(err, tree) {
				if(err)
				{
					console.log(err);
					return callback("Error getting tree");
				}
				else
				{
					return callback(false, util.treeToC(tree));
				}
			});
		}
	});
}


module.exports.homePage = function(req, res) {
	res.render('index');
};

module.exports.selectPage = function(req, res) {
	var user = req.query.user ? req.query.user : "brendanwhitfield";
	var repo = req.query.repo ? req.query.repo : "senna";

	getC(user, repo, function(err, files) {
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
	console.log(req.query);

	res.render('cgraph');
};
