// set the dimensions and margins of the graph
const margin = { top: 100, right: 30, bottom: 30, left: 100 },
  width = window.innerWidth - 200 - margin.left - margin.right,
  height = window.innerHeight - 200 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
  .select("#container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
// title
svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", "0")
  .attr("id", "title")
  .style("font-size", "2rem")
  .attr("transform", `translate(-30, -50)`)
  .text("Temperature");
// desc
svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", 30)
  .attr("id", "description")
  .style("font-size", "1.5rem")
  .attr("transform", `translate(-130, -50)`)
  .text("Years: 1753-2015, base temp 8.66 deg C");

// colors for heatmap
const colors = [
  "#b7f6ff",
  "#29e4ff",
  "#00e1fb",
  "#0fffc6",
  "#3bffa4",
  "#68ff82",
  "#c0ff3e",
  "#edff1c",
  "#fff400",
  "#ffc700",
  "#ff9b00",
  "#ff6e00",
  "#ff1500",
  "#e80000",
];
// read data
const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";
d3.json(url).then(data => {
  // month -1 to pass tests
  data.monthlyVariance.forEach(element => {
    element.month -= 1;
  });
  const uniqueYears = [...new Set(data.monthlyVariance.map(item => item.year))];
  const uniqueMonths = [
    ...new Set(data.monthlyVariance.map(item => item.month)),
  ];
  // Build X scales and axis (YEARS):
  const x = d3
    .scaleBand()
    .range([0, width])
    .domain(uniqueYears)
    .padding(0.01);

  // tics
  const yearFormat = year => {
    const date = new Date(0);
    date.setUTCFullYear(year);
    return d3.timeFormat("%Y")(date);
  };
  const xAxis = d3
    .axisBottom(x)
    // tick every 10 years to save space
    .tickValues(x.domain().filter(year => year % 10 === 0))
    .tickFormat(yearFormat);

  //  add X axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .attr("id", "x-axis");

  // Build Y scales and axis (MONTHS):

  const y = d3
    .scaleBand()
    .range([height, 0])
    .domain(uniqueMonths)
    .padding(0.01);

  // ticks format

  const monthFormat = month => {
    const date = new Date(0);
    date.setUTCMonth(month);
    return d3.timeFormat("%B")(date);
  };
  const yAxis = d3
    .axisLeft(y)
    .tickValues(y.domain())
    .tickFormat(monthFormat);

  // add axis
  svg
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis");

  // Build color scale
  const tempMin = d3.min(
    data.monthlyVariance.map(d => data.baseTemperature + d.variance)
  );
  const tempMax = d3.max(
    data.monthlyVariance.map(d => data.baseTemperature + d.variance)
  );

  const tresholdValues = [];
  for (let i = tempMin; i < tempMax; i++) {
    const value = Math.ceil(i);
    tresholdValues.push(value);
  }
  const colorScale = d3
    .scaleThreshold()
    .domain(tresholdValues)
    .range(colors);
  // tip
  const tip = d3
    .tip()
    .attr("class", "d3-tip")
    .attr("id", "tooltip")
    .html(d => {
      const date = new Date(d.year, d.month);
      const str =
        "<span class='date'>" +
        d3.timeFormat("%Y - %B")(date) +
        "</span>" +
        "<br />" +
        "<span class='temperature'>" +
        d3.format(".1f")(data.baseTemperature + d.variance) +
        "&#8451;" +
        "</span>" +
        "<br />" +
        "<span class='variance'>" +
        d3.format("+.1f")(d.variance) +
        "&#8451;" +
        "</span>";
      tip.attr("data-year", d.year);
      return str;
    })
    .direction("n")
    .offset([-10, 0]);
  svg.call(tip);

  // plot heat map
  svg
    .selectAll()
    .data(data.monthlyVariance)
    .enter()
    .append("rect")
    // attributes to pass tests
    .attr("class", "cell")
    .attr("data-month", d => d.month)
    .attr("data-year", d => d.year)
    .attr("data-temp", d => data.baseTemperature + d.variance)
    // end of attributes for tests
    .attr("x", d => x(d.year))
    .attr("y", d => y(d.month))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", d => colorScale(d.variance + data.baseTemperature))
    // tip
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);

  // LEGEND 2

  const legendColors = colors;
  const legendWidth = 400;
  const legendHeight = 300 / legendColors.length;

  const legendThreshold = colorScale;

  const legendX = d3
    .scaleLinear()
    .domain([tempMin, tempMax])
    .range([0, legendWidth]);

  const legendXAxis = d3
    .axisBottom(legendX)
    .tickSize(10, 0)
    .tickValues(legendThreshold.domain())
    .tickFormat(d3.format(".1f"));

  const legend = d3
    .select("#container")
    .append("g")
    .classed("legend", true)
    .attr("id", "legend")
    .attr("width", 600)
    .attr("height", 200)
    .attr("transform", `translate(200, 100)`);

  legend
    .append("g")
    .selectAll("rect")
    .data(
      legendThreshold.range().map(color => {
        const d = legendThreshold.invertExtent(color);
        if (d[0] == null) d[0] = legendX.domain()[0];
        if (d[1] == null) d[1] = legendX.domain()[1];
        return d;
      })
    )
    .enter()
    .append("rect")
    .style("fill", d => legendThreshold(d[0]))
    .attr({
      x: d => (d, i) => i * 20,
      y: 0,
      width: 20,
      height: 20,
    });

  legend
    .append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendXAxis);
});
