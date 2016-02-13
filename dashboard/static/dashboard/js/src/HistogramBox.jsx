var React = require('react');
var Histogram = require('./Histogram.jsx');
var ReactSpinner = require('./ReactSpinner.jsx');
var _ = require('lodash');

var HistogramBox = React.createClass({
  loadMeterRuns: function(nextProps) {
    var meterRunListURL = nextProps.meter_run_list_url + "?summary=True";
    meterRunListURL += "&fuel_type=E"
    meterRunListURL += "&fuel_type=NG"

    meterRunListURL += "&projects=" + nextProps.projects.map(function(d, i){
      return d.id;
    }).join("+");

    $.ajax({
      url: meterRunListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({meterRuns: data}, this.getChartValues);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(meterRunListURL, status, err.toString());
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadMeterRuns(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.fuelType != this.props.fuelType || nextProps.energyUnit != this.props.energyUnit) {
      this.getChartValues(nextProps);
    }
    if (nextProps.projects != this.props.projects) {
      this.loadMeterRuns(nextProps);
    }
  },
  getInitialState: function() {
    return {
      meterRuns: [],
      histogramData: {
        data: [],
        domain: {
          x: [0, 100],
          y: [0, 10],
        },
      }
    }
  },
  getChartValues: function(props) {
    if (!props) {
      props = this.props;
    }

    var project_meter_runs = {};
    this.state.meterRuns.forEach(function(d, i) {
      if (d.project in project_meter_runs) {
        project_meter_runs[d.project].push(d)
      } else {
        project_meter_runs[d.project] = [d]
      }
    });

    var values = [];
    for (var project_id in project_meter_runs) {
      if (project_meter_runs.hasOwnProperty(project_id)) {

        var annual_savings = {E: 0, NG: 0};
        project_meter_runs[project_id].forEach(function(meter_run) {
          if (meter_run.annual_savings != null) {
            if (meter_run.fuel_type == "E") {
              annual_savings.E += meter_run.annual_savings;
            } else if (meter_run.fuel_type == "NG") {
              annual_savings.NG += meter_run.annual_savings;
            }
          }
        });

        if (props.fuelType == "E") {
          if (props.energyUnit == "KWH") {
            values.push(annual_savings.E);
          } else if (props.energyUnit == "THERM") {
            values.push(annual_savings.E * 0.034);
          }
        } else if (props.fuelType == "NG") {
          if (props.energyUnit == "KWH") {
            values.push(annual_savings.NG * 29.3001);
          } else if (props.energyUnit == "THERM") {
            values.push(annual_savings.NG);
          }
        } else if (props.fuelType == "BOTH") {
          if (props.energyUnit == "KWH") {
            values.push(annual_savings.E + (annual_savings.NG * 29.3001));
          } else if (props.energyUnit == "THERM") {
            values.push((annual_savings.E * 0.034) + (annual_savings.NG));
          }
        }
      }
    }

    var data = d3.layout.histogram()
      .bins(15)
      (values);

    var domain = {
      x: d3.extent(values, function(d) { return d; }),
      y: [0, d3.max(data, function(d) { return d.y; })]
    };

    this.setState({
      histogramData: {
        data: data,
        domain: domain,
      }
    });

  },
  render: function() {
    return (
      <Histogram
        data={this.state.histogramData.data}
        domain={this.state.histogramData.domain}
        fuelType={this.props.fuelType}
        energyUnit={this.props.energyUnit}
        height={this.props.height}
      />
    )
  }
});

module.exports = HistogramBox;
