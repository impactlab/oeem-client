(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/Histogram.jsx":[function(require,module,exports){
var Histogram = React.createClass({displayName: "Histogram",
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

    var targetStateCounter = this.state.renderCounter;

    this.setState({loading: false});

    $.ajax({
      url: meterRunListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        // don't render if old (slow) ajax call. TODO find source of error.
        if (targetStateCounter == this.state.renderCounter) {
          this.setState({meterRuns: data}, this.renderChart);
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(meterRunListURL, status, err.toString());
      }.bind(this)
    });
  },
  histogramChart: function(values) {
    var w = this.state.width;
    var h = 200;
    var bins = 15;
    var margin = { top: 30, right: 10, bottom: 40, left: 40},
      width = w - margin.right - margin.left,
      height = h - margin.top - margin.bottom,
      barWidth = Math.floor(width / bins) - 2;

    var energyUnit;
    if (this.props.energyUnit == "KWH") {
      energyUnit = "kWh";
    } else {
      energyUnit = "therms";
    }

    var fuelType;
    if (this.props.fuelType == "E") {
      fuelType = "Electricity";
    } else if (this.props.fuelType == "NG") {
      fuelType = "Natural Gas";
    } else {
      fuelType = "Combined";
    }

    function chart(selection) {
      selection.each(function() {

        // A formatter for counts.
        var formatCount = d3.format(",.0f");
        var formatAxis = d3.format(".2s");

        var x = d3.scale.linear()
            .domain(d3.extent(values, function(d) { return d; }))
            .range([0, width]);

        // Generate a histogram using twenty uniformly-spaced bins.
        var data = d3.layout.histogram()
            .bins(bins)
            (values);

        var y = d3.scale.linear()
            .domain([0, d3.max(data, function(d) { return d.y; })])
            .range([height, 0]);

        console.log(x.domain());
        var tempScale = d3.scale.linear().domain([0, bins]).range(x.domain());
        var tickArray = d3.range(bins + 1).map(tempScale);
        var xAxis = d3.svg.axis()
            .scale(x)
            .tickValues(tickArray)
            .tickFormat(formatAxis)
            .orient("bottom");

        var tip = d3.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return "<span>" + d.y + " projects</span>";
          })

        var svg = d3.select(this.getElementsByTagName('svg')[0]);
        svg.selectAll("*").remove();

        svg = svg.attr("width", w).attr("height", h)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(tip);

        var bar = svg.selectAll(".bar")
            .data(data)
          .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

        // bars
        bar.append("rect")
            .attr("x", 1)
            .attr("width", barWidth)
            .attr("height", function(d) { return height - y(d.y); })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        // x axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // rotate the axis labels
        svg.selectAll(".x.axis text")
          .attr("transform", function(d) {
             return "translate(" + -1 * this.getBBox().height + "," + 0.5*this.getBBox().height + ")rotate(-30)";
         });

        // title
        svg.append("text")
                .attr("x", (width / 2))
                .attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .text("Histogram of Annual Project Savings - " + fuelType + " (" + energyUnit + " / year)");

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

    this.loadMeterRuns(this.props);
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
      loading: false,
      validData: false,
      meterRuns: [],
      renderCounter: 0, // catching an extra rerender that (TODO) needs to be found
    }
  },
  incrementRenderCounter: function() {
    this.setState({renderCounter: this.state.renderCounter + 1});
  },
  renderChart: function() {
    this.incrementRenderCounter();

    var values = this.getChartValues();
    if (values.length > 0) {
      d3.select(ReactDOM.findDOMNode(this))
        .call(this.histogramChart(values));
    }
  },
  getChartValues: function() {

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

    return values;

  },
  render: function() {

    var spinnerCfg = { lines: 9, length: 9, width: 5, radius: 10, corners: 1,
      color: '#001', opacity: 0.2, className: 'spinner', top: '95px',
      position: 'relative',
    }

    var spinner = (
      React.createElement(ReactSpinner, {config: spinnerCfg, stopped: this.state.loading})
    )
    spinner = null;

    return (
      React.createElement("div", {className: "histogram"}, 
        spinner, 
        React.createElement("svg", {className: "histogram", height: "200", width: "100%"}
        )
      )
    )
  }
});

var ReactSpinner = React.createClass({displayName: "ReactSpinner",
  propTypes: {
    config: React.PropTypes.object,
    stopped: React.PropTypes.bool
  },

  componentDidMount: function() {
    this.spinner = new Spinner(this.props.config);
    this.spinner.spin(this.refs.container);
  },

  componentWillReceiveProps: function(newProps) {
    if (newProps.stopped === true && !this.props.stopped) {
      this.spinner.stop();
    } else if (!newProps.stopped && this.props.stopped === true) {
      this.spinner.spin(this.refs.container);
    }
  },

  componentWillUnmount: function() {
    this.spinner.stop();
  },

  render: function() {
    return (
      React.createElement("div", {className: "spinnerContainer", ref: "container"})
    );
  }
});

module.exports = Histogram;

},{}],"/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/Map.jsx":[function(require,module,exports){
var Map = React.createClass({displayName: "Map",
  render: function() {
    return (
      React.createElement("svg", {className: "map", height: "200px", width: "100%"})
    )
  }
});
module.exports = Map;

},{}],"/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/Scatterplot.jsx":[function(require,module,exports){
var scatterplot = require('./scatterplot');

var Scatterplot = React.createClass({displayName: "Scatterplot",
  propTypes: {
    data: React.PropTypes.array,
    domain: React.PropTypes.object
  },

  componentDidMount: function() {
    var el = ReactDOM.findDOMNode(this);
    scatterplot.create(el, {
      width: '100%',
      height: '200px'
    }, this.getChartState());
  },

  componentDidUpdate: function() {
    var el = ReactDOM.findDOMNode(this);
    scatterplot.update(el, this.getChartState());
  },

  getChartState: function() {
    return {
      data: this.props.data,
      domain: this.props.domain
    };
  },

  componentWillUnmount: function() {
    var el = ReactDOM.findDOMNode(this);
    scatterplot.destroy(el);
  },

  render: function() {
    return (
      React.createElement("div", {className: "scatterplot"})
    );
  }
});

module.exports = Scatterplot;

},{"./scatterplot":"/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/scatterplot.js"}],"/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/Timeseries.jsx":[function(require,module,exports){
var Timeseries = React.createClass({displayName: "Timeseries",
  render: function() {
    return (
      React.createElement("svg", {className: "timeSeries", height: "200px", width: "100%"})
    )
  }
});
module.exports = Timeseries;

},{}],"/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/main.jsx":[function(require,module,exports){
window.DashboardBox = React.createClass({displayName: "DashboardBox",
  render: function() {
    return (
      React.createElement("div", {className: "dashboardBox container-fluid"}, 
        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "col-xs-12"}, 
            React.createElement(ProjectDataBox, React.__spread({}, 
              this.props)
            )
          )
        )
      )
    )
  }
});

var ProjectDataBox = React.createClass({displayName: "ProjectDataBox",
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
      React.createElement("div", {className: "selectedProjectBlockBox"}, 

        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "col-md-12"}, 
            React.createElement(CategorySelector, {
              title: null, 
              categories: chartTypes, 
              selectCategoryCallback: this.selectChartTypeCallback, 
              selectedCategoryId: this.state.selectedChartTypeId}
            ), 
            React.createElement("br", null)
          )
        ), 


        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "col-md-8"}, 
            React.createElement(ChartBox, {
              chartType: this.state.selectedChartTypeId, 
              fuelType: this.state.selectedFuelTypeId, 
              energyUnit: this.state.selectedEnergyUnitId, 
              projects: this.state.projects, 
              meter_run_list_url: this.props.meter_run_list_url}
            )
          ), 

          React.createElement("div", {className: "col-md-4"}, 
            React.createElement(ProjectSelectionSummaryBox, {
              projects: this.state.projects}
            )
          )
        ), 

        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "col-md-4"}, 
            React.createElement(CategorySelector, {
              title: null, 
              categories: fuelTypes, 
              selectCategoryCallback: this.selectFuelTypeCallback, 
              selectedCategoryId: this.state.selectedFuelTypeId}
            )
          ), 

          React.createElement("div", {className: "col-md-4"}, 
            React.createElement(CategorySelector, {
              title: null, 
              categories: energyUnits, 
              selectCategoryCallback: this.selectEnergyUnitCallback, 
              selectedCategoryId: this.state.selectedEnergyUnitId}
            )
          )
        ), 

        React.createElement(ProjectFilterBox, React.__spread({
          selectProjectBlocksCallback: this.selectProjectBlocksCallback, 

          projectBlockIdFilterMode: this.state.projectBlockIdFilterMode}, 
          this.props)
        ), 

        React.createElement(ProjectTable, {
          projects: this.state.projects}
        )
      )
    )
  }
});

var ProjectFilterBox = React.createClass({displayName: "ProjectFilterBox",
  render: function() {

    var filters = [
      (React.createElement("li", {className: "list-group-item", key: "projectBlockFilter"}, 
        React.createElement(ProjectBlockFilter, React.__spread({}, 
          this.props)
        )
      )),
      // (<li className="list-group-item" key={"dateRangesFilter"}> <DateRangesFilter/> </li>),
      // (<li className="list-group-item" key={"zipCodeFilter"}> <ZipCodeFilter/> </li>),
      // (<li className="list-group-item" key={"projectCostFilter"}> <ProjectCostFilter/> </li>),
      // (<li className="list-group-item" key={"climateZoneFilter"}> <ClimateZoneFilter/> </li>),
      // (<li className="list-group-item" key={"ecmFilter"}> <EnergyConservationMeasureFilter/> </li>),
    ];

    return (
      React.createElement("div", {className: "projectFilterBox"}, 
        React.createElement("h5", null, "Project Filters"), 
        React.createElement("ul", {className: "list-group"}, 
          filters
        )
      )
    )
  }
});

var ProjectBlockFilter = React.createClass({displayName: "ProjectBlockFilter",
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
        React.createElement(ProjectBlockListItem, {
          key: d.id, 
          selected: selected, 
          handleSelectProjectBlock: this.handleSelectProjectBlock, 
          handleDeselectProjectBlock: this.handleDeselectProjectBlock, 
          projectBlock: d}
        )
      );
    }, this);

    return (
      React.createElement("div", {className: "projectBlockFilter"}, 
        React.createElement("span", null, "Filter by project blocks"), 
        React.createElement(FilterMode, {
          toggleFilterModeCallback: this.toggleFilterModeCallback, 
          filterMode: this.state.filterMode}
        ), 
        React.createElement("ul", {className: "list-group"}, 
         projectBlockListItems
        )
      )
    )
  }
});

var FilterMode = React.createClass({displayName: "FilterMode",
  render: function() {
    return (
      React.createElement("div", {className: "filterMode"}, 
        React.createElement("span", null, 
          "Filter Mode: ", this.props.filterMode, "  ", 
          React.createElement("a", {onClick: this.props.toggleFilterModeCallback}, "toggle")
        )
      )
    )
  }
});

var ProjectBlockListItem = React.createClass({displayName: "ProjectBlockListItem",
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
      React.createElement("li", {className: "projectBlockListItem list-group-item clearfix"}, 
        React.createElement("span", null, this.props.projectBlock.name, " "), 
        React.createElement("a", {onClick: this.handleSelect}, selectedText)
      )
    )
  }
});


var FuelTypeFilter = React.createClass({displayName: "FuelTypeFilter",
  render: function() {
    var fuelTypeListItems = this.props.fuelTypes.map(function(d,i) {
      return (
        React.createElement(FuelTypeListItem, {
          key: i, 
          fuelType: d, 
          handleSelectFuelType: this.props.handleSelectFuelType}
        )
      );
    }, this);
    return (
      React.createElement("div", {className: "fuelTypeFilter"}, 
        React.createElement("span", null, "Filter by energy Type"), 
        React.createElement("ul", {className: "list-group"}, 
         fuelTypeListItems
        )
      )
    )
  }
});

var FuelTypeListItem = React.createClass({displayName: "FuelTypeListItem",
  handleSelect: function() {
    this.props.handleSelectFuelType(this.props.fuelType);
  },
  render: function() {
    return (
      React.createElement("li", {className: "fuelTypeListItem list-group-item clearfix"}, 
        React.createElement("a", {onClick: this.handleSelect}, 
          this.props.fuelType.name
        )
      )
    )
  }
});

var ClimateZoneFilter = React.createClass({displayName: "ClimateZoneFilter",
  render: function() {
    return (
      React.createElement("div", {className: "climateZoneFilter"}, 
        "Filter by climate zone"
      )
    )
  }
});


var DateRangesFilter = React.createClass({displayName: "DateRangesFilter",
  render: function() {
    return (
      React.createElement("div", {className: "dateRangesFilter"}, 
        "Filter by date ranges"
      )
    )
  }
});

var ZipCodeFilter = React.createClass({displayName: "ZipCodeFilter",
  render: function() {
    return (
      React.createElement("div", {className: "zipCodeFilter"}, 
        "Filter by ZIP code"
      )
    )
  }
});

var ProjectCostFilter = React.createClass({displayName: "ProjectCostFilter",
  render: function() {
    return (
      React.createElement("div", {className: "projectCostFilter"}, 
        "Filter by project cost"
      )
    )
  }
});
var EnergyConservationMeasureFilter = React.createClass({displayName: "EnergyConservationMeasureFilter",
  render: function() {
    return (
      React.createElement("div", {className: "energyConservationMeasureFilter"}, 
        "Filter by ECM"
      )
    )
  }
});

var ProjectSelectionSummaryBox = React.createClass({displayName: "ProjectSelectionSummaryBox",
  render: function() {
    return (
      React.createElement("div", {className: "projectSummaryBox"}, 
        React.createElement("ul", {className: "list-group"}, 
          React.createElement("li", {className: "list-group-item"}, "Number of projects: ", this.props.projects.length)
        )
      )
    )
  }
});

var CategorySelector = React.createClass({displayName: "CategorySelector",
  render: function() {
    var categoryListItems = this.props.categories.map(function(d, i) {
      var selected = (this.props.selectedCategoryId == d.id);
      return (
        React.createElement(CategoryListItem, {
          key: i, 
          category: d, 
          selected: selected, 
          selectCategoryCallback: this.props.selectCategoryCallback}
        )
      )
    }, this);

    var title;
    if (this.props.title != null) {
      title = React.createElement("h5", null, this.props.title)
    } else {
      title = null;
    }

    return (
      React.createElement("div", {className: "categorySelector"}, 
        title, 
        React.createElement("div", {className: "btn-group", "data-toggle": "buttons"}, 
          categoryListItems
        )
      )
    )
  }
});

var CategoryListItem = React.createClass({displayName: "CategoryListItem",
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
      React.createElement("label", {className: bootstrap_class, onClick: this.handleSelect}, 
        React.createElement("input", {
          type: "radio", 
          checked: this.props.selected, 
          readOnly: true}
        ), 
        this.props.category.name
      )
    )
  }
});

var Scatterplot = require('./Scatterplot.jsx');
var Histogram = require('./Histogram.jsx');
var Timeseries = require('./Timeseries.jsx');
var Map = require('./Map.jsx');

