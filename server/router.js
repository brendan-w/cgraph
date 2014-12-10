
var express = require('express');
var c = require('./controller.js');

module.exports = function(app) {

	//statics
	app.use('/static',        express.static("frontend/"));
	app.use('/node_modules/', express.static("node_modules/"));

	//dynamics
	app.get ("/",               c.homePage);
	app.post("/",               c.cloneAndParse);
	app.get ("/cgraph",         c.cgraphPage);
	app.get ("/data/:giturl",   c.getData);
	app.get ("/file",           c.getFile);
};

