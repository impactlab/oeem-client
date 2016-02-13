var projectConsumptionTimeseries = {};

projectConsumptionTimeseries.create = function(el, props, state) {

  this._w = $(el).parent().width();
  this._h = props.height;

  var shape = this._shape();

  var svg = d3.select(el).append('svg')
      .attr('class', 'projectConsumptionTimeseries')
      .attr('width', shape.w)
      .attr('height', shape.h);

  var g = svg.append('g')
      .attr('class', 'timeseries-data')
      .attr("transform", "translate(" + shape.margin.left + "," + shape.margin.top + ")");

  svg.append("text")
      .attr("class", "title")
      .attr("x", (shape.width / 2))
      .attr("y", (shape.margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Project Consumption");

  this._initAxis(el, state.domain);
  this.update(el, state);
};

projectConsumptionTimeseries.update = function(el, state) {
  var scales = this._scales(state.domain);
  this._updateAxis(el, state.domain);
  this._drawData(el, scales, state.data);
};

projectConsumptionTimeseries.destroy = function(el) {
};


/* SHAPE */

projectConsumptionTimeseries._margin = {top: 30, right: 40, bottom: 20, left: 40};
projectConsumptionTimeseries._w = null;
projectConsumptionTimeseries._h = null;
projectConsumptionTimeseries._width = function() {
  return this._w - this._margin.left - this._margin.right;
};
projectConsumptionTimeseries._height = function() {
  return this._h - this._margin.top - this._margin.bottom;
};

projectConsumptionTimeseries._shape = function() {
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

projectConsumptionTimeseries._scales = function(domain) {

  if (!domain) {
    return null;
  }

  return {
    x: d3.time.scale().range([0, this._width()]).domain(domain.x),
    y: d3.scale.linear().range([this._height(), 0]).domain(domain.y),
  }

};

/* DRAWING */
projectConsumptionTimeseries._initAxis = function(el, domain) {

  var scales = this._scales(domain);
  var shape = this._shape();

  var xAxis = d3.svg.axis()
      .scale(scales.x)
      .tickFormat(d3.time.format("%Y-%m"))
      .orient("bottom")
      .innerTickSize(-shape.height)
      .outerTickSize(0)
      .tickPadding(10);

  var yAxisElectricity = d3.svg.axis()
      .scale(scales.y)
      .orient("left")
      .innerTickSize(-shape.width)
      .outerTickSize(0)
      .tickPadding(10);

  var yAxisNaturalGas = d3.svg.axis()
      .scale(scales.y)
      .orient("right");

  var g = d3.select(el).selectAll('.timeseries-data');

  g.append("g")
      .attr("class", "y axis electricity")
      .call(yAxisElectricity);

  g.append("g")
      .attr("class", "y axis naturalGas")
      .attr("transform", "translate(" + shape.width + " ,0)")
      .call(yAxisNaturalGas);

  g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + shape.height + ")")
      .call(xAxis);

  g.append("text")
      .attr("class", "y axis label electricity")
      .attr("transform", "translate(12,0) rotate(-90)")
      .style("text-anchor", "end")
      .text("kWh");

  g.append("text")
      .attr("class", "y axis label naturalGas")
      .attr("transform", "translate(" + (shape.width - 5) + ",0) rotate(-90)")
      .style("text-anchor", "end")
      .text("therms");
}

projectConsumptionTimeseries._updateAxis = function(el, domain) {

  var scales = this._scales(domain);
  var shape = this._shape();

  var xAxis = d3.svg.axis()
      .scale(scales.x)
      .tickFormat(d3.time.format("%Y-%m"))
      .orient("bottom")
      .innerTickSize(-shape.height)
      .outerTickSize(0)
      .tickPadding(10);

  var yAxisElectricity = d3.svg.axis()
      .scale(scales.y)
      .orient("left")
      .innerTickSize(-shape.width)
      .outerTickSize(0)
      .tickPadding(10);

  var floatFormat
  var yAxisNaturalGas = d3.svg.axis()
      .scale(scales.y)
      .tickFormat(function(d) { return d3.round(d * 0.0341296)})
      .orient("right");

  d3.select(el).selectAll('.y.axis.electricity')
      .call(yAxisElectricity);

  d3.select(el).selectAll('.y.axis.naturalGas')
      .call(yAxisNaturalGas);

  d3.select(el).selectAll('.x.axis')
      .call(xAxis);

}

projectConsumptionTimeseries._drawData = function(el, scales, data) {

  var shape = this._shape()

  var electricityLine = d3.svg.line()
      .interpolate("step-after")
      .x(function(d) { return scales.x(d.start); })
      .y(function(d) { return scales.y(d.value); });

  var naturalGasLine = d3.svg.line()
      .interpolate("step-after")
      .x(function(d) { return scales.x(d.start); })
      .y(function(d) { return scales.y(d.value); });

  var g = d3.select(el).selectAll('.timeseries-data');

  g.selectAll('path.line').remove();

  g.append("path")
      .datum(data.electricity)
      .attr("class", "line electricity")
      .attr("d", electricityLine);

  g.append("path")
      .datum(data.naturalGas)
      .attr("class", "line naturalGas")
      .attr("d", naturalGasLine);

}


module.exports = projectConsumptionTimeseries;
