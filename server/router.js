
var express = require('express');
var c = require('./controller.js');

module.exports = function(app) {

	//statics
	app.use('/static',        express.static("frontend/"));
	app.use('/node_modules/', express.static("node_modules/"));

	//dynamics
	app.get ("/",               c.homePage);
	app.get ("/select",         c.selectPage);
	app.get ("/cgraph",         c.cgraphPage);
};

