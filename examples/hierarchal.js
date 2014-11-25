var width = 960,     // svg width
    height = 600,     // svg height
    dr = 4,      // default point radius
    off = 15,    // cluster hull offset
    expand = {}, // expanded clusters
    data, net, force, hullg, hull, linkg, link, nodeg, node;

var curve = d3.svg.line()
    .interpolate("cardinal-closed")
    .tension(0.85);

var fill = d3.scale.category20();

function noop() { return false; }

function nodeid(n) {
  return n.size ? "_g_"+n.group : n.name;
}

function linkid(l) {
  var u = nodeid(l.source),
      v = nodeid(l.target);
  return u<v ? u+"|"+v : v+"|"+u;
}

function getGroup(n) { return n.group; }

// constructs the network to visualize
function network(data, prev, index, expand) {
  expand = expand || {};
  var group_map = {},    // group map
      node_map = {},    // node map
      link_map = {},    // link map
      prev_node_group = {},    // previous group nodes
      prev_group_centroids = {},    // previous group centroids
      nodes = [], // output nodes
      links = []; // output links

  // process previous nodes for reuse or centroid calculation
  //if (prev) {
    //prev.nodes.forEach(function(node) {
      //var i = index(node),
          //obj;
      //if (node.size > 0) {
        //prev_node_group[i] = node;
        //node.size = 0;
      //} else {
        //obj = prev_group_centroids[i] ||
              //(prev_group_centroids[i] = {x: 0, y: 0, count: 0});
        //obj.x += node.x;
        //obj.y += node.y;
        //obj.count += 1;
      //}
    //});
  //}

  // determine nodes
  for (var k = 0; k < data.nodes.length; k++) {
    var node = data.nodes[k],
        i = index(node);

    if (expand[i]) {
      // the node should be directly visible
      node_map[node.name] = nodes.length;
      nodes.push(node);

      if (prev_node_group[i]) {
        // place new nodes at cluster location (plus jitter)
        node.x = prev_node_group[i].x + Math.random();
        node.y = prev_node_group[i].y + Math.random();
      }
    } else {
      // the node is part of a collapsed cluster
      var link = group_map[i] ||
                (group_map[i] = prev_node_group[i]) ||
                (group_map[i] = {group: i, size: 0, nodes: []});

      if (link.size === 0) {
        // if new cluster, add to set and position at centroid of leaf nodes
        node_map[i] = nodes.length;
        nodes.push(link);
        if (prev_group_centroids[i]) {
          link.x = prev_group_centroids[i].x / prev_group_centroids[i].count;
          link.y = prev_group_centroids[i].y / prev_group_centroids[i].count;
        }
      }
      link.size += 1;
      link.nodes.push(node);
    }
  }

  // determine links
  for (k = 0; k < data.links.length; k++) {
    var e = data.links[k],
        u = index(e.source),
        v = index(e.target);

    u = expand[u] ? node_map[e.source.name] : node_map[u];
    v = expand[v] ? node_map[e.target.name] : node_map[v];

    var j = (u < v ? u + "|" + v : v + "|" + u),
        link_inst = link_map[j] || (link_map[j] = {source:u, target:v, size:0});

    link_inst.size += 1;
  }

  for (var l in link_map) { links.push(link_map[l]); }
  return {nodes: nodes, links: links};
}

function convexHulls(nodes, index, offset) {
  var hulls = {};

  // create point sets
  for (var k = 0; k < nodes.length; k++) {
    var node = nodes[k];
    if (node.size) continue;
    var i = index(node),
        link = hulls[i] || (hulls[i] = []);
    link.push([node.x - offset, node.y - offset]);
    link.push([node.x - offset, node.y + offset]);
    link.push([node.x + offset, node.y - offset]);
    link.push([node.x + offset, node.y + offset]);
  }

  // create convex hulls
  var hulls_list = [];
  for (var j in hulls) {
    hulls_list.push({group: j, path: d3.geom.hull(hulls[j])});
  }

  return hulls_list;
}

function drawCluster(d) {
  return curve(d.path); // 0.8
}

// --------------------------------------------------------

var body = d3.select("body");

var vis = body.append("svg")
   .attr("width", width)
   .attr("height", height);

d3.json("miserables.json", function(json) {
  data = json;
  for (var i=0; i<data.links.length; ++i) {
    o = data.links[i];
    o.source = data.nodes[o.source];
    o.target = data.nodes[o.target];
  }

  hullg = vis.append("g");
  linkg = vis.append("g");
  nodeg = vis.append("g");

  init();

  vis.attr("opacity", 1e-6)
    .transition()
      .duration(1000)
      .attr("opacity", 1);
});

function init() {
  if (force) force.stop();

  net = network(data, net, getGroup, expand);

  //console.log(net.links);
  console.log("init called");

  force = d3.layout.force()
      .nodes(net.nodes)
      .links(net.links)
      .size([width, height])
      .linkDistance(function(d) {
        //console.log("Set Distance");
        //console.log(d.source.index === d.target.index);
        //return (Math.random() * (400 - 200) + 1);
        if (d.source.index === d.target.index) {
          console.log("small");
          return 10;
        }
        else {
          console.log("large");
          return 100;
        }
      })
      .start();

  hullg.selectAll("path.hull").remove();
  hull = hullg.selectAll("path.hull")
      .data(convexHulls(net.nodes, getGroup, off))
    .enter().append("path")
      .attr("class", "hull")
      .attr("d", drawCluster)
      .style("fill", function(d) { return fill(d.group); })
      .on("dblclick", function(d) {
        expand[d.group] = false;
        init();
      })
      ;

  link = linkg.selectAll("line.link").data(net.links, linkid);
  link.exit().remove();
  link.enter().append("line")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })
      .style("stroke-width", function(d) { return d.size || 1; })
      ;

  node = nodeg.selectAll("circle.node").data(net.nodes, nodeid);
  node.exit().remove();
  node.enter().append("circle")
      .attr("class", function(d) { return "node" + (d.size ? "" :" leaf"); })
      .attr("r", function(d) { return d.size ? d.size + dr : dr + 1; })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .style("fill", function(d) { return fill(d.group); })
      .on("dblclick", function(d) {
        if (d.size) {
          expand[d.group] = true;
          init();
        }
      })
      ;

  node.call(force.drag);

  force.on("tick", function() {
    if (!hull.empty()) {
      hull.data(convexHulls(net.nodes, getGroup, off))
          .attr("d", drawCluster)
          ;
    }

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        ;

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        ;
  })
  ;
}
