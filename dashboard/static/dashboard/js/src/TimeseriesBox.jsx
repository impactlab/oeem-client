var Timeseries = require("./Timeseries.jsx");

var TimeseriesBox = React.createClass({
  getInitialState: function() {
    return {
      height: 200,
      timeseriesData: {
        data: [],
        domain: {
          x: [0, 10],
          y: [0, 10],
        },
      }
    }
  },
  render: function() {
    return (
      <Timeseries
        data={this.state.timeseriesData.data}
        domain={this.state.timeseriesData.domain}
        fuelType={this.props.fuelType}
        energyUnit={this.props.energyUnit}
      />
    )
  }
});

module.exports = TimeseriesBox;
