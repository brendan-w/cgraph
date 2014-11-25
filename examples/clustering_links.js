var nodesPerCluster = 5,
    numClusters = 10;

var nodes = [];
var links = [];
var clusters = {};
var linked = {};

for (var i = 0; i < numClusters; i++) {
  clusters["c" + i] = [];

  for (var j = 0; j < nodesPerCluster; j++) {
    var node = {name: "c" + i + "n" + j, cluster: "c" + i};
    nodes.push(node);
    clusters["c" + i].push(node);

    if (nodes.length > 1) {
      var numLinks = Math.floor(Math.random() * 10);

      for (var k = 0; k < numLinks; k++) {
        var pred = nodes[Math.floor(Math.random() * (nodes.length - 1))];
        var key = pred.name + ":" + node.name;

        if (!(key in linked)) {
          linked[key] = true;
          links.push({source: pred, target: node});
        }
      }
    }
  }
}

console.log(nodes);
console.log(links);

var colors = d3.scale.category20()
  .domain(d3.keys(clusters));

var width = 960,
    height = 600;

function zoom() {
  svg.attr("transform",
      "translate(" + d3.event.translate +
      ") scale(" + d3.event.scale + ")");
}

var svgRoot = d3.select("#chart")
  .attr("width", "100%")
  .attr("height", "600px");

svgRoot.append("rect")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("pointer-events", "all")
  .style("fill-opacity", 0)
  .call(d3.behavior.zoom().on("zoom", zoom));

svg = svgRoot.append("g");

var force = d3.layout.force()
  .charge(-250)
  .linkDistance(300)
  .size([width, height])
  .nodes(nodes)
  .links(links)
  .start();

var hullPadding = 10;
function clusterPath(d) {
  var points = [];
  clusters[d].forEach(function(e) {
    points.push([e.x - hullPadding, e.y - hullPadding]);
    points.push([e.x - hullPadding, e.y + hullPadding]);
    points.push([e.x + hullPadding, e.y - hullPadding]);
    points.push([e.x + hullPadding, e.y + hullPadding]);
  });
  return "M" + d3.geom.hull(points).join("L") + "Z";
}

var hull = svg.selectAll("path.hull")
  .data(d3.keys(clusters))
  .enter()
    .append("path")
    .classed("hull", true)
    .attr("d", clusterPath)
    .style("fill", function(d) { return colors(d); })
    .style("fill-opacity", "0.5");

var link = svg.selectAll("line.link")
  .data(links)
  .enter()
    .append("line")
    .classed("link", true)
    .style("stroke", "black")
    .style("stroke-width", "1.5px");

var node = svg.selectAll("circle.node")
  .data(nodes)
  .enter()
    .append("circle")
    .classed("node", true)
    .style("fill", function(d) { return colors(d.cluster); })
    .attr("r", 5)
    .call(force.drag);

node
  .append("title")
  .text(function(d) { return d.name; });

force.on("tick", function(e) {
  d3.values(clusters).forEach(function(cluster) {
    var x = 0, y = 0;
    cluster.forEach(function(n) {
      x += n.x;
      y += n.y;
    });
    x = x / cluster.length;
    y = y / cluster.length;

    var k = e.alpha * 2.0;
    cluster.forEach(function(n) {
      n.x += (x - n.x) * k;
      n.y += (y - n.y) * k;
    });

  });

  hull
    .attr("d", clusterPath);

  link
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  node
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
});
