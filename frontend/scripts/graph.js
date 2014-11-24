function CallGraph() {
  "use strict";

  var my = {};

  function init(selection) {

  }

  // attr_accessor for JS
  // Get attr with .attr();
  // Set attr with .attr(val).attr2(val2);
  function attr_accessor(attr) {
    function build_accessor(val) {
      if (!arguments.length) return my[attr];
      my[attr] = val;
      return init;
    }
    return build_accessor;
  }

  // Create all the getters/setters for vars in `my`
  for (var key in my) {
    init[key] = attr_accessor(key);
  }

  // Return the constructor/accessors
  return init;
}

data = {
  "calls": [
    {
      "source": 1,
      "target": 3,
      "source_file_id": 0,
      "target_file_id": 0,
    },
    {
      "source": 2,
      "target": 1,
      "source_file_id": 0,
      "target_file_id": 0,
    },
    // Extra links to make show current multi link capabilities
    {
      "source": 2,
      "target": 1,
      "source_file_id": 0,
      "target_file_id": 0,
    },
    {
      "source": 2,
      "target": 1,
      "source_file_id": 0,
      "target_file_id": 0,
    },
    {
      "source": 2,
      "target": 1,
      "source_file_id": 0,
      "target_file_id": 0,
    },
    {
      "source": 1,
      "target": 2,
      "source_file_id": 0,
      "target_file_id": 0,
    }
  ],

  "methods": [
    {
      "filename": "../tests/memmgr/memmgr.c",
      "file_id": 0,
      "func_id": 0,
      "id": 0,
      "name": "memmgr_init",
      "public": true,
      "start_line": 36,
      "end_line": 42,
    },
    {
      "filename": "../tests/memmgr/memmgr.c",
      "file_id": 0,
      "func_id": 1,
      "id": 1,
      "name": "get_mem_source_pool",
      "public": false,
      "start_line": 43,
      "end_line": 62
    },
    {
      "filename": "../tests/memmgr/memmgr.c",
      "file_id": 0,
      "func_id": 2,
      "id": 2,
      "name": "memmgr_alloc",
      "public": true,
      "start_line": 71,
      "end_line": 128
    },
    {
      "filename": "../tests/memmgr/memmgr.c",
      "file_id": 0,
      "func_id": 3,
      "id": 3,
      "name": "memmgr_free",
      "public": true,
      "start_line": 134,
      "end_line": 176
    }
  ]
};

// sort the links by source, then target
function sort_links(links) {
    links.sort(function(a,b) {
        if (a.source > b.source) return 1;
        else if (a.source < b.source) return -1;
        else {
            if (a.target > b.target) return 1;
            if (a.target < b.target) return -1;
            else return 0;
        }
    });
    return links;
}

function add_num_links(links) {
  for (var i = 0; i < links.length; i++) {
    if (i !== 0 &&
        links[i].source == links[i-1].source &&
        links[i].target == links[i-1].target) {

      links[i].linknum = links[i-1].linknum + 1;
    }
    else {
      links[i].linknum = 1;
    }
  }
}

data.calls = sort_links(data.calls);
console.log(data.calls);

add_num_links(data.calls);
console.log(data.calls);
