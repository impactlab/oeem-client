var React = require('react');
var ReactDOM = require('react-dom');
var histogram = require('./histogram');

var Histogram = React.createClass({
  propTypes: {
    data: React.PropTypes.array,
    domain: React.PropTypes.object,
    fuelType: React.PropTypes.string,
    energyUnit: React.PropTypes.string,
    height: React.PropTypes.number,
  },

  componentDidMount: function() {
    var el = ReactDOM.findDOMNode(this);

    histogram.create(el, {
      height: this.props.height,
    }, this.getChartState());
  },

  componentDidUpdate: function() {
    var el = ReactDOM.findDOMNode(this);
    histogram.update(el, this.getChartState());
  },

  getChartState: function() {
    return {
      data: this.props.data,
      domain: this.props.domain,
      fuelType: this.props.fuelType,
      energyUnit: this.props.energyUnit,
    };
  },

  componentWillUnmount: function() {
    var el = ReactDOM.findDOMNode(this);
    histogram.destroy(el);
  },

  render: function() {
    return (
      <div className="histogram"></div>
    );
  }
});

module.exports = Histogram;
