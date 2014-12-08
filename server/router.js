
var c = require('./controller.js');

module.exports = function(app) {


	app.get("/file/:filename", c.getFile);
};