var ChartBox = React.createClass({displayName: "ChartBox",
  render: function() {
    var chartComponent;
    if (this.props.chartType == "histogram") {

      chartComponent = (
        React.createElement(Histogram, {
          projects: this.props.projects, 
          fuelType: this.props.fuelType, 
          energyUnit: this.props.energyUnit, 
          meter_run_list_url: this.props.meter_run_list_url}
        )
      )
    } else if (this.props.chartType == "timeSeries") {
      chartComponent = (
        React.createElement(Timeseries, null
        )
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
        React.createElement(Scatterplot, {
          data: sampleData, 
          domain: sampleDomain}
        )
      )
    } else if (this.props.chartType == "map") {
      chartComponent = (
        React.createElement(Map, null)
      )
    } else {
      chartComponent = React.createElement("span", null, "Please Select a Chart")
    }

    return (
      React.createElement("div", {className: "chartBox"}, 
        React.createElement("div", {className: "panel panel-default"}, 
          React.createElement("div", {className: "panel-body"}, 
            chartComponent
          )
        )
      )
    )
  }
});

var ProjectTable = React.createClass({displayName: "ProjectTable",
  render: function() {
    var projects = this.props.projects.map(function(d,i) {
      return (
        React.createElement(ProjectTableItem, {
          key: d.id, 
          project: d}
        )
      )
    });
    return (
      React.createElement("div", {className: "projectTable"}, 
        "Project Table", 
        React.createElement("ul", {className: "list-group"}, 
          projects
        )
      )
    )
  }
});

