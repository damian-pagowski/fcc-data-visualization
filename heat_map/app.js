// set the dimensions and margins of the graph
const margin = { top: 100, right: 30, bottom: 30, left: 100 },
  width = window.innerWidth - 200 - margin.left - margin.right,
  height = window.innerHeight - 200 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Read the data
var url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(url).then(data => {
  const monthsMap = {
    1: "JANUARY",
    2: "FEBRUARY",
    3: "MARCH",
    4: "APRIL",
    5: "MAY",
    6: "JUNE",
    7: "JULY",
    8: "AUGUST",
    9: "SEPTEMBER",
    10: "OCTOBER",
    11: "NOVEMBER",
    12: "DECEMBER",
  };
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
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Build X scales and axis (MONTHS):
  const y = d3
    .scaleBand()
    .range([height, 0])
    .domain(uniqueMonths)
    .padding(0.01);
  svg.append("g").call(d3.axisLeft(y));

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
  const colorScale = d3
    .scaleThreshold()
    .domain(tresholdValues)
    .range(colors);

  // plot
  svg
    .selectAll()
    .data(data.monthlyVariance)
    .enter()
    .append("rect")
    .attr("x", d => x(d.year))
    .attr("y", d => y(d.month))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", d => colorScale(d.variance + data.baseTemperature));
});
