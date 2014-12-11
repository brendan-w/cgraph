
var util  = require('./util.js');
var parse = require('./parser');


function sendError(res, message)
{
	return res.status(400).json({error:message}).send();
}


module.exports.homePage = function(req, res) {
	res.render('index');
};

module.exports.selectPage = function(req, res) {
	var user = req.query.user ? req.query.user : "brendanwhitfield";
	var repo = req.query.repo ? req.query.repo : "senna";

	util.listC(user, repo, function(err, files) {
		if(err)
		{
			console.log(err);
			sendError(res, err);
		}
		else
		{
			res.render('select', { user:user, repo:repo, files:files });
		}
	});
};

module.exports.cgraphPage = function(req, res) {
	var user = req.query.user;
	var repo = req.query.repo;

	//get the filenames from the query string
	var filenames = [];
	for(var key in req.query)
	{
		//all other keys should be filenames
		if(['user', 'repo'].indexOf(key) === -1)
			filenames.push(key);
	}

	//download the C files
	util.getC(user, repo, filenames, function(err, files) {
		if(err)
		{
			console.log(err);
			return sendError(res, "Failed to download the requested files");
		}
		else
		{
			//parse the C files into a call graph
			parse(files, function(err, data) {
				var data = JSON.stringify(data, function(k, v){return v;}, 4);
				res.render('cgraph', { user:user, repo:repo, data:data });
			});
		}
	});

};
