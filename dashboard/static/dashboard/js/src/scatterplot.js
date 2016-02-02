var scatterplot = {};

scatterplot.create = function(el, props, state) {
  var svg = d3.select(el).append('svg')
      .attr('class', 'scatterplot')
      .attr('width', props.width)
      .attr('height', props.height);

  svg.append('g')
      .attr('class', 'scatterplot-points');

  this.update(el, state);
};

scatterplot.update = function(el, state) {
  var scales = this._scales(el, state.domain);
  this._drawPoints(el, scales, state.data);
};

scatterplot.destroy = function(el) {
};

scatterplot._drawPoints = function(el, scales, data) {
  var g = d3.select(el).selectAll('.scatterplot-points');

  var point = g.selectAll('.scatterplot-point')
    .data(data, function(d) { return d.id; });

  // ENTER
  point.enter().append('circle')
      .attr('class', 'd3-point');

  // ENTER & UPDATE
  point.attr('cx', function(d) { return scales.x(d.x); })
      .attr('cy', function(d) { return scales.y(d.y); })
      .attr('r', 5);

  // EXIT
  point.exit()
      .remove();
};

scatterplot._scales = function(el, domain) {
  if (!domain) {
    return null;
  }

  var width = el.offsetWidth;
  var height = el.offsetHeight;

  var x = d3.scale.linear()
    .range([0, width])
    .domain(domain.x);

  var y = d3.scale.linear()
    .range([height, 0])
    .domain(domain.y);

  return {x: x, y: y};
};

module.exports = scatterplot;
