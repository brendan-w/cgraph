
var fs = require('fs');

module.exports.getFile = function(req, res) {
	//nah, this isn't a giant security hole or anything...
	var filename = 'tmp/' + req.param("filename");
	
	fs.readFile(filename, 'utf-8', function(err, data) {
		if(err)
			console.log(err);
		else
			res.send(data); //yup, totaly secure
	});
};

