
var express     = require('express');
var body_parser = require('body-parser');
var route       = require('./router.js');


//setup
var app = express();
app.disable("x-powered-by");
app.use(body_parser.urlencoded({
	extended: true,
}));


route(app);


//start
var server = app.listen(8000, function(err) {
	if(err)
		console.log(err);
	else
		console.log("============ Serving on port 8000 ============");
});
