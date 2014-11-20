var code_viewer = document.querySelector("#js_code_viewer"),
    current_file = "data/SENNA_NER.c";

reqwest(current_file, function(res) {
  code_viewer.innerHTML = res;

  // If we're using syntax highlighting, update it on the new file
  if (Prism) {
    console.log('tol');
    Prism.highlightElement(code_viewer);
  }
});
