var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var DashboardBox = React.createClass({
  displayName: "DashboardBox",

  render: function () {
    return React.createElement(
      "div",
      { className: "dashboardBox container-fluid" },
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "col-xs-12" },
          React.createElement(ProjectDataBox, this.props)
        )
      )
    );
  }
});

var ProjectDataBox = React.createClass({
  displayName: "ProjectDataBox",

  loadProjects: function () {
    var projectListURL = this.props.project_list_url;

    var filterParam = this.state.projectBlockIdFilterMode == "OR" ? "projectblock_or" : "projectblock_and";
    var params = this.state.selectedProjectBlockIds.map(function (d, i) {
      return filterParam + "=" + d;
    });

    if (params.length > 0) {
      projectListURL += "?" + params.join("&");
    }

    $.ajax({
      url: projectListURL,
      dataType: 'json',
      cache: false,
      success: (function (data) {
        this.setState({ projects: data });
      }).bind(this),
      error: (function (xhr, status, err) {
        console.error(projectListURL, status, err.toString());
      }).bind(this)
    });
  },
  selectProjectBlocksCallback: function (data) {
    this.setState({
      selectedProjectBlockIds: data.ids,
      projectBlockIdFilterMode: data.filterMode
    }, this.loadProjects);
  },
  selectChartTypeCallback: function (chartTypeId) {
    this.setState({ selectedChartTypeId: chartTypeId });
  },
  selectFuelTypeCallback: function (fuelTypeId) {
    this.setState({ selectedFuelTypeId: fuelTypeId });
  },
  selectEnergyUnitCallback: function (energyUnitId) {
    this.setState({ selectedEnergyUnitId: energyUnitId });
  },
  getInitialState: function () {
    return {
      projects: [],
      selectedProjectBlockIds: [],
      projectBlockIdFilterMode: "OR",
      selectedChartTypeId: "histogram",
      selectedFuelTypeId: "E",
      selectedEnergyUnitId: "KWH"
    };
  },
  componentDidMount: function () {
    this.loadProjects();
  },
  render: function () {

    var chartTypes = [{
      id: "timeSeries",
      name: "Time Series"
    }, {
      id: "histogram",
      name: "Histogram"
    }];

    return React.createElement(
      "div",
      { className: "selectedProjectBlockBox" },
      React.createElement(ProjectSelectionSummaryBox, {
        projects: this.state.projects
      }),
      React.createElement(ChartBox, {
        chartType: this.state.selectedChartTypeId,
        fuelType: this.state.selectedFuelTypeId,
        energyUnit: this.state.selectedEnergyUnitId,
        projects: this.state.projects,
        meter_run_list_url: this.props.meter_run_list_url
      }),
      React.createElement(CategorySelector, {
        title: "Chart Type Selector",
        categories: chartTypes,
        selectCategoryCallback: this.selectChartTypeCallback,
        selectedCategoryId: this.state.selectedChartTypeId
      }),
      React.createElement(ProjectFilterBox, _extends({
        selectProjectBlocksCallback: this.selectProjectBlocksCallback,

        selectFuelTypeCallback: this.selectFuelTypeCallback,
        selectedFuelTypeId: this.state.selectedFuelTypeId,

        selectEnergyUnitCallback: this.selectEnergyUnitCallback,
        selectedEnergyUnitId: this.state.selectedEnergyUnitId,

        projectBlockIdFilterMode: this.state.projectBlockIdFilterMode
      }, this.props)),
      React.createElement(ProjectTable, {
        projects: this.state.projects
      })
    );
  }
});

