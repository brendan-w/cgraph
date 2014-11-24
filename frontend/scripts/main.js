var code_viewer = document.querySelector("#js_code_viewer"),
    current_file = "../server/tests/memmgr/memmgr.c";

reqwest({
  url: current_file,
  method: 'get',
  success: function(res) {
    //code_viewer.innerHTML = res.response;
    code_viewer.innerHTML = res;
    console.log(res);

    // If we're using syntax highlighting, update it on the new file
    if (Prism) {
      Prism.highlightElement(code_viewer);
    }
  }
});

/*
 *
 *reqwest(current_file, function(res) {
 *  code_viewer.innerHTML = res;
 *  console.log(res);
 *
 *  // If we're using syntax highlighting, update it on the new file
 *  if (Prism) {
 *    Prism.highlightElement(code_viewer);
 *  }
 *});
 */
