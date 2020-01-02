const LEFT_MARGIN = 50;
const WIDTH = Math.floor(window.innerWidth - 200);
const HEIGHT = Math.floor(window.innerHeight - 200);

const tooltip = d3
  .select("#barchart")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

function showToolTip(year, value, data, x, y) {
  x = Math.floor(x);
  y = Math.floor(y);
  tooltip
    .html(
      year +
        "<br>" +
        "$" +
        value.toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,") +
        " Billion"
    )
    .attr("data-date", data)
    .style("opacity", 1)
    .style("left", x + "px")
    .style("top", y + "px");
}

const container = d3
  .select("#barchart")
  .append("svg")
  .attr("width", WIDTH + 100)
  .attr("height", HEIGHT + 60);

function addTitle() {
  d3.select("svg")
    .append("text")
    .attr("x", WIDTH / 2)
    .attr("y", "30")
    .attr("id", "title")
    .style("font-size", "2rem")
    .text("gdp");
}

d3.json(
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json"
)
  .then(data => {
    addTitle();
    const barWidth = WIDTH / data.data.length;
    const years = formatDates(data);

    const yearsDate = data.data.map(item => new Date(item[0]));

    const xMax = new Date(d3.max(yearsDate));

    const xScale = d3
      .scaleTime()
      .domain([d3.min(yearsDate), xMax])
      .range([0, WIDTH]);

    addAxisX(xScale);

    const GDP = data.data.map(item => item[1]);
    const scaledGDP = calculateScaledGdp(GDP);
    addAxisY(GDP);

    d3.select("svg")
      .selectAll("rect")
      .data(scaledGDP)
      .enter()
      .append("rect")
      .attr("data-date", (d, i) => data.data[i][0])
      .attr("data-gdp", (d, i) => data.data[i][1])
      .attr("class", "bar")
      .attr("x", (d, i) => xScale(yearsDate[i]))
      .attr("y", d => HEIGHT - d)
      .attr("width", barWidth)
      .attr("height", d => d)
      .attr("class", "bar")
      .attr("transform", "translate(60, 0)")
      .on("mouseover", (d, i) =>
        showToolTip(years[i], GDP[i], data.data[i][0], i * barWidth, HEIGHT - d)
      )
      .on("mouseout", d => tooltip.style("opacity", 0));
  })
  .catch(error => console.log(error));

function calculateScaledGdp(GDP) {
  const gdpMax = d3.max(GDP);
  const linearScale = d3
    .scaleLinear()
    .domain([0, gdpMax])
    .range([0, HEIGHT]);
  const scaledGDP = GDP.map(item => linearScale(item));
  return scaledGDP;
}

function addAxisX(xScale) {
  const xAxis = d3.axisBottom().scale(xScale);
  container
    .append("g")
    .call(xAxis)
    .attr("id", "x-axis")
    .attr("transform", `translate(${60}, ${HEIGHT})`);
}

function addAxisY(GDP) {
  const gdpMax = d3.max(GDP);

  const yAxisScale = d3
    .scaleLinear()
    .domain([0, gdpMax])
    .range([HEIGHT, 0]);
  const yAxis = d3.axisLeft(yAxisScale);
  container
    .append("g")
    .call(yAxis)
    .attr("id", "y-axis")
    .attr("transform", "translate(60, 0)");
}

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

function formatDates(data) {
  return data.data.map(item => {
    const monthNum = item[0].substring(5, 7) - 1;
    return months[monthNum] + " " + item[0].substring(0, 4);
  });
}
