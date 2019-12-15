var LinearCluster = (function (d3Object) {


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
        const width = +svgEl.attr("width");
        const height = +svgEl.attr("height");

        const g = svgEl.append("g").attr("transform", `translate(${60},${0})`);

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

            svgConfig.svgEl.call(d3Object.zoom().on("zoom", function(){
                g.attr("transform", d3Object.event.transform);
            }));

        var cluster;
        // decide the type depending on data format
        if (configToUse.extension.toLowerCase() === 'csv') {
            d3Object.tree().size([height - 400, width - 160]);
            cluster = d3Object.tree();
        }
        else if (configToUse.extension.toLowerCase() === 'json') {
            d3Object.cluster().size([height - 400, (height - 160)]);
            cluster = d3Object.cluster()
        }
        else {
            console.error(`Invalid extension ${configToUse.extension} provided, not supported by this library`);
        }


        cluster.size([height, width - 300]).separation(function (a, b) {
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

        g.selectAll(".link")
            .data(root.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal)
            .style("stroke", configToUse.link.color);

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