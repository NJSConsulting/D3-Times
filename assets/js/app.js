

function makeResponsive() {

    var svgArea = d3.select("body").select("svg");

    if (!svgArea.empty()) {
      svgArea.remove();
    }

    

    var svgWidth =  d3
    .select("#scatter")
    .node()
    .getBoundingClientRect()
    .width

    var svgHeight =  svgWidth * .75



var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "obesity";
var chosenYaxis = "income";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
 
    // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.9,
      d3.max(data, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;

}


function yScale(data, chosenYaxis) {
 
    // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYaxis]) * 0.8,
      d3.max(data, d => d[chosenYaxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

var radiusscale = d3.scaleLinear()
.domain([430, 1280])    
.range([10, 40]);

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {
 
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderyCircles(circlesGroup, newyScale, chosenYaxis) {
 
    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newyScale(d[chosenYaxis]));
  
    return circlesGroup;
  }

function renderlabels(abbrGroup, newXScale, chosenXaxis) {
   
    abbrGroup.transition()
      .duration(1000)
      .attr("dx", d => newXScale(d[chosenXAxis]));
  
    return abbrGroup;
  }
  function renderylabels(abbrGroup, newyScale, chosenYaxis) {
   
    abbrGroup.transition()
      .duration(1000)
      .attr("dy", d => newyScale(d[chosenYaxis])+5);
  
    return abbrGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(circlesGroup) {

  if (chosenXAxis === "obesity") {
    var label1 = "% Obese: ";
  }
  else {
    var label1 = "% Smokers: ";
  }

  if (chosenYaxis === "age") {
    var label2 = "Mean Age: ";
  }
  else {
    var label2 = "Median Income: ";
  }

  

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label1} ${d[chosenXAxis]}<br>${label2} ${d[chosenYaxis]}`);
    });

  circlesGroup.call(toolTip);



    circlesGroup
        .on("mouseover", toolTip.show)
        .on("mouseout",  toolTip.hide);

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below


d3.csv("/assets/data/data.csv").then(data => {
  
    
  // parse data
  data.forEach( d => {
   

    for (x = 3; x < 18; x++) {
       
       d[Object.keys(d)[x]] = +d[Object.keys(d)[x]]
       
    }
    
  });
 
  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(data, chosenYaxis);
    
  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);




        

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYaxis]))
    .attr("r", d => radiusscale(width))
    .classed("stateCircle", true)
    
    var abbrGroup =  chartGroup.selectAll('#stateText')
    .data(data)
    .enter()
    .append("text")
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d.income)+5)
        .attr("font-size", (width * 0.001) + "em")
        .text(function(d){return d.abbr})
        .classed("stateText", true)




  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(-90, ${height / 2}) rotate(-90)`)
   

  
  
  var AgeLabel = ylabelsGroup.append("text")
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Mean Age")
    .attr("x", 0)
    .attr("y", 20)
  

var IncomeLabel = ylabelsGroup.append("text")
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .text("Average Income")
    .attr("x", 0)
    .attr("y", 40)


  var ObesityLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("% Obese");

  var smokesLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("# smokes");




  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
        abbrGroup = renderlabels(abbrGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          ObesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          ObesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
   
    ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYaxis) {

        // replaces chosenXAxis with value
        chosenYaxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(data, chosenYaxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderyCircles(circlesGroup, yLinearScale, chosenYaxis);
        abbrGroup = renderylabels(abbrGroup, yLinearScale, chosenYaxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(circlesGroup);

        // changes classes to change bold text
        if (chosenYaxis === "age") {
            AgeLabel
            .classed("active", true)
            .classed("inactive", false);
          IncomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
            AgeLabel
            .classed("active", false)
            .classed("inactive", true);
          IncomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});
}


makeResponsive();
d3.select(window).on("resize", makeResponsive);

