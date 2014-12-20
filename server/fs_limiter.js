
var fs     = require('fs.extra');
var path   = require('path');
var config = require('./config.js');

//this should really be a database (well, the whole thing should be a database)
var manifest = {}; //key="user/repo"  value=last access time


function deleteOldest()
{
	//find the oldest repo
	var repos = Object.keys(manifest);

	repos.sort(function(a, b) {
		return manifest[a] - manifest[b];
	});

	//the first key is the oldest, if this function is being called, it is garaunteed to exist
	var repo = repos[0];
	fs.rmrf(path.join(config.tmp_dir, repo)); //no callback specified, don't care when this finishes
	delete manifest[repo];
}


module.exports.access = function(user, repo) {
	var key = path.join(user, repo);

	manifest[key] = new Date();

	//cap at the maximum number of repos
	while(Object.keys(manifest).length > config.max_repos)
	{
		deleteOldest();
	}
};
