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

    var params = this.state.selectedProjectBlockIds.map(function (d, i) {
      return (this.state.projectBlockIdFilterMode == "OR" ? "projectblock_or" : "projectblock_and") + "=" + d;
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
        console.error(this.props.url, status, err.toString());
      }).bind(this)
    });
  },
  selectProjectBlocksCallback: function (data) {
    console.log(data);
    this.setState({
      selectedProjectBlockIds: data.ids,
      projectBlockIdFilterMode: data.filterMode
    }, this.loadProjects);
  },
  selectChartTypeCallback: function (chartTypeId) {
    this.setState({ selectedChartTypeId: chartTypeId });
  },
  getInitialState: function () {
    return {
      projects: [],
      selectedProjectBlockIds: [],
      projectBlockIdFilterMode: "OR",
      selectedChartTypeId: "histogram"
    };
  },
  componentDidMount: function () {
    this.loadProjects();
  },
  render: function () {

    return React.createElement(
      "div",
      { className: "selectedProjectBlockBox" },
      React.createElement(ChartBox, {
        selectedChartTypeId: this.state.selectedChartTypeId,
        projects: this.state.projects,
        recent_meter_run_list_url: this.props.recent_meter_run_list_url
      }),
      React.createElement(ChartSelector, {
        selectChartTypeCallback: this.selectChartTypeCallback,
        selectedChartTypeId: this.state.selectedChartTypeId
      }),
      React.createElement(ProjectFilterBox, _extends({
        selectProjectBlocksCallback: this.selectProjectBlocksCallback,
        projectBlockIdFilterMode: this.state.projectBlockIdFilterMode
      }, this.props)),
      React.createElement(ProjectSelectionSummaryBox, {
        projects: this.state.projects
      }),
      React.createElement(ProjectTable, {
        projects: this.state.projects
      })
    );
  }
});

var ProjectFilterBox = React.createClass({
  displayName: "ProjectFilterBox",

  handleSelectEnergyType: function (data) {
    console.log(data);
  },
  render: function () {

    var energyTypes = [{ name: "Electricity" }, { name: "Natural Gas" }];

    var filters = [React.createElement(
      "li",
      { className: "list-group-item", key: "projectBlockFilter" },
      React.createElement(ProjectBlockFilter, this.props)
    ), React.createElement(
      "li",
      { className: "list-group-item", key: "energyTypeFilter" },
      React.createElement(EnergyTypeFilter, _extends({
        energyTypes: energyTypes,
        handleSelectEnergyType: this.handleSelectEnergyType
      }, this.props))
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
        console.error(this.props.url, status, err.toString());
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

var EnergyTypeFilter = React.createClass({
  displayName: "EnergyTypeFilter",

  render: function () {
    var handleSelectEnergyType = this.props.handleSelectEnergyType;
    var energyTypeListItems = this.props.energyTypes.map(function (d, i) {
      return React.createElement(EnergyTypeListItem, {
        key: i,
        energyType: d,
        handleSelectEnergyType: handleSelectEnergyType
      });
    });
    return React.createElement(
      "div",
      { className: "energyTypeFilter" },
      React.createElement(
        "span",
        null,
        "Filter by energy Type"
      ),
      React.createElement(
        "ul",
        { className: "list-group" },
        energyTypeListItems
      )
    );
  }
});

var EnergyTypeListItem = React.createClass({
  displayName: "EnergyTypeListItem",

  handleSelect: function () {
    this.props.handleSelectEnergyType(this.props.energyType);
  },
  render: function () {
    return React.createElement(
      "li",
      { className: "energyTypeListItem list-group-item clearfix" },
      React.createElement(
        "a",
        { onClick: this.handleSelect },
        this.props.energyType.name
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
        "Project Selection Summary"
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

var ChartSelector = React.createClass({
  displayName: "ChartSelector",

  render: function () {

    var chartTypes = [{
      id: "timeSeries",
      name: "Time Series"
    }, {
      id: "histogram",
      name: "Histogram"
    }];

    var selectChartTypeCallback = this.props.selectChartTypeCallback;

    var selectedChartTypeId = this.props.selectedChartTypeId;

    var chartTypeListItems = chartTypes.map(function (d, i) {
      var selected = selectedChartTypeId == d.id;
      return React.createElement(ChartTypeListItem, {
        key: i,
        chartType: d,
        selected: selected,
        selectChartTypeCallback: selectChartTypeCallback
      });
    });

    return React.createElement(
      "div",
      { className: "chartSelector" },
      React.createElement(
        "h5",
        null,
        "Chart Selector"
      ),
      React.createElement(
        "ul",
        { className: "list-group" },
        chartTypeListItems
      )
    );
  }
});

var ChartTypeListItem = React.createClass({
  displayName: "ChartTypeListItem",

  handleSelect: function () {
    this.props.selectChartTypeCallback(this.props.chartType.id);
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
      { className: "chartTypeListItem list-group-item" },
      React.createElement(
        "span",
        null,
        this.props.chartType.name,
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
    if (this.props.selectedChartTypeId == "histogram") {
      chartComponent = React.createElement(Histogram, {
        projects: this.props.projects,
        recent_meter_run_list_url: this.props.recent_meter_run_list_url
      });
    } else if (this.props.selectedChartTypeId == "timeSeries") {
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

  loadMeterRuns: function () {
    var meterRunListURL = this.props.recent_meter_run_list_url;

    if (this.props.projects.length > 0) {
      meterRunListURL += "?projects=" + this.props.projects.map(function (d, i) {
        return d.id;
      }).join("+");
    }

    $.ajax({
      url: meterRunListURL,
      dataType: 'json',
      cache: false,
      success: (function (data) {
        console.log(data);
        this.setState({ meterRuns: data });
      }).bind(this),
      error: (function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }).bind(this)
    });
  },
  histogramChart: function () {
    var margin = { top: 20, right: 25, bottom: 25, left: 20 },
        width = 760,
        height = 120;

    function chart(selection) {
      selection.each(function () {

        // Generate a Bates distribution of 10 random variables.
        var values = d3.range(1000).map(d3.random.bates(10));

        // A formatter for counts.
        var formatCount = d3.format(",.0f");

        var x = d3.scale.linear().domain([0, 1]).range([0, width]);

        // Generate a histogram using twenty uniformly-spaced bins.
        var data = d3.layout.histogram().bins(x.ticks(20))(values);

        var y = d3.scale.linear().domain([0, d3.max(data, function (d) {
          return d.y;
        })]).range([height, 0]);

        var xAxis = d3.svg.axis().scale(x).orient("bottom");

        var svg = d3.select(this);
        svg.selectAll("*").remove();

        svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
  componentDidMount: function () {
    this.loadMeterRuns();
    this.renderChart(this.props);
  },
  shouldComponentUpdate: function (props) {
    this.renderChart(this.props);
    return false;
  },
  renderChart: function (props) {
    d3.select(ReactDOM.findDOMNode(this)).call(this.histogramChart());
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