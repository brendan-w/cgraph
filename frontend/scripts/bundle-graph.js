var min_node_radius = 8,
    max_node_radius = 16,
    min_link_width = 1,
    // Links should have a width no greater than the smallest node
    max_link_width = min_node_radius - 2,
    // cluster svg_hull offset
    off = 15,
    // reference to expanded clusters
    expand = {},
    data,
    net,
    // D3 functions
    force,
    link_scale,
    node_scale,
    hull_line = d3.svg.line().interpolate("cardinal-closed").tension(0.95),
    fill = d3.scale.category20();

// SVG elements
var svg_hull_g, svg_hull,
    svg_link_g, svg_link,
    svg_text_g, svg_text,
    defs, arrows,
    svg_node_g, svg_node,
    vis = d3.select(".viz_column").append("svg"),
    pathgen = d3.svg.line().interpolate("basis"),
    responsive_width = vis.property("parentNode").clientWidth,
    responsive_height = vis.property("parentNode").clientHeight;

main();

function main() {
  var min_links, max_links, min_nodes, max_nodes;

  // Change source and targets from id's to objects
  // Do we really need this? Seems to be the easiest way...
  for (var i = 0; i < data.links.length; i++) {
    o = data.links[i];
    o.source = data.nodes[o.source];
    o.target = data.nodes[o.target];
  }

  net = network(data);
  max_nodes = _.max(_.pluck(net.nodes, 'size'));
  min_nodes = _.min(_.pluck(net.nodes, 'size'));
  max_links = _.max(_.pluck(net.links, 'size'));
  min_links = _.min(_.pluck(net.links, 'size'));

  node_scale = d3.scale.log()
    .clamp(true)
    .domain([min_nodes, max_nodes])
    .range([min_node_radius, max_node_radius]);

  link_scale = d3.scale.log()
    .clamp(true)
    .domain([min_links, max_links])
    .range([min_link_width, max_link_width]);

  svg_hull_g = vis.append("g");
  svg_link_g = vis.append("g");
  svg_node_g = vis.append("g");
  svg_text_g = vis.append("g");
  defs = vis.append("defs");
  arrows = defs.append("marker")
    .attr("id", "arrow-marker")
    .attr("refX", 5)
    .attr("refY", 5)
    .attr("markerUnits", "userSpaceOnUse")
    .attr("markerWidth", 10)
    .attr("markerHeight", 10)
    .attr("orient", "auto")
  .append("path")
    .attr("d", "M0,0 L0,10 L10,5 L0,0z");

  init();

  // Fade in the vis after we initialize all the data
  vis.attr("opacity", 1e-6)
    .transition()
    .duration(1000)
    .attr("opacity", 1);
}

