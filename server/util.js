
var path      = require('path');
var async     = require('async');
var GitHubApi = require('github');
var request   = require('request');
var config    = require('./config.js');



//find all C files in the given tree
function treeToC(tree)
{
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


//search a directory tree from GitHub for C files
module.exports.listC = function(user, repo, callback) {

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
					return callback(false, treeToC(tree));
				}
			});
		}
	});
};


module.exports.getC = function(user, repo, filenames, callback) {

	//create URLs for each raw file
	var urls = [];
	for(var i = 0; i < filenames.length; i++)
	{
		urls.push("https://raw.githubusercontent.com/" + user + "/" + repo + "/master/" + filenames[i]);
	}

	//download the files into memory
	async.map(urls, request, function(err, results) {
		if(err)
		{
			console.log(err);
			return callback(err);
		}
		else
		{
			var files = [];
			for(var i = 0; i < results.length; i++)
			{
				var result = results[i];

				if(result.statusCode == 200)
				{
					files.push({
						filename: filenames[i],
						content: result.body,
					});
				}
				else
				{
					//do nothing
					//files that dont return 200 simply won't show up
				}
			}

			return callback(false, files);
		}
	});
};
