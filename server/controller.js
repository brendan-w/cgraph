
var fs = require('fs');


module.exports.cloneAndParse = function(req, res) {


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

