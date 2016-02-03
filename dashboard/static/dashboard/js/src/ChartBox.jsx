var Scatterplot = require('./Scatterplot.jsx');
var Histogram = require('./Histogram.jsx');
var Timeseries = require('./Timeseries.jsx');
var Map = require('./Map.jsx');

var _ = require('lodash');

var ChartBox = React.createClass({
  getProjectAttributeKeys: function() {
    var projectAttributeKeyListURL = this.props.project_attribute_key_list_url;

    $.ajax({
      url: projectAttributeKeyListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({
          projectAttributeKeys: data
        }, this.getProjectAttributes);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(projectAttributeKeyListURL, status, err.toString());
      }.bind(this)
    });
  },

  getPredictedSavings: function(projectData) {
    var predictedElectricitySavingsKeyID = null;
    var predictedNaturalGasSavingsKeyID = null;
    this.state.projectAttributeKeys.forEach(function(d, i) {
      if (d.name == "predicted_electricity_savings") {
        predictedElectricitySavingsKeyID = d.id;
      } else if (d.name == "predicted_natural_gas_savings") {
        predictedNaturalGasSavingsKeyID = d.id;
      }
    });

    var predictedElectricitySavings = _.result(_.find(
      projectData.attributes,
      { 'key': predictedElectricitySavingsKeyID }
    ), 'value');

    var predictedNaturalGasSavings = _.result(_.find(
      projectData.attributes,
      { 'key': predictedNaturalGasSavingsKeyID }
    ), 'value');

    var predictedSavings = null;
    if (this.props.fuelType == "E" || this.props.fuelType == "BOTH") {
      if (predictedElectricitySavings != null) {
        predictedSavings = predictedElectricitySavings;
      }
    }

    if (this.props.fuelType == "NG" || this.props.fuelType == "BOTH") {
      if (predictedNaturalGasSavings != null) {
        if (predictedSavings != null) {
          predictedSavings += predictedNaturalGasSavings;
        } else {
          predictedSavings = predictedNaturalGasSavings;
        }
      }
    }

    return predictedSavings;
  },

  getActualSavings: function(projectData) {

    var actualElectricitySavings = _.result(_.find(
      projectData.recent_meter_runs,
      { 'fuel_type': 'E'}
    ), 'annual_savings');

    var actualNaturalGasSavings = _.result(_.find(
      projectData.attributes,
      { 'fuel_type': 'NG'}
    ), 'annual_savings');


    var actualSavings = null;
    if (this.props.fuelType == "E" || this.props.fuelType == "BOTH") {
      if (actualElectricitySavings != null) {
        actualSavings = actualElectricitySavings;
      }
    }

    if (this.props.fuelType == "NG" || this.props.fuelType == "BOTH") {
      if (actualNaturalGasSavings != null) {
        if (actualSavings != null) {
          actualSavings += actualNaturalGasSavings;
        } else {
          actualSavings = actualNaturalGasSavings;
        }
      }
    }

    return actualSavings;
  },

  getProjectAttributes: function() {
    var projectListURL = this.props.project_list_url +
      "?with_attributes=True&with_meter_runs=True";

    if (this.props.projects.length > 0) {
      meterRunListURL += "&projects=" + this.props.projects.map(function(d, i){
        return d.id;
      }).join("+");
    }

    $.ajax({
      url: projectListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        var projectData = data.map(function(d, i) {
          var predictedSavings = this.getPredictedSavings(d);
          var actualSavings = this.getActualSavings(d);

          if (predictedSavings != null && actualSavings != null) {
            return {
              id: d.project_id,
              x: actualSavings,
              y: predictedSavings,
            }
          } else {
            return null;
          };
        }, this);

        var domain = {
          x: [
            _.result(_.minBy(projectData, function(o) { return o.x; }), 'x'),
            _.result(_.maxBy(projectData, function(o) { return o.x; }), 'x'),
          ],
          y: [
            _.result(_.minBy(projectData, function(o) { return o.y; }), 'y'),
            _.result(_.maxBy(projectData, function(o) { return o.y; }), 'y'),
          ],
        };
        this.setState({
          scatterplotData: {
            data: projectData,
            domain: domain,
          }
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(projectListURL, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {
      projectAttributeKeys: [],
      scatterplotData: {
        data: [],
        domain: {
          x: [0, 1],
          y: [0, 1],
        },
      }
    }
  },
  componentDidMount: function() {
    this.getProjectAttributeKeys();
  },
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

      chartComponent = (
        <Scatterplot
          data={this.state.scatterplotData.data}
          domain={this.state.scatterplotData.domain}
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
