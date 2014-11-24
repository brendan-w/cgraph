calls = [
  {
    "source_func_id": 1,
    "target_func_id": 3,
  },
  {
    "source_func_id": 2,
    "target_func_id": 1,
  },
  // Extra links to make show current multi link capabilities
  {
    "source_func_id": 2,
    "target_func_id": 1,
  },
  {
    "source_func_id": 2,
    "target_func_id": 1,
  },
  {
    "source_func_id": 2,
    "target_func_id": 1,
  },
  {
    "source_func_id": 1,
    "target_func_id": 2,
  }
];

methods = [
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
    "func_id": 3,
    "id": 2,
    "name": "memmgr_alloc",
    "public": true,
    "start_line": 71,
    "end_line": 128
  },
  {
    "filename": "../tests/memmgr/memmgr.c",
    "file_id": 0,
    "func_id": 4,
    "id": 3,
    "name": "memmgr_free",
    "public": true,
    "start_line": 134,
    "end_line": 176
  }
];


for (var i = 0; i < calls.length; i++) {
  if (i !== 0 &&
    calls[i].source_func_id == calls[i-1].source_func_id &&
    calls[i].target_func_id == calls[i-1].target_func_id) {
    calls[i].linknum = calls[i-1].linknum + 1;
  }
  else {
    calls[i].linknum = 1;
  }
}

console.log(calls);

// sort the links by source, then target
function sortLinks(data) {
  data.links.sort(function(a, b) {
    if (a.source > b.source) return 1;
    else if (a.source < b.source) return -1;
    else {
      if (a.target > b.target) return 1;
      if (a.target < b.target) return -1;
      else return 0;
    }
  });
  return data;
}

//any links with duplicate source and target get an incremented 'linknum'
function setLinkIndexAndNum() {
  for (var i = 0; i < data.links.length; i++) {
    if (i !== 0 &&
        data.links[i].source == data.links[i-1].source &&
        data.links[i].target == data.links[i-1].target) {
      data.links[i].linkindex = data.links[i-1].linkindex + 1;
    }
    else {
      data.links[i].linkindex = 1;
    }
    // save the total number of links between two nodes
    if(mLinkNum[data.links[i].target + "," + data.links[i].source] !== undefined) {
      mLinkNum[data.links[i].target + "," + data.links[i].source] = data.links[i].linkindex;
    }
    else {
      mLinkNum[data.links[i].source + "," + data.links[i].target] = data.links[i].linkindex;
    }
  }
}

var w = 600,
    h = 600;

var force = d3.layout.force()
    .nodes(d3.values(methods))
    .links(calls)
    .size([w, h])
    .linkDistance(60)
    .charge(-300)
    .on("tick", tick)
    .start()
    ;

var svg = d3.select(".viz_column").append("svg:svg")
    //.attr("width", w)
    .attr("height", h)
    ;

// Arrow head
svg.append("defs")
    .append("marker")
    .attr("id", "end")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    ;

var path = svg.append("svg:g").selectAll("path")
    .data(force.links())
  .enter().append("svg:path")
    .attr("class", function(d) { return "link " + d.target_name; })
    .attr("marker-end", function(d) { return "url(#end)"; })
    ;

var circle = svg.append("svg:g").selectAll("circle")
    .data(force.nodes())
  .enter().append("svg:circle")
    .attr("r", 6)
    .call(force.drag)
    .on("click", function(d) { scrollToLine(d.start_line); })
    ;

var text = svg.append("svg:g").selectAll("g")
    .data(force.nodes())
  .enter().append("svg:g")
    ;

// A copy of the text with a thick white stroke for legibility.
text.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .attr("class", "shadow")
    .text(function(d) { return d.name; })
    ;

text.append("svg:text")
    .attr("x", 8)
    .attr("y", ".31em")
    .text(function(d) { return d.name; })
    ;

// Use elliptical arc path segments to doubly-encode directionality.
function tick() {
  path.attr("d", function(d) {
    var dx = d.target_func_id.x - d.source_func_id.x,
        dy = d.target_func_id.y - d.source_func_id.y,
        dr = 75/d.linknum;  //linknum is defined above

    return "M" + d.source_func_id.x + "," + d.source_func_id.y +
           "A" + dr + "," + dr + " 0 0,1 " +
           d.target_func_id.x + "," + d.target_func_id.y;
  });

  circle.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });

  text.attr("transform", function(d) {
    return "translate(" + d.x + "," + d.y + ")";
  });
}

function scrollToLine(lineNumber) {
  var padding = 1,
  paddedLine = lineNumber - padding;

  // For now pad lines by X if possible
  if (lineNumber - padding < 1) {
    elem = document.querySelector(".line-numbers-rows :nth-child(" + lineNumber + ")");
  }
  else {
    elem = document.querySelector(".line-numbers-rows :nth-child(" + paddedLine  + ")");
  }
  elem.scrollIntoView();
  return true;
}
