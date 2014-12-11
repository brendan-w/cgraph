var code_viewer = document.querySelector("#js_code_viewer");

function goto_line(filename, line)
{
  // `line` is an optional variable, as filenames won't have this
  if (line === undefined) line = 1;
	// console.log(filename, line);

	reqwest("/file?name=" + filename, function(res) {
		code_viewer.innerHTML = res;

		// If we're using syntax highlighting, update it on the new file
		if(Prism) {
			Prism.highlightElement(code_viewer);

      line_number_tag = document
        .querySelector(".line-numbers-rows :nth-child(" + line + ")");
      code_viewer.parentNode.scrollTop = line_number_tag.offsetTop;
		}

		//console.log(line);
		elem = document.querySelector(".line-numbers-rows :nth-child(" + line + ")");
		elem.scrollIntoView();
	});
}

var header      = document.querySelector("header");
var viz_column  = document.querySelector(".viz_column");
var code_column = document.querySelector(".code_column");
var col_height  = window.innerHeight - header.clientHeight;

code_column.style.height = col_height;
viz_column.style.height = col_height;
viz_column.setAttribute("height", col_height);
