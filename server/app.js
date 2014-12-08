
var express = require('express');
var route   = require('./router.js');


//setup
var app = express();
app.disable("x-powered-by");


route(app);

//start
var server = app.listen(8000, function(err) {
	if(err)
		console.log(err);
	else
		console.log("============ Serving on port 8000 ============");
});
