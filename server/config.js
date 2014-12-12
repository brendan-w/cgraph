
var path = require('path');

module.exports = {
	http_port:   8000,
	tmp_dir:     path.resolve(path.join(__dirname, "../tmp/")),
	views_dir:   path.resolve(path.join(__dirname, "../views/")),
};
