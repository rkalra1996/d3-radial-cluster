var LinearCluster = (function (d3Object) {

    function render(svgID, dataToUse, configToUse) {
        console.log('linear cluster for ', dataToUse);


        let svg = d3Object.select(`#${svgID}`);
            const width = +svg.attr("width");
            const height = +svg.attr("height");
            console.log(`width and height is ${width} ${height}`);
            let  g = svg.append("g").attr("transform", `translate(${40},${0})`);
            let tree = d3Object.tree().size([height - 400, width - 160]);
        var cluster = d3Object.cluster()
            .size([height, width - 160]);
        var stratify = d3Object.stratify()
            .parentId(function (d) {
                return d.id.substring(0, d.id.lastIndexOf("."));
            });
        var root = stratify(dataToUse)
            .sort(function (a, b) {
                return (a.height - b.height) || a.id.localeCompare(b.id);
            });
        cluster(root);
        var link = g.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);
        var node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function (d) {
                return "node" + (d.children ? " node--internal" : " node--leaf");
            })
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });
        node.append("circle")
            .attr("r", 2.5);
        node.append("text")
            .attr("dy", 3)
            .attr("x", function (d) {
                return d.children ? -8 : 8;
            })
            .style("text-anchor", function (d) {
                return d.children ? "end" : "start";
            })
            .text(function (d) {
                return d.id.substring(d.id.lastIndexOf(".") + 1);
            });
        d3Object.selectAll("input")
            .on("change", changed);
        function changed() {
            // timeout = clearTimeout(timeout);
            // (this.value === "tree" ? tree : cluster)(root);
            (this.value = cluster)(root);
            var t = d3Object.transition().duration(750);
            node.transition(t).attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });
            link.transition(t).attr("d", diagonal);
        }
        function diagonal(d) {
            return "M" + d.y + "," + d.x +
                "C" + (d.parent.y + 100) + "," + d.x +
                " " + (d.parent.y + 100) + "," + d.parent.x +
                " " + d.parent.y + "," + d.parent.x;
        }

    }

    return {
        render
    }
})(d3);