function init() {
  /*
  We're kinda lazy with maintaining the anti-coll grid here: only when we hit a
  'occupied' node, do we go and check if the occupier is still there, updating
  his quant grid location.

  This works because it 'evens out over time': a tested node hitting an
  'unoccupied slot' takes that slot, so at the start, everybody might think
  they've got a free slot for themselves, then on the next 'tick', the slot may
  be suddenly found occupied by someone else also sitting in the same slot,
  causing double occupations to be resolved as the marked owner will stay,
  while all the others will be pushed out.

  As we'll have a lot of 'ticks' before the shows stops, we'll have plenty of
  time to get everybody to an actually really empty grid slot.

  Note that the feature set lists this as 'first come, first serve', but when
  you read this, I'm sure you realize that's a bit of a lie. After all, it's
  only really 'first come, first serve in nodes[] order' on the INITIAL ROUND,
  isn't it?
  */

  var anticollision_grid = [],
      xquant = 1,
      yquant = 1,
      xqthresh,
      yqthresh,
      change_squared,
      force_size;

  if (force) force.stop();

  net = network(data);

  force = d3.layout.force()
    .nodes(net.nodes)
    .links(net.links)
    .size([responsive_width, responsive_height])
    .linkDistance(function(a_link, i) {
      var source = a_link.source,
          target = a_link.target,
          source_group = source.group_data || source,
          target_group = target.group_data || target,
          source_is_group = source.size || 0,
          target_is_group = target.size || 0,
          link_dist = 300;

      // larger distance for bigger groups:
      // both between single nodes and other groups (where size of own node
      // group still counts), and between two group nodes.

      // reduce distance for groups with very few outer links,
      // again both in expanded and grouped form, i.e. between individual
      // nodes of a group and nodes of another group or other group node or
      // between two group nodes.

      // The latter was done to keep the single-link groups close.
      if (source.group == target.group) {
        if ((source.link_count < 2 && !source_is_group) ||
            (target.link_count < 2 && !target_is_group)) {
          // 'real node' singles: don't need big distance to make the distance
          link_dist = 2;
        }
        else if (!source_is_group && !target_is_group) {
          link_dist = 2;
        }
        else if (source_group.link_count < 4 || target_group.link_count < 4) {
          link_dist = 100;
        }
      }
      else {
        if (!source_is_group && !target_is_group) {
          link_dist = 50;
        }
        else if (source_is_group && target_is_group ) {
          if (source_group.link_count < 4 || target_group.link_count < 4) {
            link_dist = 100;
          }
        }
        else if ((source_is_group && source_group.link_count < 2) ||
                ( target_is_group && target_group.link_count < 2)) {
          link_dist = 30;
        }
        else if (!source_is_group || !target_is_group) {
          link_dist = 100;
        }
      }
      a_link.distance = link_dist;
      return a_link.distance;
    })
    // Gravity & charge tweaked to separate the clusters
    .gravity(1.0)
    // Charge is important to turn single-linked groups to the outside
    .charge(function(d, i) {
      if (d.size > 2) {
        // group node
        return -5000;
      } else {
        // regular node
        return -1000;
      }
    })
     // friction adjusted to get dampened display
    .friction(0.7)
    .start();

  svg_hull_g.selectAll("path.hull").remove();
  svg_hull = svg_hull_g.selectAll("path.hull")
      .data(convexHulls(net.nodes, off))
      .enter().append("path")
        .attr("class", "hull")
        .attr("d", drawCluster)
        .style("fill", function(d) { return fill(d.group); })
        .on("dblclick", on_node_dblclick);

  svg_link = svg_link_g.selectAll("path.link").data(net.links, get_link_id);
  svg_link.exit().remove();
  svg_link.enter().append("path")
    .attr("class", "link")
    .attr("d", link_arc)
    .attr("marker-end", function(d) { return "url(#arrow-marker)"; });

  // both existing and enter()ed links may have changed stroke width due to
  // expand state change somewhere:
  svg_link.style("stroke-width", function(d) {
    return link_scale(d.size) || 1;
  });

  svg_node = svg_node_g.selectAll("circle.node").data(net.nodes, get_node_id);
  svg_node.exit().remove();
  svg_node.enter().append("circle")
      // if (d.size) || d.size > 0 when d is a group node.
      .attr("class", function(d) {
        if (d.size > 0) {
          return "node link-exapnded";
        }
        else if (d.expansion) {
          return "node";
        }
        else {
          return "node leaf";
        }
      })
      .attr("r", function(d) {
        // if group base size on number of internal nodes
        if (d.size) {
          return node_scale(d.size);
        }
        else {
          return min_node_radius;
        }
      })
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; })
      .style("fill", function(d) { return fill(d.group); })
      .on("dblclick", on_node_dblclick)
      .on("click", on_node_click)
      .on("mouseover", on_node_hover)
      .on("mouseout", on_node_out)
      ;

  svg_node.call(force.drag);

  force.on("tick", tick);
  force_size = force.size();

  svg_text = svg_text_g.selectAll("text")
    .data(net.nodes, get_node_id);
  svg_text.exit().remove();
  svg_text.enter().append("text")
      //.attr("x", function(d) { return d.x; })
      //.attr("y", function(d) { return d.y; })
      //.attr("text-anchor", "end")
      .text(function(d) {
        if (d.size) {
          var filepath = data.groups[d.group].split("/");
          return filepath[filepath.length-1];
        }
        else
        {
          return d.name;
        }
      })
      .style("opacity", function(d) {
        if(d.size) return 1;
        else       return 0;
      })
      .each(function(d) { position_text(d, this, force_size); })
      ;
}


