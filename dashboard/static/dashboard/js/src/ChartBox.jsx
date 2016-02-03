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

  getPredictedSavings: function(projectData, props) {
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
    if (props.fuelType == "E" || props.fuelType == "BOTH") {
      if (predictedElectricitySavings != null) {
        if (props.energyUnit == "KWH") {
          predictedSavings = predictedElectricitySavings;
        } else if (props.energyUnit == "THERM") {
          predictedSavings = predictedElectricitySavings * 0.03413;
        }
      }
    }

    if (props.fuelType == "NG" || props.fuelType == "BOTH") {
      if (predictedNaturalGasSavings != null) {
        if (predictedSavings != null) {
          if (props.energyUnit == "KWH") {
            predictedSavings += predictedNaturalGasSavings * 29.3001;
          } else if (props.energyUnit == "THERM") {
            predictedSavings += predictedNaturalGasSavings;
          }
        } else {
          if (props.energyUnit == "KWH") {
            predictedSavings = predictedNaturalGasSavings * 29.3001;
          } else if (props.energyUnit == "THERM") {
            predictedSavings = predictedNaturalGasSavings;
          }
        }
      }
    }

    return predictedSavings;
  },

  getActualSavings: function(projectData, props) {

    var actualElectricitySavings = _.result(_.find(
      projectData.recent_meter_runs,
      { 'fuel_type': 'E'}
    ), 'annual_savings');

    var actualNaturalGasSavings = _.result(_.find(
      projectData.recent_meter_runs,
      { 'fuel_type': 'NG'}
    ), 'annual_savings');


    var actualSavings = null;
    if (props.fuelType == "E" || props.fuelType == "BOTH") {
      if (actualElectricitySavings != null) {
        if (props.energyUnit == "KWH") {
          actualSavings = actualElectricitySavings;
        } else if (props.energyUnit == "THERM") {
          actualSavings = actualElectricitySavings * 0.03413;
        }
      }
    }

    if (props.fuelType == "NG" || props.fuelType == "BOTH") {
      if (actualNaturalGasSavings != null) {
        if (actualSavings != null) {
          if (props.energyUnit == "KWH") {
            actualSavings += actualNaturalGasSavings * 29.3001;
          } else if (props.energyUnit == "THERM") {
            actualSavings += actualNaturalGasSavings;
          }
        } else {
          if (props.energyUnit == "KWH") {
            actualSavings = actualNaturalGasSavings * 29.3001;
          } else if (props.energyUnit == "THERM") {
            actualSavings = actualNaturalGasSavings;
          }
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
        this.setState({
          scatterplotRawData:data
        }, this.computeScatterplotData(this.props));
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(projectListURL, status, err.toString());
      }.bind(this)
    });
  },
  computeScatterplotData: function(props) {
    return function () {
      var projectData = this.state.scatterplotRawData.map(function(d, i) {
        var predictedSavings = this.getPredictedSavings(d, props);
        var actualSavings = this.getActualSavings(d, props);

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

      projectData = _.compact(projectData);

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

      // add buffer if necessary
      domain.x[0] = Math.min(domain.x[0], 0);
      domain.y[0] = Math.min(domain.y[0], 0);

      this.setState({
        scatterplotData: {
          data: projectData,
          domain: domain,
        }
      });
    }.bind(this);
  },
  getInitialState: function() {
    return {
      projectAttributeKeys: [],
      scatterplotRawData: [],
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
  componentWillUpdate: function(nextProps, nextState) {
    if (nextProps.fuelType != this.props.fuelType || nextProps.energyUnit != this.props.energyUnit) {
      this.computeScatterplotData(nextProps)();
    }
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
          fuelType={this.props.fuelType}
          energyUnit={this.props.energyUnit}
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
