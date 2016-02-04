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
      .text("Gross Savings - " + fuelType + " (" + energyUnit + ")");

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


timeseries._margin = {top: 30, right: 20, bottom: 20, left: 40};
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
      .text("Gross Savings - " + fuelType + " (" + energyUnit + ")");
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
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(scales.y)
      .orient("left");

  var g = d3.select(el).selectAll('.timeseries-plot');

  g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + shape.height + ")")
      .call(xAxis);

  g.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  // g.selectAll(".x.axis text")
  //   .style("text-anchor", "end")
  //   .attr("transform", function(d) {
  //      return "translate(" + -0.0*this.getBBox().height + "," + 0.0*this.getBBox().height + ")rotate(-20)";
  //  });

}

timeseries._updateAxis = function(el, domain) {

  var scales = this._scales(domain);
  var shape = this._shape();

  var xAxis = d3.svg.axis()
      .scale(scales.x)
      .tickFormat(d3.time.format("%Y-%m"))
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(scales.y)
      .orient("left");

  var g = d3.select(el).selectAll('.x.axis')
      .call(xAxis);

  var g = d3.select(el).selectAll('.y.axis')
      .call(yAxis);
}

timeseries._drawData = function(el, scales, data) {

  var shape = this._shape()

  var formatFloat = d3.format(",.0f");

  var baselineLine = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return scales.x(d.date); })
      .y(function(d) { return scales.y(d.baseline_sum); });

  var reportingLine = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return scales.x(d.date); })
      .y(function(d) { return scales.y(d.reporting_sum); });

  var areaAboveBaselineLine = d3.svg.area()
      .interpolate("basis")
      .x(baselineLine.x())
      .y0(baselineLine.y())
      .y1(0);
  var areaBelowBaselineLine = d3.svg.area()
      .interpolate("basis")
      .x(baselineLine.x())
      .y0(baselineLine.y())
      .y1(shape.height);
  var areaAboveReportingLine = d3.svg.area()
      .interpolate("basis")
      .x(reportingLine.x())
      .y0(reportingLine.y())
      .y1(0);
  var areaBelowReportingLine = d3.svg.area()
      .interpolate("basis")
      .x(reportingLine.x())
      .y0(reportingLine.y())
      .y1(shape.height);

  var g = d3.select(el).selectAll('.timeseries-plot');

  g.selectAll('defs').remove();
  g.selectAll('path.line').remove();

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

}


module.exports = timeseries;
