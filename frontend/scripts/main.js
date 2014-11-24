var code_viewer = document.querySelector("#js_code_viewer"),
    current_file = "../server/tests/memmgr/memmgr.c";

reqwest(current_file, function(res) {
  code_viewer.innerHTML = res;
  console.log(res);

  // If we're using syntax highlighting, update it on the new file
  if (Prism) {
    Prism.highlightElement(code_viewer);
  }
});
