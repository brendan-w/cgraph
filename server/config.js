
var path = require('path');

module.exports = {
	http_port:   8000,
	tmp_dir:     path.resolve(path.join(__dirname, "../tmp/")),
	views_dir:   path.resolve(path.join(__dirname, "../views/")),
	//github gives better rate limiting if your authenticated
	github_auth: {
		type: "basic",
		username: "cgraph",
		password: "ie6_rocks", //no one will guess it, to bad it's commited to a repo...
	},
};
