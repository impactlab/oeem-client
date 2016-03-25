var React = require('react');
var Griddle = require('griddle-react');

var ProjectTable = React.createClass({
  loadData: function(props) {
    if (!props) {
      props = this.props;
    }
    var meterRunListURL = props.meter_run_list_url + "?summary=True&most_recent=True";

    meterRunListURL += "&projects=" + props.projects.map(function(d, i){
      return d.id;
    }).join("+");

    $.ajax({
      url: meterRunListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {

        var projectData = {};
        props.projects.forEach(function(d, i) {
          projectData[d.id] = {
            projectID: d.project_id,
            projectPK: d.id,
            annualSavingsElectricity: null,
            grossSavingsElectricity: null,
            annualUsageBaselineElectricity: null,
            annualUsageReportingElectricity: null,
            cvrmseBaselineElectricity: null,
            cvrmseReportingElectricity: null,
            annualSavingsNaturalGas: null,
            grossSavingsNaturalGas: null,
            annualUsageBaselineNaturalGas: null,
            annualUsageReportingNaturalGas: null,
            cvrmseBaselineNaturalGas: null,
            cvrmseReportingNaturalGas: null,
            zipcode: d.zipcode,
            weatherStation: d.weather_station,
          }
        });

        var formatFloat = function(f) { return parseFloat(d3.format(',.0f')(f));};
        data.forEach(function(d, i) {
          if (d.fuel_type == "E") {
            projectData[d.project].annualSavingsElectricity = formatFloat(d.annual_savings);
            projectData[d.project].grossSavingsElectricity = formatFloat(d.gross_savings);
            projectData[d.project].annualUsageBaselineElectricity = formatFloat(d.annual_usage_baseline);
            projectData[d.project].annualUsageReportingElectricity = formatFloat(d.annual_usage_reporting);
            projectData[d.project].cvrmseBaselineElectricity = formatFloat(d.cvrmse_baseline);
            projectData[d.project].cvrmseReportingElectricity = formatFloat(d.cvrmse_reporting);
          } else if (d.fuel_type == "NG") {
            projectData[d.project].annualSavingsNaturalGas = formatFloat(d.annual_savings);
            projectData[d.project].grossSavingsNaturalGas = formatFloat(d.gross_savings);
            projectData[d.project].annualUsageBaselineNaturalGas = formatFloat(d.annual_usage_baseline);
            projectData[d.project].annualUsageReportingNaturalGas = formatFloat(d.annual_usage_reporting);
            projectData[d.project].cvrmseBaselineNaturalGas = formatFloat(d.cvrmse_baseline);
            projectData[d.project].cvrmseReportingNaturalGas = formatFloat(d.cvrmse_reporting);
          }
        });
        var rows = props.projects.map(function(d, i) {
          return projectData[d.id];
        });
        this.setState({ data: rows});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(meterRunListURL, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {
      data: [],
    }
  },
  componentDidMount: function() {
    this.loadData();
  },
  componentWillReceiveProps: function(nextProps) {
    this.loadData(nextProps);
  },
  render: function() {
    var selectProjectCallback = this.props.selectProjectCallback;
    return (
      <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--12-col">
        <Griddle
          results={this.state.data}
          resultsPerPage={10}
          tableClassName="table"
          showFilter={true}
          showSettings={true}
          columns={[
            "projectID",
            "annualSavingsElectricity",
            "annualSavingsNaturalGas",
          ]}
          columnMetadata={[
            {
              displayName: "Project ID",
              columnName: "projectID",
              customComponent: LinkComponent,
              selectProject: function(projectPK) {
                selectProjectCallback(projectPK);
              },
            }, {
              displayName: "Annual Savings (E)",
              columnName: "annualSavingsElectricity",
            }, {
              displayName: "Gross Savings (E)",
              columnName: "grossSavingsElectricity",
            }, {
              displayName: "Annual Usage Baseline (E)",
              columnName: "annualUsageBaselineElectricity",
            }, {
              displayName: "Annual Usage Reporting (E)",
              columnName: "annualUsageReportingElectricity",
            }, {
              displayName: "CVRMSE Baseline (E)",
              columnName: "cvrmseBaselineElectricity",
            }, {
              displayName: "CVRMSE Reporting (E)",
              columnName: "cvrmseReportingElectricity",
            }, {
              displayName: "Annual Savings (NG)",
              columnName: "annualSavingsNaturalGas",
            }, {
              displayName: "Gross Savings (NG)",
              columnName: "grossSavingsNaturalGas",
            }, {
              displayName: "Annual Usage Baseline (NG)",
              columnName: "annualUsageBaselineNaturalGas",
            }, {
              displayName: "Annual Usage Reporting (NG)",
              columnName: "annualUsageReportingNaturalGas",
            }, {
              displayName: "CVRMSE Baseline (NG)",
              columnName: "cvrmseBaselineNaturalGas",
            }, {
              displayName: "CVRMSE Reporting (NG)",
              columnName: "cvrmseReportingNaturalGas",
            }, {
              displayName: "ZIP code",
              columnName: "zipcode",
            }, {
              displayName: "Weather Station",
              columnName: "weatherStation",
            }, {
              columnName: "projectPK",
              visible: false,
            }
          ]}
        />
      </div>
    )
  }
});

var LinkComponent = React.createClass({
  handler: function() {
    this.props.metadata.selectProject(this.props.rowData.projectPK);
  },
  render: function() {
    url ="#projects/" + this.props.rowData.projectPK;
    return <a onClick={this.handler}>{this.props.data}</a>
  }
});

module.exports = ProjectTable;
