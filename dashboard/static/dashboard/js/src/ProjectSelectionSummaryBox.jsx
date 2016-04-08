var React = require('react');
var filter = require('lodash.filter');
var helpers = require("./helpers");

var ProjectSelectionSummaryBox = React.createClass({
  propTypes: {
    projects: React.PropTypes.array,
    consumption_metadata_list_url: React.PropTypes.string,
  },

  getInitialState: function () {
    return {
      nProjects: null,
      nProjectsElectricity: null,
      nProjectsNaturalGas: null,
      nMeterRuns: null,
      nMeterRunsElectricity: null,
      nMeterRunsNaturalGas: null,
      grossSavings: null,
      grossSavingsElectricity: null,
      grossSavingsNaturalGas: null,
      annualSavings: null,
      annualSavingsElectricity: null,
      annualSavingsNaturalGas: null,
    }
  },

  componentDidMount: function() {
    this.getProjectCounts();
    this.getMeterRunCounts();
  },

  componentWillReceiveProps: function(nextProps) {
    this.getProjectCounts(nextProps);
    this.getMeterRunCounts(nextProps);
  },

  getProjectCounts: function(props) {
    if (!props) {
      props = this.props;
    }
    var consumptionMetadataListURL = props.consumption_metadata_list_url + "?summary=True";

    consumptionMetadataListURL += "&" + helpers.getProjectParam(props.projects);

    $.ajax({
      url: consumptionMetadataListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({nProjectsElectricity: filter(data, function(d) {return d.fuel_type == "E"}).length});
        this.setState({nProjectsNaturalGas: filter(data, function(d) {return d.fuel_type == "NG"}).length});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(consumptionMetadataListURL, status, err.toString());
      }.bind(this)
    });
  },

  getMeterRunCounts: function(props) {
    if (!props) {
      props = this.props;
    }
    var meterRunListURL = props.meter_run_list_url + "?summary=True&most_recent=True";

    meterRunListURL += "&" + helpers.getProjectParam(props.projects);
    $.ajax({
      url: meterRunListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        var annualSavings = 0;
        var annualSavingsNaturalGas = 0;
        var annualSavingsElectricity = 0;
        var grossSavings = 0;
        var grossSavingsNaturalGas = 0;
        var grossSavingsElectricity = 0;
        data.forEach(function(d, i) {
          if (d.fuel_type == "E") {
            annualSavings += d.annual_savings;
            annualSavingsElectricity += d.annual_savings;
            grossSavings += d.gross_savings;
            grossSavingsElectricity += d.gross_savings;
          } else if (d.fuel_type == "NG") {
            annualSavings += d.annual_savings * 29.3001;
            annualSavingsNaturalGas += d.annual_savings * 29.3001;
            grossSavings += d.gross_savings * 29.3001;
            grossSavingsNaturalGas += d.gross_savings * 29.3001;
          }
        });
        formatFloat = d3.format(',.0f');
        this.setState({
          nMeterRuns: data.length,
          nMeterRunsElectricity: filter(data, function(d) {return d.fuel_type == "E"}).length,
          nMeterRunsNaturalGas: filter(data, function(d) {return d.fuel_type == "NG"}).length,
          annualSavings: formatFloat(annualSavings),
          annualSavingsNaturalGas: formatFloat(annualSavingsNaturalGas),
          annualSavingsElectricity: formatFloat(annualSavingsElectricity),
          grossSavings: formatFloat(grossSavings),
          grossSavingsNaturalGas: formatFloat(grossSavingsNaturalGas),
          grossSavingsElectricity: formatFloat(grossSavingsElectricity),
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(meterRunListURL, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    return (
      <div className="mdl-card mdl-shadow--2dp mdl-cell mdl-cell--4-col">
        <div className="mdl-card__title">
          Summary statistics
        </div>

        <div className="mdl-card__supporting-text">
          <table className="table table-condensed">
            <thead>
            <tr>
              <th></th>
              <th className="text-center">Electricity</th>
              <th className="text-center">Natural Gas</th>
              <th className="text-center">Total</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>Number of projects</td>
              <td className="text-center">{this.state.nProjectsElectricity}</td>
              <td className="text-center">{this.state.nProjectsNaturalGas}</td>
              <td className="text-center">{this.props.projects.length}</td>
            </tr>
            <tr>
              <td>Number of meter runs</td>
              <td className="text-center">{this.state.nMeterRunsElectricity}</td>
              <td className="text-center">{this.state.nMeterRunsNaturalGas}</td>
              <td className="text-center">{this.state.nMeterRuns}</td>
            </tr>
            <tr>
              <td>Gross savings (kWh)</td>
              <td className="text-center">{this.state.grossSavingsElectricity}</td>
              <td className="text-center">{this.state.grossSavingsNaturalGas}</td>
              <td className="text-center">{this.state.grossSavings}</td>
            </tr>
            <tr>
              <td>Annual savings (kWh)</td>
              <td className="text-center">{this.state.annualSavingsElectricity}</td>
              <td className="text-center">{this.state.annualSavingsNaturalGas}</td>
              <td className="text-center">{this.state.annualSavings}</td>
            </tr>
            </tbody>
          </table>
        </div>

      </div>
    )
  }
});

module.exports=ProjectSelectionSummaryBox;
