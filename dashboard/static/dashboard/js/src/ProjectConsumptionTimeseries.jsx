var React = require('react');
var ReactDOM = require('react-dom');
var projectConsumptionTimeseries = require('./projectConsumptionTimeseries');

var ProjectConsumptionTimeseries = React.createClass({
  propTypes: {
    data: React.PropTypes.object,
    domain: React.PropTypes.object,
    height: React.PropTypes.number,
  },

  componentDidMount: function() {
    var el = ReactDOM.findDOMNode(this);

    projectConsumptionTimeseries.create(el, {
      height: this.props.height,
    }, this.getChartState());
  },

  componentDidUpdate: function() {
    var el = ReactDOM.findDOMNode(this);
    projectConsumptionTimeseries.update(el, this.getChartState());
  },

  getChartState: function() {
    return {
      data: this.props.data,
      domain: this.props.domain,
    };
  },

  componentWillUnmount: function() {
    var el = ReactDOM.findDOMNode(this);
    projectConsumptionTimeseries.destroy(el);
  },

  render: function() {
    return (
      <div className="projectConsumptionTimeseries"></div>
    );
  }
});

module.exports = ProjectConsumptionTimeseries;
