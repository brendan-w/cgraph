
var code_viewer = document.querySelector("#js_code_viewer");
var currentFile = null;


function goto_line(line)
{
	line = line || 1;

	// If we're using syntax highlighting, update it on the new file
	if(Prism) {
		Prism.highlightElement(code_viewer);
		line_number_tag = document.querySelector(".line-numbers-rows :nth-child(" + line + ")");
		code_viewer.parentNode.scrollTop = line_number_tag.offsetTop;
	}

	//console.log(line);
	elem = document.querySelector(".line-numbers-rows :nth-child(" + line + ")");
	elem.scrollIntoView();
}

function goto_code(filename, line)
{
	if(filename !== currentFile)
	{
		var url = "/file?user=" + user + "&repo=" + repo + "&filename=" + filename;
		reqwest(url, function(body) {
			code_viewer.innerHTML = body;
			goto_line(line);
			currentFile = filename;
		});
	}
	else
	{
		goto_line(line);
	}
}

var header      = document.querySelector("header");
var viz_column  = document.querySelector(".viz_column");
var code_column = document.querySelector(".code_column");
var col_height  = window.innerHeight - header.clientHeight;

code_column.style.height = col_height;
viz_column.style.height = col_height;
viz_column.setAttribute("height", col_height);
