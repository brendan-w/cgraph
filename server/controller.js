
var fs    = require('fs');
var url   = require('url');
var clone = require('nodegit').Clone.clone;


//submission of new git URL
module.exports.cloneAndParse = function(req, res) {
	var git = req.body.url;

	if(!git) git = "brendanwhitfield/senna";
	git = url.resolve("git://github.com/", git);

	//clone the repo into the temp directory
	clone(git, "tmp").then(function(repo) {
		res.redirect("/cgraph.html");

	});
};


//serves the JSON
module.exports.getData = function(req, res) {


};

//serves the C files
module.exports.getFile = function(req, res) {
	//nah, this isn't a giant security hole or anything...
	var filename = 'tmp/' + req.param("filename");
	
	fs.readFile(filename, 'utf-8', function(err, data) {
		if(err)
		{
			console.log(err);
			res.status(404).send("File not found");
		}
		else
		{
			res.send(data); //yup, totaly secure
		}
	});
};

