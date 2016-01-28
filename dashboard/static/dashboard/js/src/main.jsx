var DashboardBox = React.createClass({
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
        name: "Time Series",
      },
      {
        id: "histogram",
        name: "Histogram",
      }
    ];

    return (
      <div className="selectedProjectBlockBox">

        <ProjectSelectionSummaryBox
          projects={this.state.projects}
        />

        <ChartBox
          chartType={this.state.selectedChartTypeId}
          fuelType={this.state.selectedFuelTypeId}
          energyUnit={this.state.selectedEnergyUnitId}
          projects={this.state.projects}
          meter_run_list_url={this.props.meter_run_list_url}
        />

        <CategorySelector
          title={"Chart Type Selector"}
          categories={chartTypes}
          selectCategoryCallback={this.selectChartTypeCallback}
          selectedCategoryId={this.state.selectedChartTypeId}
        />

        <ProjectFilterBox
          selectProjectBlocksCallback={this.selectProjectBlocksCallback}

          selectFuelTypeCallback={this.selectFuelTypeCallback}
          selectedFuelTypeId={this.state.selectedFuelTypeId}

          selectEnergyUnitCallback={this.selectEnergyUnitCallback}
          selectedEnergyUnitId={this.state.selectedEnergyUnitId}

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

    var filters = [
      (<li className="list-group-item" key={"projectBlockFilter"}>
        <ProjectBlockFilter
          {...this.props}
        />
      </li>),
      (<li className="list-group-item" key={"fuelTypeFilter"}>
        <CategorySelector
          title={"Fuel Type Selector"}
          categories={fuelTypes}
          selectCategoryCallback={this.props.selectFuelTypeCallback}
          selectedCategoryId={this.props.selectedFuelTypeId}
        />
      </li>),
      (<li className="list-group-item" key={"energyUnitFilter"}>
        <CategorySelector
          title={"Energy Unit Selector"}
          categories={energyUnits}
          selectCategoryCallback={this.props.selectEnergyUnitCallback}
          selectedCategoryId={this.props.selectedEnergyUnitId}
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

    var handleSelectProjectBlock = this.handleSelectProjectBlock;
    var handleDeselectProjectBlock = this.handleDeselectProjectBlock;
    var selectedProjectBlockIds = this.state.selectedProjectBlockIds;

    var projectBlockListItems = this.state.projectBlockList.map(function(d, i) {
      var selected = (selectedProjectBlockIds.indexOf(d.id) != -1);
      return (
        <ProjectBlockListItem
          key={d.id}
          selected={selected}
          handleSelectProjectBlock={handleSelectProjectBlock}
          handleDeselectProjectBlock={handleDeselectProjectBlock}
          projectBlock={d}
        />
      );
    });

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
    var handleSelectFuelType = this.props.handleSelectFuelType;
    var fuelTypeListItems = this.props.fuelTypes.map(function(d,i) {
      return (
        <FuelTypeListItem
          key={i}
          fuelType={d}
          handleSelectFuelType={handleSelectFuelType}
        />
      );
    });
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
        <h5>Stats</h5>
        <ul className="list-group">
          <li className="list-group-item">Number of projects: {this.props.projects.length}</li>
        </ul>
      </div>
    )
  }
});

var CategorySelector = React.createClass({
  render: function() {

    var selectCategoryCallback = this.props.selectCategoryCallback;

    var selectedCategoryId = this.props.selectedCategoryId;

    var categoryListItems = this.props.categories.map(function(d, i) {
      var selected = (selectedCategoryId == d.id);
      return (
        <CategoryListItem
          key={i}
          category={d}
          selected={selected}
          selectCategoryCallback={selectCategoryCallback}
        />
      )
    });

    return (
      <div className="categorySelector">
        <h5>{this.props.title}</h5>
        <ul className="list-group">
          {categoryListItems}
        </ul>
      </div>
    )
  }
});

var CategoryListItem = React.createClass({
  handleSelect: function() {
    this.props.selectCategoryCallback(this.props.category.id);
  },
  render: function() {
    var toggleSelect;
    if (this.props.selected) {
      toggleSelect = <span>Selected</span>
    } else {
      toggleSelect = <a onClick={this.handleSelect}>Select</a>
    }
    return (
      <li className="categoryItem list-group-item">
        <span>{this.props.category.name}&nbsp;</span>
        {toggleSelect}
      </li>
    )
  }
});

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
        <TimeSeries
        />
      )
    } else {
      chartComponent = <span>Please Select a Chart</span>
    }

    return (
      <div className="chartBox">
        <h5>Chart Box</h5>
        <div className="panel panel-default">
          <div className="panel-body">
            {chartComponent}
          </div>
        </div>
      </div>
    )
  }
});

