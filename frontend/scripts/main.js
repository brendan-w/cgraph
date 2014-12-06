var code_viewer = document.querySelector("#js_code_viewer");

function goto_line(filename, line)
{
  // `line` is an optional variable, as filenames won't have this
  if (line === undefined) line = 1;
	console.log(filename, line);

	reqwest("/file/" + filename, function(res) {
		code_viewer.innerHTML = res;
		//console.log(res);

		// If we're using syntax highlighting, update it on the new file
		if(Prism) {
			Prism.highlightElement(code_viewer);

      line_number_tag = document
        .querySelector(".line-numbers-rows :nth-child(" + line + ")");
      code_viewer.parentNode.scrollTop = line_number_tag.offsetTop;
		}
	});
}
