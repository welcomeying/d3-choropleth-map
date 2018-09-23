 // Get data
var EDUCATION_FILE = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
var COUNTY_FILE = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

d3.queue().
defer(d3.json, COUNTY_FILE).
defer(d3.json, EDUCATION_FILE).
await(ready);

function ready(error, county, education) {
  if (error) throw error;
  var path = d3.geoPath();

  // color constant
  var color = d3.scaleThreshold().
  domain([0, 10, 20, 30, 40, 50, 60, 70, 80]).
  range(["#e9f4fc", "#d3eaf8", "#a7d5f1", "#7bbfea", "#4faae3", "#2295dd", "#1c77b0", "#155a84", "#0e3c58"]);

  // Set the dimensions of the canvas / graph
  var w = 1000;
  var h = 500;
  var margin = 150;

  var xScale = d3.scaleLinear().
  domain([0, 60]).
  rangeRound([600, 780]);

  var svg = d3.select("body").
  append("svg").
  attr("width", w + margin * 2).
  attr("height", h + margin * 2).
  append("g").
  attr("transform", "translate(" + margin + "," + margin + ")");

  // Add title and description
  svg.append("text").
  attr("id", "title").
  attr("x", w / 2).
  attr("text-anchor", "middle").
  attr("y", -60).
  text("United States Educational Attainment").
  style("font-size", "45px");

  svg.append("text").
  attr("id", "description").
  attr("x", w / 2).
  attr("text-anchor", "middle").
  attr("y", -25).
  html("Percentage of adult age 25 and older with a bachelor's degree or higher (2010-2014)").
  style("font-size", "18px");

  // Add legend
  var g = svg.append("g").
  attr("class", "key");

  g.call(d3.axisBottom(xScale).
  tickSize(13).
  tickFormat(function (x, i) {return x + "%";}).
  tickValues(color.domain())).
  select(".domain").
  remove();

  var legend = g.selectAll(".legend").
  data(color.range()).
  enter().append("g").
  attr("id", "legend");

  legend.append("rect").
  attr("x", function (d, i) {return xScale(i * 10);}).
  attr("y", -10).
  attr("width", 30).
  attr("height", 20).
  style("fill", function (d, i) {return d;});

  // Define tooltip
  var tooltip = d3.select("body").
  append("div").
  style("visibility", "hidden").
  attr("id", "tooltip");

  // Add map and tooltip
  svg.append("g").
  selectAll("path").
  data(topojson.feature(county, county.objects.counties).features).
  enter().append("path").
  attr("class", "county").
  attr("d", path).
  attr("data-fips", function (d, i) {return d.id;}).
  attr("data-education", function (d) {
    var result = education.filter(function (obj) {
      return obj.fips == d.id;
    });
    return result[0].bachelorsOrHigher;
  }).
  attr("fill", function (d) {
    var result = education.filter(function (obj) {
      return obj.fips == d.id;
    });
    return color(result[0].bachelorsOrHigher);
  }).
  on("mouseover", function (d) {
    tooltip.style("visibility", "visible").
    attr("data-education", d3.select(this).attr("data-education")).
    html(function () {
      var result = education.filter(function (obj) {
        return obj.fips == d.id;
      });
      return result[0]['area_name'] + ', ' + result[0]['state'] + ': ' + result[0].bachelorsOrHigher + '%';
    }).
    style("left", d3.event.pageX + 10 + "px").
    style("top", d3.event.pageY + "px");}).
  on("mouseout", function () {return tooltip.style("visibility", "hidden");});

  // Add state limits
  svg.append("path").
  datum(topojson.mesh(county, county.objects.states, function (a, b) {return a !== b;})).
  attr("class", "states").
  attr("d", path);

}