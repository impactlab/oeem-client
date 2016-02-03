var scatterplot = {};

scatterplot.create = function(el, props, state) {


  this._w = $(el).parent().width();
  this._h = props.height;

  var shape = this._shape();

  var svg = d3.select(el).append('svg')
      .attr('class', 'scatterplot')
      .attr('width', shape.w)
      .attr('height', shape.h);

  var g = svg.append('g')
      .attr('class', 'scatterplot-points')
      .attr("transform", "translate(" + shape.margin.left + "," + shape.margin.top + ")");

  svg.append("text")
      .attr("x", (shape.w / 2))
      .attr("y", (shape.margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Predicted vs. Actual Annual Savings");

  this._initAxis(el, state.domain);

  this.update(el, state);
};

scatterplot.update = function(el, state) {
  var scales = this._scales(state.domain);
  this._updateAxis(el, state.domain);
  this._drawPoints(el, scales, state.data);
};

scatterplot.destroy = function(el) {
};


/* SHAPE */

scatterplot._margin = {top: 30, right: 20, bottom: 25, left: 55};
scatterplot._w = null;
scatterplot._h = null;
scatterplot._width = function(w, margin) {
  return w - margin.left - margin.right;
};
scatterplot._height = function(h, margin) {
  return h - margin.top - margin.bottom;
};

scatterplot._shape = function() {
  var w = this._w;
  var h = this._h;
  var margin = this._margin;
  var width = this._width(w, margin);
  var height = this._height(h, margin);
  return {
    h: h, w: w,
    margin: margin,
    height: height,
    width: width
  }
}

/* DRAWING */
scatterplot._initAxis = function(el, domain) {

  var scales = this._scales(domain);
  var shape = this._shape();

  var xAxis = d3.svg.axis()
      .scale(scales.x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(scales.y)
      .orient("left");

  var g = d3.select(el).selectAll('.scatterplot-points');

  g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + shape.height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", shape.width)
      .attr("transform", "translate(-10, 0)")
      .attr("y", -6)
      .style("text-anchor", "end")
      .text("Actual");

  g.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,0)")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90) translate(-10,0)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Predicted");

  var min_max = Math.min(scales.x.domain()[1], scales.y.domain()[1]);

  var equivalence_line = g.append("g")
      .attr("class", "equivalence");

  var lineFunction = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");

  var equivalenceLineData = [
    {x: scales.x(0), y: scales.y(0)},
    {x: scales.x(min_max), y: scales.y(min_max)},
  ];

  equivalence_line.append("path")
    .attr("id", "equivalence_path")
    .attr("stroke","black")
    .attr("d", lineFunction(equivalenceLineData));

  equivalence_line.append("text")
      .attr("class", "label")
      .attr("dy", ".71em")
      .attr("transform", "translate(0,5)")
  .append("textPath")
      .style("text-anchor","end")
      .attr("startOffset","96%")
      .attr("xlink:href","#equivalence_path")
      .text("Savings Realized");

  equivalence_line.append("text")
      .attr("class", "label")
      .attr("dy", ".71em")
      .attr("transform", "translate(0,-14)")
  .append("textPath")
      .style("text-anchor","end")
      .attr("startOffset","97%")
      .attr("xlink:href","#equivalence_path")
      .text("Savings Not Realized");

}

scatterplot._updateAxis = function(el, domain) {

  var scales = this._scales(domain);
  var shape = this._shape();

  var xAxis = d3.svg.axis()
      .scale(scales.x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(scales.y)
      .orient("left");

  d3.select(el).selectAll('.x.axis')
      .call(xAxis);

  d3.select(el).selectAll('.y.axis')
      .call(yAxis);

  var min_max = Math.min(scales.x.domain()[1], scales.y.domain()[1]);

  var lineFunction = d3.svg.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .interpolate("linear");

  var equivalenceLineData = [
    {x: scales.x(0), y: scales.y(0)},
    {x: scales.x(min_max), y: scales.y(min_max)},
  ];

  d3.select(el).selectAll("path#equivalence_path")
    .attr("d", lineFunction(equivalenceLineData));
}

scatterplot._drawPoints = function(el, scales, data) {

  var formatFloat = d3.format(",.0f");

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return (
        "<span>Project: " + d.id.substring(0,5) + '...' + "</span><br/>" +
        "<span>Predicted: " + formatFloat(d.y) + "</span><br/>" +
        "<span>Actual: " + formatFloat(d.x) +"</span>"
      );
    });


  var g = d3.select(el).selectAll('.scatterplot-points');

  g.call(tip);

  var point = g.selectAll('.scatterplot-point')
    .data(data, function(d) { return d.id; });

  // ENTER
  point.enter().append('circle')
      .attr('class', 'd3-point');

  // ENTER & UPDATE
  point.attr('cx', function(d) { return scales.x(d.x); })
      .attr('cy', function(d) { return scales.y(d.y); })
      .attr('r', 3.5)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

  // EXIT
  point.exit()
      .remove();
};

scatterplot._scales = function(domain) {

  if (!domain) {
    return null;
  }

  var shape = this._shape();

  scatter_margin = 10;

  var x = d3.scale.linear()
    .range([scatter_margin, shape.width - scatter_margin])
    .domain(domain.x);

  var y = d3.scale.linear()
    .range([shape.height - scatter_margin, scatter_margin])
    .domain(domain.y);

  return {x: x, y: y};
};

module.exports = scatterplot;