function tick(e) {
  //Force all nodes with only one link to point outwards.

  // To do this, we first calculate the center mass (okay, we wing it, we
  // fake node 'weight'), then see whether the target node for links from
  // single-link nodes is closer to the center-of-mass than us, and if it
  // isn't, we push the node outwards.

  var center = {x: 0, y: 0, weight: 0},
      singles = [],
      force_size,
      c, k,
      mx, my,
      dx, dy,
      alpha;

  net.nodes.forEach(function(n) {
    var w = Math.max(1, n.size || 0, n.weight || 0);

    center.x += w * n.x;
    center.y += w * n.y;
    center.weight += w;

    if (n.size > 0 ? n.link_count < 4 : n.group_data.link_count < 3)
      singles.push(n);
  });

  force_size = force.size();

  mx = force_size[0] / 2;
  my = force_size[1] / 2;

  singles.forEach(function(n) {
    var k, x, y,
        alpha,
        power,
        dx, dy,
        n_is_group = n.size || 0,
        w = Math.max(1, n.size || 0, n.weight || 0);

    // Just let unconnected nodes float in the hull
    if (n.link_count === 0) return;

    // apply amplification of the 'original' alpha:
    // 1.0 for singles and double-connected nodes, close to 0 for highly
    // connected nodes, rapidly decreasing. Use this as we want to give those
    // 'non-singles' a little bit of the same 'push out' treatment. Reduce
    // effect for 'real nodes' which are singles:
    // they need much less encouragement!
    if (n_is_group) {
      power = Math.max(2, n.link_count);
    }
    else {
      power = Math.max(2, n.group_data.link_count);
    }

    power = 2 / power;
    alpha = e.alpha * power;

    // undo/revert gravity forces (or as near as we can get, here)
    // revert for truly single nodes, revert just a wee little bit for
    // dual linked nodes,
    // only reduce ever so slightly for nodes with few links (~ 3) that made
    // it into this 'singles' selection
    k = alpha * force.gravity() * (0.8 + power);

    if (k) {
      dx = (mx - n.x) * k;
      dy = (my - n.y) * k;
      n.x -= dx;
      n.y -= dy;

      center.x -= dx * w;
      center.y -= dy * w;
    }
  });

  // move the entire graph so that its center of mass sits at the center
  center.x /= center.weight;
  center.y /= center.weight;

  dx = mx - center.x;
  dy = my - center.y;

  alpha = e.alpha * 5;
  dx *= alpha;
  dy *= alpha;

  net.nodes.forEach(function(n) {
    n.x += dx;
    n.y += dy;
  });

  change_squared = 0;

  // fixup .px/.py so drag behaviour and annealing get the correct values, as
  // force.tick() would expect .px and .py to be the previous .x and .y
  net.nodes.forEach(function(node) {

    restrict_node_to_window(node, force_size);

    // fixes 'elusive' node behaviour when hovering with the mouse
    // (related to force.drag)
    if (node.fixed) {
      node.x = node.px;
      node.y = node.py;
    }
    node.px = node.x;
    node.py = node.y;

    // plus copy for faster stop check
    change_squared += Math.pow((node.qx - node.x), 2);
    change_squared += Math.pow((node.qy - node.y), 2);
    node.qx = node.x;
    node.qy = node.y;
  });

  if (!svg_hull.empty()) {
    svg_hull
      .data(convexHulls(net.nodes, off))
      .attr("d", drawCluster);
  }

  svg_link
    .attr("d", link_arc);

  svg_node
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    ;

  svg_text
    .each(function(d) { position_text(d, this, force_size); })
    ;
}

function log(object) {
  // console.log prints a reference to the object, but sometimes we want
  // to inspect the state of a variable frozen at the time of the call
  // JSON.stringify serves this purpose
  console.log(JSON.stringify(object, null, "\t"));
}

function position_text(d, that, force_size) {
  // Orient the node's text such that it doesn't go off screen
  var force_window_width = force_size[1],
      text_width = that.getBBox().width + off,
      diff = force_window_width - text_width,
      node_width = node_scale(d.size) || min_node_radius;

  if (d.x < diff) {
    d3.select(that)
      .attr("x", function(d) { return d.x + (2 * node_width); })
      .attr("y", function(d) { return d.y; })
      .attr("text-anchor", "start")
      ;
  }
  else {
    d3.select(that)
      .attr("x", function(d) { return d.x - (2 * node_width); })
      .attr("y", function(d) { return d.y; })
      .attr("text-anchor", "end")
      ;
  }
}

