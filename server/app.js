
var express = require('express');
var route   = require('./router.js');


//setup
var app = express();
app.disable("x-powered-by");


//routing & controlling
app.use('/', express.static("frontend/"));
app.use('/node_modules/', express.static("node_modules/"));


route(app);

//start
var server = app.listen(8000, function(err) {
	if(err)
		console.log(err);
	else
		console.log("============ Serving on port 8000 ============");
});
