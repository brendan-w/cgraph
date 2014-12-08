
var express = require('express');
var c = require('./controller.js');

module.exports = function(app) {

	//statics
	app.use('/', express.static("frontend/"));
	app.use('/node_modules/', express.static("node_modules/"));

	//dynamics
	app.post("/",               c.cloneAndParse);
	app.get ("/data/:giturl",   c.getData);
	app.get ("/file/:filename", c.getFile);
};


