function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.

    var svgArea = d3.select("body").select("svg ");

    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // svg params
    var svgHeight = window.innerHeight - 200;
    var svgWidth = window.innerWidth - 500;

    var margin = {
        top: 20,
        right: 40,
        bottom: 80,
        left: 100
    };

    var chartWidth = svgWidth - margin.left - margin.right;
    var chartHeight = svgHeight - margin.top - margin.bottom;


    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // function used for updating x-scale var upon click on axis label
    function xScale(censusData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
                d3.max(censusData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, chartWidth]);

        return xLinearScale;

    }

    // function used for updating y-scale var upon click on axis label
    function yScale(censusData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
                d3.max(censusData, d => d[chosenYAxis]) * 1.2
            ])
            .range([chartHeight, 0]);

        return yLinearScale;

    }

    // function used for updating xAxis adn yAxis var upon click on axis label
    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(2000)
            .call(bottomAxis);

        return xAxis;
    }

    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(2000)
            .call(leftAxis);

        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(2000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    }


    function renderText(circleLabels, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circleLabels.transition()
            .duration(2000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis]));

        return circleLabels;
    }


    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {


        if (chosenXAxis === "poverty") {
            xlabel = "Poverty (%): "

        } else if (chosenXAxis === "income") {
            xlabel = "Median Income: ";
        } else {
            xlabel = "Age: ";
        }

        if (chosenYAxis === "healthcare") {
            ylabel = "Lacks Healthcare (%): ";
        } else if (chosenYAxis === "obesity") {
            ylabel = "Obesity (%): ";
        } else {
            ylabel = "Smokers (%): ";
        }


        var toolTip = d3.tip()
            .attr("class", "tooltip")
            .attr("border", "black")
            .style("opacity", .80)
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "3px")
            .style("padding", "10px")
            .offset([50, 90])
            .html(function(d) {
                return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
                toolTip.show(data);
            })
            // onmouseout event
            .on("mouseout", function(data, index) {
                toolTip.hide(data);
            });

        return circlesGroup;
    }

    // Retrieve data from the CSV file and execute everything below
    (async function() {
        var censusData = await d3.csv("assets/data/data.csv").catch(err => console.log(err))

        // parse data
        censusData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.income = +data.income;
            data.age = +data.age;
            data.obesity = +data.obesity;
            data.smokes = +data.smokes;
        });

        // LinearScale function above csv import
        var xLinearScale = xScale(censusData, chosenXAxis);
        var yLinearScale = yScale(censusData, chosenYAxis);



        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x and y axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);



        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(censusData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r", 15)
            .attr("fill", "aqua")
            .attr("stroke", "black")
            .attr("opacity", ".75");

        var circleLabels = chartGroup.selectAll(null)
            .data(censusData)
            .enter()
            .append("text");

        circleLabels
            .attr("x", function(d) {
                return xLinearScale(d[chosenXAxis]);
            })
            .attr("y", function(d) {
                return yLinearScale(d[chosenYAxis]);
            })
            .text(function(d) {
                return d.abbr;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .attr("fill", "black");

        // Create group for  x-axis labels
        var xlabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 10})`);

        var povertyLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .text("% in Poverty");

        var incomeLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "income") // value to grab for event listener
            .classed("inactive", true)
            // .style("font-weight", "lighter")
            .style("color", "grey")
            .text("Income (Median)");

        var ageLabel = xlabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "age") // value to grab for event listener
            .classed("inactive", true)
            // .style("font-weight", "lighter")
            .text("Age (Median)");



        // // Create group for  y-axis labels

        var ylabelsGroup = chartGroup.append("g")
            .attr("transform", `translate (${0 - margin.left/4}, ${chartHeight / 2})`);

        var healthcareLabel = ylabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 0 - 20)
            .attr("transform", "rotate(-90)")
            .classed("active", true)
            .attr("dy", "1em")
            .attr("value", "healthcare") // value to grab for event listener
            .text("Lacks Healthcare (%)");

        var obesityLabel = ylabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 0 - 40)
            .attr("transform", "rotate(-90)")
            .classed("inactive", true)
            // .style("font-weight", "lighter")
            .attr("dy", "1em")
            .attr("value", "obesity") // value to grab for event listener
            .text("Obese (%)");

        var smokesLabel = ylabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 0 - 60)
            .attr("transform", "rotate(-90)")
            // .style("font-weight", "lighter")
            .classed("inactive", true)
            .attr("dy", "1em")
            .attr("value", "smokes") // value to grab for event listener
            .text("Smoker (%)");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


        // x axis labels event listener
        xlabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenXAxis) {

                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    // console.log(chosenXAxis)

                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(censusData, chosenXAxis);

                    // updates x axis with transition
                    xAxis = renderXAxis(xLinearScale, xAxis);


                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circleLabels = renderText(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    // changes classes to change bold text
                    if (chosenXAxis === "income") {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);

                    } else if (chosenXAxis === "age") {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);

                    } else {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);

                    }
                }
            });

        ylabelsGroup.selectAll("text")
            .on("click", function() {
                // get value of selection
                var value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {

                    // replaces chosenYAxis with value
                    chosenYAxis = value;

                    // console.log(chosenYAxis)

                    // functions here found above csv import
                    // updates y scale for new data
                    yLinearScale = yScale(censusData, chosenYAxis);

                    // updates y axis with transition
                    yAxis = renderYAxis(yLinearScale, yAxis);

                    // updates circles with new y values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                    circleLabels = renderText(circleLabels, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    // changes classes to change bold text
                    if (chosenYAxis === "obesity") {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenYAxis === "smokes") {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    } else {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                }
            });
    })()
}
makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);