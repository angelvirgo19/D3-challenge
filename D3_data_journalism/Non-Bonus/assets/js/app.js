function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg ");

    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // svg params
    var svgHeight = window.innerHeight - 150;
    var svgWidth = window.innerWidth - 500;

    var margin = {
        top: 20,
        right: 40,
        bottom: 60,
        left: 100
    };

    var chartWidth = svgWidth - margin.left - margin.right;
    var chartHeight = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Import Data
    (async function() {
        var censusData = await d3.csv("assets/data/data.csv").catch(function(error) {
            console.log(error);
        });


        // Step 1: Parse Data/Cast as numbers
        // ==============================
        censusData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
        });

        // Step 2: Create scale functions
        // ==============================
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d.poverty) * 0.8,
                d3.max(censusData, d => d.poverty) * 1.2
            ])
            .range([0, chartWidth]);

        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d.healthcare) * 0.8,
                d3.max(censusData, d => d.healthcare) * 1.2
            ])
            .range([chartHeight, 0]);

        // Step 3: Create axis functions
        // ==============================
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Step 4: Append Axes to the chart
        // ==============================
        chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        // Step 5: Create Circles
        // ==============================
        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "16")
            .attr("fill", "aqua")
            .attr("stroke", "black")
            .attr("opacity", "1")
            // .call(responsivefy)

        var circleLabels = chartGroup.selectAll(null)
            .data(censusData)
            .enter()
            .append("text");
        circleLabels
            .attr("x", d => xLinearScale(d.poverty))
            .attr("y", d => yLinearScale(d.healthcare))
            .text(function(d) {
                return d.abbr;
            })
            .attr("font-family", "calibri")
            .attr("font-size", "12px")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            // .attr("x", ".2em")
            .attr("fill", "black");

        // Step 6: Initialize tool tip
        // ==============================
        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .attr("border", "black")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "3px")
            .style("padding", "10px")
            .offset([40, 80])
            .html(function(d) {
                return (`<br>State: ${d.state}<br>Poverty: ${d.poverty}<br>Healthcare: ${d.healthcare}`);
            });

        // Step 7: Create tooltip in the chart
        // ==============================
        chartGroup.call(toolTip);

        // Step 8: Create event listeners to display and hide the tooltip
        // ==============================
        circlesGroup.on("click", function(data) {
                toolTip.show(data, this);
            })
            // onmouseout event
            .on("mouseout", function(data, index) {
                toolTip.hide(data);
            });

        // Create axes labels
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (chartHeight / 2))
            .attr("dy", "1em")
            .classed("axis-text", true)
            .text("Lacks Healthcare (%)");

        chartGroup.append("text")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.top + 30})`)
            .classed("axis-text", true)
            .text("In Poverty (%)");
    })();
}

makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);