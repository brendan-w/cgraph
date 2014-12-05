
var express = require('express');

//setup
var app = express();
app.use('/', express.static("frontend/"));
app.use('/node_modules/', express.static("node_modules/"));


app.disable("x-powered-by");


//routing & controlling
app.get("/file/:filename", function(req, res) {
	res.send("I'm a file");
});


//start
var server = app.listen(8000, function(err) {
	if(err)
		console.log(err);
	else
		console.log("============ Serving on port 8000 ============");
});
