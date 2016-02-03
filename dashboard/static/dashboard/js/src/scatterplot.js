var scatterplot = {};

scatterplot.create = function(el, props, state) {

  var margin = this._margin;

  var w = this._w(el);
  var h = props.height;
  this._h = h;

  var width = this._width(w, margin);
  var height = this._height(h, margin);

  var svg = d3.select(el).append('svg')
      .attr('class', 'scatterplot')
      .attr('width', w)
      .attr('height', h);

  svg.append('g')
      .attr('class', 'scatterplot-points')
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("text")
    .attr("x", (w / 2))
    .attr("y", (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Predicted vs. Actual Annual Savings");

  this.update(el, state);
};

scatterplot.update = function(el, state) {
  var scales = this._scales(el, state.domain);
  this._drawPoints(el, scales, state.data);
};

scatterplot.destroy = function(el) {
};

scatterplot._margin = {top: 30, right: 20, bottom: 20, left: 20};

scatterplot._w = function(el) {
  return $(el).parent().width();
};
scatterplot._h = null;

scatterplot._width = function(w, margin) {
  return w - margin.left - margin.right;
};

scatterplot._height = function(h, margin) {
  return h - margin.top - margin.left;
};

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

  var min_max = Math.min(scales.x.domain()[1], scales.y.domain()[1]);

  g.append("line")
    .style("stroke", "black")
    .attr("x1", scales.x(0))
    .attr("y1", scales.y(0))
    .attr("x2", scales.x(min_max))
    .attr("y2", scales.y(min_max));

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

scatterplot._scales = function(el, domain) {
  if (!domain) {
    return null;
  }

  var margin = this._margin;

  var w = this._w(el);
  var h = this._h;

  var width = this._width(w, margin);
  var height = this._height(h, margin);

  var x = d3.scale.linear()
    .range([0, width])
    .domain(domain.x);

  var y = d3.scale.linear()
    .range([height, 0])
    .domain(domain.y);

  return {x: x, y: y};
};

module.exports = scatterplot;
