var code_viewer = document.querySelector("#js_code_viewer");

function goto_line(filename, line)
{
	console.log(filename, line);
	
	reqwest("/file/" + filename, function(res) {
		code_viewer.innerHTML = res;
		console.log(res);

		// If we're using syntax highlighting, update it on the new file
		if(Prism) {
			Prism.highlightElement(code_viewer);
		}
	});
}
