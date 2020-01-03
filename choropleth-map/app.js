// set the dimensions and margins of the graph
const margin = { top: 100, right: 30, bottom: 30, left: 100 },
  width = 1024;
height = 768;

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
  .style("font-size", "1.7rem")
  .attr("transform", `translate(0, -50)`)
  .text("Higher Education in USA");
// description
svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", "0")
  .attr("id", "description")
  .style("font-size", "1.1rem")
  .attr("transform", `translate(0, -10)`)
  .text("Description...");

const urlEducation =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const urlCountryData =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([d3.json(urlEducation), d3.json(urlCountryData)]).then(data => {
  data.forEach(d => console.log(d));
  const education = data[0];
  const country = data[1];
  // legend
  const educationValues = education.map(d => d.bachelorsOrHigher);
  const minValue = d3.min(educationValues);
  const maxValue = d3.max(educationValues);

  const legendWidth = 300;
  const legendPositionX = 500;
  const xScaleLegend = d3
    .scaleLinear()
    .domain([minValue, maxValue])
    .rangeRound([legendPositionX, legendPositionX + legendWidth]);

  const colorNumber = 8;
  const colorRange = d3.range(
    minValue,
    maxValue,
    (maxValue - minValue) / colorNumber
  );
  const colorScale = d3
    .scaleThreshold()
    .domain(colorRange)
    .range(d3.schemeGreens[colorNumber]);

  const legend = svg
    .append("g")
    .attr("class", "key")
    .attr("id", "legend")
    .attr("transform", "translate(15,20)");

  legend
    .selectAll("rect")
    .data(
      colorScale.range().map(function(d) {
        d = colorScale.invertExtent(d);
        if (d[0] == null) d[0] = xScaleLegend.domain()[0];
        if (d[1] == null) d[1] = xScaleLegend.domain()[1];
        return d;
      })
    )
    .enter()
    .append("rect")
    .attr("height", 8)
    .attr("x", function(d) {
      return xScaleLegend(d[0]);
    })
    .attr("width", function(d) {
      return xScaleLegend(d[1]) - xScaleLegend(d[0]);
    })
    .attr("fill", function(d) {
      return colorScale(d[0]);
    });

  legend
    .append("text")
    .attr("class", "caption")
    .attr("x", xScaleLegend.range()[0])
    .attr("y", 0)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold");

  legend
    .call(
      d3
        .axisBottom(xScaleLegend)
        .tickSize(13)
        .tickFormat(function(xScaleLegend) {
          return Math.round(xScaleLegend) + "%";
        })
        .tickValues(colorScale.domain())
    )
    .select(".domain")
    .remove();

  // lookup

  const findMatching = d => education.find(obj => obj.fips == d.id);
  const lookup = {};
  country.objects.counties.geometries.forEach(c => {
    const found = findMatching(c);
    tmp = {};
    tmp.education = found.bachelorsOrHigher;
    tmp.name = found.area_name;
    tmp.state = found.state;
    tmp.color = colorScale(found.bachelorsOrHigher);
    lookup[c.id] = tmp;
  });

  // tip
  const tip = d3
    .tip()
    .attr("class", "d3-tip")
    .attr("id", "tooltip")
    .html(d => {
      tip.attr("data-education", lookup[d.id].education);
      return `${lookup[d.id].name}, ${lookup[d.id].state} : ${
        lookup[d.id].education
      } %`;
    })
    .direction("n")
    .offset([-10, 0]);
  svg.call(tip);

  // plot
  const path = d3.geoPath();
  svg
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(country, country.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("data-fips", d => d.id)
    .attr("data-education", d => lookup[d.id].education)
    .attr("fill", d => lookup[d.id].color)
    .attr("d", path)
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide);
  svg
    .append("path")
    .datum(topojson.mesh(country, country.objects.counties, (a, b) => a !== b))
    .attr("class", "states")
    .attr("fill", "none")
    .attr("d", path);
});
