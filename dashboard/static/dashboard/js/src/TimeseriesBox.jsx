var React = require('react');
var ReactDOM = require('react-dom');
var Timeseries = require("./Timeseries.jsx");
var _ = require("lodash");
var helpers = require("./helpers");

var TimeseriesBox = React.createClass({
  loadProjects: function(props) {
    if (!props) {
      props = this.props;
    }

    var projectListURL = props.project_list_url + "?with_monthly_summary=True";

    projectListURL += "&" + helpers.getProjectParam(props.projects);

    $.ajax({
      url: projectListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({
          rawProjectData: data,
        }, this.computeTimeSeries);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(projectListURL, status, err.toString());
      }.bind(this)
    });
  },

  computeTimeSeries: function(props) {
    if (!props) {
      props = this.props;
    }
    var timeseries = {};

    this.state.rawProjectData.forEach(function(p, i) {
      p.recent_meter_runs.forEach(function(m, i) {
        if (m.fuel_type == "E" && (props.fuelType == "E" || props.fuelType == "BOTH")) {
          m.monthlyaverageusagebaseline_set.forEach(function(d, i) {
            var value = +d.value;
            var date = d.date;
            if (props.energyUnit == "THERM") {
              value *= 0.03413;
            }
            if (date in timeseries) {
              timeseries[date].baseline.value += value;
              timeseries[date].baseline.n += 1;
            } else {
              timeseries[date] = {
                baseline: {
                  value: value,
                  n: 1,
                },
                reporting: {
                  value: 0,
                  n: 0,
                }
              }
            }
          }, this);
          m.monthlyaverageusagereporting_set.forEach(function(d, i) {
            var value = +d.value;
            var date = d.date;
            if (props.energyUnit == "THERM") {
              value *= 0.03413;
            }
            if (date in timeseries) {
              timeseries[date].reporting.value += value;
              timeseries[date].reporting.n += 1;
            } else {
              timeseries[date] = {
                baseline: {
                  value: 0,
                  n: 0,
                },
                reporting: {
                  value: value,
                  n: 1,
                },
              }
            }
          }, this);
        }
        if (m.fuel_type == "NG" && (props.fuelType == "NG" || props.fuelType == "BOTH")) {
          m.monthlyaverageusagebaseline_set.forEach(function(d, i) {
            var value = +d.value;
            var date = d.date;
            if (props.energyUnit == "KWH") {
              value *= 29.3001;
            }
            if (d.date in timeseries) {
              timeseries[date].baseline.value += value;
              timeseries[date].baseline.n += 1;
            } else {
              timeseries[date] = {
                baseline: {
                  value: value,
                  n: 1,
                },
                reporting: {
                  value: 0,
                  n: 0,
                }
              }
            }
          }, this);
          m.monthlyaverageusagereporting_set.forEach(function(d, i) {
            var value = +d.value;
            var date = d.date;
            if (props.energyUnit == "KWH") {
              value *= 29.3001;
            }

            if (date in timeseries) {
              timeseries[date].reporting.value += value;
              timeseries[date].reporting.n += 1;
            } else {
              timeseries[date] = {
                baseline: {
                  value: 0,
                  n: 0,
                },
                reporting: {
                  value: value,
                  n: 1,
                }
              }
            }
          }, this);
        }
      }, this);
    }, this);

    var parseDate = d3.time.format("%Y-%m-%d").parse;

    var timeseries = _.sortBy(_.toPairs(timeseries), function(o) { return o[0]; }).map(function(d, i) {
      var date = parseDate(d[0]);
      var n_days_in_month = new Date(date.getYear(), date.getMonth() + 1, 0).getDate()
      var baseline_avg = isNaN(d[1].baseline.value / d[1].baseline.n) ?
        null : d[1].baseline.value / d[1].baseline.n;
      var reporting_avg = isNaN(d[1].reporting.value / d[1].reporting.n) ?
        null : d[1].reporting.value / d[1].reporting.n;
      return {
        date: date,
        baseline_avg: baseline_avg * n_days_in_month,
        baseline_sum: d[1].baseline.value * n_days_in_month,
        baseline_n: d[1].baseline.n,
        reporting_avg: reporting_avg * n_days_in_month,
        reporting_sum: d[1].reporting.value * n_days_in_month,
        reporting_n: d[1].reporting.n,
        difference_avg: (baseline_avg - reporting_avg) * n_days_in_month, // only works if reporting.n == baseline.n
        difference_sum: (d[1].baseline.value - d[1].reporting.value) * n_days_in_month,
      };
    });

    var date_extent = d3.extent(timeseries, function(d) { return d.date});

    var baseline_sum_extent = d3.extent(timeseries, function(d) { return d.baseline_sum});
    var reporting_sum_extent = d3.extent(timeseries, function(d) { return d.reporting_sum});
    var value_extent = d3.extent(baseline_sum_extent.concat(reporting_sum_extent));

    var domain = {
      x: date_extent,
      y: value_extent,
    }

    this.setState({
      timeseriesData: {
        data: timeseries,
        domain: domain,
      },
    });
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.fuelType != this.props.fuelType || nextProps.energyUnit != this.props.energyUnit) {
      this.computeTimeSeries(nextProps);
    }
    if (nextProps.projects != this.props.projects) {
      this.loadProjects(nextProps);
    }
  },

  getInitialState: function() {
    return {
      rawProjectData: [],
      timeseriesData: {
        data: [],
        domain: {
          x: [new Date("2000-01-01"), new Date("2001-01-02")],
          y: [0, 10],
        },
      }
    }
  },

  componentDidMount: function() {
    this.loadProjects();
  },

  render: function() {
    return (
      <Timeseries
        data={this.state.timeseriesData.data}
        domain={this.state.timeseriesData.domain}
        fuelType={this.props.fuelType}
        energyUnit={this.props.energyUnit}
        height={this.props.height}
      />
    )
  }
});

module.exports = TimeseriesBox;
