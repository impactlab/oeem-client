var Timeseries = require("./Timeseries.jsx");
var _ = require("lodash");

var TimeseriesBox = React.createClass({
  loadProjects: function() {
    var projectListURL = this.props.project_list_url + "?with_monthly_summary=True";

    if (this.props.projects.length > 0) {
      projectListURL += "&projects=" + this.props.projects.map(function(d, i){
        return d.id;
      }).join("+");
    }

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

  computeTimeSeries: function() {
    var timeseries = {};

    this.state.rawProjectData.forEach(function(p, i) {
      p.recent_meter_runs.forEach(function(m, i) {
        if (m.fuel_type == "E" && (this.props.fuelType == "E" || this.props.fuelType == "BOTH")) {
          m.monthlyaverageusagebaseline_set.forEach(function(d, i) {
            var value = +d.value;
            var date = d.date;
            if (this.energyUnit == "THERM") {
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
            if (this.energyUnit == "THERM") {
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
        if (m.fuel_type == "NG" && (this.props.fuelType == "NG" || this.props.fuelType == "BOTH")) {
          m.monthlyaverageusagebaseline_set.forEach(function(d, i) {
            var value = +d.value;
            var date = d.date;
            if (this.energyUnit == "KWH") {
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
            if (this.energyUnit == "KWH") {
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
      var baseline_avg = isNaN(d[1].baseline.value / d[1].baseline.n) ?
        null : d[1].baseline.value / d[1].baseline.n;
      var reporting_avg = isNaN(d[1].reporting.value / d[1].reporting.n) ?
        null : d[1].reporting.value / d[1].reporting.n;
      return {
        date: parseDate(d[0]),
        baseline_avg: baseline_avg,
        baseline_sum: d[1].baseline.value,
        baseline_n: d[1].baseline.n,
        reporting_avg: reporting_avg,
        reporting_sum: d[1].reporting.value,
        reporting_n: d[1].reporting.n,
        difference_avg: baseline_avg - reporting_avg, // only works if reporting.n == baseline.n
        difference_sum: d[1].baseline.value - d[1].reporting.value,
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

  getInitialState: function() {
    return {
      height: 200,
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
      />
    )
  }
});

module.exports = TimeseriesBox;