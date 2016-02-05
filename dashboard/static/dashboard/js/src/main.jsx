var CategorySelector = require('./CategorySelector.jsx');
var ProjectTable = require('./ProjectTable.jsx');
var ProjectSelectionSummaryBox = require('./ProjectSelectionSummaryBox.jsx');
var ProjectFilterBox = require('./ProjectFilterBox.jsx');
var ChartBox = require('./ChartBox.jsx');
var DownloadButton = require('./DownloadButton.jsx');

window.DashboardBox = React.createClass({
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
  getInitialState: function() {
    return {
      projects: [],
      selectedProjectBlockIds: [],
      projectBlockIdFilterMode: "OR",
      selectedChartTypeId: "scatterPlot",
      selectedFuelTypeId: "E",
      selectedEnergyUnitId: "KWH",
    };
  },
  componentDidMount: function() {
    this.loadProjects();
  },
  render: function() {

    var chartTypes = [
      { id: "timeSeries", name: "Gross Savings Time Series", },
      { id: "histogram", name: "Annual Savings Histogram", },
      { id: "scatterPlot", name: "Realization Rate Scatterplot", },
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

        <ProjectFilterBox
          selectProjectBlocksCallback={this.selectProjectBlocksCallback}

          projectBlockIdFilterMode={this.state.projectBlockIdFilterMode}
          {...this.props}
        />

        <ProjectTable
          projects={this.state.projects}
        />
      </div>
    )
  }
});
