
var fs        = require('fs');
var url       = require('url');
var git       = require('gift');
var path      = require('path');
var async     = require('async');
var mkdirp    = require('mkdirp');
var GitHubApi = require('github');
var request   = require('request');
var config    = require('./config.js');




function securePath(dirty_path, root_dir)
{
	//null bytes
	if(dirty_path.indexOf('\0') !== -1)
		return false;

	//only allow the following characters
	/*
	if (!/^[a-z0-9\/_]+$/.test(dirty_path))
		return false;
	*/

	//if a root directory is specified, it MUST appear
	if(root_dir)
	{
		resolved_path = path.resolve(dirty_path);
		if(resolved_path.indexOf(root_dir) !== 0)
			return false;
	}

	return true;
}
module.exports.securePath = securePath;


//thanks stackoverflow, for implementing what should be in the fs lib
//http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
function walkRepo(dir, done)
{
	var results = [];
	fs.readdir(dir, function(err, list) {
		if(err) return done(err);
		var pending = list.length;
		if(!pending) return done(null, results);
		list.forEach(function(file) {

			if(file !== '.git') //exclude all .git directories
			{
				file = dir + '/' + file;
				fs.stat(file, function(err, stat) {
					if(stat && stat.isDirectory()) {
						//dir, recurse
						walkRepo(file, function(err, res) {
							results = results.concat(res);
							if (!--pending) done(null, results);
						});
					} else {
						//file
						if (!--pending) done(null, results);	
						if(path.extname(file).toLowerCase() === '.c')
							results.push(file);
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


function listC(tmp_path, callback)
{
	walkRepo(tmp_path, function(err, results) {
		if(err)
		{
			return callback(err);
		}
		else
		{
			//make all paths relative to the git directory
			for(var f = 0; f < results.length; f++)
			{
				console.log(path.relative(tmp_path, results[f]));
				results[f] = path.relative(tmp_path, results[f]);
			}
			return callback(null, results);
		}
	});
}
module.exports.listC = listC;




//repo already exists on filesystem, run a `git pull origin master`
function updateRepo(tmp_path, callback)
{
	var repo = git(tmp_path);
	repo.git("pull", {}, ["origin", "master"], function(err) {
		if(err)
		{
			console.log(err);
			return callback("Failed to pull new updates for repo");
		}
		else
		{
			return callback(null, tmp_path);
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
					return callback(null, tmp_path);
				}
			});
		}
	});
}


//callback returns (err, tmp_path)
module.exports.getRepo = function(user, repo, callback) {

	var user_repo = path.join(user, repo);
	var tmp_path = path.join(config.tmp_dir, user_repo);

	if(!securePath(tmp_path, config.tmp_dir))
		return callback("Please specifiy valid path");

	var git_url = url.resolve("git://github.com/", user_repo);
	
	fs.exists(tmp_path, function(exists) {
		if(exists)
			updateRepo(tmp_path, callback);
		else
			newRepo(tmp_path, git_url, callback);
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