function restrict_node_to_window(node, size) {
  var k = 1.5,
      dx, dy,
      radius;

  // restrain all nodes to window area
  if (node.size > 0) {
    radius = node.size + min_node_radius + 2;
  }
  else {
    radius = min_node_radius + 3;
  }

  dx = 0;
  if (node.x < radius)
    dx = radius - node.x;
  else if (node.x > size[0] - radius)
    dx = size[0] - radius - node.x;

  dy = 0;
  if (node.y < radius)
    dy = radius - node.y;
  else if (node.y > size[1] - radius)
    dy = size[1] - radius - node.y;

  node.x += dx * k;
  node.y += dy * k;
}

function get_node_id(node) {
  if (node.is_group) {
    return "file_" + node.group;
  }
  else {
    return "func_" + node.id;
  }
}

function get_link_id(link) {
  var source = get_node_id(link.source),
      target = get_node_id(link.target);

  return source + "|" + target;
}

function get_group(node) {
  return node.group;
}

function get_node(nodes, node_id) {
  return nodes[node_id];
}

function cycle_state(d) {
  var g = d.group,
      s = expand[g] || false;

  s = s ? false : true;
  expand[g] = s;
  return expand[g];
}

// constructs the network to visualize
function network(data) {
  function checkNetworkState() {
    log("");
    log("Group Map");
    console.log(group_map);
    log(group_map);

    log("Node Map");
    log(node_map);

    log("Link Map");
    console.log(link_map);

    log("Expanded Clusters");
    log(expand);
  }

  expand = expand || {};
  var node_data = build_node_data(data.nodes),
      nodes     = node_data.nodes,
      node_map  = node_data.node_map,
      group_map = node_data.group_map,
      link_map  = build_link_map(data.links, node_map),
      links     = build_links(link_map);

  //checkNetworkState();
  return { nodes: nodes, links: links };
}

function build_node_data(node_ds) {
  var nodes = [],
      group_map = {},
      node_map = {};

  node_ds.forEach(function(node, k) {
    var group_id = get_group(node),
        node_id = get_node_id(node),
        // Expand is an object of the form {`group_id` : boolean}
        expansion = expand[group_id] || false;

    // Set a default group state if it hasn't already been initiated
    if (!group_map[group_id]) {
      group_map[group_id] = { group: group_id, size: 0, link_count: 0,
                              nodes: [], expansion: expansion, is_group: true };
    }

    // if cluster expanded, the node should be directly visible
    if (expansion) {
      node_map[node_id] = node;
      nodes.push(node);
    }
    // the node is part of a collapsed cluster
    else {
      if (group_map[group_id].size === 0) {
        // if new cluster, add to set and position at centroid of leaf nodes
        node_map[node_id] = group_map[group_id];

        // Add the collapsed cluster to the list of nodes
        node_map[get_node_id(group_map[group_id])] = group_map[group_id];
        nodes.push(group_map[group_id]);
      }
      // have element node point to group node:
      else {
        node_map[node_id] = group_map[group_id];
      }
      group_map[group_id].nodes.push(node_id);
    }

    // always count group size as we also use it to tweak the force graph
    group_map[group_id].size += 1;
    node.group_data = group_map[group_id];
    node.link_count = 0;
  });

  return { nodes: nodes, node_map: node_map, group_map: group_map };
}

function build_link_map(links, node_map) {
  var link_map = {};

  links.forEach(function(current_link) {
    var source = get_group(current_link.source),
        target = get_group(current_link.target),
        real_source,
        real_target,
        current_source,
        current_target,
        link_map_key,
        link;

    // While d3.layout.force does convert link.source and link.target NUMERIC
    // values to direct node references, it doesn't for other attributes, such
    // as .real_source, so we do not use indexes in node_map[] but direct node
    // references to skip the d3.layout.force implicit links conversion later
    // on and ensure that both .source/.target and .real_source/.real_target
    // are of the same type and pointing at valid nodes.
    real_source = get_node_id(current_link.source);
    real_target = get_node_id(current_link.target);
    // Real source tells us whether it's going to the file or the function node
    source = node_map[real_source];
    target = node_map[real_target];

    // skip links from node to same (A-A); they are rendered as 0-length
    // lines anyhow. Less links in array = faster animation.
    if (source == target) return;

    current_source = get_node_id(source);
    current_target = get_node_id(target);

    link_map_key = current_source + "|" + current_target;

    if (link_map[link_map_key]) {
      link = link_map[link_map_key];
    }
    else {
      link = {source: source, target: target,
              size: 0, distance: 0, key: link_map_key};
      link_map[link_map_key] = link;
    }

    link.size += current_link.value;

    if (link.size == 1) {
      source.link_count++;
      target.link_count++;
    }
  });

  return link_map;
}

