

var fs        = require('fs.extra');
var url       = require('url');
var git       = require('gift');
var path      = require('path');
var async     = require('async');
var GitHubApi = require('github');
var util      = require('./util.js');
var config    = require('./config.js');




//use the GitHub API to check the validity and size of the repo
module.exports.validRepo = function(user, repo, callback) {
	var github = new GitHubApi({ version: "3.0.0" });
	github.authenticate(config.github_auth);

	var query = {
		user: user,
		repo: repo,
	};

	github.repos.get(query, function(err, repo_data) {
		if(err)
		{
			console.log(err);
			return callback("Not a valid github repository");
		}
		else
		{
			if(repo_data.size !== undefined) //size is allowed to be zero
			{
				if(repo_data.size > config.max_repo_size)
				{
					var mb = util.printFloat(config.max_repo_size / 1024, 1);
					callback("Only repos under " + mb + "MB are supported");
				}
				else
				{
					callback(null); //valid
				}
			}
			else
			{
				console.log("no size given by GitHub (probably surpassed 5000 requests/hour)");
				callback("GitHub API error, try again in a little while");
			}
		}
	});
};


//repo already exists on filesystem, run a `git pull origin master`
function updateRepo(tmp_path, callback)
{
	var repo = git(tmp_path);
	repo.git("pull", {}, ["origin"], function(err) {
		if(err)
		{
			console.log(err);
			return callback("Failed to pull new updates for repo");
		}
		else
		{
			return callback(null);
		}
	});
}

//new repo, must be cloned down
function newRepo(tmp_path, git_url, callback)
{
	fs.mkdirp(tmp_path, function(err) {
		if(err)
		{
			return callback('Failed to make tmp directory. Invalid path?');
		}
		else
		{
			//clone the repo into the temp directory
			git.clone(git_url, tmp_path, function(err, repo) {
				if(err)
				{
					console.log(err);
					return callback("Failed to clone repository");
				}
				else
				{
					return callback(null);
				}
			});
		}
	});
}


//callback returns (err, tmp_path)
module.exports.getRepo = function(user, repo, callback) {

	var user_repo = path.join(user, repo);
	var tmp_path = path.join(config.tmp_dir, user_repo);

	if(!util.securePath(tmp_path, config.tmp_dir))
		return callback("Please specifiy valid path");

	var git_url = url.resolve("git://github.com/", user_repo);
	
	fs.exists(tmp_path, function(exists) {
		if(exists)
			updateRepo(tmp_path, callback);
		else
			newRepo(tmp_path, git_url, callback);
	});
};



//lists all of the C files in the given tmp repo
module.exports.listC = function(tmp_path, callback) {
	var results = [];
	var walker = fs.walk(tmp_path);

	walker.on("file", function(root, stat, next) {
		//get the path relative to the root of the project
		var file_path = path.relative(tmp_path, path.join(root, stat.name));
		
		if(file_path.split(path.sep)[0] === ".git")
			return next();

		if(path.extname(file_path) === ".c")
			results.push(file_path);
			
		return next();
	});

	walker.on("end", function() {
		callback(null, results);
	});
};



/*
	loads the given filenames from disk into memory
	the callback returns (err, files)
	where files =
	[
		{
			filename: "main.c",
			content: "#include <iostream> ..."
		},
		...
	]
*/
module.exports.loadC = function(file_paths, file_names, callback) {

	//download the files into memory
	async.map(file_paths, fs.readFile, function(err, data) {
		if(err)
		{
			console.log(err);
			return callback(err);
		}
		else
		{
			var output_files = [];

			for(var i = 0; i < data.length; i++)
			{
				output_files.push({
					filename: file_names[i],
					content: data[i].toString('utf8'),
				});
			}

			return callback(null, output_files);
		}
	});
};