var Histogram = React.createClass({
  loadMeterRuns: function(nextProps) {
    var meterRunListURL = nextProps.meter_run_list_url + "?summary=True";

    if (this.props.fuelType == "E" || this.props.fuelType == "BOTH") {
      meterRunListURL += "&fuel_type=E"
    }

    if (this.props.fuelType == "NG" || this.props.fuelType == "BOTH") {
      meterRunListURL += "&fuel_type=NG"
    }

    if (nextProps.projects.length > 0) {
      meterRunListURL += "&projects=" + nextProps.projects.map(function(d, i){
        return d.id;
      }).join("+");
    }

    $.ajax({
      url: meterRunListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({meterRuns: data}, this.renderChart);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(meterRunListURL, status, err.toString());
      }.bind(this)
    });
  },
  histogramChart: function() {
    var margin = {top: 20, right: 25, bottom: 25, left: 20},
      width = this.state.width,
      height = 150;

    var project_meter_runs = {};
    this.state.meterRuns.forEach(function(d, i) {
      if (d.project in project_meter_runs) {
        project_meter_runs[d.project].push(d)
      } else {
        project_meter_runs[d.project] = [d]
      }
    });

    var values = [];
    for (var project_id in project_meter_runs) {
      if (project_meter_runs.hasOwnProperty(project_id)) {

        var annual_savings = {E: 0, NG: 0};
        project_meter_runs[project_id].forEach(function(meter_run) {
          if (meter_run.annual_savings != null) {
            if (meter_run.fuel_type == "E") {
              annual_savings.E += meter_run.annual_savings;
            } else if (meter_run.fuel_type == "NG") {
              annual_savings.NG += meter_run.annual_savings;
            }
          }
        });

        if (this.props.energyUnit == "KWH") {
          values.push(annual_savings.E + (annual_savings.NG * 29.3001));
        } else if (this.props.energyUnit == "THERM") {
          values.push((annual_savings.E * 0.034) + (annual_savings.NG));
        }
      }
    }

    console.log(values);

    function chart(selection) {
      selection.each(function() {

        // A formatter for counts.
        var formatCount = d3.format(",.0f");

        var x = d3.scale.linear()
            .domain(d3.extent(values, function(d) { return d; }))
            .range([0, width]);

        // Generate a histogram using twenty uniformly-spaced bins.
        var data = d3.layout.histogram()
            .bins(x.ticks(20))
            (values);

        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.y; })])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var svg = d3.select(this);
          svg.selectAll("*").remove();

        svg.attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var bar = svg.selectAll(".bar")
            .data(data)
          .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        bar.append("rect")
            .attr("x", 1)
            .attr("width", x(data[0].dx) - 1)
            .attr("height", function(d) { return height - y(d.y); });

        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", 6)
            .attr("x", x(data[0].dx) / 2)
            .attr("text-anchor", "middle")
            .text(function(d) { return formatCount(d.y); });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

      });
    }

    chart.margin = function(_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    return chart;
  },
  handleResize: function(e) {
    this.setState({
      width: this.getCurrentWidth(),
    });
    this.renderChart();
  },
  getCurrentWidth: function() {
    return $(ReactDOM.findDOMNode(this)).parent().width();
  },
  componentDidMount: function() {
    this.setState({
      width: this.getCurrentWidth(),
    });
    window.addEventListener('resize', this.handleResize);
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.handleResize);
  },
  componentWillReceiveProps: function(nextProps) {
    this.loadMeterRuns(nextProps);
  },
  shouldComponentUpdate: function(props) {
    return false;
  },
  getInitialState: function() {
    return {
      width: 0,
      meterRuns: [],
    }
  },
  renderChart: function() {
    d3.select(ReactDOM.findDOMNode(this))
      .call(this.histogramChart());
  },
  render: function() {
    return (
      <svg className="histogram"></svg>
    )
  }
});

var TimeSeries = React.createClass({
  render: function() {
    return (
      <div className="timeSeries">
        Time Series
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
