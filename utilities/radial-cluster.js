var RadialCluster = (function (d3Object) {


    function createSVGComponent(containerid, paddingAll = '5 5 5 5') {
        // apply default word cloud size if not available
        var svgSize = '750 750';
        var containerElement = d3Object.selectAll(containerid);
        let element = containerElement.nodes();
        // To check if no containers are found with the containerid
        if (!element || element.length == 0)
          throw new Error('No Container found with element selector : ' + containerid);
          // To check if multiple containers are found with the containerid
          if(element.length >1)
          throw new Error('Multiple Container found with element selector : "' + containerid + '". Please specify unique id or class of the element');
        let svgSizeEach = svgSize.split(' ');
        let container_height = d3Object.select(element[0]).attr('height') || svgSizeEach[0];
        let container_width = d3Object.select(element[0]).attr('width') || svgSizeEach[1];
        let elementStyle = window.getComputedStyle(element[0]);
        let paddingEach = paddingAll.split(' ');
        let padding_left = parseFloat(elementStyle.getPropertyValue('padding-left')) || paddingEach[0];
        let padding_right = parseFloat(elementStyle.getPropertyValue('padding-right')) || paddingEach[1];
        let padding_top = parseFloat(elementStyle.getPropertyValue('padding-top')) || paddingEach[2];
        let padding_bottom = parseFloat(elementStyle.getPropertyValue('padding-bottom')) || paddingEach[3];
        container_width = container_width - padding_left - padding_right;
        container_height = container_height - padding_top - padding_bottom;
        var svgElement = containerElement
          .append('svg')
          .attr('class', 'svgElement')
          .attr('height', container_height)
          .attr("width", container_width);
        return svgElement;
      }

    function createSVG(svgID) {
        
        let svgEl = createSVGComponent(`#${svgID}`);
        let width = +(svgEl.attr("width"));
        let height = +(svgEl.attr("height"));
        let g = svgEl.append("g").attr("transform", "translate(" + (width >> 1) + "," + (height >> 1) + ")");
        return {
            svgEl,
            g,
            width,
            height
        };
    }

    function render(svgID, dataToUse, configToUse) {

        var svgConfig = createSVG(svgID);
        // add zoom functionality
        svgConfig.svgEl.call(d3Object.zoom().on("zoom", function(){
            svgConfig.g.attr("transform", d3Object.event.transform);
        }));

        // check if the user wants to create a linear or radial dendrograph
        var cluster;
        var root;
        if (configToUse.extension === 'json') {
            console.log('selected json');
            cluster = d3Object.cluster()
                .size([360, (svgConfig.height / 2) - 100]);

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
                const degreesSpread = 360;
                const depth = svgConfig.height/2;
                cluster = d3Object.tree()
                .size([degreesSpread, depth]).separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

            
            root = cluster(stratify(dataToUse)
                .sort(function (a, b) {
                    return (a.height - b.height) || a.id.localeCompare(b.id);
                }));

        } else {
            console.error(`Invalid extension ${configToUse.extension} provided, not supported by this library`);
        }
        cluster(root);

        svgConfig.g.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", function (d) {
                    return "M" + project(d.x, d.y) +
                    "C" + project(d.x, (d.y + d.parent.y) / 2) +
                    " " + project(d.parent.x, (d.y + d.parent.y) / 2) +
                    " " + project(d.parent.x, d.parent.y);
            }).style("stroke", configToUse.link.color);

        var node = svgConfig.g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", function (d) {
                return "node" + (d.children ? " node--internal" : " node--leaf");
            })
            .attr("transform", function (d) {
                return `translate( ${project(d.x, d.y)})`;
            });

        node.append("circle")
            .attr("r", function(){ return configToUse.node.radius ? configToUse.node.radius : 3.5}).style("fill", configToUse.node.color);

            node.append("text")
                .attr("dy", ".31em")
                .attr("x", function (d) {
                    return d.x < 180 === !d.children ? 13 : -13;
                })
                .style("text-anchor", function (d) {
                    return d.x < 180 === !d.children ? "start" : "end";
                })
                .style('font-size', function(){return 2*(configToUse.node.radius ? configToUse.node.radius : 3.5)})
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