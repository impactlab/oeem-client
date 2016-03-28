var React = require('react');
var ReactDOM = require('react-dom');
var timeseries = require('./timeseries');
var spinner = require('./spinner')

var Timeseries = React.createClass({
  propTypes: {
    data: React.PropTypes.array,
    domain: React.PropTypes.object,
    fuelType: React.PropTypes.string,
    energyUnit: React.PropTypes.string,
    height: React.PropTypes.number,
  },

  getInitialState: function() {
    return {
      chartCreated: false
    };
  },

  componentDidMount: function() {
    var el = ReactDOM.findDOMNode(this);

    spinner.create(el, 'ts-spinner');
  },

  componentDidUpdate: function() {
    var el = ReactDOM.findDOMNode(this);

    // if there is data
    if(this.props.data.length){

      // create chart if it hasn't been created
      if(!this.state.chartCreated){

        spinner.destroy('ts-spinner');

        timeseries.create(el, {
          height: this.props.height,
        }, this.getChartState());

        this.setState({ chartCreated: true });
      } else{
        // otherwise update chart
        timeseries.update(el, this.getChartState());
      }
    }
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
