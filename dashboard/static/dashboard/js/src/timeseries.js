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
  // var scales = this._scales(state.domain);
  this._updateTitle(el, state);
};

timeseries.destroy = function(el) {
};


timeseries._margin = {top: 30, right: 10, bottom: 40, left: 40};
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

  var x = d3.scale.linear()
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

}

module.exports = timeseries;