var ProjectFilterBox = React.createClass({
  displayName: "ProjectFilterBox",

  render: function () {

    var fuelTypes = [{
      id: "E",
      name: "Electricity"
    }, {
      id: "NG",
      name: "Natural Gas"
    }, {
      id: "BOTH",
      name: "Combined"
    }];

    var energyUnits = [{
      id: "KWH",
      name: "kWh"
    }, {
      id: "THERM",
      name: "therms"
    }];

    var filters = [React.createElement(
      "li",
      { className: "list-group-item", key: "projectBlockFilter" },
      React.createElement(ProjectBlockFilter, this.props)
    ), React.createElement(
      "li",
      { className: "list-group-item", key: "fuelTypeFilter" },
      React.createElement(CategorySelector, {
        title: "Fuel Type Selector",
        categories: fuelTypes,
        selectCategoryCallback: this.props.selectFuelTypeCallback,
        selectedCategoryId: this.props.selectedFuelTypeId
      })
    ), React.createElement(
      "li",
      { className: "list-group-item", key: "energyUnitFilter" },
      React.createElement(CategorySelector, {
        title: "Energy Unit Selector",
        categories: energyUnits,
        selectCategoryCallback: this.props.selectEnergyUnitCallback,
        selectedCategoryId: this.props.selectedEnergyUnitId
      })
    )];

    // (<li className="list-group-item" key={"dateRangesFilter"}> <DateRangesFilter/> </li>),
    // (<li className="list-group-item" key={"zipCodeFilter"}> <ZipCodeFilter/> </li>),
    // (<li className="list-group-item" key={"projectCostFilter"}> <ProjectCostFilter/> </li>),
    // (<li className="list-group-item" key={"climateZoneFilter"}> <ClimateZoneFilter/> </li>),
    // (<li className="list-group-item" key={"ecmFilter"}> <EnergyConservationMeasureFilter/> </li>),
    return React.createElement(
      "div",
      { className: "projectFilterBox" },
      React.createElement(
        "h5",
        null,
        "Project Filters"
      ),
      React.createElement(
        "ul",
        { className: "list-group" },
        filters
      )
    );
  }
});

var ProjectBlockFilter = React.createClass({
  displayName: "ProjectBlockFilter",

  loadProjectBlocks: function () {
    $.ajax({
      url: this.props.project_block_list_url + "?name_only=true",
      dataType: 'json',
      cache: false,
      success: (function (data) {
        this.setState({ projectBlockList: data });
      }).bind(this),
      error: (function (xhr, status, err) {
        console.error(this.props.project_block_list_url + "?name_only=true", status, err.toString());
      }).bind(this)
    });
  },
  handleSelectProjectBlock: function (projectBlockId) {
    var ids = this.state.selectedProjectBlockIds;
    ids.push(projectBlockId);
    this.setState({ selectedProjectBlockIds: ids }, this.callCallback);
  },
  handleDeselectProjectBlock: function (projectBlockId) {
    var ids = this.state.selectedProjectBlockIds;
    var index = ids.indexOf(projectBlockId);
    if (index != -1) {
      ids.splice(index, 1);
    }
    this.setState({ selectedProjectBlockIds: ids }, this.callCallback);
  },
  toggleFilterModeCallback: function () {
    var filterMode = this.state.filterMode == "OR" ? "AND" : "OR";
    this.setState({ filterMode: filterMode }, this.callCallback);
  },
  callCallback: function () {
    this.props.selectProjectBlocksCallback({
      ids: this.state.selectedProjectBlockIds,
      filterMode: this.state.filterMode
    });
  },
  getInitialState: function () {
    return {
      projectBlockList: [],
      selectedProjectBlockIds: [],
      filterMode: this.props.projectBlockIdFilterMode
    };
  },
  componentDidMount: function () {
    this.loadProjectBlocks();
  },
  render: function () {

    var handleSelectProjectBlock = this.handleSelectProjectBlock;
    var handleDeselectProjectBlock = this.handleDeselectProjectBlock;
    var selectedProjectBlockIds = this.state.selectedProjectBlockIds;

    var projectBlockListItems = this.state.projectBlockList.map(function (d, i) {
      var selected = selectedProjectBlockIds.indexOf(d.id) != -1;
      return React.createElement(ProjectBlockListItem, {
        key: d.id,
        selected: selected,
        handleSelectProjectBlock: handleSelectProjectBlock,
        handleDeselectProjectBlock: handleDeselectProjectBlock,
        projectBlock: d
      });
    });

    return React.createElement(
      "div",
      { className: "projectBlockFilter" },
      React.createElement(
        "span",
        null,
        "Filter by project blocks"
      ),
      React.createElement(FilterMode, {
        toggleFilterModeCallback: this.toggleFilterModeCallback,
        filterMode: this.state.filterMode
      }),
      React.createElement(
        "ul",
        { className: "list-group" },
        projectBlockListItems
      )
    );
  }
});

