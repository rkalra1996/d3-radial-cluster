var LinearCluster = (function (d3Object) {


    function createSVG(svgID) {
        let svgEl = d3Object.select(`#${svgID}`);
        const width = +svgEl.attr("width");
        const height = +svgEl.attr("height");

        const g = svgEl.append("g").attr("transform", `translate(${40},${0})`);

        return {
            svgEl,
            width,
            height,
            g
        };
    }

    function render(svgID, dataToUse, configToUse) {

        let svgConfig = createSVG(svgID);

        let width = svgConfig.width,
            height = svgConfig.height, 
            g = svgConfig.g;

        var cluster;
        // decide the type depending on data format
        if (configToUse.extension.toLowerCase() === 'csv') {
            d3Object.tree().size([height - 400, width - 160]);
            cluster = d3Object.tree();
        }
        else if (configToUse.extension.toLowerCase() === 'json') {
            d3Object.cluster().size([height - 400, width - 160]);
            cluster = d3Object.cluster()
        }
        else {
            console.error(`Invalid extension ${configToUse.extension} provided, not supported by this library`);
        }


        cluster.size([height, width - 160]).separation(function (a, b) {
                return (a.parent == b.parent ? 1 : 2) / a.depth;
            });

        var root;

        if (configToUse.extension.toLowerCase() === 'csv') {
            let stratify = d3Object.stratify()
            .parentId(function (d) {
                return d.id.substring(0, d.id.lastIndexOf("."));
            });
            root = stratify(dataToUse)
            .sort(function (a, b) {
                return (a.height - b.height) || a.id.localeCompare(b.id);
            });
        }
        else {
            // specify a root for json data
            root = d3Object.hierarchy(dataToUse, function(d) {
                return d.children;
            });
        }

        cluster(root);

        var link = g.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal)
            .style("stroke", configToUse.link.color);

        var node = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function (d) {
                console.log(`depth of node ${d.data.name} is ${d.depth}`);
                return "node" + (d.children ? " node--internal" : " node--leaf");
            })
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            });

        node.append("circle")
        .attr("r", function(){ return configToUse.node.radius ? configToUse.node.radius : 3.5}).style("fill", configToUse.node.color);


        node.append("text")
            .attr("dy", 3)
            .attr("x", function (d) {
                return d.children ? -8 : 8;
            })
            .style("text-anchor", function (d) {
                return d.children ? "end" : "start";
            })
            .text(function (d) {
                // if a csv file is loaded, pick the name from id by default
                if (configToUse.extension === 'csv') {
                    if (d.hasOwnProperty('id')) {
                        return d.id.substring(d.id.lastIndexOf(".") + 1);
                    }
                    else {return null} 
                }
                else {
                    return (configToUse.node.label && d.data.hasOwnProperty(configToUse.node.label)) ? d.data[configToUse.node.label] :  d.data.name
                }
            })
            .style('font-size', function () {
                return 2*(configToUse.node.radius ? configToUse.node.radius : 3.5)
            });


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