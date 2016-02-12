var React = require('react');
var ReactDOM = require('react-dom');
var CategorySelector = require('./CategorySelector.jsx');
var ProjectTable = require('./ProjectTable.jsx');
var ProjectSelectionSummaryBox = require('./ProjectSelectionSummaryBox.jsx');
var ProjectFilterBox = require('./ProjectFilterBox.jsx');
var ChartBox = require('./ChartBox.jsx');
var DownloadButton = require('./DownloadButton.jsx');
var ProjectDetailModal = require('./ProjectDetailModal.jsx');
var _ = require('lodash');

DashboardBox = React.createClass({
  render: function() {
    return (
      <div className="dashboardBox container-fluid">
        <div className="row">
          <div className="col-xs-12">
            <ProjectDataBox
              {...this.props}
            />
          </div>
        </div>
      </div>
    )
  }
});

var ProjectDataBox = React.createClass({
  loadProjects: function() {
    var projectListURL = this.props.project_list_url;

    var filterParam = (this.state.projectBlockIdFilterMode == "OR") ?
        "projectblock_or" : "projectblock_and";
    var params = this.state.selectedProjectBlockIds.map(function(d, i) {
      return filterParam + "=" + d;
    });

    if (this.state.selectedBaselineEndDateRange != null) {
      if (this.state.selectedBaselineEndDateRange.start != null) {
        params.push("baseline_period_end_0=" + this.state.selectedBaselineEndDateRange.start.format('YYYY-MM-DD'));
      }
      if (this.state.selectedBaselineEndDateRange.end != null) {
        params.push("baseline_period_end_1=" + this.state.selectedBaselineEndDateRange.end.format('YYYY-MM-DD'));
      }
    }

    if (this.state.selectedReportingStartDateRange != null) {
      if (this.state.selectedReportingStartDateRange.start != null) {
        params.push("reporting_period_start_0=" + this.state.selectedReportingStartDateRange.start.format('YYYY-MM-DD'));
      }
      if (this.state.selectedReportingStartDateRange.end != null) {
        params.push("reporting_period_start_1=" + this.state.selectedReportingStartDateRange.end.format('YYYY-MM-DD'));
      }
    }

    if (params.length > 0) {
      projectListURL += "?" + params.join("&");
    }

    $.ajax({
      url: projectListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({projects: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(projectListURL, status, err.toString());
      }.bind(this)
    });
  },
  selectProjectBlocksCallback: function(data) {
    this.setState({
      selectedProjectBlockIds: data.ids,
      projectBlockIdFilterMode: data.filterMode,
    }, this.loadProjects);
  },
  selectChartTypeCallback: function(chartTypeId) {
    this.setState({selectedChartTypeId: chartTypeId});
  },
  selectFuelTypeCallback: function(fuelTypeId) {
    this.setState({selectedFuelTypeId: fuelTypeId});
  },
  selectEnergyUnitCallback: function(energyUnitId) {
    this.setState({selectedEnergyUnitId: energyUnitId});
  },
  selectBaselineEndDateRangeCallback: function(dateRange) {
    this.setState({
      selectedBaselineEndDateRange: dateRange,
    }, this.loadProjects);
  },
  selectReportingStartDateRangeCallback: function(dateRange) {
    this.setState({
      selectedReportingStartDateRange: dateRange,
    }, this.loadProjects);
  },
  selectProjectDetailCallback: function(project_pk) {
    var projectDetailURL = this.props.project_detail_url + project_pk
    $.ajax({
      url: projectDetailURL,
      dataType: 'json',
      cache: false,
      success: function(data) {

        var projectIndex = _.findIndex(this.state.projects, function(o) { return o.id == project_pk});
        var nextProject = null;
        var prevProject = null;
        if (projectIndex > 0) {
          prevProject = this.state.projects[projectIndex - 1].id;
        }

        if (projectIndex < this.state.projects.length - 1) {
          nextProject = this.state.projects[projectIndex + 1].id;
        }

        this.setState({
          projectDetail: data,
          projectDetailPrev: prevProject,
          projectDetailNext: nextProject,
        }, this.openProjectDetailModal);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(projectDetailURL, status, err.toString());
      }.bind(this)
    });
  },
  openProjectDetailModal: function() {
    this.setState({
      projectDetailModalOpen: true,
    });
  },
  closeProjectDetailModalCallback: function() {
    this.setState({
      projectDetailModalOpen: false,
    });
  },
  getInitialState: function() {
    return {
      projects: [],
      selectedProjectBlockIds: [],
      projectBlockIdFilterMode: "OR",
      selectedChartTypeId: "scatterPlot",
      selectedFuelTypeId: "E",
      selectedEnergyUnitId: "KWH",
      selectedBaselineEndDateRange: null,
      selectedReportingStartDateRange: null,
      projectDetail: null,
      projectDetailPrev: null,
      projectDetailNext: null,
      projectDetailModalOpen: false,
    };
  },
  componentDidMount: function() {
    this.loadProjects();
  },
  render: function() {

    var chartTypes = [
      { id: "timeSeries", name: "Gross Savings", },
      { id: "histogram", name: "Annual Savings", },
      { id: "scatterPlot", name: "Realization Rate", },
      { id: "map", name: "Map", },
    ];

    var fuelTypes = [
      { id: "E", name: "Electricity", },
      { id: "NG", name: "Natural Gas", },
      { id: "BOTH", name: "Combined", },
    ];

    var energyUnits = [
      { id: "KWH", name: "kWh", },
      { id: "THERM", name: "therms", },
    ];

    return (
      <div className="selectedProjectBlockBox">

        <ProjectFilterBox
          selectProjectBlocksCallback={this.selectProjectBlocksCallback}
          selectBaselineEndDateRangeCallback={this.selectBaselineEndDateRangeCallback}
          selectReportingStartDateRangeCallback={this.selectReportingStartDateRangeCallback}

          projectBlockIdFilterMode={this.state.projectBlockIdFilterMode}
          {...this.props}
        />

        <div className="row">
          <div className="col-md-9">
            <CategorySelector
              title={null}
              categories={chartTypes}
              selectCategoryCallback={this.selectChartTypeCallback}
              selectedCategoryId={this.state.selectedChartTypeId}
            />
            <br/>
          </div>
          <div className="col-md-3">
           <DownloadButton
              project_list_url={this.props.project_list_url}
              project_attribute_key_list_url={this.props.project_attribute_key_list_url}
           />
          </div>
        </div>


        <div className="row">
          <div className="col-md-8">
            <ChartBox
              chartType={this.state.selectedChartTypeId}
              fuelType={this.state.selectedFuelTypeId}
              energyUnit={this.state.selectedEnergyUnitId}
              projects={this.state.projects}
              meter_run_list_url={this.props.meter_run_list_url}
              project_attribute_key_list_url={this.props.project_attribute_key_list_url}
              project_list_url={this.props.project_list_url}
            />
          </div>

          <div className="col-md-4">
            <ProjectSelectionSummaryBox
              projects={this.state.projects}
              consumption_metadata_list_url={this.props.consumption_metadata_list_url}
              meter_run_list_url={this.props.meter_run_list_url}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <CategorySelector
              title={null}
              categories={fuelTypes}
              selectCategoryCallback={this.selectFuelTypeCallback}
              selectedCategoryId={this.state.selectedFuelTypeId}
            />
          </div>

          <div className="col-md-4">
            <CategorySelector
              title={null}
              categories={energyUnits}
              selectCategoryCallback={this.selectEnergyUnitCallback}
              selectedCategoryId={this.state.selectedEnergyUnitId}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <ProjectTable
              projects={this.state.projects}
              consumption_metadata_list_url={this.props.consumption_metadata_list_url}
              meter_run_list_url={this.props.meter_run_list_url}
              selectProjectCallback={this.selectProjectDetailCallback}
            />
          </div>
        </div>

        <ProjectDetailModal
          project={this.state.projectDetail}
          nextProject={this.state.projectDetailNext}
          prevProject={this.state.projectDetailPrev}
          selectProjectCallback={this.selectProjectDetailCallback}
          modalIsOpen={this.state.projectDetailModalOpen}
          closeModalCallback={this.closeProjectDetailModalCallback}
          consumption_metadata_list_url={this.props.consumption_metadata_list_url}
        />
      </div>
    )
  }
});

ReactDOM.render(
  <DashboardBox
    project_block_list_url="/datastore_proxy/project_blocks/"
    project_list_url="/datastore_proxy/projects/"
    project_detail_url="/datastore_proxy/projects/"
    meter_run_list_url="/datastore_proxy/meter_runs/"
    project_attribute_key_list_url="/datastore_proxy/project_attribute_keys/"
    project_attribute_list_url="/datastore_proxy/project_attributes/"
    consumption_metadata_list_url="/datastore_proxy/consumption_metadatas/"
  />,
  document.getElementById('dashboard')
);

