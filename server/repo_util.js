

var fs        = require('fs');
var url       = require('url');
var git       = require('gift');
var path      = require('path');
var async     = require('async');
var mkdirp    = require('mkdirp');
var GitHubApi = require('github');
var util      = require('./util.js');
var config    = require('./config.js');






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
			if(repo_data.size > config.max_repo_size)
			{
				callback("Only repos under " + (config.max_repo_size / 1024) + "MB are supported");
			}
			else
			{
				callback(null); //valid
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
	mkdirp(tmp_path, function(err) {
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



//thanks stackoverflow, for implementing what should be in the fs lib
//http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search

//call with (root, callback)
//current_dir is internal use only
function listC(root, done, current_dir)
{
	var results = [];

	current_dir = current_dir ? current_dir : root;

	fs.readdir(current_dir, function(err, list) {
		if(err) return done(err);
		var pending = list.length;
		if(!pending) return done(null, results);
		list.forEach(function(file) {

			if(file !== '.git') //exclude all .git directories
			{
				file = current_dir + '/' + file;
				fs.stat(file, function(err, stat) {
					if(stat && stat.isDirectory()) {
						//dir, recurse
						listC(root, function(err, res) {
							results = results.concat(res);
							if (!--pending) done(null, results);
						}, file);
					} else {
						//file
						if(path.extname(file).toLowerCase() === '.c')
						{
							//could have used path.relative, but this is faster (to make the path relative to the repo)
							results.push(file.substr(root.length + 1));
						}
						if (!--pending) done(null, results);
					}
				});
			}
			else
			{
				if (!--pending) done(null, results);
			}

		});
	});
}
module.exports.listC = listC;



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
module.exports.loadC = function(tmp_path, filenames, callback) {

	//create paths to each raw file
	var file_paths = [];
	for(var i = 0; i < filenames.length; i++)
	{
		var file = path.join(tmp_path, filenames[i]);

		if(!util.securePath(file, config.tmp_dir))
			return callback("Insecure or invalid file path");
		else
			file_paths.push(file)
	}

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
					filename: filenames[i],
					content: data[i].toString('utf8'),
				});
			}

			return callback(null, output_files);
		}
	});
};