var FilterMode = React.createClass({
  displayName: "FilterMode",

  render: function () {
    return React.createElement(
      "div",
      { className: "filterMode" },
      React.createElement(
        "span",
        null,
        "Filter Mode: ",
        this.props.filterMode,
        "  ",
        React.createElement(
          "a",
          { onClick: this.props.toggleFilterModeCallback },
          "toggle"
        )
      )
    );
  }
});

var ProjectBlockListItem = React.createClass({
  displayName: "ProjectBlockListItem",

  handleSelect: function () {
    if (this.props.selected) {
      this.props.handleDeselectProjectBlock(this.props.projectBlock.id);
    } else {
      this.props.handleSelectProjectBlock(this.props.projectBlock.id);
    }
  },
  render: function () {

    var selectedText;
    if (this.props.selected) {
      selectedText = "Selected - click to deselect";
    } else {
      selectedText = "Unselected - click to select";
    }

    return React.createElement(
      "li",
      { className: "projectBlockListItem list-group-item clearfix" },
      React.createElement(
        "span",
        null,
        this.props.projectBlock.name,
        " "
      ),
      React.createElement(
        "a",
        { onClick: this.handleSelect },
        selectedText
      )
    );
  }
});

var FuelTypeFilter = React.createClass({
  displayName: "FuelTypeFilter",

  render: function () {
    var handleSelectFuelType = this.props.handleSelectFuelType;
    var fuelTypeListItems = this.props.fuelTypes.map(function (d, i) {
      return React.createElement(FuelTypeListItem, {
        key: i,
        fuelType: d,
        handleSelectFuelType: handleSelectFuelType
      });
    });
    return React.createElement(
      "div",
      { className: "fuelTypeFilter" },
      React.createElement(
        "span",
        null,
        "Filter by energy Type"
      ),
      React.createElement(
        "ul",
        { className: "list-group" },
        fuelTypeListItems
      )
    );
  }
});

var FuelTypeListItem = React.createClass({
  displayName: "FuelTypeListItem",

  handleSelect: function () {
    this.props.handleSelectFuelType(this.props.fuelType);
  },
  render: function () {
    return React.createElement(
      "li",
      { className: "fuelTypeListItem list-group-item clearfix" },
      React.createElement(
        "a",
        { onClick: this.handleSelect },
        this.props.fuelType.name
      )
    );
  }
});

var ClimateZoneFilter = React.createClass({
  displayName: "ClimateZoneFilter",

  render: function () {
    return React.createElement(
      "div",
      { className: "climateZoneFilter" },
      "Filter by climate zone"
    );
  }
});

var DateRangesFilter = React.createClass({
  displayName: "DateRangesFilter",

  render: function () {
    return React.createElement(
      "div",
      { className: "dateRangesFilter" },
      "Filter by date ranges"
    );
  }
});

var ZipCodeFilter = React.createClass({
  displayName: "ZipCodeFilter",

  render: function () {
    return React.createElement(
      "div",
      { className: "zipCodeFilter" },
      "Filter by ZIP code"
    );
  }
});

var ProjectCostFilter = React.createClass({
  displayName: "ProjectCostFilter",

  render: function () {
    return React.createElement(
      "div",
      { className: "projectCostFilter" },
      "Filter by project cost"
    );
  }
});
var EnergyConservationMeasureFilter = React.createClass({
  displayName: "EnergyConservationMeasureFilter",

  render: function () {
    return React.createElement(
      "div",
      { className: "energyConservationMeasureFilter" },
      "Filter by ECM"
    );
  }
});

var ProjectSelectionSummaryBox = React.createClass({
  displayName: "ProjectSelectionSummaryBox",

  render: function () {
    return React.createElement(
      "div",
      { className: "projectSummaryBox" },
      React.createElement(
        "h5",
        null,
        "Stats"
      ),
      React.createElement(
        "ul",
        { className: "list-group" },
        React.createElement(
          "li",
          { className: "list-group-item" },
          "Number of projects: ",
          this.props.projects.length
        )
      )
    );
  }
});

