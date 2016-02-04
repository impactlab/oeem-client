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
    var baseline = {};
    var reporting = {};
    this.state.rawProjectData.forEach(function(p, i) {
      p.recent_meter_runs.forEach(function(m, i) {
        if (m.fuel_type == "E" && (this.props.fuelType == "E" || this.props.fuelType == "BOTH")) {
          m.monthlyaverageusagebaseline_set.forEach(function(d, i) {
            var value = d.value;
            if (this.energyUnit == "THERM") {
              value *= 0.03413;
            }
            if (d.date in baseline) {
              baseline[d.date] += value;
            } else {
              baseline[d.date] = value;
            }
          }, this);
          m.monthlyaverageusagereporting_set.forEach(function(d, i) {
            var value = d.value;
            if (this.energyUnit == "THERM") {
              value *= 0.03413;
            }
            if (d.date in reporting) {
              reporting[d.date] += value;
            } else {
              reporting[d.date] = value;
            }
          }, this);
        }
        if (m.fuel_type == "NG" && (this.props.fuelType == "NG" || this.props.fuelType == "BOTH")) {
          m.monthlyaverageusagebaseline_set.forEach(function(d, i) {
            var value = d.value;
            if (this.energyUnit == "KWH") {
              value *= 29.3001;
            }
            if (d.date in baseline) {
              baseline[d.date] += value;
            } else {
              baseline[d.date] = value;
            }
          }, this);
          m.monthlyaverageusagereporting_set.forEach(function(d, i) {
            var value = d.value;
            if (this.energyUnit == "KWH") {
              value *= 29.3001;
            }

            if (d.date in reporting) {
              reporting[d.date] += value;
            } else {
              reporting[d.date] = value;
            }
          }, this);
        }
      }, this);
    }, this);

    var baseline = _.sortBy(_.toPairs(baseline), function(o) { return o[0]; }).map(function(d, i) {
      return {
        date: d[0],
        value: d[1],
      };
    });

    var reporting = _.sortBy(_.toPairs(reporting), function(o) { return o[0]; }).map(function(d, i) {
      return {
        date: d[0],
        value: d[1],
      };
    });

    var data = {
      baseline: baseline,
      reporting: reporting,
    }

    var baseline_date_extent = d3.extent(baseline, function(d) { return d.date});
    var reporting_date_extent = d3.extent(reporting, function(d) { return d.date});
    var date_extent = d3.extent(baseline_date_extent.concat(reporting_date_extent));

    var baseline_value_extent = d3.extent(baseline, function(d) { return d.value});
    var reporting_value_extent = d3.extent(reporting, function(d) { return d.value});
    var value_extent = d3.extent(baseline_value_extent.concat(reporting_value_extent));

    var domain = {
      x: date_extent,
      y: value_extent,
    }

    this.setState({
      timeseriesData: {
        data: data,
        domain: domain,
      },
    });
  },

  getInitialState: function() {
    return {
      height: 200,
      rawProjectData: [],
      timeseriesData: {
        data: {
          baseline: [],
          reporting: [],
        },
        domain: {
          x: [0, 10],
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
