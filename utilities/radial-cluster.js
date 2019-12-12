var RadialCluster = (function (d3Object) {

    function createSVG() {
        let svgEl = d3Object.select("svg");
        let width = +svgEl.attr("width")
        let height = +svgEl.attr("height");
        let g = svgEl.append("g").attr("transform", "translate(" + (width / 2 - 15) + "," + (height / 2 + 25) + ")");
        return {
            svgEl,
            g,
            width,
            height
        };
    }

    function render(dataToUse, configToUse) {

        var svgConfig = createSVG();

        // check if the user wants to create a linear or radial dendrograph
        var cluster;
        var root;
        if (configToUse.extension === 'json') {
            console.log('selected json');
            cluster = d3Object.cluster()
                .size([360, 390]);
            root = d3Object.hierarchy(dataToUse, function (d) {
                return d.children
            });

        } else if (configToUse.extension === 'csv') {
            console.log('selected csv')
            const stratify = d3Object
                .stratify()
                .parentId(function (d) {
                    return d.id.substring(0, d.id.lastIndexOf("."));
                });
            cluster = d3Object.tree()
                .size([360, 390]);

            root = cluster(stratify(dataToUse)
                .sort(function (a, b) {
                    return (a.height - b.height) || a.id.localeCompare(b.id);
                }));

        } else {
            console.error(`Invalid extension ${configToUse.extension} provided, not supported by this library`);
        }
        cluster(root);

        var link = svgConfig.g.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", function (d) {
                if (configToUse.type === 'linear') {
                    console.log('type selected is linear');
                    return "M" + d.y + "," + d.x
                               + "C" + (d.parent.y + 100) + "," + d.x
                               + " " + (d.parent.y + 100) + "," + d.parent.x
                               + " " + d.parent.y + "," + d.parent.x;
                }
                else {
                    console.log('type selected is radial');
                    return "M" + project(d.x, d.y) +
                    "C" + project(d.x, (d.y + d.parent.y) / 2) +
                    " " + project(d.parent.x, (d.y + d.parent.y) / 2) +
                    " " + project(d.parent.x, d.parent.y);
                }
            }).style("stroke", configToUse.link.color);

        var node = svgConfig.g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function (d) {
                return "node" + (d.children ? " node--internal" : " node--leaf");
            })
            .attr("transform", function (d) {
                return `translate( ${ configToUse.type === 'radial' ? project(d.x, d.y) : d.y + "," + d.x })`;
            });

        node.append("circle")
            .attr("r", function(){ return configToUse.node.radius ? configToUse.node.radius : 3.5}).style("fill", configToUse.node.color);

            if (configToUse.type === 'linear') {
                node.append("text")
                .attr("dy", 3)
                .attr("x", function(d) { return d.children ? -8 : 8; })
                .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
                .text(function(d) {
                    if (configToUse.extension === 'csv') {
                        if (d.hasOwnProperty('id')) {
                         return d.id.substring(d.id.lastIndexOf(".") + 1); 
                        }
                        else {return null} 
                    } else {
                        return (configToUse.node.label && d.data.hasOwnProperty(configToUse.node.label)) ? d.data[configToUse.node.label] :  d.data.name
                    }
                    });
            } else {
                node.append("text")
                .attr("dy", ".31em")
                .attr("x", function (d) {
                    return d.x < 180 === !d.children ? 13 : -13;
                })
                .style("text-anchor", function (d) {
                    return d.x < 180 === !d.children ? "start" : "end";
                })
                .attr("transform", function (d) {
                    return "rotate(" + (d.x < 180 ? d.x - 90 : d.x + 90) + ")";
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
                });
    
            }
        function project(x, y) {
            var angle = (x - 90) / 180 * Math.PI,
                radius = y;
            return [radius * Math.cos(angle), radius * Math.sin(angle)];
        }



    }

    return {
        render
    }
})(d3)