
var path = require('path');

module.exports = {
	http_port:      process.env.PORT || 8000,
	tmp_dir:        path.resolve(path.join(__dirname, "../tmp/")),
	views_dir:      path.resolve(path.join(__dirname, "../views/")),
	human_readable: false,
	clean_every:    12, //hours
};
