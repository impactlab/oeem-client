var histogram = {};

histogram.create = function(el, props, state) {

  this._w = $(el).parent().width();
  this._h = props.height;

  var shape = this._shape();

  var svg = d3.select(el).append('svg')
      .attr('class', 'histogram')
      .attr('width', shape.w)
      .attr('height', shape.h);

  var g = svg.append('g')
      .attr('class', 'histogram-bars')
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
      .text("Histogram of Annual Project Savings - " + fuelType + " (" + energyUnit + " / year)");

  this._initAxis(el, state.domain, state.energyUnit);

  this.update(el, state);
};

histogram.update = function(el, state) {
  var scales = this._scales(state.domain);
  this._updateAxis(el, state.domain, state.energyUnit);
  this._updateTitle(el, state);
  this._drawPoints(el, scales, state.data);
};

histogram.destroy = function(el) {
};


/* SHAPE */

histogram._margin = {top: 30, right: 10, bottom: 40, left: 40};
histogram._w = null;
histogram._h = null;
histogram._width = function() {
  return this._w - this._margin.left - this._margin.right;
};
histogram._height = function() {
  return this._h - this._margin.top - this._margin.bottom;
};
histogram._bins = 15;
histogram._barWidth = function() {
  return (this._width() / this._bins) - 2;
}

histogram._shape = function() {
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

/* DRAWING */
histogram._initAxis = function(el, domain, energyUnit) {

  var scales = this._scales(domain);
  var shape = this._shape();
  var bins = this._bins;

  var formatAxis = d3.format('.2s');
  var tempScale = d3.scale.linear().domain([0, bins]).range(scales.x.domain());
  var tickArray = d3.range(bins + 1).map(tempScale);

  var xAxis = d3.svg.axis()
      .scale(scales.x)
      .tickValues(tickArray)
      .tickFormat(formatAxis)
      .orient("bottom");

  var g = d3.select(el).selectAll('.histogram-bars');

  g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + shape.height + ")")
      .call(xAxis);

  g.selectAll(".x.axis text")
    .attr("transform", function(d) {
       return "translate(" + -1 * this.getBBox().height + "," + 0.5*this.getBBox().height + ")rotate(-30)";
   });
}

histogram._updateTitle = function(el, state) {

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
      .text("Histogram of Annual Project Savings - " + fuelType + " (" + energyUnit + " / year)");
}

histogram._updateAxis = function(el, domain, energyUnit) {

  var scales = this._scales(domain);
  var shape = this._shape();
  var bins = this._bins;

  var formatAxis = d3.format('.2s');
  var tempScale = d3.scale.linear().domain([0, bins]).range(scales.x.domain());
  var tickArray = d3.range(bins + 1).map(tempScale);

  var xAxis = d3.svg.axis()
      .scale(scales.x)
      .tickValues(tickArray)
      .tickFormat(formatAxis)
      .orient("bottom");

  d3.select(el).selectAll('.x.axis')
      .call(xAxis);

  d3.select(el).selectAll(".x.axis text")
    .attr("transform", function(d) {
       return "translate(" + -1 * this.getBBox().height + "," + 0.5*this.getBBox().height + ")rotate(-30)";
   });
}

histogram._drawPoints = function(el, scales, data) {

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<span>" + d.y + " projects</span>";
    });

  var g = d3.select(el).selectAll('.histogram-bars');

  g.call(tip);

  var bar = g.selectAll(".bar")
      .data(data, function(d) { return d.x; });

  bar.enter().append("g")
      .attr("class", "bar");

  bar.append("rect")
      .attr("x", 1)
      .attr("transform", function(d) { return "translate(" + scales.x(d.x) + "," + scales.y(d.y) + ")"; })
      .attr("width", this._barWidth())
      .attr("height", function(d) { return this._height() - scales.y(d.y); }.bind(this))
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  bar.exit()
      .remove()

};

histogram._scales = function(domain) {

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

module.exports = histogram;
