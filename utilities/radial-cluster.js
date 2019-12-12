var RadialCluster = (function(d3Object){

    function initiate(dataToUse) {
        console.log('recieved d3 as ', d3Object);
        console.log('recieved data as ', dataToUse);

        var svg = d3Object.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        g = svg.append("g").attr("transform", "translate(" + (width / 2 - 15) + "," + (height / 2 + 25) + ")");
    
    /* var stratify = d3Object.stratify()
        .parentId(function(d) { 
            console.log(`parent for ${JSON.stringify(d)} is `, d.id.substring(0, d.id.lastIndexOf(".")));
            return d.id.substring(0, d.id.lastIndexOf(".")); 
        });
     */
    // get total width and height of svg, make cluster of that height only
    console.log(d3Object.select("svg").node().getBBox());
    var cluster = d3Object.tree()
        .size([360, 390]);
    
    d3Object.csv("flare.csv", function(error, data) {
        console.log('csv data is ', data);
      if (error) throw error;
    
      /* var root = tree(stratify(data)
          .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); }));
     */
    var root = d3Object.hierarchy(dataToUse, function(d){return d.children});

          cluster(root);
    
          console.log(root);
      var link = g.selectAll(".link")
        .data(root.descendants().slice(1))
        .enter().append("path")
          .attr("class", "link")
          .attr("d", function(d) {
              console.log('creating link for ', d);
            return "M" + project(d.x, d.y)
                + "C" + project(d.x, (d.y + d.parent.y) / 2)
                + " " + project(d.parent.x, (d.y + d.parent.y) / 2)
                + " " + project(d.parent.x, d.parent.y);
          });
    
      var node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
          .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
          .attr("transform", function(d) { return "translate(" + project(d.x, d.y) + ")"; });
    
      node.append("circle")
          .attr("r", 3.5);
    
      node.append("text")
          .attr("dy", ".31em")
          .attr("x", function(d) { return d.x < 180 === !d.children ? 6 : -6; })
          .style("text-anchor", function(d) { return d.x < 180 === !d.children ? "start" : "end"; })
          .attr("transform", function(d) { return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")"; })
          .text(function(d) { return d.data.name });
    });
    
    function project(x, y) {
      var angle = (x - 90) / 180 * Math.PI, radius = y;
      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    }



    }

    return {
        initiate
    }
})(d3)