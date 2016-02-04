var ScatterplotBox = require('./ScatterplotBox.jsx');
var HistogramBox = require('./HistogramBox.jsx');
var TimeseriesBox = require('./TimeseriesBox.jsx');
var Map = require('./Map.jsx');

var ChartBox = React.createClass({
  render: function() {
    var chartComponent;
    if (this.props.chartType == "histogram") {

      chartComponent = (
        <HistogramBox
          projects={this.props.projects}
          fuelType={this.props.fuelType}
          energyUnit={this.props.energyUnit}
          meter_run_list_url={this.props.meter_run_list_url}
        />
      )
    } else if (this.props.chartType == "timeSeries") {
      chartComponent = (
        <TimeseriesBox
          projects={this.props.projects}
          fuelType={this.props.fuelType}
          energyUnit={this.props.energyUnit}
          project_list_url={this.props.project_list_url}
        />
      )
    } else if (this.props.chartType == "scatterPlot") {

      chartComponent = (
        <ScatterplotBox
          projects={this.props.projects}
          fuelType={this.props.fuelType}
          energyUnit={this.props.energyUnit}
          project_attribute_key_list_url={this.props.project_attribute_key_list_url}
          project_list_url={this.props.project_list_url}
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
