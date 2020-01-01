const width = Math.floor(window.innerWidth - 200);
const height = Math.floor(window.innerHeight - 200);
const MARGIN = 25;
const MARGIN_LEFT = 40;

const container = d3
  .select("#barchart")
  .append("svg")
  .attr("width", width + 50)
  .attr("height", height + 50)
  .style("background-color", "pink");

const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json";

d3.json(url)
  .then(data => doThings(data))
  .catch(error => console.log(error));

function addTitle() {
  d3.select("svg")
    .append("text")
    .attr("x", width / 2)
    .attr("y", "30")
    .attr("id", "title")
    .style("font-size", "2rem")
    .text("gdp");
}
function addAxisY(yAxisScale) {
  const yAxis = d3.axisLeft(yAxisScale);
  d3.select("svg")
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", `translate(${MARGIN_LEFT}, 25)`);
}

function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

function addAxisX(xScale) {
  const xAxis = d3.axisBottom().scale(xScale);
  d3.select("svg")
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", `translate(${MARGIN}, ${height + MARGIN})`);
}

function doThings(data) {
  // us-1
  addTitle();

  // us-9
  const dates = data.data.map(item => new Date(item[0]));
  const dateMax = new Date(d3.max(dates));
  const dateMin = new Date(d3.min(dates));

  const xScale = d3
    .scaleTime()
    .domain([dateMin, dateMax])
    .range([0, width]);

  const gdp = data.data.map(item => item[1]);
  const maxGdp = d3.max(gdp);

  const linearScale = d3
    .scaleLinear()
    .domain([0, maxGdp])
    .range([0, height]);

  const scaledGdp = gdp.map(item => linearScale(item));

  const barWidth = width / dates.length;

  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  //   const prettyDates = scaledGdp.map( d => formatDate())
  d3.select("svg")
    .selectAll("rect")
    .data(scaledGdp)
    .enter()
    .append("rect")
    .attr("x", (d, i) => xScale(dates[i]) + MARGIN_LEFT)
    .attr("y", d => height - d + MARGIN)
    .attr("width", barWidth)
    .attr("height", d => d)
    .attr("class", "bar")
    .attr("data-date", (d, i) => data.data[i][0])
    .attr("data-gdp", (d, i) => data.data[i][1])
    .append("title")
    .text((d, i) => `${formatDate(dates[i])} : ${d} USD`)
    .attr("id", "tooltip")
    .attr("data-date", (d, i) => formatDate(dates[i]));

  addAxisX(xScale);
  // Y
  const yAxisScale = d3
    .scaleLinear()
    .domain([0, maxGdp])
    .range([height, 0]);

  addAxisY(yAxisScale);
}
