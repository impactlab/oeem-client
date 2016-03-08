var React = require('react');
var ProjectConsumptionTimeseries = require('./ProjectConsumptionTimeseries.jsx');
var _ = require('lodash');

var ProjectConsumptionTimeseriesBox = React.createClass({
  loadConsumption: function(props) {
    if (!props) {
      props = this.props;
    }
    var consumptionMetadataListURL = props.consumption_metadata_list_url +
            "?projects=" + props.project.id;

    $.ajax({
      url: consumptionMetadataListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({consumptionMetadata: data}, this.getChartValues);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(consumptionMetadataListURL, status, err.toString());
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadConsumption();
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.project != this.props.project) {
      this.loadConsumption(nextProps);
    }
  },

  getInitialState: function() {
    return {
      consumptionMetadata: [],
      chartData: {
        data: {
          electricity: [],
          naturalGas: [],
        },
        domain: {
          x: [new Date("2000-01-01"), new Date("2001-01-01")],
          y: [0, 1],
        },
      }
    }
  },

  getChartValues: function(props) {
    if (!props) {
      props = this.props;
    }

    var consumptionElectricity = _.find(this.state.consumptionMetadata, function(o) { return o.fuel_type == "E" && o.energy_unit == "KWH"; });
    var consumptionNaturalGas = _.find(this.state.consumptionMetadata, function(o) { return o.fuel_type == "NG" && o.energy_unit == "THM"; });

    var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse;

    var data = {
      electricity: consumptionElectricity.records.map(function(d) {
        return {
          value: +d.value,
          start: parseDate(d.start),
        }
      }),
      naturalGas: consumptionNaturalGas.records.map(function(d) {
        return {
          value: (+d.value) * 29.3001,
          start: parseDate(d.start),
        }
      }),
    };

    // remove last element of both, which is usually null, then replace with last element.
    // This is necessary because of the way the graph is drawn with interpolate('step-after')k
    var lastElectricity = data.electricity.pop();
    data.electricity.push({
      value: data.electricity[data.electricity.length],
      start: lastElectricity.start,
    });

    var lastNaturalGas = data.naturalGas.pop();
    data.naturalGas.push({
      value: data.naturalGas[data.naturalGas.length],
      start: lastNaturalGas.start,
    });

    var both = data.electricity.concat(data.naturalGas);

    var domain = {
      x: d3.extent(both, function(d) {return d.start}),
      y: [0, d3.max(both, function(d) {return d.value})],
    };

    var chartData = {
      data: data,
      domain: domain,
    };

    this.setState({
      chartData: chartData,
    });

  },
  render: function() {
    return (
      <ProjectConsumptionTimeseries
        data={this.state.chartData.data}
        domain={this.state.chartData.domain}
        height={this.props.height}
      />
    )
  }
});

module.exports = ProjectConsumptionTimeseriesBox;
