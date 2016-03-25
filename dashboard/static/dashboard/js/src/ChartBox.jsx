var React = require('react');
var ScatterplotBox = require('./ScatterplotBox.jsx');
var HistogramBox = require('./HistogramBox.jsx');
var TimeseriesBox = require('./TimeseriesBox.jsx');
var MapBox = require('./MapBox.jsx');

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
          height={300}
        />
      )
    } else if (this.props.chartType == "timeSeries") {
      chartComponent = (
        <TimeseriesBox
          projects={this.props.projects}
          fuelType={this.props.fuelType}
          energyUnit={this.props.energyUnit}
          project_list_url={this.props.project_list_url}
          height={300}
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
          height={300}
        />
      )
    } else if (this.props.chartType == "map") {
      chartComponent = (
        <MapBox
          projects={this.props.projects}
          project_list_url={this.props.project_list_url}
          height={300}
        />
      )
    } else {
      chartComponent = <span>Please Select a Chart</span>
    }

    return (
      <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--8-col">
        {chartComponent}
      </div>
    )
  }
});

module.exports = ChartBox;