var ProjectTableItem = React.createClass({displayName: "ProjectTableItem",
  handleSelect: function() {
    console.log(this.props.project);
  },
  render: function() {
    return (
      React.createElement("li", {className: "list-group-item clearfix"}, 
        React.createElement("a", {onClick: this.handleSelect}, 
          this.props.project.project_id
        )
      )
    )
  }
});

},{"./Histogram.jsx":"/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/Histogram.jsx","./Map.jsx":"/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/Map.jsx","./Scatterplot.jsx":"/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/Scatterplot.jsx","./Timeseries.jsx":"/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/Timeseries.jsx"}],"/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/scatterplot.js":[function(require,module,exports){
var scatterplot = {};

scatterplot.create = function(el, props, state) {
  var svg = d3.select(el).append('svg')
      .attr('class', 'scatterplot')
      .attr('width', props.width)
      .attr('height', props.height);

  svg.append('g')
      .attr('class', 'scatterplot-points');

  this.update(el, state);
};

scatterplot.update = function(el, state) {
  var scales = this._scales(el, state.domain);
  this._drawPoints(el, scales, state.data);
};

scatterplot.destroy = function(el) {
};

scatterplot._drawPoints = function(el, scales, data) {
  var g = d3.select(el).selectAll('.scatterplot-points');

  var point = g.selectAll('.scatterplot-point')
    .data(data, function(d) { return d.id; });

  // ENTER
  point.enter().append('circle')
      .attr('class', 'd3-point');

  // ENTER & UPDATE
  point.attr('cx', function(d) { return scales.x(d.x); })
      .attr('cy', function(d) { return scales.y(d.y); })
      .attr('r', 5);

  // EXIT
  point.exit()
      .remove();
};

scatterplot._scales = function(el, domain) {
  if (!domain) {
    return null;
  }

  var width = el.offsetWidth;
  var height = el.offsetHeight;

  var x = d3.scale.linear()
    .range([0, width])
    .domain(domain.x);

  var y = d3.scale.linear()
    .range([height, 0])
    .domain(domain.y);

  return {x: x, y: y};
};

module.exports = scatterplot;

},{}]},{},["/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/main.jsx"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGhpbG5nby9kZXYvb2VlbS1jbGllbnQvZGFzaGJvYXJkL3N0YXRpYy9kYXNoYm9hcmQvanMvc3JjL0hpc3RvZ3JhbS5qc3giLCIvVXNlcnMvcGhpbG5nby9kZXYvb2VlbS1jbGllbnQvZGFzaGJvYXJkL3N0YXRpYy9kYXNoYm9hcmQvanMvc3JjL01hcC5qc3giLCIvVXNlcnMvcGhpbG5nby9kZXYvb2VlbS1jbGllbnQvZGFzaGJvYXJkL3N0YXRpYy9kYXNoYm9hcmQvanMvc3JjL1NjYXR0ZXJwbG90LmpzeCIsIi9Vc2Vycy9waGlsbmdvL2Rldi9vZWVtLWNsaWVudC9kYXNoYm9hcmQvc3RhdGljL2Rhc2hib2FyZC9qcy9zcmMvVGltZXNlcmllcy5qc3giLCIvVXNlcnMvcGhpbG5nby9kZXYvb2VlbS1jbGllbnQvZGFzaGJvYXJkL3N0YXRpYy9kYXNoYm9hcmQvanMvc3JjL21haW4uanN4IiwiL1VzZXJzL3BoaWxuZ28vZGV2L29lZW0tY2xpZW50L2Rhc2hib2FyZC9zdGF0aWMvZGFzaGJvYXJkL2pzL3NyYy9zY2F0dGVycGxvdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUksK0JBQStCLHlCQUFBO0VBQ2pDLGFBQWEsRUFBRSxTQUFTLFNBQVMsRUFBRTtBQUNyQyxJQUFJLElBQUksZUFBZSxHQUFHLFNBQVMsQ0FBQyxrQkFBa0IsR0FBRyxlQUFlLENBQUM7O0lBRXJFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLE1BQU0sRUFBRTtNQUMvRCxlQUFlLElBQUksY0FBYztBQUN2QyxLQUFLOztJQUVELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLE1BQU0sRUFBRTtNQUNoRSxlQUFlLElBQUksZUFBZTtBQUN4QyxLQUFLOztJQUVELElBQUksU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQ2pDLGVBQWUsSUFBSSxZQUFZLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQztPQUNiLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDbkIsS0FBSzs7QUFFTCxJQUFJLElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7O0FBRXRELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDOztJQUVoQyxDQUFDLENBQUMsSUFBSSxDQUFDO01BQ0wsR0FBRyxFQUFFLGVBQWU7TUFDcEIsUUFBUSxFQUFFLE1BQU07TUFDaEIsS0FBSyxFQUFFLEtBQUs7QUFDbEIsTUFBTSxPQUFPLEVBQUUsU0FBUyxJQUFJLEVBQUU7O1FBRXRCLElBQUksa0JBQWtCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUU7VUFDbEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDcEQ7T0FDRixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7TUFDWixLQUFLLEVBQUUsU0FBUyxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUNoQyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7T0FDeEQsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ2IsQ0FBQyxDQUFDO0dBQ0o7RUFDRCxjQUFjLEVBQUUsU0FBUyxNQUFNLEVBQUU7SUFDL0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDekIsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ1osSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2QsSUFBSSxNQUFNLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDO01BQ3RELEtBQUssR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSTtNQUN0QyxNQUFNLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU07QUFDN0MsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztJQUUxQyxJQUFJLFVBQVUsQ0FBQztJQUNmLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxFQUFFO01BQ2xDLFVBQVUsR0FBRyxLQUFLLENBQUM7S0FDcEIsTUFBTTtNQUNMLFVBQVUsR0FBRyxRQUFRLENBQUM7QUFDNUIsS0FBSzs7SUFFRCxJQUFJLFFBQVEsQ0FBQztJQUNiLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksR0FBRyxFQUFFO01BQzlCLFFBQVEsR0FBRyxhQUFhLENBQUM7S0FDMUIsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtNQUN0QyxRQUFRLEdBQUcsYUFBYSxDQUFDO0tBQzFCLE1BQU07TUFDTCxRQUFRLEdBQUcsVUFBVSxDQUFDO0FBQzVCLEtBQUs7O0lBRUQsU0FBUyxLQUFLLENBQUMsU0FBUyxFQUFFO0FBQzlCLE1BQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXO0FBQ2hDOztRQUVRLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDNUMsUUFBUSxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDOztRQUVsQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTthQUNwQixNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNqRSxhQUFhLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQy9COztRQUVRLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFO2FBQzNCLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDdkIsYUFBYSxNQUFNLENBQUMsQ0FBQzs7UUFFYixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRTthQUNwQixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNuRSxhQUFhLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOztRQUV4QixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3hCLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsRCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRTthQUNwQixLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ1IsVUFBVSxDQUFDLFNBQVMsQ0FBQzthQUNyQixVQUFVLENBQUMsVUFBVSxDQUFDO0FBQ25DLGFBQWEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztRQUV0QixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFO1dBQ2YsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7V0FDdkIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7V0FDaEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2hCLE9BQU8sUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUM7QUFDdkQsV0FBVyxDQUFDOztRQUVKLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDakUsUUFBUSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDOztRQUU1QixHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7V0FDekMsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUN0QixhQUFhLElBQUksQ0FBQyxXQUFXLEVBQUUsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7O0FBRXBGLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7UUFFZCxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQzthQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDO1dBQ1osS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQzthQUNqQixJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQztBQUNqQyxhQUFhLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNuRzs7UUFFUSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQzthQUNiLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2FBQ1osSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7YUFDdkIsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2FBQ3ZELEVBQUUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQztBQUN0QyxhQUFhLEVBQUUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RDOztRQUVRLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO2FBQ1YsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUM7YUFDdkIsSUFBSSxDQUFDLFdBQVcsRUFBRSxjQUFjLEdBQUcsTUFBTSxHQUFHLEdBQUcsQ0FBQztBQUM3RCxhQUFhLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6Qjs7UUFFUSxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztXQUMxQixJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxFQUFFO2FBQzVCLE9BQU8sWUFBWSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQztBQUNqSCxVQUFVLENBQUMsQ0FBQztBQUNaOztRQUVRLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2lCQUNULElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFBRTtpQkFDdEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztpQkFDL0IsSUFBSSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7aUJBQzdCLEtBQUssQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDO0FBQzNDLGlCQUFpQixJQUFJLENBQUMsd0NBQXdDLEdBQUcsUUFBUSxHQUFHLElBQUksR0FBRyxVQUFVLEdBQUcsVUFBVSxDQUFDLENBQUM7O09BRXJHLENBQUMsQ0FBQztBQUNULEtBQUs7O0lBRUQsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsRUFBRTtNQUN6QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLE1BQU0sQ0FBQztNQUNyQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO01BQ1gsT0FBTyxLQUFLLENBQUM7QUFDbkIsS0FBSyxDQUFDOztJQUVGLEtBQUssQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLEVBQUU7TUFDeEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxLQUFLLENBQUM7TUFDcEMsS0FBSyxHQUFHLENBQUMsQ0FBQztNQUNWLE9BQU8sS0FBSyxDQUFDO0FBQ25CLEtBQUssQ0FBQzs7SUFFRixLQUFLLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxFQUFFO01BQ3pCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sTUFBTSxDQUFDO01BQ3JDLE1BQU0sR0FBRyxDQUFDLENBQUM7TUFDWCxPQUFPLEtBQUssQ0FBQztBQUNuQixLQUFLLENBQUM7O0lBRUYsT0FBTyxLQUFLLENBQUM7R0FDZDtFQUNELFlBQVksRUFBRSxTQUFTLENBQUMsRUFBRTtJQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDO01BQ1osS0FBSyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUU7S0FDOUIsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0dBQ3BCO0VBQ0QsZUFBZSxFQUFFLFdBQVc7SUFDMUIsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO0dBQ3ZEO0FBQ0gsRUFBRSxpQkFBaUIsRUFBRSxXQUFXOztJQUU1QixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvQixJQUFJLENBQUMsUUFBUSxDQUFDO01BQ1osS0FBSyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUU7S0FDOUIsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7R0FDdEQ7RUFDRCxvQkFBb0IsRUFBRSxXQUFXO0lBQy9CLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0dBQ3pEO0VBQ0QseUJBQXlCLEVBQUUsU0FBUyxTQUFTLEVBQUU7SUFDN0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUMvQjtFQUNELHFCQUFxQixFQUFFLFNBQVMsS0FBSyxFQUFFO0lBQ3JDLE9BQU8sS0FBSyxDQUFDO0dBQ2Q7RUFDRCxlQUFlLEVBQUUsV0FBVztJQUMxQixPQUFPO01BQ0wsS0FBSyxFQUFFLENBQUM7TUFDUixPQUFPLEVBQUUsS0FBSztNQUNkLFNBQVMsRUFBRSxLQUFLO01BQ2hCLFNBQVMsRUFBRSxFQUFFO01BQ2IsYUFBYSxFQUFFLENBQUM7S0FDakI7R0FDRjtFQUNELHNCQUFzQixFQUFFLFdBQVc7SUFDakMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQzlEO0VBQ0QsV0FBVyxFQUFFLFdBQVc7QUFDMUIsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzs7SUFFOUIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ25DLElBQUksTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7TUFDckIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7S0FDdEM7R0FDRjtBQUNILEVBQUUsY0FBYyxFQUFFLFdBQVc7O0lBRXpCLElBQUksa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0lBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7TUFDMUMsSUFBSSxDQUFDLENBQUMsT0FBTyxJQUFJLGtCQUFrQixFQUFFO1FBQ25DLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO09BQ3RDLE1BQU07UUFDTCxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDcEM7QUFDUCxLQUFLLENBQUMsQ0FBQzs7SUFFSCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDaEIsS0FBSyxJQUFJLFVBQVUsSUFBSSxrQkFBa0IsRUFBRTtBQUMvQyxNQUFNLElBQUksa0JBQWtCLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFOztRQUVqRCxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25DLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLFNBQVMsRUFBRTtVQUN6RCxJQUFJLFNBQVMsQ0FBQyxjQUFjLElBQUksSUFBSSxFQUFFO1lBQ3BDLElBQUksU0FBUyxDQUFDLFNBQVMsSUFBSSxHQUFHLEVBQUU7Y0FDOUIsY0FBYyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsY0FBYyxDQUFDO2FBQzlDLE1BQU0sSUFBSSxTQUFTLENBQUMsU0FBUyxJQUFJLElBQUksRUFBRTtjQUN0QyxjQUFjLENBQUMsRUFBRSxJQUFJLFNBQVMsQ0FBQyxjQUFjLENBQUM7YUFDL0M7V0FDRjtBQUNYLFNBQVMsQ0FBQyxDQUFDOztRQUVILElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLElBQUksS0FBSyxFQUFFO1VBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsSUFBSSxjQUFjLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDL0QsTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLE9BQU8sRUFBRTtVQUMzQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxLQUFLLEtBQUssY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDL0Q7T0FDRjtBQUNQLEtBQUs7O0FBRUwsSUFBSSxPQUFPLE1BQU0sQ0FBQzs7R0FFZjtBQUNILEVBQUUsTUFBTSxFQUFFLFdBQVc7O0lBRWpCLElBQUksVUFBVSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQztNQUN0RSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsTUFBTTtNQUM5RCxRQUFRLEVBQUUsVUFBVTtBQUMxQixLQUFLOztJQUVELElBQUksT0FBTztNQUNULG9CQUFDLFlBQVksRUFBQSxDQUFBLENBQUMsTUFBQSxFQUFNLENBQUUsVUFBVSxFQUFDLENBQUMsT0FBQSxFQUFPLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFRLENBQUEsQ0FBRyxDQUFBO0tBQ2xFO0FBQ0wsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDOztJQUVmO01BQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxXQUFZLENBQUEsRUFBQTtRQUN4QixPQUFPLEVBQUM7UUFDVCxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLFdBQUEsRUFBVyxDQUFDLE1BQUEsRUFBTSxDQUFDLEtBQUEsRUFBSyxDQUFDLEtBQUEsRUFBSyxDQUFDLE1BQU8sQ0FBQTtRQUMvQyxDQUFBO01BQ0YsQ0FBQTtLQUNQO0dBQ0Y7QUFDSCxDQUFDLENBQUMsQ0FBQzs7QUFFSCxJQUFJLGtDQUFrQyw0QkFBQTtFQUNwQyxTQUFTLEVBQUU7SUFDVCxNQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNO0lBQzlCLE9BQU8sRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUk7QUFDakMsR0FBRzs7RUFFRCxpQkFBaUIsRUFBRSxXQUFXO0lBQzVCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzNDLEdBQUc7O0VBRUQseUJBQXlCLEVBQUUsU0FBUyxRQUFRLEVBQUU7SUFDNUMsSUFBSSxRQUFRLENBQUMsT0FBTyxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO01BQ3BELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDckIsTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxJQUFJLEVBQUU7TUFDM0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztLQUN4QztBQUNMLEdBQUc7O0VBRUQsb0JBQW9CLEVBQUUsV0FBVztJQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3hCLEdBQUc7O0VBRUQsTUFBTSxFQUFFLFdBQVc7SUFDakI7TUFDRSxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLGtCQUFBLEVBQWtCLENBQUMsR0FBQSxFQUFHLENBQUMsV0FBVyxDQUFBLENBQUcsQ0FBQTtNQUNwRDtHQUNIO0FBQ0gsQ0FBQyxDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7OztBQzVTM0IsSUFBSSx5QkFBeUIsbUJBQUE7RUFDM0IsTUFBTSxFQUFFLFdBQVc7SUFDakI7TUFDRSxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLEtBQUEsRUFBSyxDQUFDLE1BQUEsRUFBTSxDQUFDLE9BQUEsRUFBTyxDQUFDLEtBQUEsRUFBSyxDQUFDLE1BQU0sQ0FBQSxDQUFHLENBQUE7S0FDcEQ7R0FDRjtDQUNGLENBQUMsQ0FBQztBQUNILE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDOzs7QUNQckIsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDOztBQUUzQyxJQUFJLGlDQUFpQywyQkFBQTtFQUNuQyxTQUFTLEVBQUU7SUFDVCxJQUFJLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLO0lBQzNCLE1BQU0sRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU07QUFDbEMsR0FBRzs7RUFFRCxpQkFBaUIsRUFBRSxXQUFXO0lBQzVCLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUU7TUFDckIsS0FBSyxFQUFFLE1BQU07TUFDYixNQUFNLEVBQUUsT0FBTztLQUNoQixFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQzdCLEdBQUc7O0VBRUQsa0JBQWtCLEVBQUUsV0FBVztJQUM3QixJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BDLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELEdBQUc7O0VBRUQsYUFBYSxFQUFFLFdBQVc7SUFDeEIsT0FBTztNQUNMLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUk7TUFDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtLQUMxQixDQUFDO0FBQ04sR0FBRzs7RUFFRCxvQkFBb0IsRUFBRSxXQUFXO0lBQy9CLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM1QixHQUFHOztFQUVELE1BQU0sRUFBRSxXQUFXO0lBQ2pCO01BQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxhQUFjLENBQU0sQ0FBQTtNQUNuQztHQUNIO0FBQ0gsQ0FBQyxDQUFDLENBQUM7O0FBRUgsTUFBTSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUM7OztBQ3hDN0IsSUFBSSxnQ0FBZ0MsMEJBQUE7RUFDbEMsTUFBTSxFQUFFLFdBQVc7SUFDakI7TUFDRSxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLFlBQUEsRUFBWSxDQUFDLE1BQUEsRUFBTSxDQUFDLE9BQUEsRUFBTyxDQUFDLEtBQUEsRUFBSyxDQUFDLE1BQU0sQ0FBQSxDQUFHLENBQUE7S0FDM0Q7R0FDRjtDQUNGLENBQUMsQ0FBQztBQUNILE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDOzs7QUNQNUIseUNBQXlDLDRCQUFBO0VBQ3ZDLE1BQU0sRUFBRSxXQUFXO0lBQ2pCO01BQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyw4QkFBK0IsQ0FBQSxFQUFBO1FBQzVDLG9CQUFBLEtBQUksRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsS0FBTSxDQUFBLEVBQUE7VUFDbkIsb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxXQUFZLENBQUEsRUFBQTtZQUN6QixvQkFBQyxjQUFjLEVBQUEsZ0JBQUEsR0FBQTtjQUNaLEdBQUcsSUFBSSxDQUFDLEtBQU0sQ0FBQTtZQUNmLENBQUE7VUFDRSxDQUFBO1FBQ0YsQ0FBQTtNQUNGLENBQUE7S0FDUDtHQUNGO0FBQ0gsQ0FBQyxDQUFDLENBQUM7O0FBRUgsSUFBSSxvQ0FBb0MsOEJBQUE7RUFDdEMsWUFBWSxFQUFFLFdBQVc7QUFDM0IsSUFBSSxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDOztJQUVqRCxJQUFJLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLElBQUksSUFBSTtRQUMxRCxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQztJQUMzQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7TUFDakUsT0FBTyxXQUFXLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNuQyxLQUFLLENBQUMsQ0FBQzs7SUFFSCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQ3JCLGNBQWMsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQyxLQUFLOztJQUVELENBQUMsQ0FBQyxJQUFJLENBQUM7TUFDTCxHQUFHLEVBQUUsY0FBYztNQUNuQixRQUFRLEVBQUUsTUFBTTtNQUNoQixLQUFLLEVBQUUsS0FBSztNQUNaLE9BQU8sRUFBRSxTQUFTLElBQUksRUFBRTtRQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDakMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO01BQ1osS0FBSyxFQUFFLFNBQVMsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7UUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO09BQ3ZELENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUNiLENBQUMsQ0FBQztHQUNKO0VBQ0QsMkJBQTJCLEVBQUUsU0FBUyxJQUFJLEVBQUU7SUFDMUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztNQUNaLHVCQUF1QixFQUFFLElBQUksQ0FBQyxHQUFHO01BQ2pDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxVQUFVO0tBQzFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0dBQ3ZCO0VBQ0QsdUJBQXVCLEVBQUUsU0FBUyxXQUFXLEVBQUU7SUFDN0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7R0FDbkQ7RUFDRCxzQkFBc0IsRUFBRSxTQUFTLFVBQVUsRUFBRTtJQUMzQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztHQUNqRDtFQUNELHdCQUF3QixFQUFFLFNBQVMsWUFBWSxFQUFFO0lBQy9DLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxvQkFBb0IsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO0dBQ3JEO0VBQ0QsZUFBZSxFQUFFLFdBQVc7SUFDMUIsT0FBTztNQUNMLFFBQVEsRUFBRSxFQUFFO01BQ1osdUJBQXVCLEVBQUUsRUFBRTtNQUMzQix3QkFBd0IsRUFBRSxJQUFJO01BQzlCLG1CQUFtQixFQUFFLFdBQVc7TUFDaEMsa0JBQWtCLEVBQUUsR0FBRztNQUN2QixvQkFBb0IsRUFBRSxLQUFLO0tBQzVCLENBQUM7R0FDSDtFQUNELGlCQUFpQixFQUFFLFdBQVc7SUFDNUIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0dBQ3JCO0FBQ0gsRUFBRSxNQUFNLEVBQUUsV0FBVzs7SUFFakIsSUFBSSxVQUFVLEdBQUc7TUFDZjtRQUNFLEVBQUUsRUFBRSxZQUFZO1FBQ2hCLElBQUksRUFBRSwyQkFBMkI7T0FDbEM7TUFDRDtRQUNFLEVBQUUsRUFBRSxXQUFXO1FBQ2YsSUFBSSxFQUFFLDBCQUEwQjtPQUNqQztNQUNEO1FBQ0UsRUFBRSxFQUFFLGFBQWE7UUFDakIsSUFBSSxFQUFFLDhCQUE4QjtPQUNyQztNQUNEO1FBQ0UsRUFBRSxFQUFFLEtBQUs7UUFDVCxJQUFJLEVBQUUsS0FBSztPQUNaO0FBQ1AsS0FBSyxDQUFDOztJQUVGLElBQUksU0FBUyxHQUFHO01BQ2Q7UUFDRSxFQUFFLEVBQUUsR0FBRztRQUNQLElBQUksRUFBRSxhQUFhO09BQ3BCO01BQ0Q7UUFDRSxFQUFFLEVBQUUsSUFBSTtRQUNSLElBQUksRUFBRSxhQUFhO09BQ3BCO01BQ0Q7UUFDRSxFQUFFLEVBQUUsTUFBTTtRQUNWLElBQUksRUFBRSxVQUFVO09BQ2pCO0FBQ1AsS0FBSyxDQUFDOztJQUVGLElBQUksV0FBVyxHQUFHO01BQ2hCO1FBQ0UsRUFBRSxFQUFFLEtBQUs7UUFDVCxJQUFJLEVBQUUsS0FBSztPQUNaO01BQ0Q7UUFDRSxFQUFFLEVBQUUsT0FBTztRQUNYLElBQUksRUFBRSxRQUFRO09BQ2Y7QUFDUCxLQUFLLENBQUM7O0lBRUY7QUFDSixNQUFNLG9CQUFBLEtBQUksRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMseUJBQTBCLENBQUEsRUFBQTs7UUFFdkMsb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxLQUFNLENBQUEsRUFBQTtVQUNuQixvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLFdBQVksQ0FBQSxFQUFBO1lBQ3pCLG9CQUFDLGdCQUFnQixFQUFBLENBQUE7Y0FDZixLQUFBLEVBQUssQ0FBRSxJQUFJLEVBQUM7Y0FDWixVQUFBLEVBQVUsQ0FBRSxVQUFVLEVBQUM7Y0FDdkIsc0JBQUEsRUFBc0IsQ0FBRSxJQUFJLENBQUMsdUJBQXVCLEVBQUM7Y0FDckQsa0JBQUEsRUFBa0IsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLG1CQUFvQixDQUFBO1lBQ25ELENBQUEsRUFBQTtZQUNGLG9CQUFBLElBQUcsRUFBQSxJQUFFLENBQUE7VUFDRCxDQUFBO0FBQ2hCLFFBQWMsQ0FBQSxFQUFBO0FBQ2Q7O1FBRVEsb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxLQUFNLENBQUEsRUFBQTtVQUNuQixvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLFVBQVcsQ0FBQSxFQUFBO1lBQ3hCLG9CQUFDLFFBQVEsRUFBQSxDQUFBO2NBQ1AsU0FBQSxFQUFTLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBQztjQUMxQyxRQUFBLEVBQVEsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFDO2NBQ3hDLFVBQUEsRUFBVSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUM7Y0FDNUMsUUFBQSxFQUFRLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUM7Y0FDOUIsa0JBQUEsRUFBa0IsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFtQixDQUFBO1lBQ2xELENBQUE7QUFDZCxVQUFnQixDQUFBLEVBQUE7O1VBRU4sb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxVQUFXLENBQUEsRUFBQTtZQUN4QixvQkFBQywwQkFBMEIsRUFBQSxDQUFBO2NBQ3pCLFFBQUEsRUFBUSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUyxDQUFBO1lBQzlCLENBQUE7VUFDRSxDQUFBO0FBQ2hCLFFBQWMsQ0FBQSxFQUFBOztRQUVOLG9CQUFBLEtBQUksRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsS0FBTSxDQUFBLEVBQUE7VUFDbkIsb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxVQUFXLENBQUEsRUFBQTtZQUN4QixvQkFBQyxnQkFBZ0IsRUFBQSxDQUFBO2NBQ2YsS0FBQSxFQUFLLENBQUUsSUFBSSxFQUFDO2NBQ1osVUFBQSxFQUFVLENBQUUsU0FBUyxFQUFDO2NBQ3RCLHNCQUFBLEVBQXNCLENBQUUsSUFBSSxDQUFDLHNCQUFzQixFQUFDO2NBQ3BELGtCQUFBLEVBQWtCLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBbUIsQ0FBQTtZQUNsRCxDQUFBO0FBQ2QsVUFBZ0IsQ0FBQSxFQUFBOztVQUVOLG9CQUFBLEtBQUksRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsVUFBVyxDQUFBLEVBQUE7WUFDeEIsb0JBQUMsZ0JBQWdCLEVBQUEsQ0FBQTtjQUNmLEtBQUEsRUFBSyxDQUFFLElBQUksRUFBQztjQUNaLFVBQUEsRUFBVSxDQUFFLFdBQVcsRUFBQztjQUN4QixzQkFBQSxFQUFzQixDQUFFLElBQUksQ0FBQyx3QkFBd0IsRUFBQztjQUN0RCxrQkFBQSxFQUFrQixDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQXFCLENBQUE7WUFDcEQsQ0FBQTtVQUNFLENBQUE7QUFDaEIsUUFBYyxDQUFBLEVBQUE7O1FBRU4sb0JBQUMsZ0JBQWdCLEVBQUEsZ0JBQUE7QUFDekIsVUFBVSwyQkFBQSxFQUEyQixDQUFFLElBQUksQ0FBQywyQkFBMkIsRUFBQzs7VUFFOUQsd0JBQUEsRUFBd0IsQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF5QixHQUFBO1VBQzdELEdBQUcsSUFBSSxDQUFDLEtBQU0sQ0FBQTtBQUN6QixRQUFVLENBQUEsRUFBQTs7UUFFRixvQkFBQyxZQUFZLEVBQUEsQ0FBQTtVQUNYLFFBQUEsRUFBUSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUyxDQUFBO1FBQzlCLENBQUE7TUFDRSxDQUFBO0tBQ1A7R0FDRjtBQUNILENBQUMsQ0FBQyxDQUFDOztBQUVILElBQUksc0NBQXNDLGdDQUFBO0FBQzFDLEVBQUUsTUFBTSxFQUFFLFdBQVc7O0lBRWpCLElBQUksT0FBTyxHQUFHO09BQ1gsb0JBQUEsSUFBRyxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxpQkFBQSxFQUFpQixDQUFDLEdBQUEsRUFBRyxDQUFFLG9CQUFzQixDQUFBLEVBQUE7UUFDMUQsb0JBQUMsa0JBQWtCLEVBQUEsZ0JBQUEsR0FBQTtVQUNoQixHQUFHLElBQUksQ0FBQyxLQUFNLENBQUE7UUFDZixDQUFBO0FBQ1YsTUFBVyxDQUFBO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSyxDQUFDOztJQUVGO01BQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxrQkFBbUIsQ0FBQSxFQUFBO1FBQ2hDLG9CQUFBLElBQUcsRUFBQSxJQUFDLEVBQUEsaUJBQW9CLENBQUEsRUFBQTtRQUN4QixvQkFBQSxJQUFHLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLFlBQWEsQ0FBQSxFQUFBO1VBQ3hCLE9BQVE7UUFDTixDQUFBO01BQ0QsQ0FBQTtLQUNQO0dBQ0Y7QUFDSCxDQUFDLENBQUMsQ0FBQzs7QUFFSCxJQUFJLHdDQUF3QyxrQ0FBQTtFQUMxQyxpQkFBaUIsRUFBRSxXQUFXO0lBQzVCLENBQUMsQ0FBQyxJQUFJLENBQUM7TUFDTCxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsR0FBRyxpQkFBaUI7TUFDMUQsUUFBUSxFQUFFLE1BQU07TUFDaEIsS0FBSyxFQUFFLEtBQUs7TUFDWixPQUFPLEVBQUUsU0FBUyxJQUFJLEVBQUU7UUFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDekMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO01BQ1osS0FBSyxFQUFFLFNBQVMsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7UUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLHNCQUFzQixHQUFHLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztPQUM5RixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDYixDQUFDLENBQUM7R0FDSjtFQUNELHdCQUF3QixFQUFFLFNBQVMsY0FBYyxFQUFFO0lBQ2pELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUM7SUFDN0MsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0dBQ2xFO0VBQ0QsMEJBQTBCLEVBQUUsU0FBUyxjQUFjLEVBQUU7SUFDbkQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQztJQUM3QyxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3hDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxFQUFFO01BQ2YsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDdEI7SUFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0dBQ2xFO0VBQ0Qsd0JBQXdCLEVBQUUsV0FBVztJQUNuQyxJQUFJLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxJQUFJLElBQUksSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ2hFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0dBQzVEO0VBQ0QsWUFBWSxFQUFFLFdBQVc7SUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQztNQUNyQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyx1QkFBdUI7TUFDdkMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtLQUNsQyxDQUFDLENBQUM7R0FDSjtFQUNELGVBQWUsRUFBRSxXQUFXO0lBQzFCLE9BQU87TUFDTCxnQkFBZ0IsRUFBRSxFQUFFO01BQ3BCLHVCQUF1QixFQUFFLEVBQUU7TUFDM0IsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCO0tBQ2hELENBQUM7R0FDSDtFQUNELGlCQUFpQixFQUFFLFdBQVc7SUFDNUIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7R0FDMUI7RUFDRCxNQUFNLEVBQUUsV0FBVztJQUNqQixJQUFJLHFCQUFxQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsRUFBRTtNQUN6RSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUN4RTtRQUNFLG9CQUFDLG9CQUFvQixFQUFBLENBQUE7VUFDbkIsR0FBQSxFQUFHLENBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBQztVQUNWLFFBQUEsRUFBUSxDQUFFLFFBQVEsRUFBQztVQUNuQix3QkFBQSxFQUF3QixDQUFFLElBQUksQ0FBQyx3QkFBd0IsRUFBQztVQUN4RCwwQkFBQSxFQUEwQixDQUFFLElBQUksQ0FBQywwQkFBMEIsRUFBQztVQUM1RCxZQUFBLEVBQVksQ0FBRSxDQUFFLENBQUE7UUFDaEIsQ0FBQTtRQUNGO0FBQ1IsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDOztJQUVUO01BQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxvQkFBcUIsQ0FBQSxFQUFBO1FBQ2xDLG9CQUFBLE1BQUssRUFBQSxJQUFDLEVBQUEsMEJBQStCLENBQUEsRUFBQTtRQUNyQyxvQkFBQyxVQUFVLEVBQUEsQ0FBQTtVQUNULHdCQUFBLEVBQXdCLENBQUUsSUFBSSxDQUFDLHdCQUF3QixFQUFDO1VBQ3hELFVBQUEsRUFBVSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVyxDQUFBO1FBQ2xDLENBQUEsRUFBQTtRQUNGLG9CQUFBLElBQUcsRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsWUFBYSxDQUFBLEVBQUE7U0FDekIscUJBQXNCO1FBQ25CLENBQUE7TUFDRCxDQUFBO0tBQ1A7R0FDRjtBQUNILENBQUMsQ0FBQyxDQUFDOztBQUVILElBQUksZ0NBQWdDLDBCQUFBO0VBQ2xDLE1BQU0sRUFBRSxXQUFXO0lBQ2pCO01BQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxZQUFhLENBQUEsRUFBQTtRQUMxQixvQkFBQSxNQUFLLEVBQUEsSUFBQyxFQUFBO0FBQUEsVUFBQSxlQUFBLEVBQ1UsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUMsSUFBQSxFQUFBO0FBQUEsVUFDcEMsb0JBQUEsR0FBRSxFQUFBLENBQUEsQ0FBQyxPQUFBLEVBQU8sQ0FBRSxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUEwQixDQUFBLEVBQUEsUUFBVSxDQUFBO1FBQ3RELENBQUE7TUFDSCxDQUFBO0tBQ1A7R0FDRjtBQUNILENBQUMsQ0FBQyxDQUFDOztBQUVILElBQUksMENBQTBDLG9DQUFBO0VBQzVDLFlBQVksRUFBRSxXQUFXO0lBQ3ZCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUU7TUFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNuRSxJQUFJO01BQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNqRTtHQUNGO0FBQ0gsRUFBRSxNQUFNLEVBQUUsV0FBVzs7SUFFakIsSUFBSSxZQUFZLENBQUM7SUFDakIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtNQUN2QixZQUFZLEdBQUcsOEJBQThCLENBQUM7S0FDL0MsTUFBTTtNQUNMLFlBQVksR0FBRyw4QkFBOEIsQ0FBQztBQUNwRCxLQUFLOztJQUVEO01BQ0Usb0JBQUEsSUFBRyxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQywrQ0FBZ0QsQ0FBQSxFQUFBO1FBQzVELG9CQUFBLE1BQUssRUFBQSxJQUFDLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFDLEdBQWEsQ0FBQSxFQUFBO1FBQ2pELG9CQUFBLEdBQUUsRUFBQSxDQUFBLENBQUMsT0FBQSxFQUFPLENBQUUsSUFBSSxDQUFDLFlBQWMsQ0FBQSxFQUFDLFlBQWlCLENBQUE7TUFDOUMsQ0FBQTtLQUNOO0dBQ0Y7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUNIOztBQUVBLElBQUksb0NBQW9DLDhCQUFBO0VBQ3RDLE1BQU0sRUFBRSxXQUFXO0lBQ2pCLElBQUksaUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtNQUM3RDtRQUNFLG9CQUFDLGdCQUFnQixFQUFBLENBQUE7VUFDZixHQUFBLEVBQUcsQ0FBRSxDQUFDLEVBQUM7VUFDUCxRQUFBLEVBQVEsQ0FBRSxDQUFDLEVBQUM7VUFDWixvQkFBQSxFQUFvQixDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQXFCLENBQUE7UUFDdEQsQ0FBQTtRQUNGO0tBQ0gsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNUO01BQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxnQkFBaUIsQ0FBQSxFQUFBO1FBQzlCLG9CQUFBLE1BQUssRUFBQSxJQUFDLEVBQUEsdUJBQTRCLENBQUEsRUFBQTtRQUNsQyxvQkFBQSxJQUFHLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLFlBQWEsQ0FBQSxFQUFBO1NBQ3pCLGlCQUFrQjtRQUNmLENBQUE7TUFDRCxDQUFBO0tBQ1A7R0FDRjtBQUNILENBQUMsQ0FBQyxDQUFDOztBQUVILElBQUksc0NBQXNDLGdDQUFBO0VBQ3hDLFlBQVksRUFBRSxXQUFXO0lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUN0RDtFQUNELE1BQU0sRUFBRSxXQUFXO0lBQ2pCO01BQ0Usb0JBQUEsSUFBRyxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQywyQ0FBNEMsQ0FBQSxFQUFBO1FBQ3hELG9CQUFBLEdBQUUsRUFBQSxDQUFBLENBQUMsT0FBQSxFQUFPLENBQUUsSUFBSSxDQUFDLFlBQWMsQ0FBQSxFQUFBO1VBQzVCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUs7UUFDeEIsQ0FBQTtNQUNELENBQUE7S0FDTjtHQUNGO0FBQ0gsQ0FBQyxDQUFDLENBQUM7O0FBRUgsSUFBSSx1Q0FBdUMsaUNBQUE7RUFDekMsTUFBTSxFQUFFLFdBQVc7SUFDakI7TUFDRSxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLG1CQUFvQixDQUFBLEVBQUE7QUFBQSxRQUFBLHdCQUFBO0FBQUEsTUFFN0IsQ0FBQTtLQUNQO0dBQ0Y7QUFDSCxDQUFDLENBQUMsQ0FBQztBQUNIOztBQUVBLElBQUksc0NBQXNDLGdDQUFBO0VBQ3hDLE1BQU0sRUFBRSxXQUFXO0lBQ2pCO01BQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxrQkFBbUIsQ0FBQSxFQUFBO0FBQUEsUUFBQSx1QkFBQTtBQUFBLE1BRTVCLENBQUE7S0FDUDtHQUNGO0FBQ0gsQ0FBQyxDQUFDLENBQUM7O0FBRUgsSUFBSSxtQ0FBbUMsNkJBQUE7RUFDckMsTUFBTSxFQUFFLFdBQVc7SUFDakI7TUFDRSxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLGVBQWdCLENBQUEsRUFBQTtBQUFBLFFBQUEsb0JBQUE7QUFBQSxNQUV6QixDQUFBO0tBQ1A7R0FDRjtBQUNILENBQUMsQ0FBQyxDQUFDOztBQUVILElBQUksdUNBQXVDLGlDQUFBO0VBQ3pDLE1BQU0sRUFBRSxXQUFXO0lBQ2pCO01BQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxtQkFBb0IsQ0FBQSxFQUFBO0FBQUEsUUFBQSx3QkFBQTtBQUFBLE1BRTdCLENBQUE7S0FDUDtHQUNGO0NBQ0YsQ0FBQyxDQUFDO0FBQ0gsSUFBSSxxREFBcUQsK0NBQUE7RUFDdkQsTUFBTSxFQUFFLFdBQVc7SUFDakI7TUFDRSxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLGlDQUFrQyxDQUFBLEVBQUE7QUFBQSxRQUFBLGVBQUE7QUFBQSxNQUUzQyxDQUFBO0tBQ1A7R0FDRjtBQUNILENBQUMsQ0FBQyxDQUFDOztBQUVILElBQUksZ0RBQWdELDBDQUFBO0VBQ2xELE1BQU0sRUFBRSxXQUFXO0lBQ2pCO01BQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxtQkFBb0IsQ0FBQSxFQUFBO1FBQ2pDLG9CQUFBLElBQUcsRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsWUFBYSxDQUFBLEVBQUE7VUFDekIsb0JBQUEsSUFBRyxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxpQkFBa0IsQ0FBQSxFQUFBLHNCQUFBLEVBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQVksQ0FBQTtRQUNsRixDQUFBO01BQ0QsQ0FBQTtLQUNQO0dBQ0Y7QUFDSCxDQUFDLENBQUMsQ0FBQzs7QUFFSCxJQUFJLHNDQUFzQyxnQ0FBQTtFQUN4QyxNQUFNLEVBQUUsV0FBVztJQUNqQixJQUFJLGlCQUFpQixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7TUFDL0QsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7TUFDdkQ7UUFDRSxvQkFBQyxnQkFBZ0IsRUFBQSxDQUFBO1VBQ2YsR0FBQSxFQUFHLENBQUUsQ0FBQyxFQUFDO1VBQ1AsUUFBQSxFQUFRLENBQUUsQ0FBQyxFQUFDO1VBQ1osUUFBQSxFQUFRLENBQUUsUUFBUSxFQUFDO1VBQ25CLHNCQUFBLEVBQXNCLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBdUIsQ0FBQTtRQUMxRCxDQUFBO09BQ0g7QUFDUCxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7O0lBRVQsSUFBSSxLQUFLLENBQUM7SUFDVixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTtNQUM1QixLQUFLLEdBQUcsb0JBQUEsSUFBRyxFQUFBLElBQUMsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQVcsQ0FBQTtLQUNwQyxNQUFNO01BQ0wsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNuQixLQUFLOztJQUVEO01BQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxrQkFBbUIsQ0FBQSxFQUFBO1FBQy9CLEtBQUssRUFBQztRQUNQLG9CQUFBLEtBQUksRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsV0FBQSxFQUFXLENBQUMsYUFBQSxFQUFXLENBQUMsU0FBVSxDQUFBLEVBQUE7VUFDOUMsaUJBQWtCO1FBQ2YsQ0FBQTtNQUNGLENBQUE7S0FDUDtHQUNGO0FBQ0gsQ0FBQyxDQUFDLENBQUM7O0FBRUgsSUFBSSxzQ0FBc0MsZ0NBQUE7RUFDeEMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxFQUFFO0lBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDM0Q7RUFDRCxNQUFNLEVBQUUsV0FBVztJQUNqQixJQUFJLGVBQWUsQ0FBQztJQUNwQixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO01BQ3ZCLGVBQWUsR0FBRyx5Q0FBeUMsQ0FBQztLQUM3RCxNQUFNO01BQ0wsZUFBZSxHQUFHLGtDQUFrQyxDQUFDO0tBQ3REO0lBQ0Q7TUFDRSxvQkFBQSxPQUFNLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFFLGVBQWUsRUFBQyxDQUFDLE9BQUEsRUFBTyxDQUFFLElBQUksQ0FBQyxZQUFjLENBQUEsRUFBQTtRQUM3RCxvQkFBQSxPQUFNLEVBQUEsQ0FBQTtVQUNKLElBQUEsRUFBSSxDQUFDLE9BQUEsRUFBTztVQUNaLE9BQUEsRUFBTyxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFDO1VBQzdCLFFBQUEsRUFBUSxDQUFFLElBQUssQ0FBQTtRQUNmLENBQUEsRUFBQTtRQUNELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUs7TUFDcEIsQ0FBQTtLQUNUO0dBQ0Y7QUFDSCxDQUFDLENBQUMsQ0FBQzs7QUFFSCxJQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUMvQyxJQUFJLFNBQVMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUMzQyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUM3QyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRS9CLElBQUksOEJBQThCLHdCQUFBO0VBQ2hDLE1BQU0sRUFBRSxXQUFXO0lBQ2pCLElBQUksY0FBYyxDQUFDO0FBQ3ZCLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxXQUFXLEVBQUU7O01BRXZDLGNBQWM7UUFDWixvQkFBQyxTQUFTLEVBQUEsQ0FBQTtVQUNSLFFBQUEsRUFBUSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFDO1VBQzlCLFFBQUEsRUFBUSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFDO1VBQzlCLFVBQUEsRUFBVSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFDO1VBQ2xDLGtCQUFBLEVBQWtCLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBbUIsQ0FBQTtRQUNsRCxDQUFBO09BQ0g7S0FDRixNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksWUFBWSxFQUFFO01BQy9DLGNBQWM7UUFDWixvQkFBQyxVQUFVLEVBQUEsSUFBQTtRQUNULENBQUE7T0FDSDtBQUNQLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLGFBQWEsRUFBRTs7TUFFaEQsSUFBSSxVQUFVLEdBQUc7UUFDZixDQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzdCLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDdEMsT0FBTyxDQUFDOztNQUVGLElBQUksWUFBWSxHQUFHO1FBQ2pCLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDVixDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO0FBQ25CLE9BQU8sQ0FBQzs7TUFFRixjQUFjO1FBQ1osb0JBQUMsV0FBVyxFQUFBLENBQUE7VUFDVixJQUFBLEVBQUksQ0FBRSxVQUFVLEVBQUM7VUFDakIsTUFBQSxFQUFNLENBQUUsWUFBYSxDQUFBO1FBQ3JCLENBQUE7T0FDSDtLQUNGLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxLQUFLLEVBQUU7TUFDeEMsY0FBYztRQUNaLG9CQUFDLEdBQUcsRUFBQSxJQUFBLENBQUcsQ0FBQTtPQUNSO0tBQ0YsTUFBTTtNQUNMLGNBQWMsR0FBRyxvQkFBQSxNQUFLLEVBQUEsSUFBQyxFQUFBLHVCQUE0QixDQUFBO0FBQ3pELEtBQUs7O0lBRUQ7TUFDRSxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLFVBQVcsQ0FBQSxFQUFBO1FBQ3hCLG9CQUFBLEtBQUksRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMscUJBQXNCLENBQUEsRUFBQTtVQUNuQyxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLFlBQWEsQ0FBQSxFQUFBO1lBQ3pCLGNBQWU7VUFDWixDQUFBO1FBQ0YsQ0FBQTtNQUNGLENBQUE7S0FDUDtHQUNGO0FBQ0gsQ0FBQyxDQUFDLENBQUM7O0FBRUgsSUFBSSxrQ0FBa0MsNEJBQUE7RUFDcEMsTUFBTSxFQUFFLFdBQVc7SUFDakIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtNQUNuRDtRQUNFLG9CQUFDLGdCQUFnQixFQUFBLENBQUE7VUFDZixHQUFBLEVBQUcsQ0FBRSxDQUFDLENBQUMsRUFBRSxFQUFDO1VBQ1YsT0FBQSxFQUFPLENBQUUsQ0FBRSxDQUFBO1FBQ1gsQ0FBQTtPQUNIO0tBQ0YsQ0FBQyxDQUFDO0lBQ0g7TUFDRSxvQkFBQSxLQUFJLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLGNBQWUsQ0FBQSxFQUFBO0FBQUEsUUFBQSxlQUFBLEVBQUE7QUFBQSxRQUU1QixvQkFBQSxJQUFHLEVBQUEsQ0FBQSxDQUFDLFNBQUEsRUFBUyxDQUFDLFlBQWEsQ0FBQSxFQUFBO1VBQ3hCLFFBQVM7UUFDUCxDQUFBO01BQ0QsQ0FBQTtLQUNQO0dBQ0Y7QUFDSCxDQUFDLENBQUMsQ0FBQzs7QUFFSCxJQUFJLHNDQUFzQyxnQ0FBQTtFQUN4QyxZQUFZLEVBQUUsV0FBVztJQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDakM7RUFDRCxNQUFNLEVBQUUsV0FBVztJQUNqQjtNQUNFLG9CQUFBLElBQUcsRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsMEJBQTJCLENBQUEsRUFBQTtRQUN2QyxvQkFBQSxHQUFFLEVBQUEsQ0FBQSxDQUFDLE9BQUEsRUFBTyxDQUFFLElBQUksQ0FBQyxZQUFjLENBQUEsRUFBQTtVQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFXO1FBQzdCLENBQUE7TUFDRCxDQUFBO0tBQ047R0FDRjtDQUNGLENBQUMsQ0FBQzs7O0FDbmtCSCxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7O0FBRXJCLFdBQVcsQ0FBQyxNQUFNLEdBQUcsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtFQUM5QyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7T0FDaEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUM7T0FDNUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ2pDLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7O0VBRWxDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ2pCLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDOztFQUV6QyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN6QixDQUFDLENBQUM7O0FBRUYsV0FBVyxDQUFDLE1BQU0sR0FBRyxTQUFTLEVBQUUsRUFBRSxLQUFLLEVBQUU7RUFDdkMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQzVDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0MsQ0FBQyxDQUFDOztBQUVGLFdBQVcsQ0FBQyxPQUFPLEdBQUcsU0FBUyxFQUFFLEVBQUU7QUFDbkMsQ0FBQyxDQUFDOztBQUVGLFdBQVcsQ0FBQyxXQUFXLEdBQUcsU0FBUyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtBQUNyRCxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0VBRXZELElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7QUFDL0MsS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzlDOztFQUVFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO0FBQ2hDLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNqQzs7RUFFRSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFFLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO09BQ2xELElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUN4RCxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDcEI7O0VBRUUsS0FBSyxDQUFDLElBQUksRUFBRTtPQUNQLE1BQU0sRUFBRSxDQUFDO0FBQ2hCLENBQUMsQ0FBQzs7QUFFRixXQUFXLENBQUMsT0FBTyxHQUFHLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRTtFQUN6QyxJQUFJLENBQUMsTUFBTSxFQUFFO0lBQ1gsT0FBTyxJQUFJLENBQUM7QUFDaEIsR0FBRzs7RUFFRCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO0FBQzdCLEVBQUUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQzs7RUFFN0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7S0FDdEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQ3RCLEtBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7RUFFcEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7S0FDdEIsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLEtBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzs7RUFFcEIsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLENBQUMsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgSGlzdG9ncmFtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBsb2FkTWV0ZXJSdW5zOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICB2YXIgbWV0ZXJSdW5MaXN0VVJMID0gbmV4dFByb3BzLm1ldGVyX3J1bl9saXN0X3VybCArIFwiP3N1bW1hcnk9VHJ1ZVwiO1xuXG4gICAgaWYgKHRoaXMucHJvcHMuZnVlbFR5cGUgPT0gXCJFXCIgfHwgdGhpcy5wcm9wcy5mdWVsVHlwZSA9PSBcIkJPVEhcIikge1xuICAgICAgbWV0ZXJSdW5MaXN0VVJMICs9IFwiJmZ1ZWxfdHlwZT1FXCJcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5mdWVsVHlwZSA9PSBcIk5HXCIgfHwgdGhpcy5wcm9wcy5mdWVsVHlwZSA9PSBcIkJPVEhcIikge1xuICAgICAgbWV0ZXJSdW5MaXN0VVJMICs9IFwiJmZ1ZWxfdHlwZT1OR1wiXG4gICAgfVxuXG4gICAgaWYgKG5leHRQcm9wcy5wcm9qZWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICBtZXRlclJ1bkxpc3RVUkwgKz0gXCImcHJvamVjdHM9XCIgKyBuZXh0UHJvcHMucHJvamVjdHMubWFwKGZ1bmN0aW9uKGQsIGkpe1xuICAgICAgICByZXR1cm4gZC5pZDtcbiAgICAgIH0pLmpvaW4oXCIrXCIpO1xuICAgIH1cblxuICAgIHZhciB0YXJnZXRTdGF0ZUNvdW50ZXIgPSB0aGlzLnN0YXRlLnJlbmRlckNvdW50ZXI7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtsb2FkaW5nOiBmYWxzZX0pO1xuXG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogbWV0ZXJSdW5MaXN0VVJMLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgLy8gZG9uJ3QgcmVuZGVyIGlmIG9sZCAoc2xvdykgYWpheCBjYWxsLiBUT0RPIGZpbmQgc291cmNlIG9mIGVycm9yLlxuICAgICAgICBpZiAodGFyZ2V0U3RhdGVDb3VudGVyID09IHRoaXMuc3RhdGUucmVuZGVyQ291bnRlcikge1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe21ldGVyUnVuczogZGF0YX0sIHRoaXMucmVuZGVyQ2hhcnQpO1xuICAgICAgICB9XG4gICAgICB9LmJpbmQodGhpcyksXG4gICAgICBlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKG1ldGVyUnVuTGlzdFVSTCwgc3RhdHVzLCBlcnIudG9TdHJpbmcoKSk7XG4gICAgICB9LmJpbmQodGhpcylcbiAgICB9KTtcbiAgfSxcbiAgaGlzdG9ncmFtQ2hhcnQ6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgIHZhciB3ID0gdGhpcy5zdGF0ZS53aWR0aDtcbiAgICB2YXIgaCA9IDIwMDtcbiAgICB2YXIgYmlucyA9IDE1O1xuICAgIHZhciBtYXJnaW4gPSB7IHRvcDogMzAsIHJpZ2h0OiAxMCwgYm90dG9tOiA0MCwgbGVmdDogNDB9LFxuICAgICAgd2lkdGggPSB3IC0gbWFyZ2luLnJpZ2h0IC0gbWFyZ2luLmxlZnQsXG4gICAgICBoZWlnaHQgPSBoIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b20sXG4gICAgICBiYXJXaWR0aCA9IE1hdGguZmxvb3Iod2lkdGggLyBiaW5zKSAtIDI7XG5cbiAgICB2YXIgZW5lcmd5VW5pdDtcbiAgICBpZiAodGhpcy5wcm9wcy5lbmVyZ3lVbml0ID09IFwiS1dIXCIpIHtcbiAgICAgIGVuZXJneVVuaXQgPSBcImtXaFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmVyZ3lVbml0ID0gXCJ0aGVybXNcIjtcbiAgICB9XG5cbiAgICB2YXIgZnVlbFR5cGU7XG4gICAgaWYgKHRoaXMucHJvcHMuZnVlbFR5cGUgPT0gXCJFXCIpIHtcbiAgICAgIGZ1ZWxUeXBlID0gXCJFbGVjdHJpY2l0eVwiO1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5mdWVsVHlwZSA9PSBcIk5HXCIpIHtcbiAgICAgIGZ1ZWxUeXBlID0gXCJOYXR1cmFsIEdhc1wiO1xuICAgIH0gZWxzZSB7XG4gICAgICBmdWVsVHlwZSA9IFwiQ29tYmluZWRcIjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGFydChzZWxlY3Rpb24pIHtcbiAgICAgIHNlbGVjdGlvbi5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vIEEgZm9ybWF0dGVyIGZvciBjb3VudHMuXG4gICAgICAgIHZhciBmb3JtYXRDb3VudCA9IGQzLmZvcm1hdChcIiwuMGZcIik7XG4gICAgICAgIHZhciBmb3JtYXRBeGlzID0gZDMuZm9ybWF0KFwiLjJzXCIpO1xuXG4gICAgICAgIHZhciB4ID0gZDMuc2NhbGUubGluZWFyKClcbiAgICAgICAgICAgIC5kb21haW4oZDMuZXh0ZW50KHZhbHVlcywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZDsgfSkpXG4gICAgICAgICAgICAucmFuZ2UoWzAsIHdpZHRoXSk7XG5cbiAgICAgICAgLy8gR2VuZXJhdGUgYSBoaXN0b2dyYW0gdXNpbmcgdHdlbnR5IHVuaWZvcm1seS1zcGFjZWQgYmlucy5cbiAgICAgICAgdmFyIGRhdGEgPSBkMy5sYXlvdXQuaGlzdG9ncmFtKClcbiAgICAgICAgICAgIC5iaW5zKGJpbnMpXG4gICAgICAgICAgICAodmFsdWVzKTtcblxuICAgICAgICB2YXIgeSA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgICAgICAgICAuZG9tYWluKFswLCBkMy5tYXgoZGF0YSwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC55OyB9KV0pXG4gICAgICAgICAgICAucmFuZ2UoW2hlaWdodCwgMF0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHguZG9tYWluKCkpO1xuICAgICAgICB2YXIgdGVtcFNjYWxlID0gZDMuc2NhbGUubGluZWFyKCkuZG9tYWluKFswLCBiaW5zXSkucmFuZ2UoeC5kb21haW4oKSk7XG4gICAgICAgIHZhciB0aWNrQXJyYXkgPSBkMy5yYW5nZShiaW5zICsgMSkubWFwKHRlbXBTY2FsZSk7XG4gICAgICAgIHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKClcbiAgICAgICAgICAgIC5zY2FsZSh4KVxuICAgICAgICAgICAgLnRpY2tWYWx1ZXModGlja0FycmF5KVxuICAgICAgICAgICAgLnRpY2tGb3JtYXQoZm9ybWF0QXhpcylcbiAgICAgICAgICAgIC5vcmllbnQoXCJib3R0b21cIik7XG5cbiAgICAgICAgdmFyIHRpcCA9IGQzLnRpcCgpXG4gICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2QzLXRpcCcpXG4gICAgICAgICAgLm9mZnNldChbLTEwLCAwXSlcbiAgICAgICAgICAuaHRtbChmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICByZXR1cm4gXCI8c3Bhbj5cIiArIGQueSArIFwiIHByb2plY3RzPC9zcGFuPlwiO1xuICAgICAgICAgIH0pXG5cbiAgICAgICAgdmFyIHN2ZyA9IGQzLnNlbGVjdCh0aGlzLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzdmcnKVswXSk7XG4gICAgICAgIHN2Zy5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpO1xuXG4gICAgICAgIHN2ZyA9IHN2Zy5hdHRyKFwid2lkdGhcIiwgdykuYXR0cihcImhlaWdodFwiLCBoKVxuICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbi5sZWZ0ICsgXCIsXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpO1xuXG4gICAgICAgIHN2Zy5jYWxsKHRpcCk7XG5cbiAgICAgICAgdmFyIGJhciA9IHN2Zy5zZWxlY3RBbGwoXCIuYmFyXCIpXG4gICAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAgIC5lbnRlcigpLmFwcGVuZChcImdcIilcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJiYXJcIilcbiAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgeChkLngpICsgXCIsXCIgKyB5KGQueSkgKyBcIilcIjsgfSk7XG5cbiAgICAgICAgLy8gYmFyc1xuICAgICAgICBiYXIuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIDEpXG4gICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIGJhcldpZHRoKVxuICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gaGVpZ2h0IC0geShkLnkpOyB9KVxuICAgICAgICAgICAgLm9uKCdtb3VzZW92ZXInLCB0aXAuc2hvdylcbiAgICAgICAgICAgIC5vbignbW91c2VvdXQnLCB0aXAuaGlkZSk7XG5cbiAgICAgICAgLy8geCBheGlzXG4gICAgICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwieCBheGlzXCIpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLFwiICsgaGVpZ2h0ICsgXCIpXCIpXG4gICAgICAgICAgICAuY2FsbCh4QXhpcyk7XG5cbiAgICAgICAgLy8gcm90YXRlIHRoZSBheGlzIGxhYmVsc1xuICAgICAgICBzdmcuc2VsZWN0QWxsKFwiLnguYXhpcyB0ZXh0XCIpXG4gICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIC0xICogdGhpcy5nZXRCQm94KCkuaGVpZ2h0ICsgXCIsXCIgKyAwLjUqdGhpcy5nZXRCQm94KCkuaGVpZ2h0ICsgXCIpcm90YXRlKC0zMClcIjtcbiAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHRpdGxlXG4gICAgICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsICh3aWR0aCAvIDIpKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCAwIC0gKG1hcmdpbi50b3AgLyAyKSlcbiAgICAgICAgICAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpXG4gICAgICAgICAgICAgICAgLnN0eWxlKFwiZm9udC1zaXplXCIsIFwiMTZweFwiKVxuICAgICAgICAgICAgICAgIC50ZXh0KFwiSGlzdG9ncmFtIG9mIEFubnVhbCBQcm9qZWN0IFNhdmluZ3MgLSBcIiArIGZ1ZWxUeXBlICsgXCIgKFwiICsgZW5lcmd5VW5pdCArIFwiIC8geWVhcilcIik7XG5cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNoYXJ0Lm1hcmdpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG1hcmdpbjtcbiAgICAgIG1hcmdpbiA9IF87XG4gICAgICByZXR1cm4gY2hhcnQ7XG4gICAgfTtcblxuICAgIGNoYXJ0LndpZHRoID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gd2lkdGg7XG4gICAgICB3aWR0aCA9IF87XG4gICAgICByZXR1cm4gY2hhcnQ7XG4gICAgfTtcblxuICAgIGNoYXJ0LmhlaWdodCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGhlaWdodDtcbiAgICAgIGhlaWdodCA9IF87XG4gICAgICByZXR1cm4gY2hhcnQ7XG4gICAgfTtcblxuICAgIHJldHVybiBjaGFydDtcbiAgfSxcbiAgaGFuZGxlUmVzaXplOiBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB3aWR0aDogdGhpcy5nZXRDdXJyZW50V2lkdGgoKSxcbiAgICB9KTtcbiAgICB0aGlzLnJlbmRlckNoYXJ0KCk7XG4gIH0sXG4gIGdldEN1cnJlbnRXaWR0aDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQoUmVhY3RET00uZmluZERPTU5vZGUodGhpcykpLnBhcmVudCgpLndpZHRoKCk7XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMubG9hZE1ldGVyUnVucyh0aGlzLnByb3BzKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHdpZHRoOiB0aGlzLmdldEN1cnJlbnRXaWR0aCgpLFxuICAgIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmhhbmRsZVJlc2l6ZSk7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5oYW5kbGVSZXNpemUpO1xuICB9LFxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICB0aGlzLmxvYWRNZXRlclJ1bnMobmV4dFByb3BzKTtcbiAgfSxcbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbihwcm9wcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IDAsXG4gICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgIHZhbGlkRGF0YTogZmFsc2UsXG4gICAgICBtZXRlclJ1bnM6IFtdLFxuICAgICAgcmVuZGVyQ291bnRlcjogMCwgLy8gY2F0Y2hpbmcgYW4gZXh0cmEgcmVyZW5kZXIgdGhhdCAoVE9ETykgbmVlZHMgdG8gYmUgZm91bmRcbiAgICB9XG4gIH0sXG4gIGluY3JlbWVudFJlbmRlckNvdW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe3JlbmRlckNvdW50ZXI6IHRoaXMuc3RhdGUucmVuZGVyQ291bnRlciArIDF9KTtcbiAgfSxcbiAgcmVuZGVyQ2hhcnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW5jcmVtZW50UmVuZGVyQ291bnRlcigpO1xuXG4gICAgdmFyIHZhbHVlcyA9IHRoaXMuZ2V0Q2hhcnRWYWx1ZXMoKTtcbiAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGQzLnNlbGVjdChSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKSlcbiAgICAgICAgLmNhbGwodGhpcy5oaXN0b2dyYW1DaGFydCh2YWx1ZXMpKTtcbiAgICB9XG4gIH0sXG4gIGdldENoYXJ0VmFsdWVzOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBwcm9qZWN0X21ldGVyX3J1bnMgPSB7fTtcbiAgICB0aGlzLnN0YXRlLm1ldGVyUnVucy5mb3JFYWNoKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgIGlmIChkLnByb2plY3QgaW4gcHJvamVjdF9tZXRlcl9ydW5zKSB7XG4gICAgICAgIHByb2plY3RfbWV0ZXJfcnVuc1tkLnByb2plY3RdLnB1c2goZClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2plY3RfbWV0ZXJfcnVuc1tkLnByb2plY3RdID0gW2RdXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgZm9yICh2YXIgcHJvamVjdF9pZCBpbiBwcm9qZWN0X21ldGVyX3J1bnMpIHtcbiAgICAgIGlmIChwcm9qZWN0X21ldGVyX3J1bnMuaGFzT3duUHJvcGVydHkocHJvamVjdF9pZCkpIHtcblxuICAgICAgICB2YXIgYW5udWFsX3NhdmluZ3MgPSB7RTogMCwgTkc6IDB9O1xuICAgICAgICBwcm9qZWN0X21ldGVyX3J1bnNbcHJvamVjdF9pZF0uZm9yRWFjaChmdW5jdGlvbihtZXRlcl9ydW4pIHtcbiAgICAgICAgICBpZiAobWV0ZXJfcnVuLmFubnVhbF9zYXZpbmdzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChtZXRlcl9ydW4uZnVlbF90eXBlID09IFwiRVwiKSB7XG4gICAgICAgICAgICAgIGFubnVhbF9zYXZpbmdzLkUgKz0gbWV0ZXJfcnVuLmFubnVhbF9zYXZpbmdzO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXRlcl9ydW4uZnVlbF90eXBlID09IFwiTkdcIikge1xuICAgICAgICAgICAgICBhbm51YWxfc2F2aW5ncy5ORyArPSBtZXRlcl9ydW4uYW5udWFsX3NhdmluZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5lbmVyZ3lVbml0ID09IFwiS1dIXCIpIHtcbiAgICAgICAgICB2YWx1ZXMucHVzaChhbm51YWxfc2F2aW5ncy5FICsgKGFubnVhbF9zYXZpbmdzLk5HICogMjkuMzAwMSkpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZW5lcmd5VW5pdCA9PSBcIlRIRVJNXCIpIHtcbiAgICAgICAgICB2YWx1ZXMucHVzaCgoYW5udWFsX3NhdmluZ3MuRSAqIDAuMDM0KSArIChhbm51YWxfc2F2aW5ncy5ORykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlcztcblxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNwaW5uZXJDZmcgPSB7IGxpbmVzOiA5LCBsZW5ndGg6IDksIHdpZHRoOiA1LCByYWRpdXM6IDEwLCBjb3JuZXJzOiAxLFxuICAgICAgY29sb3I6ICcjMDAxJywgb3BhY2l0eTogMC4yLCBjbGFzc05hbWU6ICdzcGlubmVyJywgdG9wOiAnOTVweCcsXG4gICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICB9XG5cbiAgICB2YXIgc3Bpbm5lciA9IChcbiAgICAgIDxSZWFjdFNwaW5uZXIgY29uZmlnPXtzcGlubmVyQ2ZnfSBzdG9wcGVkPXt0aGlzLnN0YXRlLmxvYWRpbmd9IC8+XG4gICAgKVxuICAgIHNwaW5uZXIgPSBudWxsO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaGlzdG9ncmFtXCI+XG4gICAgICAgIHtzcGlubmVyfVxuICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cImhpc3RvZ3JhbVwiIGhlaWdodD1cIjIwMFwiIHdpZHRoPVwiMTAwJVwiPlxuICAgICAgICA8L3N2Zz5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBSZWFjdFNwaW5uZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIGNvbmZpZzogUmVhY3QuUHJvcFR5cGVzLm9iamVjdCxcbiAgICBzdG9wcGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbFxuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNwaW5uZXIgPSBuZXcgU3Bpbm5lcih0aGlzLnByb3BzLmNvbmZpZyk7XG4gICAgdGhpcy5zcGlubmVyLnNwaW4odGhpcy5yZWZzLmNvbnRhaW5lcik7XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV3UHJvcHMpIHtcbiAgICBpZiAobmV3UHJvcHMuc3RvcHBlZCA9PT0gdHJ1ZSAmJiAhdGhpcy5wcm9wcy5zdG9wcGVkKSB7XG4gICAgICB0aGlzLnNwaW5uZXIuc3RvcCgpO1xuICAgIH0gZWxzZSBpZiAoIW5ld1Byb3BzLnN0b3BwZWQgJiYgdGhpcy5wcm9wcy5zdG9wcGVkID09PSB0cnVlKSB7XG4gICAgICB0aGlzLnNwaW5uZXIuc3Bpbih0aGlzLnJlZnMuY29udGFpbmVyKTtcbiAgICB9XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3Bpbm5lci5zdG9wKCk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGlubmVyQ29udGFpbmVyXCIgcmVmPVwiY29udGFpbmVyXCIgLz5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBIaXN0b2dyYW07XG4iLCJ2YXIgTWFwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8c3ZnIGNsYXNzTmFtZT1cIm1hcFwiIGhlaWdodD1cIjIwMHB4XCIgd2lkdGg9XCIxMDAlXCIgLz5cbiAgICApXG4gIH1cbn0pO1xubW9kdWxlLmV4cG9ydHMgPSBNYXA7XG4iLCJ2YXIgc2NhdHRlcnBsb3QgPSByZXF1aXJlKCcuL3NjYXR0ZXJwbG90Jyk7XG5cbnZhciBTY2F0dGVycGxvdCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcHJvcFR5cGVzOiB7XG4gICAgZGF0YTogUmVhY3QuUHJvcFR5cGVzLmFycmF5LFxuICAgIGRvbWFpbjogUmVhY3QuUHJvcFR5cGVzLm9iamVjdFxuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZWwgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBzY2F0dGVycGxvdC5jcmVhdGUoZWwsIHtcbiAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICBoZWlnaHQ6ICcyMDBweCdcbiAgICB9LCB0aGlzLmdldENoYXJ0U3RhdGUoKSk7XG4gIH0sXG5cbiAgY29tcG9uZW50RGlkVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZWwgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICBzY2F0dGVycGxvdC51cGRhdGUoZWwsIHRoaXMuZ2V0Q2hhcnRTdGF0ZSgpKTtcbiAgfSxcblxuICBnZXRDaGFydFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZGF0YTogdGhpcy5wcm9wcy5kYXRhLFxuICAgICAgZG9tYWluOiB0aGlzLnByb3BzLmRvbWFpblxuICAgIH07XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbCA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIHNjYXR0ZXJwbG90LmRlc3Ryb3koZWwpO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2NhdHRlcnBsb3RcIj48L2Rpdj5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTY2F0dGVycGxvdDtcbiIsInZhciBUaW1lc2VyaWVzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8c3ZnIGNsYXNzTmFtZT1cInRpbWVTZXJpZXNcIiBoZWlnaHQ9XCIyMDBweFwiIHdpZHRoPVwiMTAwJVwiIC8+XG4gICAgKVxuICB9XG59KTtcbm1vZHVsZS5leHBvcnRzID0gVGltZXNlcmllcztcbiIsIndpbmRvdy5EYXNoYm9hcmRCb3ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGFzaGJvYXJkQm94IGNvbnRhaW5lci1mbHVpZFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvd1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTEyXCI+XG4gICAgICAgICAgICA8UHJvamVjdERhdGFCb3hcbiAgICAgICAgICAgICAgey4uLnRoaXMucHJvcHN9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBQcm9qZWN0RGF0YUJveCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgbG9hZFByb2plY3RzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcHJvamVjdExpc3RVUkwgPSB0aGlzLnByb3BzLnByb2plY3RfbGlzdF91cmw7XG5cbiAgICB2YXIgZmlsdGVyUGFyYW0gPSAodGhpcy5zdGF0ZS5wcm9qZWN0QmxvY2tJZEZpbHRlck1vZGUgPT0gXCJPUlwiKSA/XG4gICAgICAgIFwicHJvamVjdGJsb2NrX29yXCIgOiBcInByb2plY3RibG9ja19hbmRcIjtcbiAgICB2YXIgcGFyYW1zID0gdGhpcy5zdGF0ZS5zZWxlY3RlZFByb2plY3RCbG9ja0lkcy5tYXAoZnVuY3Rpb24oZCwgaSkge1xuICAgICAgcmV0dXJuIGZpbHRlclBhcmFtICsgXCI9XCIgKyBkO1xuICAgIH0pO1xuXG4gICAgaWYgKHBhcmFtcy5sZW5ndGggPiAwKSB7XG4gICAgICBwcm9qZWN0TGlzdFVSTCArPSBcIj9cIiArIHBhcmFtcy5qb2luKFwiJlwiKTtcbiAgICB9XG5cbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBwcm9qZWN0TGlzdFVSTCxcbiAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3Byb2plY3RzOiBkYXRhfSk7XG4gICAgICB9LmJpbmQodGhpcyksXG4gICAgICBlcnJvcjogZnVuY3Rpb24oeGhyLCBzdGF0dXMsIGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKHByb2plY3RMaXN0VVJMLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH0pO1xuICB9LFxuICBzZWxlY3RQcm9qZWN0QmxvY2tzQ2FsbGJhY2s6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHNlbGVjdGVkUHJvamVjdEJsb2NrSWRzOiBkYXRhLmlkcyxcbiAgICAgIHByb2plY3RCbG9ja0lkRmlsdGVyTW9kZTogZGF0YS5maWx0ZXJNb2RlLFxuICAgIH0sIHRoaXMubG9hZFByb2plY3RzKTtcbiAgfSxcbiAgc2VsZWN0Q2hhcnRUeXBlQ2FsbGJhY2s6IGZ1bmN0aW9uKGNoYXJ0VHlwZUlkKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7c2VsZWN0ZWRDaGFydFR5cGVJZDogY2hhcnRUeXBlSWR9KTtcbiAgfSxcbiAgc2VsZWN0RnVlbFR5cGVDYWxsYmFjazogZnVuY3Rpb24oZnVlbFR5cGVJZCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkRnVlbFR5cGVJZDogZnVlbFR5cGVJZH0pO1xuICB9LFxuICBzZWxlY3RFbmVyZ3lVbml0Q2FsbGJhY2s6IGZ1bmN0aW9uKGVuZXJneVVuaXRJZCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkRW5lcmd5VW5pdElkOiBlbmVyZ3lVbml0SWR9KTtcbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvamVjdHM6IFtdLFxuICAgICAgc2VsZWN0ZWRQcm9qZWN0QmxvY2tJZHM6IFtdLFxuICAgICAgcHJvamVjdEJsb2NrSWRGaWx0ZXJNb2RlOiBcIk9SXCIsXG4gICAgICBzZWxlY3RlZENoYXJ0VHlwZUlkOiBcImhpc3RvZ3JhbVwiLFxuICAgICAgc2VsZWN0ZWRGdWVsVHlwZUlkOiBcIkVcIixcbiAgICAgIHNlbGVjdGVkRW5lcmd5VW5pdElkOiBcIktXSFwiLFxuICAgIH07XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmxvYWRQcm9qZWN0cygpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGNoYXJ0VHlwZXMgPSBbXG4gICAgICB7XG4gICAgICAgIGlkOiBcInRpbWVTZXJpZXNcIixcbiAgICAgICAgbmFtZTogXCJHcm9zcyBTYXZpbmdzIFRpbWUgU2VyaWVzXCIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogXCJoaXN0b2dyYW1cIixcbiAgICAgICAgbmFtZTogXCJBbm51YWwgU2F2aW5ncyBIaXN0b2dyYW1cIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiBcInNjYXR0ZXJQbG90XCIsXG4gICAgICAgIG5hbWU6IFwiUmVhbGl6YXRpb24gUmF0ZSBTY2F0dGVycGxvdFwiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6IFwibWFwXCIsXG4gICAgICAgIG5hbWU6IFwiTWFwXCIsXG4gICAgICB9LFxuICAgIF07XG5cbiAgICB2YXIgZnVlbFR5cGVzID0gW1xuICAgICAge1xuICAgICAgICBpZDogXCJFXCIsXG4gICAgICAgIG5hbWU6IFwiRWxlY3RyaWNpdHlcIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiBcIk5HXCIsXG4gICAgICAgIG5hbWU6IFwiTmF0dXJhbCBHYXNcIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiBcIkJPVEhcIixcbiAgICAgICAgbmFtZTogXCJDb21iaW5lZFwiLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgdmFyIGVuZXJneVVuaXRzID0gW1xuICAgICAge1xuICAgICAgICBpZDogXCJLV0hcIixcbiAgICAgICAgbmFtZTogXCJrV2hcIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiBcIlRIRVJNXCIsXG4gICAgICAgIG5hbWU6IFwidGhlcm1zXCIsXG4gICAgICB9LFxuICAgIF07XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJzZWxlY3RlZFByb2plY3RCbG9ja0JveFwiPlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtbWQtMTJcIj5cbiAgICAgICAgICAgIDxDYXRlZ29yeVNlbGVjdG9yXG4gICAgICAgICAgICAgIHRpdGxlPXtudWxsfVxuICAgICAgICAgICAgICBjYXRlZ29yaWVzPXtjaGFydFR5cGVzfVxuICAgICAgICAgICAgICBzZWxlY3RDYXRlZ29yeUNhbGxiYWNrPXt0aGlzLnNlbGVjdENoYXJ0VHlwZUNhbGxiYWNrfVxuICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5SWQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWRDaGFydFR5cGVJZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8YnIvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtbWQtOFwiPlxuICAgICAgICAgICAgPENoYXJ0Qm94XG4gICAgICAgICAgICAgIGNoYXJ0VHlwZT17dGhpcy5zdGF0ZS5zZWxlY3RlZENoYXJ0VHlwZUlkfVxuICAgICAgICAgICAgICBmdWVsVHlwZT17dGhpcy5zdGF0ZS5zZWxlY3RlZEZ1ZWxUeXBlSWR9XG4gICAgICAgICAgICAgIGVuZXJneVVuaXQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWRFbmVyZ3lVbml0SWR9XG4gICAgICAgICAgICAgIHByb2plY3RzPXt0aGlzLnN0YXRlLnByb2plY3RzfVxuICAgICAgICAgICAgICBtZXRlcl9ydW5fbGlzdF91cmw9e3RoaXMucHJvcHMubWV0ZXJfcnVuX2xpc3RfdXJsfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLW1kLTRcIj5cbiAgICAgICAgICAgIDxQcm9qZWN0U2VsZWN0aW9uU3VtbWFyeUJveFxuICAgICAgICAgICAgICBwcm9qZWN0cz17dGhpcy5zdGF0ZS5wcm9qZWN0c31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtbWQtNFwiPlxuICAgICAgICAgICAgPENhdGVnb3J5U2VsZWN0b3JcbiAgICAgICAgICAgICAgdGl0bGU9e251bGx9XG4gICAgICAgICAgICAgIGNhdGVnb3JpZXM9e2Z1ZWxUeXBlc31cbiAgICAgICAgICAgICAgc2VsZWN0Q2F0ZWdvcnlDYWxsYmFjaz17dGhpcy5zZWxlY3RGdWVsVHlwZUNhbGxiYWNrfVxuICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5SWQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWRGdWVsVHlwZUlkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLW1kLTRcIj5cbiAgICAgICAgICAgIDxDYXRlZ29yeVNlbGVjdG9yXG4gICAgICAgICAgICAgIHRpdGxlPXtudWxsfVxuICAgICAgICAgICAgICBjYXRlZ29yaWVzPXtlbmVyZ3lVbml0c31cbiAgICAgICAgICAgICAgc2VsZWN0Q2F0ZWdvcnlDYWxsYmFjaz17dGhpcy5zZWxlY3RFbmVyZ3lVbml0Q2FsbGJhY2t9XG4gICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnlJZD17dGhpcy5zdGF0ZS5zZWxlY3RlZEVuZXJneVVuaXRJZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxQcm9qZWN0RmlsdGVyQm94XG4gICAgICAgICAgc2VsZWN0UHJvamVjdEJsb2Nrc0NhbGxiYWNrPXt0aGlzLnNlbGVjdFByb2plY3RCbG9ja3NDYWxsYmFja31cblxuICAgICAgICAgIHByb2plY3RCbG9ja0lkRmlsdGVyTW9kZT17dGhpcy5zdGF0ZS5wcm9qZWN0QmxvY2tJZEZpbHRlck1vZGV9XG4gICAgICAgICAgey4uLnRoaXMucHJvcHN9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPFByb2plY3RUYWJsZVxuICAgICAgICAgIHByb2plY3RzPXt0aGlzLnN0YXRlLnByb2plY3RzfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59KTtcblxudmFyIFByb2plY3RGaWx0ZXJCb3ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZmlsdGVycyA9IFtcbiAgICAgICg8bGkgY2xhc3NOYW1lPVwibGlzdC1ncm91cC1pdGVtXCIga2V5PXtcInByb2plY3RCbG9ja0ZpbHRlclwifT5cbiAgICAgICAgPFByb2plY3RCbG9ja0ZpbHRlclxuICAgICAgICAgIHsuLi50aGlzLnByb3BzfVxuICAgICAgICAvPlxuICAgICAgPC9saT4pLFxuICAgICAgLy8gKDxsaSBjbGFzc05hbWU9XCJsaXN0LWdyb3VwLWl0ZW1cIiBrZXk9e1wiZGF0ZVJhbmdlc0ZpbHRlclwifT4gPERhdGVSYW5nZXNGaWx0ZXIvPiA8L2xpPiksXG4gICAgICAvLyAoPGxpIGNsYXNzTmFtZT1cImxpc3QtZ3JvdXAtaXRlbVwiIGtleT17XCJ6aXBDb2RlRmlsdGVyXCJ9PiA8WmlwQ29kZUZpbHRlci8+IDwvbGk+KSxcbiAgICAgIC8vICg8bGkgY2xhc3NOYW1lPVwibGlzdC1ncm91cC1pdGVtXCIga2V5PXtcInByb2plY3RDb3N0RmlsdGVyXCJ9PiA8UHJvamVjdENvc3RGaWx0ZXIvPiA8L2xpPiksXG4gICAgICAvLyAoPGxpIGNsYXNzTmFtZT1cImxpc3QtZ3JvdXAtaXRlbVwiIGtleT17XCJjbGltYXRlWm9uZUZpbHRlclwifT4gPENsaW1hdGVab25lRmlsdGVyLz4gPC9saT4pLFxuICAgICAgLy8gKDxsaSBjbGFzc05hbWU9XCJsaXN0LWdyb3VwLWl0ZW1cIiBrZXk9e1wiZWNtRmlsdGVyXCJ9PiA8RW5lcmd5Q29uc2VydmF0aW9uTWVhc3VyZUZpbHRlci8+IDwvbGk+KSxcbiAgICBdO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHJvamVjdEZpbHRlckJveFwiPlxuICAgICAgICA8aDU+UHJvamVjdCBGaWx0ZXJzPC9oNT5cbiAgICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3QtZ3JvdXBcIj5cbiAgICAgICAgICB7ZmlsdGVyc31cbiAgICAgICAgPC91bD5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBQcm9qZWN0QmxvY2tGaWx0ZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGxvYWRQcm9qZWN0QmxvY2tzOiBmdW5jdGlvbigpIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLnByb3BzLnByb2plY3RfYmxvY2tfbGlzdF91cmwgKyBcIj9uYW1lX29ubHk9dHJ1ZVwiLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cHJvamVjdEJsb2NrTGlzdDogZGF0YX0pO1xuICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcih0aGlzLnByb3BzLnByb2plY3RfYmxvY2tfbGlzdF91cmwgKyBcIj9uYW1lX29ubHk9dHJ1ZVwiLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH0pO1xuICB9LFxuICBoYW5kbGVTZWxlY3RQcm9qZWN0QmxvY2s6IGZ1bmN0aW9uKHByb2plY3RCbG9ja0lkKSB7XG4gICAgdmFyIGlkcyA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRQcm9qZWN0QmxvY2tJZHM7XG4gICAgaWRzLnB1c2gocHJvamVjdEJsb2NrSWQpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkUHJvamVjdEJsb2NrSWRzOiBpZHN9LCB0aGlzLmNhbGxDYWxsYmFjayk7XG4gIH0sXG4gIGhhbmRsZURlc2VsZWN0UHJvamVjdEJsb2NrOiBmdW5jdGlvbihwcm9qZWN0QmxvY2tJZCkge1xuICAgIHZhciBpZHMgPSB0aGlzLnN0YXRlLnNlbGVjdGVkUHJvamVjdEJsb2NrSWRzO1xuICAgIHZhciBpbmRleCA9IGlkcy5pbmRleE9mKHByb2plY3RCbG9ja0lkKTtcbiAgICBpZiAoaW5kZXggIT0gLTEpIHtcbiAgICAgIGlkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZFByb2plY3RCbG9ja0lkczogaWRzfSwgdGhpcy5jYWxsQ2FsbGJhY2spO1xuICB9LFxuICB0b2dnbGVGaWx0ZXJNb2RlQ2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmaWx0ZXJNb2RlID0gKHRoaXMuc3RhdGUuZmlsdGVyTW9kZSA9PSBcIk9SXCIpID8gXCJBTkRcIiA6IFwiT1JcIjtcbiAgICB0aGlzLnNldFN0YXRlKHtmaWx0ZXJNb2RlOiBmaWx0ZXJNb2RlfSwgdGhpcy5jYWxsQ2FsbGJhY2spO1xuICB9LFxuICBjYWxsQ2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucHJvcHMuc2VsZWN0UHJvamVjdEJsb2Nrc0NhbGxiYWNrKHtcbiAgICAgIGlkczogdGhpcy5zdGF0ZS5zZWxlY3RlZFByb2plY3RCbG9ja0lkcyxcbiAgICAgIGZpbHRlck1vZGU6IHRoaXMuc3RhdGUuZmlsdGVyTW9kZSxcbiAgICB9KTtcbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvamVjdEJsb2NrTGlzdDogW10sXG4gICAgICBzZWxlY3RlZFByb2plY3RCbG9ja0lkczogW10sXG4gICAgICBmaWx0ZXJNb2RlOiB0aGlzLnByb3BzLnByb2plY3RCbG9ja0lkRmlsdGVyTW9kZSxcbiAgICB9O1xuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5sb2FkUHJvamVjdEJsb2NrcygpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwcm9qZWN0QmxvY2tMaXN0SXRlbXMgPSB0aGlzLnN0YXRlLnByb2plY3RCbG9ja0xpc3QubWFwKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgIHZhciBzZWxlY3RlZCA9ICh0aGlzLnN0YXRlLnNlbGVjdGVkUHJvamVjdEJsb2NrSWRzLmluZGV4T2YoZC5pZCkgIT0gLTEpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFByb2plY3RCbG9ja0xpc3RJdGVtXG4gICAgICAgICAga2V5PXtkLmlkfVxuICAgICAgICAgIHNlbGVjdGVkPXtzZWxlY3RlZH1cbiAgICAgICAgICBoYW5kbGVTZWxlY3RQcm9qZWN0QmxvY2s9e3RoaXMuaGFuZGxlU2VsZWN0UHJvamVjdEJsb2NrfVxuICAgICAgICAgIGhhbmRsZURlc2VsZWN0UHJvamVjdEJsb2NrPXt0aGlzLmhhbmRsZURlc2VsZWN0UHJvamVjdEJsb2NrfVxuICAgICAgICAgIHByb2plY3RCbG9jaz17ZH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwcm9qZWN0QmxvY2tGaWx0ZXJcIj5cbiAgICAgICAgPHNwYW4+RmlsdGVyIGJ5IHByb2plY3QgYmxvY2tzPC9zcGFuPlxuICAgICAgICA8RmlsdGVyTW9kZVxuICAgICAgICAgIHRvZ2dsZUZpbHRlck1vZGVDYWxsYmFjaz17dGhpcy50b2dnbGVGaWx0ZXJNb2RlQ2FsbGJhY2t9XG4gICAgICAgICAgZmlsdGVyTW9kZT17dGhpcy5zdGF0ZS5maWx0ZXJNb2RlfVxuICAgICAgICAvPlxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAge3Byb2plY3RCbG9ja0xpc3RJdGVtc31cbiAgICAgICAgPC91bD5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBGaWx0ZXJNb2RlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZpbHRlck1vZGVcIj5cbiAgICAgICAgPHNwYW4+XG4gICAgICAgICAgRmlsdGVyIE1vZGU6IHt0aGlzLnByb3BzLmZpbHRlck1vZGV9ICZuYnNwO1xuICAgICAgICAgIDxhIG9uQ2xpY2s9e3RoaXMucHJvcHMudG9nZ2xlRmlsdGVyTW9kZUNhbGxiYWNrfT50b2dnbGU8L2E+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBQcm9qZWN0QmxvY2tMaXN0SXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgaGFuZGxlU2VsZWN0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCkge1xuICAgICAgdGhpcy5wcm9wcy5oYW5kbGVEZXNlbGVjdFByb2plY3RCbG9jayh0aGlzLnByb3BzLnByb2plY3RCbG9jay5pZCk7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnByb3BzLmhhbmRsZVNlbGVjdFByb2plY3RCbG9jayh0aGlzLnByb3BzLnByb2plY3RCbG9jay5pZCk7XG4gICAgfVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGVjdGVkVGV4dDtcbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCkge1xuICAgICAgc2VsZWN0ZWRUZXh0ID0gXCJTZWxlY3RlZCAtIGNsaWNrIHRvIGRlc2VsZWN0XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdGVkVGV4dCA9IFwiVW5zZWxlY3RlZCAtIGNsaWNrIHRvIHNlbGVjdFwiO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8bGkgY2xhc3NOYW1lPVwicHJvamVjdEJsb2NrTGlzdEl0ZW0gbGlzdC1ncm91cC1pdGVtIGNsZWFyZml4XCI+XG4gICAgICAgIDxzcGFuPnt0aGlzLnByb3BzLnByb2plY3RCbG9jay5uYW1lfSZuYnNwOzwvc3Bhbj5cbiAgICAgICAgPGEgb25DbGljaz17dGhpcy5oYW5kbGVTZWxlY3R9PntzZWxlY3RlZFRleHR9PC9hPlxuICAgICAgPC9saT5cbiAgICApXG4gIH1cbn0pO1xuXG5cbnZhciBGdWVsVHlwZUZpbHRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnVlbFR5cGVMaXN0SXRlbXMgPSB0aGlzLnByb3BzLmZ1ZWxUeXBlcy5tYXAoZnVuY3Rpb24oZCxpKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8RnVlbFR5cGVMaXN0SXRlbVxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICBmdWVsVHlwZT17ZH1cbiAgICAgICAgICBoYW5kbGVTZWxlY3RGdWVsVHlwZT17dGhpcy5wcm9wcy5oYW5kbGVTZWxlY3RGdWVsVHlwZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZnVlbFR5cGVGaWx0ZXJcIj5cbiAgICAgICAgPHNwYW4+RmlsdGVyIGJ5IGVuZXJneSBUeXBlPC9zcGFuPlxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAge2Z1ZWxUeXBlTGlzdEl0ZW1zfVxuICAgICAgICA8L3VsPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59KTtcblxudmFyIEZ1ZWxUeXBlTGlzdEl0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGhhbmRsZVNlbGVjdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wcm9wcy5oYW5kbGVTZWxlY3RGdWVsVHlwZSh0aGlzLnByb3BzLmZ1ZWxUeXBlKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGxpIGNsYXNzTmFtZT1cImZ1ZWxUeXBlTGlzdEl0ZW0gbGlzdC1ncm91cC1pdGVtIGNsZWFyZml4XCI+XG4gICAgICAgIDxhIG9uQ2xpY2s9e3RoaXMuaGFuZGxlU2VsZWN0fT5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5mdWVsVHlwZS5uYW1lfVxuICAgICAgICA8L2E+XG4gICAgICA8L2xpPlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBDbGltYXRlWm9uZUZpbHRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJjbGltYXRlWm9uZUZpbHRlclwiPlxuICAgICAgICBGaWx0ZXIgYnkgY2xpbWF0ZSB6b25lXG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn0pO1xuXG5cbnZhciBEYXRlUmFuZ2VzRmlsdGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhdGVSYW5nZXNGaWx0ZXJcIj5cbiAgICAgICAgRmlsdGVyIGJ5IGRhdGUgcmFuZ2VzXG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn0pO1xuXG52YXIgWmlwQ29kZUZpbHRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ6aXBDb2RlRmlsdGVyXCI+XG4gICAgICAgIEZpbHRlciBieSBaSVAgY29kZVxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59KTtcblxudmFyIFByb2plY3RDb3N0RmlsdGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInByb2plY3RDb3N0RmlsdGVyXCI+XG4gICAgICAgIEZpbHRlciBieSBwcm9qZWN0IGNvc3RcbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG52YXIgRW5lcmd5Q29uc2VydmF0aW9uTWVhc3VyZUZpbHRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJlbmVyZ3lDb25zZXJ2YXRpb25NZWFzdXJlRmlsdGVyXCI+XG4gICAgICAgIEZpbHRlciBieSBFQ01cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBQcm9qZWN0U2VsZWN0aW9uU3VtbWFyeUJveCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwcm9qZWN0U3VtbWFyeUJveFwiPlxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJsaXN0LWdyb3VwLWl0ZW1cIj5OdW1iZXIgb2YgcHJvamVjdHM6IHt0aGlzLnByb3BzLnByb2plY3RzLmxlbmd0aH08L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59KTtcblxudmFyIENhdGVnb3J5U2VsZWN0b3IgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNhdGVnb3J5TGlzdEl0ZW1zID0gdGhpcy5wcm9wcy5jYXRlZ29yaWVzLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICB2YXIgc2VsZWN0ZWQgPSAodGhpcy5wcm9wcy5zZWxlY3RlZENhdGVnb3J5SWQgPT0gZC5pZCk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Q2F0ZWdvcnlMaXN0SXRlbVxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICBjYXRlZ29yeT17ZH1cbiAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0ZWR9XG4gICAgICAgICAgc2VsZWN0Q2F0ZWdvcnlDYWxsYmFjaz17dGhpcy5wcm9wcy5zZWxlY3RDYXRlZ29yeUNhbGxiYWNrfVxuICAgICAgICAvPlxuICAgICAgKVxuICAgIH0sIHRoaXMpO1xuXG4gICAgdmFyIHRpdGxlO1xuICAgIGlmICh0aGlzLnByb3BzLnRpdGxlICE9IG51bGwpIHtcbiAgICAgIHRpdGxlID0gPGg1Pnt0aGlzLnByb3BzLnRpdGxlfTwvaDU+XG4gICAgfSBlbHNlIHtcbiAgICAgIHRpdGxlID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJjYXRlZ29yeVNlbGVjdG9yXCI+XG4gICAgICAgIHt0aXRsZX1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXBcIiBkYXRhLXRvZ2dsZT1cImJ1dHRvbnNcIj5cbiAgICAgICAgICB7Y2F0ZWdvcnlMaXN0SXRlbXN9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59KTtcblxudmFyIENhdGVnb3J5TGlzdEl0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGhhbmRsZVNlbGVjdDogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMucHJvcHMuc2VsZWN0Q2F0ZWdvcnlDYWxsYmFjayh0aGlzLnByb3BzLmNhdGVnb3J5LmlkKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYm9vdHN0cmFwX2NsYXNzO1xuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkKSB7XG4gICAgICBib290c3RyYXBfY2xhc3MgPSBcImNhdGVnb3J5TGlzdEl0ZW0gYnRuIGJ0bi1wcmltYXJ5IGFjdGl2ZVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBib290c3RyYXBfY2xhc3MgPSBcImNhdGVnb3J5TGlzdEl0ZW0gYnRuIGJ0bi1wcmltYXJ5XCI7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8bGFiZWwgY2xhc3NOYW1lPXtib290c3RyYXBfY2xhc3N9IG9uQ2xpY2s9e3RoaXMuaGFuZGxlU2VsZWN0fT5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgdHlwZT1cInJhZGlvXCJcbiAgICAgICAgICBjaGVja2VkPXt0aGlzLnByb3BzLnNlbGVjdGVkfVxuICAgICAgICAgIHJlYWRPbmx5PXt0cnVlfVxuICAgICAgICAvPlxuICAgICAgICB7dGhpcy5wcm9wcy5jYXRlZ29yeS5uYW1lfVxuICAgICAgPC9sYWJlbD5cbiAgICApXG4gIH1cbn0pO1xuXG52YXIgU2NhdHRlcnBsb3QgPSByZXF1aXJlKCcuL1NjYXR0ZXJwbG90LmpzeCcpO1xudmFyIEhpc3RvZ3JhbSA9IHJlcXVpcmUoJy4vSGlzdG9ncmFtLmpzeCcpO1xudmFyIFRpbWVzZXJpZXMgPSByZXF1aXJlKCcuL1RpbWVzZXJpZXMuanN4Jyk7XG52YXIgTWFwID0gcmVxdWlyZSgnLi9NYXAuanN4Jyk7XG5cbnZhciBDaGFydEJveCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2hhcnRDb21wb25lbnQ7XG4gICAgaWYgKHRoaXMucHJvcHMuY2hhcnRUeXBlID09IFwiaGlzdG9ncmFtXCIpIHtcblxuICAgICAgY2hhcnRDb21wb25lbnQgPSAoXG4gICAgICAgIDxIaXN0b2dyYW1cbiAgICAgICAgICBwcm9qZWN0cz17dGhpcy5wcm9wcy5wcm9qZWN0c31cbiAgICAgICAgICBmdWVsVHlwZT17dGhpcy5wcm9wcy5mdWVsVHlwZX1cbiAgICAgICAgICBlbmVyZ3lVbml0PXt0aGlzLnByb3BzLmVuZXJneVVuaXR9XG4gICAgICAgICAgbWV0ZXJfcnVuX2xpc3RfdXJsPXt0aGlzLnByb3BzLm1ldGVyX3J1bl9saXN0X3VybH1cbiAgICAgICAgLz5cbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuY2hhcnRUeXBlID09IFwidGltZVNlcmllc1wiKSB7XG4gICAgICBjaGFydENvbXBvbmVudCA9IChcbiAgICAgICAgPFRpbWVzZXJpZXNcbiAgICAgICAgLz5cbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuY2hhcnRUeXBlID09IFwic2NhdHRlclBsb3RcIikge1xuXG4gICAgICB2YXIgc2FtcGxlRGF0YSA9IFtcbiAgICAgICAge2lkOiAnNWZibXptdGMnLCB4OiA3LCB5OiA0MX0sXG4gICAgICAgIHtpZDogJ3M0ZjhwaHdtJywgeDogMTEsIHk6IDQ1fSxcbiAgICAgIF07XG5cbiAgICAgIHZhciBzYW1wbGVEb21haW4gPSB7XG4gICAgICAgIHg6IFswLCAzMF0sXG4gICAgICAgIHk6IFswLCAxMDBdLFxuICAgICAgfTtcblxuICAgICAgY2hhcnRDb21wb25lbnQgPSAoXG4gICAgICAgIDxTY2F0dGVycGxvdFxuICAgICAgICAgIGRhdGE9e3NhbXBsZURhdGF9XG4gICAgICAgICAgZG9tYWluPXtzYW1wbGVEb21haW59XG4gICAgICAgIC8+XG4gICAgICApXG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmNoYXJ0VHlwZSA9PSBcIm1hcFwiKSB7XG4gICAgICBjaGFydENvbXBvbmVudCA9IChcbiAgICAgICAgPE1hcCAvPlxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICBjaGFydENvbXBvbmVudCA9IDxzcGFuPlBsZWFzZSBTZWxlY3QgYSBDaGFydDwvc3Bhbj5cbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJjaGFydEJveFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsIHBhbmVsLWRlZmF1bHRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWJvZHlcIj5cbiAgICAgICAgICAgIHtjaGFydENvbXBvbmVudH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn0pO1xuXG52YXIgUHJvamVjdFRhYmxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwcm9qZWN0cyA9IHRoaXMucHJvcHMucHJvamVjdHMubWFwKGZ1bmN0aW9uKGQsaSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFByb2plY3RUYWJsZUl0ZW1cbiAgICAgICAgICBrZXk9e2QuaWR9XG4gICAgICAgICAgcHJvamVjdD17ZH1cbiAgICAgICAgLz5cbiAgICAgIClcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwcm9qZWN0VGFibGVcIj5cbiAgICAgICAgUHJvamVjdCBUYWJsZVxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAgIHtwcm9qZWN0c31cbiAgICAgICAgPC91bD5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBQcm9qZWN0VGFibGVJdGVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBoYW5kbGVTZWxlY3Q6IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMucHJvcHMucHJvamVjdCk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxsaSBjbGFzc05hbWU9XCJsaXN0LWdyb3VwLWl0ZW0gY2xlYXJmaXhcIj5cbiAgICAgICAgPGEgb25DbGljaz17dGhpcy5oYW5kbGVTZWxlY3R9PlxuICAgICAgICAgIHt0aGlzLnByb3BzLnByb2plY3QucHJvamVjdF9pZH1cbiAgICAgICAgPC9hPlxuICAgICAgPC9saT5cbiAgICApXG4gIH1cbn0pO1xuIiwidmFyIHNjYXR0ZXJwbG90ID0ge307XG5cbnNjYXR0ZXJwbG90LmNyZWF0ZSA9IGZ1bmN0aW9uKGVsLCBwcm9wcywgc3RhdGUpIHtcbiAgdmFyIHN2ZyA9IGQzLnNlbGVjdChlbCkuYXBwZW5kKCdzdmcnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ3NjYXR0ZXJwbG90JylcbiAgICAgIC5hdHRyKCd3aWR0aCcsIHByb3BzLndpZHRoKVxuICAgICAgLmF0dHIoJ2hlaWdodCcsIHByb3BzLmhlaWdodCk7XG5cbiAgc3ZnLmFwcGVuZCgnZycpXG4gICAgICAuYXR0cignY2xhc3MnLCAnc2NhdHRlcnBsb3QtcG9pbnRzJyk7XG5cbiAgdGhpcy51cGRhdGUoZWwsIHN0YXRlKTtcbn07XG5cbnNjYXR0ZXJwbG90LnVwZGF0ZSA9IGZ1bmN0aW9uKGVsLCBzdGF0ZSkge1xuICB2YXIgc2NhbGVzID0gdGhpcy5fc2NhbGVzKGVsLCBzdGF0ZS5kb21haW4pO1xuICB0aGlzLl9kcmF3UG9pbnRzKGVsLCBzY2FsZXMsIHN0YXRlLmRhdGEpO1xufTtcblxuc2NhdHRlcnBsb3QuZGVzdHJveSA9IGZ1bmN0aW9uKGVsKSB7XG59O1xuXG5zY2F0dGVycGxvdC5fZHJhd1BvaW50cyA9IGZ1bmN0aW9uKGVsLCBzY2FsZXMsIGRhdGEpIHtcbiAgdmFyIGcgPSBkMy5zZWxlY3QoZWwpLnNlbGVjdEFsbCgnLnNjYXR0ZXJwbG90LXBvaW50cycpO1xuXG4gIHZhciBwb2ludCA9IGcuc2VsZWN0QWxsKCcuc2NhdHRlcnBsb3QtcG9pbnQnKVxuICAgIC5kYXRhKGRhdGEsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuaWQ7IH0pO1xuXG4gIC8vIEVOVEVSXG4gIHBvaW50LmVudGVyKCkuYXBwZW5kKCdjaXJjbGUnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ2QzLXBvaW50Jyk7XG5cbiAgLy8gRU5URVIgJiBVUERBVEVcbiAgcG9pbnQuYXR0cignY3gnLCBmdW5jdGlvbihkKSB7IHJldHVybiBzY2FsZXMueChkLngpOyB9KVxuICAgICAgLmF0dHIoJ2N5JywgZnVuY3Rpb24oZCkgeyByZXR1cm4gc2NhbGVzLnkoZC55KTsgfSlcbiAgICAgIC5hdHRyKCdyJywgNSk7XG5cbiAgLy8gRVhJVFxuICBwb2ludC5leGl0KClcbiAgICAgIC5yZW1vdmUoKTtcbn07XG5cbnNjYXR0ZXJwbG90Ll9zY2FsZXMgPSBmdW5jdGlvbihlbCwgZG9tYWluKSB7XG4gIGlmICghZG9tYWluKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICB2YXIgd2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcbiAgdmFyIGhlaWdodCA9IGVsLm9mZnNldEhlaWdodDtcblxuICB2YXIgeCA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgLnJhbmdlKFswLCB3aWR0aF0pXG4gICAgLmRvbWFpbihkb21haW4ueCk7XG5cbiAgdmFyIHkgPSBkMy5zY2FsZS5saW5lYXIoKVxuICAgIC5yYW5nZShbaGVpZ2h0LCAwXSlcbiAgICAuZG9tYWluKGRvbWFpbi55KTtcblxuICByZXR1cm4ge3g6IHgsIHk6IHl9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzY2F0dGVycGxvdDtcbiJdfQ==
