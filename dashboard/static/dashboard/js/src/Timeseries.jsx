var timeseries = require('./timeseries');

var Timeseries = React.createClass({
  propTypes: {
    data: React.PropTypes.object,
    domain: React.PropTypes.object,
    fuelType: React.PropTypes.string,
    energyUnit: React.PropTypes.string,
  },

  componentDidMount: function() {
    var el = ReactDOM.findDOMNode(this);

    timeseries.create(el, {
      height: 200,
    }, this.getChartState());
  },

  componentDidUpdate: function() {
    var el = ReactDOM.findDOMNode(this);
    timeseries.update(el, this.getChartState());
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
    timeseries.destroy(el);
  },

  render: function() {
    return (
      <div className="timeseries"></div>
    );
  }
});

module.exports = Timeseries;
