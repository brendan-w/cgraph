
var express     = require('express');
var body_parser = require('body-parser');
var route       = require('./router.js');
var config      = require('./config.js');


//setup
var app = express();
app.set('views', config.views_dir);
app.set('view engine', 'jade');
app.disable("x-powered-by");
app.use(body_parser.urlencoded({
	extended: true,
}));


route(app);

console.log("============= Starting with settings =============");
console.log(config);

//start
var server = app.listen(config.http_port, function(err) {
	if(err)
		console.log(err);
	else
		console.log("============== Serving on port " + config.http_port + " ==============");
});
