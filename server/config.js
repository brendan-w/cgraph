
var path = require('path');

module.exports = {
	http_port:      process.env.PORT || 8000,
	tmp_dir:        path.resolve(path.join(__dirname, "../tmp/")),
	views_dir:      path.resolve(path.join(__dirname, "../views/")),
	human_readable: false,
	max_repo_size:  10 * 1024, //kB
	max_repos:      25,

	//github gives better rate limiting if your authenticated
	github_auth: {
		type: "basic",
		username: process.env.GITHUB_USER,
		password: process.env.GITHUB_PASS,
	},
};
