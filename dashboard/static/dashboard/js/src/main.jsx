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
      selectedChartTypeId: "histogram",
      selectedFuelTypeId: "E",
      selectedEnergyUnitId: "KWH",
    };
  },
  componentDidMount: function() {
    this.loadProjects();
  },
  render: function() {

    var chartTypes = [
      {
        id: "timeSeries",
        name: "Gross Savings Time Series",
      },
      {
        id: "histogram",
        name: "Annual Savings Histogram",
      },
      {
        id: "scatterPlot",
        name: "Realization Rate Scatterplot",
      },
      {
        id: "map",
        name: "Map",
      },
    ];

    var fuelTypes = [
      {
        id: "E",
        name: "Electricity",
      },
      {
        id: "NG",
        name: "Natural Gas",
      },
      {
        id: "BOTH",
        name: "Combined",
      },
    ];

    var energyUnits = [
      {
        id: "KWH",
        name: "kWh",
      },
      {
        id: "THERM",
        name: "therms",
      },
    ];

    return (
      <div className="selectedProjectBlockBox">

        <div className="row">
          <div className="col-md-12">
            <CategorySelector
              title={null}
              categories={chartTypes}
              selectCategoryCallback={this.selectChartTypeCallback}
              selectedCategoryId={this.state.selectedChartTypeId}
            />
            <br/>
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
            />
          </div>

          <div className="col-md-4">
            <ProjectSelectionSummaryBox
              projects={this.state.projects}
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

var ProjectFilterBox = React.createClass({
  render: function() {

    var filters = [
      (<li className="list-group-item" key={"projectBlockFilter"}>
        <ProjectBlockFilter
          {...this.props}
        />
      </li>),
      // (<li className="list-group-item" key={"dateRangesFilter"}> <DateRangesFilter/> </li>),
      // (<li className="list-group-item" key={"zipCodeFilter"}> <ZipCodeFilter/> </li>),
      // (<li className="list-group-item" key={"projectCostFilter"}> <ProjectCostFilter/> </li>),
      // (<li className="list-group-item" key={"climateZoneFilter"}> <ClimateZoneFilter/> </li>),
      // (<li className="list-group-item" key={"ecmFilter"}> <EnergyConservationMeasureFilter/> </li>),
    ];

    return (
      <div className="projectFilterBox">
        <h5>Project Filters</h5>
        <ul className="list-group">
          {filters}
        </ul>
      </div>
    )
  }
});

var ProjectBlockFilter = React.createClass({
  loadProjectBlocks: function() {
    $.ajax({
      url: this.props.project_block_list_url + "?name_only=true",
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({projectBlockList: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.project_block_list_url + "?name_only=true", status, err.toString());
      }.bind(this)
    });
  },
  handleSelectProjectBlock: function(projectBlockId) {
    var ids = this.state.selectedProjectBlockIds;
    ids.push(projectBlockId);
    this.setState({selectedProjectBlockIds: ids}, this.callCallback);
  },
  handleDeselectProjectBlock: function(projectBlockId) {
    var ids = this.state.selectedProjectBlockIds;
    var index = ids.indexOf(projectBlockId);
    if (index != -1) {
      ids.splice(index, 1);
    }
    this.setState({selectedProjectBlockIds: ids}, this.callCallback);
  },
  toggleFilterModeCallback: function() {
    var filterMode = (this.state.filterMode == "OR") ? "AND" : "OR";
    this.setState({filterMode: filterMode}, this.callCallback);
  },
  callCallback: function() {
    this.props.selectProjectBlocksCallback({
      ids: this.state.selectedProjectBlockIds,
      filterMode: this.state.filterMode,
    });
  },
  getInitialState: function() {
    return {
      projectBlockList: [],
      selectedProjectBlockIds: [],
      filterMode: this.props.projectBlockIdFilterMode,
    };
  },
  componentDidMount: function() {
    this.loadProjectBlocks();
  },
  render: function() {
    var projectBlockListItems = this.state.projectBlockList.map(function(d, i) {
      var selected = (this.state.selectedProjectBlockIds.indexOf(d.id) != -1);
      return (
        <ProjectBlockListItem
          key={d.id}
          selected={selected}
          handleSelectProjectBlock={this.handleSelectProjectBlock}
          handleDeselectProjectBlock={this.handleDeselectProjectBlock}
          projectBlock={d}
        />
      );
    }, this);

    return (
      <div className="projectBlockFilter">
        <span>Filter by project blocks</span>
        <FilterMode
          toggleFilterModeCallback={this.toggleFilterModeCallback}
          filterMode={this.state.filterMode}
        />
        <ul className="list-group">
         {projectBlockListItems}
        </ul>
      </div>
    )
  }
});

var FilterMode = React.createClass({
  render: function() {
    return (
      <div className="filterMode">
        <span>
          Filter Mode: {this.props.filterMode} &nbsp;
          <a onClick={this.props.toggleFilterModeCallback}>toggle</a>
        </span>
      </div>
    )
  }
});

var ProjectBlockListItem = React.createClass({
  handleSelect: function() {
    if (this.props.selected) {
      this.props.handleDeselectProjectBlock(this.props.projectBlock.id);
    }else{
      this.props.handleSelectProjectBlock(this.props.projectBlock.id);
    }
  },
  render: function() {

    var selectedText;
    if (this.props.selected) {
      selectedText = "Selected - click to deselect";
    } else {
      selectedText = "Unselected - click to select";
    }

    return (
      <li className="projectBlockListItem list-group-item clearfix">
        <span>{this.props.projectBlock.name}&nbsp;</span>
        <a onClick={this.handleSelect}>{selectedText}</a>
      </li>
    )
  }
});


var FuelTypeFilter = React.createClass({
  render: function() {
    var fuelTypeListItems = this.props.fuelTypes.map(function(d,i) {
      return (
        <FuelTypeListItem
          key={i}
          fuelType={d}
          handleSelectFuelType={this.props.handleSelectFuelType}
        />
      );
    }, this);
    return (
      <div className="fuelTypeFilter">
        <span>Filter by energy Type</span>
        <ul className="list-group">
         {fuelTypeListItems}
        </ul>
      </div>
    )
  }
});

var FuelTypeListItem = React.createClass({
  handleSelect: function() {
    this.props.handleSelectFuelType(this.props.fuelType);
  },
  render: function() {
    return (
      <li className="fuelTypeListItem list-group-item clearfix">
        <a onClick={this.handleSelect}>
          {this.props.fuelType.name}
        </a>
      </li>
    )
  }
});

var ClimateZoneFilter = React.createClass({
  render: function() {
    return (
      <div className="climateZoneFilter">
        Filter by climate zone
      </div>
    )
  }
});


var DateRangesFilter = React.createClass({
  render: function() {
    return (
      <div className="dateRangesFilter">
        Filter by date ranges
      </div>
    )
  }
});

var ZipCodeFilter = React.createClass({
  render: function() {
    return (
      <div className="zipCodeFilter">
        Filter by ZIP code
      </div>
    )
  }
});

var ProjectCostFilter = React.createClass({
  render: function() {
    return (
      <div className="projectCostFilter">
        Filter by project cost
      </div>
    )
  }
});
var EnergyConservationMeasureFilter = React.createClass({
  render: function() {
    return (
      <div className="energyConservationMeasureFilter">
        Filter by ECM
      </div>
    )
  }
});

var ProjectSelectionSummaryBox = React.createClass({
  render: function() {
    return (
      <div className="projectSummaryBox">
        <ul className="list-group">
          <li className="list-group-item">Number of projects: {this.props.projects.length}</li>
        </ul>
      </div>
    )
  }
});

var CategorySelector = React.createClass({
  render: function() {
    var categoryListItems = this.props.categories.map(function(d, i) {
      var selected = (this.props.selectedCategoryId == d.id);
      return (
        <CategoryListItem
          key={i}
          category={d}
          selected={selected}
          selectCategoryCallback={this.props.selectCategoryCallback}
        />
      )
    }, this);

    var title;
    if (this.props.title != null) {
      title = <h5>{this.props.title}</h5>
    } else {
      title = null;
    }

    return (
      <div className="categorySelector">
        {title}
        <div className="btn-group" data-toggle="buttons">
          {categoryListItems}
        </div>
      </div>
    )
  }
});

var CategoryListItem = React.createClass({
  handleSelect: function(e) {
    this.props.selectCategoryCallback(this.props.category.id);
  },
  render: function() {
    var bootstrap_class;
    if (this.props.selected) {
      bootstrap_class = "categoryListItem btn btn-primary active";
    } else {
      bootstrap_class = "categoryListItem btn btn-primary";
    }
    return (
      <label className={bootstrap_class} onClick={this.handleSelect}>
        <input
          type="radio"
          checked={this.props.selected}
          readOnly={true}
        />
        {this.props.category.name}
      </label>
    )
  }
});

var Scatterplot = require('./Scatterplot.jsx');
var Histogram = require('./Histogram.jsx');
var Timeseries = require('./Timeseries.jsx');
var Map = require('./Map.jsx');

var ChartBox = React.createClass({
  render: function() {
    var chartComponent;
    if (this.props.chartType == "histogram") {

      chartComponent = (
        <Histogram
          projects={this.props.projects}
          fuelType={this.props.fuelType}
          energyUnit={this.props.energyUnit}
          meter_run_list_url={this.props.meter_run_list_url}
        />
      )
    } else if (this.props.chartType == "timeSeries") {
      chartComponent = (
        <Timeseries
        />
      )
    } else if (this.props.chartType == "scatterPlot") {

      var sampleData = [
        {id: '5fbmzmtc', x: 7, y: 41},
        {id: 's4f8phwm', x: 11, y: 45},
      ];

      var sampleDomain = {
        x: [0, 30],
        y: [0, 100],
      };

      chartComponent = (
        <Scatterplot
          data={sampleData}
          domain={sampleDomain}
        />
      )
    } else if (this.props.chartType == "map") {
      chartComponent = (
        <Map />
      )
    } else {
      chartComponent = <span>Please Select a Chart</span>
    }

    return (
      <div className="chartBox">
        <div className="panel panel-default">
          <div className="panel-body">
            {chartComponent}
          </div>
        </div>
      </div>
    )
  }
});

var ProjectTable = React.createClass({
  render: function() {
    var projects = this.props.projects.map(function(d,i) {
      return (
        <ProjectTableItem
          key={d.id}
          project={d}
        />
      )
    });
    return (
      <div className="projectTable">
        Project Table
        <ul className="list-group">
          {projects}
        </ul>
      </div>
    )
  }
});

var ProjectTableItem = React.createClass({
  handleSelect: function() {
    console.log(this.props.project);
  },
  render: function() {
    return (
      <li className="list-group-item clearfix">
        <a onClick={this.handleSelect}>
          {this.props.project.project_id}
        </a>
      </li>
    )
  }
});
