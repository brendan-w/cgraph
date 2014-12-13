
var fs      = require('fs');
var express = require('express');


//setup
var app = express();
app.disable("x-powered-by");


//routing & controlling
app.use('/', express.static("frontend/"));
app.use('/node_modules/', express.static("node_modules/"));

app.get("/file/:filename", function(req, res) {

	//nah, this isn't a giant security hole or anything...
	var filename = 'tmp/' + req.param("filename");
	
	fs.readFile(filename, 'utf-8', function(err, data) {
		if(err)
			console.log(err);
		else
			res.send(data); //yup, totaly secure
	});
});


//start
var server = app.listen(process.env.PORT || 8000, function(err) {
	if(err)
		console.log(err);
	else
		console.log("============ Serving on port 8000 ============");
});
