const MARGIN = 100;
const WIDTH = Math.floor(window.innerWidth - 200);
const HEIGHT = Math.floor(window.innerHeight - 200);

function addTitle(title) {
  d3.select("svg")
    .append("text")
    .attr("transform", `translate(0,${MARGIN / 2})`)
    .attr("x", WIDTH / 2)
    .attr("y", "30")
    .attr("id", "title")
    .style("font-size", "2rem")
    .text(title);
}

const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

d3.json(url).then(data => {
  // div for the tooltip
  const tooltip = d3
    .select("#container")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("display", "absolute");

  const svg = d3
    .select("#container")
    .append("svg")
    .attr("width", WIDTH + 100)
    .attr("height", HEIGHT + 100)
    .attr("class", "graph")
    .append("g")
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    .attr("transform", `translate( 80,50)`);

  addTitle("Cyclists Vs Doping");

  data = data.map(d => {
    const timeTokens = d.Time.split(":");
    d.Time = new Date(1970, 0, 1, 0, timeTokens[0], timeTokens[1]);
    return d;
  });

  const xScale = d3
    .scaleLinear()
    .range([0, WIDTH])
    .domain([d3.min(data, d => d.Year), d3.max(data, d => d.Year)]);

  const yScale = d3
    .scaleTime()
    .range([0, HEIGHT])
    .domain(d3.extent(data, d => d.Time));

  const timeFormat = d3.timeFormat("%M:%S");

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("id", "x-axis")
    .attr("transform", "translate(0," + HEIGHT + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", WIDTH)
    .attr("y", 0)
    .text("Year");

  svg
    .append("g")
    .attr("class", "y axis")
    .attr("id", "y-axis")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .text("Best Time");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -160)
    .attr("y", -44)
    .style("font-size", 18)
    .text("Time in Minutes");

  svg
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 6)
    .attr("cx", d => xScale(d.Year))
    .attr("cy", d => yScale(d.Time))
    .attr("data-xvalue", d => d.Year)
    .attr("data-yvalue", d => d.Time.toISOString())
    .attr("class", "dot")
    .style("fill", d => (d.Doping ? "red" : "green"))
    // legend hover on/out
    .on("mouseover", function(d) {
      console.log("hover");
      console.log("x: " + d3.event.pageX + " y: " + d3.event.pageY);
      tooltip
        .style("x", d3.event.pageX + "px")
        .style("y", d3.event.pageY - 28 + "px")
        .style("opacity", 0.9)
        .attr("data-year", d.Year)
        .html(
          `Name: ${d.Name}<br/> Year: ${d.Year}<br/> Time: ${timeFormat(
            d.Time
          )}<br/> Doping: ${d.Doping ? "YES" : "NO"}`
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function(d) {
      tooltip.style("opacity", 0);
    });

  // LEGEND

  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("id", "legend")
    .attr("x", WIDTH - 100)
    .attr("y", 25)
    .attr("height", 100)
    .attr("width", 200);

  legend
    .append("rect")
    .attr("x", WIDTH - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", "red");

  legend
    .append("text")
    .attr("x", WIDTH - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text("Doping");

  legend
    .append("rect")
    .attr("x", WIDTH - 18)
    .attr("y", 30)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", "green");

  legend
    .append("text")
    .attr("x", WIDTH - 24)
    .attr("y", 40)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text("Clean");
});
