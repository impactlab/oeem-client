var timeseries = {};

timeseries.create = function(el, props, state) {

  this._w = $(el).parent().width();
  this._h = props.height;

  var shape = this._shape();

  var svg = d3.select(el).append('svg')
      .attr('class', 'timeseries')
      .attr('width', shape.w)
      .attr('height', shape.h);

  var g = svg.append('g')
      .attr('class', 'timeseries-plot')
      .attr("transform", "translate(" + shape.margin.left + "," + shape.margin.top + ")");

  var fuelType;
  if (state.fuelType == "E") {
    fuelType = "Electricity";
  } else if (state.fuelType == "NG") {
    fuelType = "Natural Gas";
  } else {
    fuelType = "Combined";
  }

  var energyUnit;
  if (state.energyUnit == "KWH") {
    energyUnit = "kWh";
  } else {
    energyUnit = "therms";
  }

  svg.append("text")
      .attr("class", "title")
      .attr("x", (shape.width / 2))
      .attr("y", (shape.margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Gross Savings - " + fuelType + " (" + energyUnit + "/month)");

  this._initAxis(el, state.domain);

  this.update(el, state);

};

timeseries.update = function(el, state) {
  var scales = this._scales(state.domain);
  this._updateTitle(el, state);
  this._updateAxis(el, state.domain);
  this._drawData(el, scales, state.data);
};

timeseries.destroy = function(el) {
};


timeseries._margin = {top: 30, right: 20, bottom: 20, left: 50};
timeseries._w = null;
timeseries._h = null;
timeseries._width = function() {
  return this._w - this._margin.left - this._margin.right;
};
timeseries._height = function() {
  return this._h - this._margin.top - this._margin.bottom;
};

timeseries._shape = function() {
  var w = this._w;
  var h = this._h;
  var margin = this._margin;
  var width = this._width();
  var height = this._height();
  return {
    h: h, w: w,
    margin: margin,
    height: height,
    width: width
  }
}

timeseries._updateTitle = function(el, state) {

  var fuelType;
  if (state.fuelType == "E") {
    fuelType = "Electricity";
  } else if (state.fuelType == "NG") {
    fuelType = "Natural Gas";
  } else {
    fuelType = "Combined";
  }

  var energyUnit;
  if (state.energyUnit == "KWH") {
    energyUnit = "kWh";
  } else {
    energyUnit = "therms";
  }

  d3.select(el).selectAll('text.title')
      .text("Gross Savings - " + fuelType + " (" + energyUnit + "/month)");
}

timeseries._scales = function(domain) {

  if (!domain) {
    return null;
  }

  var x = d3.time.scale()
    .range([0, this._width()])
    .domain(domain.x);

  var y = d3.scale.linear()
    .range([this._height(), 0])
    .domain(domain.y);

  return {x: x, y: y};
};

timeseries._initAxis = function(el, domain) {

  var scales = this._scales(domain);
  var shape = this._shape();

  var xAxis = d3.svg.axis()
      .scale(scales.x)
      .tickFormat(d3.time.format("%Y-%m"))
      .orient("bottom")
      .innerTickSize(-shape.height)
      .outerTickSize(0)
      .tickPadding(10);

  var yAxis = d3.svg.axis()
      .scale(scales.y)
      .orient("left")
      .innerTickSize(-shape.width)
      .outerTickSize(0)
      .tickPadding(10);

  var g = d3.select(el).selectAll('.timeseries-plot');

  g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + shape.height + ")")
      .call(xAxis);

  g.append("g")
      .attr("class", "y axis")
      .call(yAxis);

}

timeseries._updateAxis = function(el, domain) {

  var scales = this._scales(domain);
  var shape = this._shape();

  var xAxis = d3.svg.axis()
      .scale(scales.x)
      .tickFormat(d3.time.format("%Y-%m"))
      .orient("bottom")
      .innerTickSize(-shape.height)
      .outerTickSize(0)
      .tickPadding(10);

  var yAxis = d3.svg.axis()
      .scale(scales.y)
      .orient("left")
      .innerTickSize(-shape.width)
      .outerTickSize(0)
      .tickPadding(10);

  var g = d3.select(el).selectAll('.x.axis')
      .call(xAxis);

  var g = d3.select(el).selectAll('.y.axis')
      .call(yAxis);
}

timeseries._drawData = function(el, scales, data) {

  var shape = this._shape()

  var baselineLine = d3.svg.line()
      .interpolate("monotone")
      .x(function(d) { return scales.x(d.date); })
      .y(function(d) { return scales.y(d.baseline_sum); });

  var reportingLine = d3.svg.line()
      .interpolate("monotone")
      .x(function(d) { return scales.x(d.date); })
      .y(function(d) { return scales.y(d.reporting_sum); });

  var areaAboveBaselineLine = d3.svg.area()
      .interpolate("monotone")
      .x(baselineLine.x())
      .y0(baselineLine.y())
      .y1(0);
  var areaBelowBaselineLine = d3.svg.area()
      .interpolate("monotone")
      .x(baselineLine.x())
      .y0(baselineLine.y())
      .y1(shape.height);
  var areaAboveReportingLine = d3.svg.area()
      .interpolate("monotone")
      .x(reportingLine.x())
      .y0(reportingLine.y())
      .y1(0);
  var areaBelowReportingLine = d3.svg.area()
      .interpolate("monotone")
      .x(reportingLine.x())
      .y0(reportingLine.y())
      .y1(shape.height);

  var g = d3.select(el).selectAll('.timeseries-plot');

  g.selectAll('defs').remove();
  g.selectAll('path.line').remove();
  g.selectAll('path.area').remove();
  g.selectAll('focus').remove();

  var defs = g.append('defs');

  defs.append('clipPath')
      .attr('id', 'clip-baseline')
      .append('path')
      .datum(data)
      .attr('d', areaAboveBaselineLine);

  defs.append('clipPath')
    .attr('id', 'clip-reporting')
    .append('path')
    .datum(data)
    .attr('d', areaAboveReportingLine);


  g.append("path")
      .datum(data)
      .attr("class", "baseline area")
      .attr("d", areaBelowBaselineLine)
      .attr('clip-path', 'url(#clip-reporting)');

  g.append("path")
      .datum(data)
      .attr("class", "reporting area")
      .attr("d", areaBelowReportingLine)
      .attr('clip-path', 'url(#clip-baseline)');

  g.append("path")
      .datum(data)
      .attr("class", "baseline line")
      .attr("d", baselineLine);

  g.append("path")
      .datum(data)
      .attr("class", "reporting line")
      .attr("d", reportingLine);

  var focus = g.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
      .attr("class", "baseline")
      .attr("r", 4.5);

  focus.append("circle")
      .attr("class", "reporting")
      .attr("r", 4.5);

  focus.append("text")
      .attr("class", "baseline value")
      .style("text-anchor", "end")
      .attr("x", shape.width + 10)
      .attr("y", -20)
      .attr("dy", ".35em")
      .text("");

  focus.append("text")
      .attr("class", "baseline label")
      .style("text-anchor", "end")
      .attr("x", shape.width - 35)
      .attr("y", -20)
      .attr("dy", ".35em")
      .text("Baseline:");

  focus.append("text")
      .attr("class", "reporting value")
      .style("text-anchor", "end")
      .attr("x", shape.width + 10)
      .attr("y", -5)
      .attr("dy", ".35em")
      .text("");

  focus.append("text")
      .attr("class", "reporting label")
      .style("text-anchor", "end")
      .attr("x", shape.width - 35)
      .attr("y", -5)
      .attr("dy", ".35em")
      .text("Reporting:");

  focus.append("text")
      .attr("class", "difference value")
      .style("text-anchor", "end")
      .attr("x", shape.width + 10)
      .attr("y", 10)
      .attr("dy", ".35em")
      .text("");

  focus.append("text")
      .attr("class", "difference label")
      .style("text-anchor", "end")
      .attr("x", shape.width - 35)
      .attr("y", 10)
      .attr("dy", ".35em")
      .text("Savings:");

  focus.append("line")
      .attr("class", "x")
      .style("stroke", "blue")
      .style("stroke-width", "0.7px")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5)
      .attr("y1", 0)
      .attr("y2", shape.height);

  focus.append("line")
      .attr("class", "y baseline")
      .style("stroke", "blue")
      .style("stroke-width", "0.7px")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5)
      .attr("x1", shape.width)
      .attr("x2", shape.width);

  focus.append("line")
      .attr("class", "y reporting")
      .style("stroke", "blue")
      .style("stroke-width", "0.7px")
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.5)
      .attr("x1", shape.width)
      .attr("x2", shape.width);

  g.append("rect")
      .attr("class", "overlay")
      .attr("width", shape.width)
      .attr("height", shape.height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

  var bisectDate = d3.bisector(function(d) { return d.date; }).left;
  var formatFloat = d3.format(",.0f");

  function mousemove() {
    var x0 = scales.x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;

    focus.select("text.baseline.value")
      .text(formatFloat(d.baseline_sum));

    focus.select("text.reporting.value")
      .text(formatFloat(d.reporting_sum));

    focus.select("text.difference.value")
      .text(formatFloat(d.baseline_sum - d.reporting_sum));

    focus.select("circle.baseline")
      .attr("transform", "translate(" + scales.x(d.date) + "," + scales.y(d.baseline_sum) + ")");
    focus.select("circle.reporting")
      .attr("transform", "translate(" + scales.x(d.date) + "," + scales.y(d.reporting_sum) + ")");

    focus.select(".x")
      .attr("transform", "translate(" + scales.x(d.date) + "," + scales.y(d.baseline_sum) + ")")
      .attr("y2", shape.height - scales.y(d.baseline_sum));

    focus.select(".y.baseline")
      .attr("transform", "translate(" + shape.width * -1 + "," + scales.y(d.baseline_sum) + ")")
      .attr("x2", shape.width + shape.width);
    focus.select(".y.reporting")
      .attr("transform", "translate(" + shape.width * -1 + "," + scales.y(d.reporting_sum) + ")")
      .attr("x2", shape.width + shape.width);
  }
}


module.exports = timeseries;
