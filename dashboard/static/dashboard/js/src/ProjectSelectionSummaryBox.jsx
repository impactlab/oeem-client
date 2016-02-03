var filter = require('lodash.filter');

var ProjectSelectionSummaryBox = React.createClass({
  propTypes: {
    projects: React.PropTypes.array,
    consumption_metadata_list_url: React.PropTypes.string,
  },

  getInitialState: function () {
    return {
      nProjects: 0,
      nProjectsElectricity: 0,
      nProjectsNaturalGas: 0,
      nMeterRuns: 0,
      nMeterRunsElectricity: 0,
      nMeterRunsNaturalGas: 0,
    }
  },

  componentDidMount: function() {
    this.getProjectCounts(this.props);
    this.getMeterRunCounts(this.props);
  },

  getProjectCounts: function(props) {
    var consumptionMetadataListURL = props.consumption_metadata_list_url + "?summary=True";

    if (props.projects.length > 0) {
      consumptionMetadataListURL += "&projects=" + props.projects.map(function(d, i){
        return d.id;
      }).join("+");
    }

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
    var meterRunListURL = props.meter_run_list_url + "?summary=True&most_recent=True";

    if (props.projects.length > 0) {
      meterRunListURL += "&projects=" + props.projects.map(function(d, i){
        return d.id;
      }).join("+");
    }

    $.ajax({
      url: meterRunListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({nMeterRuns: data.length});
        this.setState({nMeterRunsElectricity: filter(data, function(d) {return d.fuel_type == "E"}).length});
        this.setState({nMeterRunsNaturalGas: filter(data, function(d) {return d.fuel_type == "NG"}).length});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(meterRunListURL, status, err.toString());
      }.bind(this)
    });
  },

  componentWillReceiveProps: function(nextProps) {
    this.getProjectCounts(nextProps);
    this.getMeterRunCounts(nextProps);
  },

  render: function() {
    return (
      <div className="projectSelectionSummaryBox">
        <ul className="list-group">
          <li className="list-group-item">
            <span>Selected projects:&nbsp;</span>
            <b>{this.props.projects.length}&nbsp;</b>
            <span>(w/ E: {this.state.nProjectsElectricity}, w/ NG: {this.state.nProjectsNaturalGas})</span>
          </li>
          <li className="list-group-item">
            <span>Selected project meter runs:&nbsp;</span>
            <b>{this.state.nMeterRuns}&nbsp;</b>
            <span>(E: {this.state.nMeterRunsElectricity}, NG: {this.state.nMeterRunsNaturalGas})</span>
          </li>
        </ul>
      </div>
    )
  }
});

module.exports=ProjectSelectionSummaryBox;
