
var file_name   = document.querySelector("#file_name");
var code_viewer = document.querySelector("#js_code_viewer");
var header      = document.querySelector("header");
var viz_column  = document.querySelector(".viz_column");
var code_column = document.querySelector(".code_column");
var col_height  = window.innerHeight - header.clientHeight;

code_column.style.height = col_height;
viz_column.style.height  = col_height;
viz_column.setAttribute("height", col_height);


function escapeHTML(str)
{
	var div = document.createElement('div');
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
}


function goto_line(line)
{
	line = line || 1;

	//console.log(line);
	elem = document.querySelector(".line-numbers-rows :nth-child(" + line + ")");
	elem.scrollIntoView();

	//scrolls all the way up, includes the padding at the top
	if(!line)
		code_viewer.parentNode.scrollTop = 0;
}

function goto_code(filename, line)
{
	if(file_name.innerHTML !== filename)
	{
		var url = "/file?user=" + user + "&repo=" + repo + "&filename=" + filename;
		reqwest(url, function(body) {
			code_viewer.innerHTML = escapeHTML(body);
			Prism.highlightElement(code_viewer);
			goto_line(line);
			file_name.innerHTML = filename;
		});
	}
	else
	{
		goto_line(line);
	}
}