var CategorySelector = React.createClass({
  displayName: "CategorySelector",

  render: function () {

    var selectCategoryCallback = this.props.selectCategoryCallback;

    var selectedCategoryId = this.props.selectedCategoryId;

    var categoryListItems = this.props.categories.map(function (d, i) {
      var selected = selectedCategoryId == d.id;
      return React.createElement(CategoryListItem, {
        key: i,
        category: d,
        selected: selected,
        selectCategoryCallback: selectCategoryCallback
      });
    });

    return React.createElement(
      "div",
      { className: "categorySelector" },
      React.createElement(
        "h5",
        null,
        this.props.title
      ),
      React.createElement(
        "ul",
        { className: "list-group" },
        categoryListItems
      )
    );
  }
});

var CategoryListItem = React.createClass({
  displayName: "CategoryListItem",

  handleSelect: function () {
    this.props.selectCategoryCallback(this.props.category.id);
  },
  render: function () {
    var toggleSelect;
    if (this.props.selected) {
      toggleSelect = React.createElement(
        "span",
        null,
        "Selected"
      );
    } else {
      toggleSelect = React.createElement(
        "a",
        { onClick: this.handleSelect },
        "Select"
      );
    }
    return React.createElement(
      "li",
      { className: "categoryItem list-group-item" },
      React.createElement(
        "span",
        null,
        this.props.category.name,
        " "
      ),
      toggleSelect
    );
  }
});

var ChartBox = React.createClass({
  displayName: "ChartBox",

  render: function () {

    var chartComponent;
    if (this.props.chartType == "histogram") {
      chartComponent = React.createElement(Histogram, {
        projects: this.props.projects,
        fuelType: this.props.fuelType,
        energyUnit: this.props.energyUnit,
        meter_run_list_url: this.props.meter_run_list_url
      });
    } else if (this.props.chartType == "timeSeries") {
      chartComponent = React.createElement(TimeSeries, null);
    } else {
      chartComponent = React.createElement(
        "span",
        null,
        "Please Select a Chart"
      );
    }

    return React.createElement(
      "div",
      { className: "chartBox" },
      React.createElement(
        "h5",
        null,
        "Chart Box"
      ),
      React.createElement(
        "div",
        { className: "panel panel-default" },
        React.createElement(
          "div",
          { className: "panel-body" },
          chartComponent
        )
      )
    );
  }
});

