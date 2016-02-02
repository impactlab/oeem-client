var Scatterplot = require('./Scatterplot.jsx');
var Histogram = require('./Histogram.jsx');
var Timeseries = require('./Timeseries.jsx');
var Map = require('./Map.jsx');

var ChartBox = React.createClass({
  render: function() {
    var chartComponent;
    if (this.props.chartType == "histogram") {

      chartComponent = (
        <Histogram
          projects={this.props.projects}
          fuelType={this.props.fuelType}
          energyUnit={this.props.energyUnit}
          meter_run_list_url={this.props.meter_run_list_url}
        />
      )
    } else if (this.props.chartType == "timeSeries") {
      chartComponent = (
        <Timeseries
        />
      )
    } else if (this.props.chartType == "scatterPlot") {

      var sampleData = [
        {id: '5fbmzmtc', x: 7, y: 41},
        {id: 's4f8phwm', x: 11, y: 45},
      ];

      var sampleDomain = {
        x: [0, 30],
        y: [0, 100],
      };

      chartComponent = (
        <Scatterplot
          data={sampleData}
          domain={sampleDomain}
        />
      )
    } else if (this.props.chartType == "map") {
      chartComponent = (
        <Map />
      )
    } else {
      chartComponent = <span>Please Select a Chart</span>
    }

    return (
      <div className="chartBox">
        <div className="panel panel-default">
          <div className="panel-body">
            {chartComponent}
          </div>
        </div>
      </div>
    )
  }
});

module.exports = ChartBox;
