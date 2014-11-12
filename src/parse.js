
var fs = require("fs");
var c = fs.readFileSync("./tests/hash.c", "utf8");

//tokenize

function Token(name, line)
{
	this.name = name;
	this.line = line;
}

var tokens = [];
var lineCounter = 1;
var buffer = "";

//rules
var identifier = /^([a-zA-Z_$][0-9a-zA-Z_$]*)$/;


for(var i = 0; i < c.length; i++)
{
	var k = c.charAt(i);

	if(k === '\n') lineCounter++;



	if(buffer.length !== 0)
	{
		if(!identifier.test(buffer)) //the buffer does NOT hold an identifier
		{
			tokens.push(new Token(buffer, lineCounter));
			buffer = "";
		}
		else //the buffer DOES hold an identifier
		{
			if(!identifier.test(buffer + k)) //if the next char isn't part of the ident, dump token
			{
				tokens.push(new Token(buffer, lineCounter));
				buffer = "";
			}
		}
	}
	

	if(!/\s/.test(k))
	{
		buffer += k;
	}
}

console.log(tokens);




//allows regex to be concatenated together
//avoids some escaping madness, since regex literals don't have to be string escaped too
// consider:    "\\("  vs   /\(/
function r(re) { return re.source; }



var function_decl_and_call = r(  /\s+/  ) + identifier + r(  /\s*\(/  );

var accepted_prefixes = r(  /[+-\/\*=<>&\|!]+/  );


function match(re, text)
{
	matches = [];
	re = new RegExp(re);

	var m = re.exec(text); 

	while(m)
		matches.push(m);
		m = re.exec(text);

	return matches;
}