function build_links(link_map) {
  links = [];
  for (var key in link_map) {
    links.push(link_map[key]);
  }
  return links;
}

function convexHulls(nodes, offset) {
  var hulls = {};

  // create point sets
  for (var k = 0; k < nodes.length; k++) {
    var n = nodes[k];
    if (n.size) continue;
    var i = get_group(n),
        l = hulls[i] || (hulls[i] = []);

    l.push([n.x-offset, n.y-offset]);
    l.push([n.x-offset, n.y+offset]);
    l.push([n.x+offset, n.y-offset]);
    l.push([n.x+offset, n.y+offset]);
  }

  // create convex hulls
  var hullset = [];
  for (var j in hulls) {
    hullset.push({
      group: j,
      path: d3.geom.hull(hulls[j]) });
  }
  return hullset;
}

function drawCluster(d) {
  return hull_line(d.path);
}

function on_node_click(d) {
  var filename = data.groups[d.group];
  goto_code(filename, d.line);
}

// these functions call init(); by declaring them here
// they don't have the old init() as a closure any more.
// This should save us some memory and cycles when using
// this in a long-running setting.
function on_node_dblclick(d) {
  cycle_state(d);
  init();

  svg_text
    .transition()
    .duration(300)
    .style("opacity", function(o) {
      if(o.size === undefined)
        return o == d ? 1 : 0;
      else
        return 1;
    })
    ;
}

function on_node_hover(d) {
  svg_link
    .transition()
    .duration(300)
    .style("opacity", function(o) {
      return connected_link(d, o) ? 1 : 0.15;
    })
    ;

  svg_text
    .transition()
    .duration(300)
    .style("opacity", function(o) {
      if(o.size === undefined)
        return o == d ? 1 : 0;
      else
        return 1;
    })
    ;
}

function on_node_out(d) {
  svg_link
    .transition()
    .duration(300)
    .style("opacity", 1);

  svg_text.style("opacity", function(o) {
    if(o.size === undefined)
      return 0;
    else
      return 1;
  });
}

function connected_link(a, b) {
  return get_node_id(a) === b.key.split("|")[0];
}

function link_arc(d) {
  // Draw arcs between the nodes d.source and d.target, but do so from the
  // edge of the nodes radius at a 45 degree angle from the direct line.
  // This is so the arrow heads are not hidden by really large nodes
  var source_r = node_scale(d.source.size) || min_node_radius,
      target_r = node_scale(d.target.size) || min_node_radius,
      source_x = d.source.x,
      source_y = d.source.y,
      target_x = d.target.x,
      target_y = d.target.y,
      dx = target_x - source_x,
      dy = target_y - source_y,
      length = Math.sqrt(dx * dx + dy * dy),
      polar = to_polar(dx, dy),
      polar_source = [polar[0], source_r],
      cart_source,
      polar_target = [polar[0], target_r+5],
      cart_target;

  polar_source[0] -= Math.PI/4;
  polar_target[0] += Math.PI/4;
  cart_source = from_polar([source_x, source_y], polar_source);
  cart_target = from_polar([target_x, target_y], polar_target);

  return "M" + source_x + "," + source_y +
         "A" + length + "," + length + " 0 0,1 " +
         cart_target[0] + "," + cart_target[1];
}

function to_polar(x, y) {
  var theta = Math.atan2(x, y),
      mag = Math.sqrt(x * x + y * y);
  return [theta, mag];
}

function from_polar(start, polar) {
  x = start[0] + Math.cos(polar[0]) * polar[1];
  y = start[1] - Math.sin(polar[0]) * polar[1];
  return [x, y];
}

function neighboring(a, b) {
  // could be faster via lookup table...
  return data.links.some(function(d) {
    return (d.source === a && d.target === b) ||
           (d.source === b && d.target === a);
  });
}