var Histogram = React.createClass({
  displayName: "Histogram",

  loadMeterRuns: function (nextProps) {
    var meterRunListURL = nextProps.meter_run_list_url + "?summary=True";

    if (this.props.fuelType == "E" || this.props.fuelType == "BOTH") {
      meterRunListURL += "&fuel_type=E";
    }

    if (this.props.fuelType == "NG" || this.props.fuelType == "BOTH") {
      meterRunListURL += "&fuel_type=NG";
    }

    if (nextProps.projects.length > 0) {
      meterRunListURL += "&projects=" + nextProps.projects.map(function (d, i) {
        return d.id;
      }).join("+");
    }

    var targetStateCounter = this.state.renderCounter;

    $.ajax({
      url: meterRunListURL,
      dataType: 'json',
      cache: false,
      success: (function (data) {
        // don't render if old (slow) ajax call. TODO find source of error.
        if (targetStateCounter == this.state.renderCounter) {
          this.setState({ meterRuns: data }, this.renderChart);
        }
      }).bind(this),
      error: (function (xhr, status, err) {
        console.error(meterRunListURL, status, err.toString());
      }).bind(this)
    });
  },
  histogramChart: function (values) {
    var w = this.state.width;
    var h = 150;
    var margin = { top: 20, right: 20 + w / 4, bottom: 25, left: 20 + w / 4 },
        width = w - margin.right - margin.left,
        height = h - margin.top - margin.bottom;

    function chart(selection) {
      selection.each(function () {

        // A formatter for counts.
        var formatCount = d3.format(",.0f");

        var x = d3.scale.linear().domain(d3.extent(values, function (d) {
          return d;
        })).range([0, width]);

        // Generate a histogram using twenty uniformly-spaced bins.
        var data = d3.layout.histogram().bins(x.ticks(20))(values);

        var y = d3.scale.linear().domain([0, d3.max(data, function (d) {
          return d.y;
        })]).range([height, 0]);

        var xAxis = d3.svg.axis().scale(x).orient("bottom");

        var svg = d3.select(this);
        svg.selectAll("*").remove();

        svg.attr("width", w).attr("height", h).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var bar = svg.selectAll(".bar").data(data).enter().append("g").attr("class", "bar").attr("transform", function (d) {
          return "translate(" + x(d.x) + "," + y(d.y) + ")";
        });

        bar.append("rect").attr("x", 1).attr("width", x(data[0].dx) - 1).attr("height", function (d) {
          return height - y(d.y);
        });

        bar.append("text").attr("dy", ".75em").attr("y", 6).attr("x", x(data[0].dx) / 2).attr("text-anchor", "middle").text(function (d) {
          return formatCount(d.y);
        });

        svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
      });
    }

    chart.margin = function (_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };

    chart.width = function (_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };

    chart.height = function (_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };

    return chart;
  },
  handleResize: function (e) {
    this.setState({
      width: this.getCurrentWidth()
    });
    this.renderChart();
  },
  getCurrentWidth: function () {
    return $(ReactDOM.findDOMNode(this)).parent().width();
  },
  componentDidMount: function () {
    this.setState({
      width: this.getCurrentWidth()
    });
    window.addEventListener('resize', this.handleResize);
  },
  componentWillUnmount: function () {
    window.removeEventListener('resize', this.handleResize);
  },
  componentWillReceiveProps: function (nextProps) {
    this.loadMeterRuns(nextProps);
  },
  shouldComponentUpdate: function (props) {
    return false;
  },
  getInitialState: function () {
    return {
      width: 0,
      meterRuns: [],
      renderCounter: 0 };
  },
  // catching an extra rerender that (TODO) needs to be found
  incrementRenderCounter: function () {
    this.setState({ renderCounter: this.state.renderCounter + 1 });
  },
  renderChart: function () {
    this.incrementRenderCounter();
    d3.select(ReactDOM.findDOMNode(this)).call(this.histogramChart(this.getChartValues()));
  },
  getChartValues: function () {

    var project_meter_runs = {};
    this.state.meterRuns.forEach(function (d, i) {
      if (d.project in project_meter_runs) {
        project_meter_runs[d.project].push(d);
      } else {
        project_meter_runs[d.project] = [d];
      }
    });

    var values = [];
    for (var project_id in project_meter_runs) {
      if (project_meter_runs.hasOwnProperty(project_id)) {

        var annual_savings = { E: 0, NG: 0 };
        project_meter_runs[project_id].forEach(function (meter_run) {
          if (meter_run.annual_savings != null) {
            if (meter_run.fuel_type == "E") {
              annual_savings.E += meter_run.annual_savings;
            } else if (meter_run.fuel_type == "NG") {
              annual_savings.NG += meter_run.annual_savings;
            }
          }
        });

        if (this.props.energyUnit == "KWH") {
          values.push(annual_savings.E + annual_savings.NG * 29.3001);
        } else if (this.props.energyUnit == "THERM") {
          values.push(annual_savings.E * 0.034 + annual_savings.NG);
        }
      }
    }

    return values;
  },
  render: function () {
    return React.createElement("svg", { className: "histogram" });
  }
});

var TimeSeries = React.createClass({
  displayName: "TimeSeries",

  render: function () {
    return React.createElement(
      "div",
      { className: "timeSeries" },
      "Time Series"
    );
  }
});

var ProjectTable = React.createClass({
  displayName: "ProjectTable",

  render: function () {
    var projects = this.props.projects.map(function (d, i) {
      return React.createElement(ProjectTableItem, {
        key: d.id,
        project: d
      });
    });
    return React.createElement(
      "div",
      { className: "projectTable" },
      "Project Table",
      React.createElement(
        "ul",
        { className: "list-group" },
        projects
      )
    );
  }
});

var ProjectTableItem = React.createClass({
  displayName: "ProjectTableItem",

  handleSelect: function () {
    console.log(this.props.project);
  },
  render: function () {
    return React.createElement(
      "li",
      { className: "list-group-item clearfix" },
      React.createElement(
        "a",
        { onClick: this.handleSelect },
        this.props.project.project_id
      )
    );
  }
});