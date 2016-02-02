(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/main.jsx":[function(require,module,exports){
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
            )
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
        React.createElement("h5", null, "Stats"), 
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
        React.createElement(TimeSeries, null
        )
      )
    } else if (this.props.chartType == "scatterPlot") {
      chartComponent = (
        React.createElement(ScatterPlot, null
        )
      )
    } else if (this.props.chartType == "map") {
      chartComponent = (
        React.createElement(Map, null
        )
      )
    } else {
      chartComponent = React.createElement("span", null, "Please Select a Chart")
    }

    return (
      React.createElement("div", {className: "chartBox"}, 
        React.createElement("h5", null, "Chart Box"), 
        React.createElement("div", {className: "panel panel-default"}, 
          React.createElement("div", {className: "panel-body"}, 
            chartComponent
          )
        )
      )
    )
  }
});

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


    if (this.state.spinner == null) {

      var opts = { lines: 9, length: 9, width: 5, radius: 10, corners: 1,
        color: '#001', opacity: 0.2, className: 'spinner', top: '95px',
        position: 'relative',
      }
      var spinner = new Spinner(opts).spin(ReactDOM.findDOMNode(this).parentElement);
      this.setState({spinner: spinner});
    } else {
      this.state.spinner.spin()
    }

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

        var svg = d3.select(this);
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
      spinner: null,
      meterRuns: [],
      renderCounter: 0, // catching an extra rerender that (TODO) needs to be found
    }
  },
  incrementRenderCounter: function() {
    this.setState({renderCounter: this.state.renderCounter + 1});
  },
  renderChart: function() {
    this.incrementRenderCounter();
    d3.select(ReactDOM.findDOMNode(this))
      .call(this.histogramChart(this.getChartValues()));
    this.state.spinner.stop();
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
    return (
      React.createElement("svg", {className: "histogram", height: "200"})
    )
  }
});


var ScatterPlot = React.createClass({displayName: "ScatterPlot",
  shouldComponentUpdate: function(props) {
    return false;
  },
  getInitialState: function() {
    return {
    }
  },
  render: function() {
    return (
      React.createElement("div", null, 
      React.createElement("svg", {className: "scatterBlot", height: "200"})
      )
    )
  }
});

var TimeSeries = React.createClass({displayName: "TimeSeries",
  render: function() {
    return (
      React.createElement("div", {className: "timeSeries"}, 
        "Time Series"
      )
    )
  }
});

var Map = React.createClass({displayName: "Map",
  render: function() {
    return (
      React.createElement("div", {className: "timeSeries"}, 
        "Map"
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

},{}]},{},["/Users/philngo/dev/oeem-client/dashboard/static/dashboard/js/src/main.jsx"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvcGhpbG5nby9kZXYvb2VlbS1jbGllbnQvZGFzaGJvYXJkL3N0YXRpYy9kYXNoYm9hcmQvanMvc3JjL21haW4uanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEseUNBQXlDLDRCQUFBO0VBQ3ZDLE1BQU0sRUFBRSxXQUFXO0lBQ2pCO01BQ0Usb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyw4QkFBK0IsQ0FBQSxFQUFBO1FBQzVDLG9CQUFBLEtBQUksRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsS0FBTSxDQUFBLEVBQUE7VUFDbkIsb0JBQUEsS0FBSSxFQUFBLENBQUEsQ0FBQyxTQUFBLEVBQVMsQ0FBQyxXQUFZLENBQUEsRUFBQTtZQUN6QixvQkFBQyxjQUFjLEVBQUEsZ0JBQUEsR0FBQTtjQUNaLEdBQUcsSUFBSSxDQUFDLEtBQU0sQ0FBQTtZQUNmLENBQUE7VUFDRSxDQUFBO1FBQ0YsQ0FBQTtNQUNGLENBQUE7S0FDUDtHQUNGO0FBQ0gsQ0FBQyxDQUFDLENBQUM7O0FBRUgsSUFBSSxvQ0FBb0MsOEJBQUE7RUFDdEMsWUFBWSxFQUFFLFdBQVc7QUFDM0IsSUFBSSxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDOztJQUVqRCxJQUFJLFdBQVcsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsd0JBQXdCLElBQUksSUFBSTtRQUMxRCxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQztJQUMzQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7TUFDakUsT0FBTyxXQUFXLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUNuQyxLQUFLLENBQUMs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Q0FBQzs7QUFFSCxJQUFJLHNDQUFzQyxnQ0FBQTtFQUN4QyxZQUFZLEVBQUUsV0FBVztJQUN2QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDakM7RUFDRCxNQUFNLEVBQUUsV0FBVztJQUNqQjtNQUNFLG9CQUFBLElBQUcsRUFBQSxDQUFBLENBQUMsU0FBQSxFQUFTLENBQUMsMEJBQTJCLENBQUEsRUFBQTtRQUN2QyxvQkFBQSxHQUFFLEVBQUEsQ0FBQSxDQUFDLE9BQUEsRUFBTyxDQUFFLElBQUksQ0FBQyxZQUFjLENBQUEsRUFBQTtVQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFXO1FBQzdCLENBQUE7TUFDRCxDQUFBO0tBQ047R0FDRjtDQUNGLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ3aW5kb3cuRGFzaGJvYXJkQm94ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhc2hib2FyZEJveCBjb250YWluZXItZmx1aWRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3dcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC14cy0xMlwiPlxuICAgICAgICAgICAgPFByb2plY3REYXRhQm94XG4gICAgICAgICAgICAgIHsuLi50aGlzLnByb3BzfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn0pO1xuXG52YXIgUHJvamVjdERhdGFCb3ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGxvYWRQcm9qZWN0czogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHByb2plY3RMaXN0VVJMID0gdGhpcy5wcm9wcy5wcm9qZWN0X2xpc3RfdXJsO1xuXG4gICAgdmFyIGZpbHRlclBhcmFtID0gKHRoaXMuc3RhdGUucHJvamVjdEJsb2NrSWRGaWx0ZXJNb2RlID09IFwiT1JcIikgP1xuICAgICAgICBcInByb2plY3RibG9ja19vclwiIDogXCJwcm9qZWN0YmxvY2tfYW5kXCI7XG4gICAgdmFyIHBhcmFtcyA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRQcm9qZWN0QmxvY2tJZHMubWFwKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgIHJldHVybiBmaWx0ZXJQYXJhbSArIFwiPVwiICsgZDtcbiAgICB9KTtcblxuICAgIGlmIChwYXJhbXMubGVuZ3RoID4gMCkge1xuICAgICAgcHJvamVjdExpc3RVUkwgKz0gXCI/XCIgKyBwYXJhbXMuam9pbihcIiZcIik7XG4gICAgfVxuXG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogcHJvamVjdExpc3RVUkwsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtwcm9qZWN0czogZGF0YX0pO1xuICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihwcm9qZWN0TGlzdFVSTCwgc3RhdHVzLCBlcnIudG9TdHJpbmcoKSk7XG4gICAgICB9LmJpbmQodGhpcylcbiAgICB9KTtcbiAgfSxcbiAgc2VsZWN0UHJvamVjdEJsb2Nrc0NhbGxiYWNrOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZFByb2plY3RCbG9ja0lkczogZGF0YS5pZHMsXG4gICAgICBwcm9qZWN0QmxvY2tJZEZpbHRlck1vZGU6IGRhdGEuZmlsdGVyTW9kZSxcbiAgICB9LCB0aGlzLmxvYWRQcm9qZWN0cyk7XG4gIH0sXG4gIHNlbGVjdENoYXJ0VHlwZUNhbGxiYWNrOiBmdW5jdGlvbihjaGFydFR5cGVJZCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkQ2hhcnRUeXBlSWQ6IGNoYXJ0VHlwZUlkfSk7XG4gIH0sXG4gIHNlbGVjdEZ1ZWxUeXBlQ2FsbGJhY2s6IGZ1bmN0aW9uKGZ1ZWxUeXBlSWQpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEZ1ZWxUeXBlSWQ6IGZ1ZWxUeXBlSWR9KTtcbiAgfSxcbiAgc2VsZWN0RW5lcmd5VW5pdENhbGxiYWNrOiBmdW5jdGlvbihlbmVyZ3lVbml0SWQpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZEVuZXJneVVuaXRJZDogZW5lcmd5VW5pdElkfSk7XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHByb2plY3RzOiBbXSxcbiAgICAgIHNlbGVjdGVkUHJvamVjdEJsb2NrSWRzOiBbXSxcbiAgICAgIHByb2plY3RCbG9ja0lkRmlsdGVyTW9kZTogXCJPUlwiLFxuICAgICAgc2VsZWN0ZWRDaGFydFR5cGVJZDogXCJoaXN0b2dyYW1cIixcbiAgICAgIHNlbGVjdGVkRnVlbFR5cGVJZDogXCJFXCIsXG4gICAgICBzZWxlY3RlZEVuZXJneVVuaXRJZDogXCJLV0hcIixcbiAgICB9O1xuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5sb2FkUHJvamVjdHMoKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBjaGFydFR5cGVzID0gW1xuICAgICAge1xuICAgICAgICBpZDogXCJ0aW1lU2VyaWVzXCIsXG4gICAgICAgIG5hbWU6IFwiR3Jvc3MgU2F2aW5ncyBUaW1lIFNlcmllc1wiLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaWQ6IFwiaGlzdG9ncmFtXCIsXG4gICAgICAgIG5hbWU6IFwiQW5udWFsIFNhdmluZ3MgSGlzdG9ncmFtXCIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogXCJzY2F0dGVyUGxvdFwiLFxuICAgICAgICBuYW1lOiBcIlJlYWxpemF0aW9uIFJhdGUgU2NhdHRlcnBsb3RcIixcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGlkOiBcIm1hcFwiLFxuICAgICAgICBuYW1lOiBcIk1hcFwiLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgdmFyIGZ1ZWxUeXBlcyA9IFtcbiAgICAgIHtcbiAgICAgICAgaWQ6IFwiRVwiLFxuICAgICAgICBuYW1lOiBcIkVsZWN0cmljaXR5XCIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogXCJOR1wiLFxuICAgICAgICBuYW1lOiBcIk5hdHVyYWwgR2FzXCIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogXCJCT1RIXCIsXG4gICAgICAgIG5hbWU6IFwiQ29tYmluZWRcIixcbiAgICAgIH0sXG4gICAgXTtcblxuICAgIHZhciBlbmVyZ3lVbml0cyA9IFtcbiAgICAgIHtcbiAgICAgICAgaWQ6IFwiS1dIXCIsXG4gICAgICAgIG5hbWU6IFwia1doXCIsXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBpZDogXCJUSEVSTVwiLFxuICAgICAgICBuYW1lOiBcInRoZXJtc1wiLFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2VsZWN0ZWRQcm9qZWN0QmxvY2tCb3hcIj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvd1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLW1kLTEyXCI+XG4gICAgICAgICAgICA8Q2F0ZWdvcnlTZWxlY3RvclxuICAgICAgICAgICAgICB0aXRsZT17bnVsbH1cbiAgICAgICAgICAgICAgY2F0ZWdvcmllcz17Y2hhcnRUeXBlc31cbiAgICAgICAgICAgICAgc2VsZWN0Q2F0ZWdvcnlDYWxsYmFjaz17dGhpcy5zZWxlY3RDaGFydFR5cGVDYWxsYmFja31cbiAgICAgICAgICAgICAgc2VsZWN0ZWRDYXRlZ29yeUlkPXt0aGlzLnN0YXRlLnNlbGVjdGVkQ2hhcnRUeXBlSWR9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cblxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtbWQtOFwiPlxuICAgICAgICAgICAgPENoYXJ0Qm94XG4gICAgICAgICAgICAgIGNoYXJ0VHlwZT17dGhpcy5zdGF0ZS5zZWxlY3RlZENoYXJ0VHlwZUlkfVxuICAgICAgICAgICAgICBmdWVsVHlwZT17dGhpcy5zdGF0ZS5zZWxlY3RlZEZ1ZWxUeXBlSWR9XG4gICAgICAgICAgICAgIGVuZXJneVVuaXQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWRFbmVyZ3lVbml0SWR9XG4gICAgICAgICAgICAgIHByb2plY3RzPXt0aGlzLnN0YXRlLnByb2plY3RzfVxuICAgICAgICAgICAgICBtZXRlcl9ydW5fbGlzdF91cmw9e3RoaXMucHJvcHMubWV0ZXJfcnVuX2xpc3RfdXJsfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLW1kLTRcIj5cbiAgICAgICAgICAgIDxQcm9qZWN0U2VsZWN0aW9uU3VtbWFyeUJveFxuICAgICAgICAgICAgICBwcm9qZWN0cz17dGhpcy5zdGF0ZS5wcm9qZWN0c31cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtbWQtNFwiPlxuICAgICAgICAgICAgPENhdGVnb3J5U2VsZWN0b3JcbiAgICAgICAgICAgICAgdGl0bGU9e251bGx9XG4gICAgICAgICAgICAgIGNhdGVnb3JpZXM9e2Z1ZWxUeXBlc31cbiAgICAgICAgICAgICAgc2VsZWN0Q2F0ZWdvcnlDYWxsYmFjaz17dGhpcy5zZWxlY3RGdWVsVHlwZUNhbGxiYWNrfVxuICAgICAgICAgICAgICBzZWxlY3RlZENhdGVnb3J5SWQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWRGdWVsVHlwZUlkfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLW1kLTRcIj5cbiAgICAgICAgICAgIDxDYXRlZ29yeVNlbGVjdG9yXG4gICAgICAgICAgICAgIHRpdGxlPXtudWxsfVxuICAgICAgICAgICAgICBjYXRlZ29yaWVzPXtlbmVyZ3lVbml0c31cbiAgICAgICAgICAgICAgc2VsZWN0Q2F0ZWdvcnlDYWxsYmFjaz17dGhpcy5zZWxlY3RFbmVyZ3lVbml0Q2FsbGJhY2t9XG4gICAgICAgICAgICAgIHNlbGVjdGVkQ2F0ZWdvcnlJZD17dGhpcy5zdGF0ZS5zZWxlY3RlZEVuZXJneVVuaXRJZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxQcm9qZWN0RmlsdGVyQm94XG4gICAgICAgICAgc2VsZWN0UHJvamVjdEJsb2Nrc0NhbGxiYWNrPXt0aGlzLnNlbGVjdFByb2plY3RCbG9ja3NDYWxsYmFja31cblxuICAgICAgICAgIHByb2plY3RCbG9ja0lkRmlsdGVyTW9kZT17dGhpcy5zdGF0ZS5wcm9qZWN0QmxvY2tJZEZpbHRlck1vZGV9XG4gICAgICAgICAgey4uLnRoaXMucHJvcHN9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPFByb2plY3RUYWJsZVxuICAgICAgICAgIHByb2plY3RzPXt0aGlzLnN0YXRlLnByb2plY3RzfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59KTtcblxudmFyIFByb2plY3RGaWx0ZXJCb3ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZmlsdGVycyA9IFtcbiAgICAgICg8bGkgY2xhc3NOYW1lPVwibGlzdC1ncm91cC1pdGVtXCIga2V5PXtcInByb2plY3RCbG9ja0ZpbHRlclwifT5cbiAgICAgICAgPFByb2plY3RCbG9ja0ZpbHRlclxuICAgICAgICAgIHsuLi50aGlzLnByb3BzfVxuICAgICAgICAvPlxuICAgICAgPC9saT4pLFxuICAgICAgLy8gKDxsaSBjbGFzc05hbWU9XCJsaXN0LWdyb3VwLWl0ZW1cIiBrZXk9e1wiZGF0ZVJhbmdlc0ZpbHRlclwifT4gPERhdGVSYW5nZXNGaWx0ZXIvPiA8L2xpPiksXG4gICAgICAvLyAoPGxpIGNsYXNzTmFtZT1cImxpc3QtZ3JvdXAtaXRlbVwiIGtleT17XCJ6aXBDb2RlRmlsdGVyXCJ9PiA8WmlwQ29kZUZpbHRlci8+IDwvbGk+KSxcbiAgICAgIC8vICg8bGkgY2xhc3NOYW1lPVwibGlzdC1ncm91cC1pdGVtXCIga2V5PXtcInByb2plY3RDb3N0RmlsdGVyXCJ9PiA8UHJvamVjdENvc3RGaWx0ZXIvPiA8L2xpPiksXG4gICAgICAvLyAoPGxpIGNsYXNzTmFtZT1cImxpc3QtZ3JvdXAtaXRlbVwiIGtleT17XCJjbGltYXRlWm9uZUZpbHRlclwifT4gPENsaW1hdGVab25lRmlsdGVyLz4gPC9saT4pLFxuICAgICAgLy8gKDxsaSBjbGFzc05hbWU9XCJsaXN0LWdyb3VwLWl0ZW1cIiBrZXk9e1wiZWNtRmlsdGVyXCJ9PiA8RW5lcmd5Q29uc2VydmF0aW9uTWVhc3VyZUZpbHRlci8+IDwvbGk+KSxcbiAgICBdO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHJvamVjdEZpbHRlckJveFwiPlxuICAgICAgICA8aDU+UHJvamVjdCBGaWx0ZXJzPC9oNT5cbiAgICAgICAgPHVsIGNsYXNzTmFtZT1cImxpc3QtZ3JvdXBcIj5cbiAgICAgICAgICB7ZmlsdGVyc31cbiAgICAgICAgPC91bD5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBQcm9qZWN0QmxvY2tGaWx0ZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGxvYWRQcm9qZWN0QmxvY2tzOiBmdW5jdGlvbigpIHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiB0aGlzLnByb3BzLnByb2plY3RfYmxvY2tfbGlzdF91cmwgKyBcIj9uYW1lX29ubHk9dHJ1ZVwiLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cHJvamVjdEJsb2NrTGlzdDogZGF0YX0pO1xuICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcih0aGlzLnByb3BzLnByb2plY3RfYmxvY2tfbGlzdF91cmwgKyBcIj9uYW1lX29ubHk9dHJ1ZVwiLCBzdGF0dXMsIGVyci50b1N0cmluZygpKTtcbiAgICAgIH0uYmluZCh0aGlzKVxuICAgIH0pO1xuICB9LFxuICBoYW5kbGVTZWxlY3RQcm9qZWN0QmxvY2s6IGZ1bmN0aW9uKHByb2plY3RCbG9ja0lkKSB7XG4gICAgdmFyIGlkcyA9IHRoaXMuc3RhdGUuc2VsZWN0ZWRQcm9qZWN0QmxvY2tJZHM7XG4gICAgaWRzLnB1c2gocHJvamVjdEJsb2NrSWQpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkUHJvamVjdEJsb2NrSWRzOiBpZHN9LCB0aGlzLmNhbGxDYWxsYmFjayk7XG4gIH0sXG4gIGhhbmRsZURlc2VsZWN0UHJvamVjdEJsb2NrOiBmdW5jdGlvbihwcm9qZWN0QmxvY2tJZCkge1xuICAgIHZhciBpZHMgPSB0aGlzLnN0YXRlLnNlbGVjdGVkUHJvamVjdEJsb2NrSWRzO1xuICAgIHZhciBpbmRleCA9IGlkcy5pbmRleE9mKHByb2plY3RCbG9ja0lkKTtcbiAgICBpZiAoaW5kZXggIT0gLTEpIHtcbiAgICAgIGlkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZFByb2plY3RCbG9ja0lkczogaWRzfSwgdGhpcy5jYWxsQ2FsbGJhY2spO1xuICB9LFxuICB0b2dnbGVGaWx0ZXJNb2RlQ2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmaWx0ZXJNb2RlID0gKHRoaXMuc3RhdGUuZmlsdGVyTW9kZSA9PSBcIk9SXCIpID8gXCJBTkRcIiA6IFwiT1JcIjtcbiAgICB0aGlzLnNldFN0YXRlKHtmaWx0ZXJNb2RlOiBmaWx0ZXJNb2RlfSwgdGhpcy5jYWxsQ2FsbGJhY2spO1xuICB9LFxuICBjYWxsQ2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucHJvcHMuc2VsZWN0UHJvamVjdEJsb2Nrc0NhbGxiYWNrKHtcbiAgICAgIGlkczogdGhpcy5zdGF0ZS5zZWxlY3RlZFByb2plY3RCbG9ja0lkcyxcbiAgICAgIGZpbHRlck1vZGU6IHRoaXMuc3RhdGUuZmlsdGVyTW9kZSxcbiAgICB9KTtcbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvamVjdEJsb2NrTGlzdDogW10sXG4gICAgICBzZWxlY3RlZFByb2plY3RCbG9ja0lkczogW10sXG4gICAgICBmaWx0ZXJNb2RlOiB0aGlzLnByb3BzLnByb2plY3RCbG9ja0lkRmlsdGVyTW9kZSxcbiAgICB9O1xuICB9LFxuICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5sb2FkUHJvamVjdEJsb2NrcygpO1xuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwcm9qZWN0QmxvY2tMaXN0SXRlbXMgPSB0aGlzLnN0YXRlLnByb2plY3RCbG9ja0xpc3QubWFwKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgIHZhciBzZWxlY3RlZCA9ICh0aGlzLnN0YXRlLnNlbGVjdGVkUHJvamVjdEJsb2NrSWRzLmluZGV4T2YoZC5pZCkgIT0gLTEpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFByb2plY3RCbG9ja0xpc3RJdGVtXG4gICAgICAgICAga2V5PXtkLmlkfVxuICAgICAgICAgIHNlbGVjdGVkPXtzZWxlY3RlZH1cbiAgICAgICAgICBoYW5kbGVTZWxlY3RQcm9qZWN0QmxvY2s9e3RoaXMuaGFuZGxlU2VsZWN0UHJvamVjdEJsb2NrfVxuICAgICAgICAgIGhhbmRsZURlc2VsZWN0UHJvamVjdEJsb2NrPXt0aGlzLmhhbmRsZURlc2VsZWN0UHJvamVjdEJsb2NrfVxuICAgICAgICAgIHByb2plY3RCbG9jaz17ZH1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfSwgdGhpcyk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwcm9qZWN0QmxvY2tGaWx0ZXJcIj5cbiAgICAgICAgPHNwYW4+RmlsdGVyIGJ5IHByb2plY3QgYmxvY2tzPC9zcGFuPlxuICAgICAgICA8RmlsdGVyTW9kZVxuICAgICAgICAgIHRvZ2dsZUZpbHRlck1vZGVDYWxsYmFjaz17dGhpcy50b2dnbGVGaWx0ZXJNb2RlQ2FsbGJhY2t9XG4gICAgICAgICAgZmlsdGVyTW9kZT17dGhpcy5zdGF0ZS5maWx0ZXJNb2RlfVxuICAgICAgICAvPlxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAge3Byb2plY3RCbG9ja0xpc3RJdGVtc31cbiAgICAgICAgPC91bD5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBGaWx0ZXJNb2RlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZpbHRlck1vZGVcIj5cbiAgICAgICAgPHNwYW4+XG4gICAgICAgICAgRmlsdGVyIE1vZGU6IHt0aGlzLnByb3BzLmZpbHRlck1vZGV9ICZuYnNwO1xuICAgICAgICAgIDxhIG9uQ2xpY2s9e3RoaXMucHJvcHMudG9nZ2xlRmlsdGVyTW9kZUNhbGxiYWNrfT50b2dnbGU8L2E+XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBQcm9qZWN0QmxvY2tMaXN0SXRlbSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgaGFuZGxlU2VsZWN0OiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCkge1xuICAgICAgdGhpcy5wcm9wcy5oYW5kbGVEZXNlbGVjdFByb2plY3RCbG9jayh0aGlzLnByb3BzLnByb2plY3RCbG9jay5pZCk7XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnByb3BzLmhhbmRsZVNlbGVjdFByb2plY3RCbG9jayh0aGlzLnByb3BzLnByb2plY3RCbG9jay5pZCk7XG4gICAgfVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHNlbGVjdGVkVGV4dDtcbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RlZCkge1xuICAgICAgc2VsZWN0ZWRUZXh0ID0gXCJTZWxlY3RlZCAtIGNsaWNrIHRvIGRlc2VsZWN0XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdGVkVGV4dCA9IFwiVW5zZWxlY3RlZCAtIGNsaWNrIHRvIHNlbGVjdFwiO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8bGkgY2xhc3NOYW1lPVwicHJvamVjdEJsb2NrTGlzdEl0ZW0gbGlzdC1ncm91cC1pdGVtIGNsZWFyZml4XCI+XG4gICAgICAgIDxzcGFuPnt0aGlzLnByb3BzLnByb2plY3RCbG9jay5uYW1lfSZuYnNwOzwvc3Bhbj5cbiAgICAgICAgPGEgb25DbGljaz17dGhpcy5oYW5kbGVTZWxlY3R9PntzZWxlY3RlZFRleHR9PC9hPlxuICAgICAgPC9saT5cbiAgICApXG4gIH1cbn0pO1xuXG5cbnZhciBGdWVsVHlwZUZpbHRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnVlbFR5cGVMaXN0SXRlbXMgPSB0aGlzLnByb3BzLmZ1ZWxUeXBlcy5tYXAoZnVuY3Rpb24oZCxpKSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8RnVlbFR5cGVMaXN0SXRlbVxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICBmdWVsVHlwZT17ZH1cbiAgICAgICAgICBoYW5kbGVTZWxlY3RGdWVsVHlwZT17dGhpcy5wcm9wcy5oYW5kbGVTZWxlY3RGdWVsVHlwZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZnVlbFR5cGVGaWx0ZXJcIj5cbiAgICAgICAgPHNwYW4+RmlsdGVyIGJ5IGVuZXJneSBUeXBlPC9zcGFuPlxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAge2Z1ZWxUeXBlTGlzdEl0ZW1zfVxuICAgICAgICA8L3VsPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59KTtcblxudmFyIEZ1ZWxUeXBlTGlzdEl0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGhhbmRsZVNlbGVjdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wcm9wcy5oYW5kbGVTZWxlY3RGdWVsVHlwZSh0aGlzLnByb3BzLmZ1ZWxUeXBlKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGxpIGNsYXNzTmFtZT1cImZ1ZWxUeXBlTGlzdEl0ZW0gbGlzdC1ncm91cC1pdGVtIGNsZWFyZml4XCI+XG4gICAgICAgIDxhIG9uQ2xpY2s9e3RoaXMuaGFuZGxlU2VsZWN0fT5cbiAgICAgICAgICB7dGhpcy5wcm9wcy5mdWVsVHlwZS5uYW1lfVxuICAgICAgICA8L2E+XG4gICAgICA8L2xpPlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBDbGltYXRlWm9uZUZpbHRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJjbGltYXRlWm9uZUZpbHRlclwiPlxuICAgICAgICBGaWx0ZXIgYnkgY2xpbWF0ZSB6b25lXG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn0pO1xuXG5cbnZhciBEYXRlUmFuZ2VzRmlsdGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImRhdGVSYW5nZXNGaWx0ZXJcIj5cbiAgICAgICAgRmlsdGVyIGJ5IGRhdGUgcmFuZ2VzXG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn0pO1xuXG52YXIgWmlwQ29kZUZpbHRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ6aXBDb2RlRmlsdGVyXCI+XG4gICAgICAgIEZpbHRlciBieSBaSVAgY29kZVxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59KTtcblxudmFyIFByb2plY3RDb3N0RmlsdGVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInByb2plY3RDb3N0RmlsdGVyXCI+XG4gICAgICAgIEZpbHRlciBieSBwcm9qZWN0IGNvc3RcbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG52YXIgRW5lcmd5Q29uc2VydmF0aW9uTWVhc3VyZUZpbHRlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJlbmVyZ3lDb25zZXJ2YXRpb25NZWFzdXJlRmlsdGVyXCI+XG4gICAgICAgIEZpbHRlciBieSBFQ01cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBQcm9qZWN0U2VsZWN0aW9uU3VtbWFyeUJveCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwcm9qZWN0U3VtbWFyeUJveFwiPlxuICAgICAgICA8aDU+U3RhdHM8L2g1PlxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAgIDxsaSBjbGFzc05hbWU9XCJsaXN0LWdyb3VwLWl0ZW1cIj5OdW1iZXIgb2YgcHJvamVjdHM6IHt0aGlzLnByb3BzLnByb2plY3RzLmxlbmd0aH08L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59KTtcblxudmFyIENhdGVnb3J5U2VsZWN0b3IgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNhdGVnb3J5TGlzdEl0ZW1zID0gdGhpcy5wcm9wcy5jYXRlZ29yaWVzLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICB2YXIgc2VsZWN0ZWQgPSAodGhpcy5wcm9wcy5zZWxlY3RlZENhdGVnb3J5SWQgPT0gZC5pZCk7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Q2F0ZWdvcnlMaXN0SXRlbVxuICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICBjYXRlZ29yeT17ZH1cbiAgICAgICAgICBzZWxlY3RlZD17c2VsZWN0ZWR9XG4gICAgICAgICAgc2VsZWN0Q2F0ZWdvcnlDYWxsYmFjaz17dGhpcy5wcm9wcy5zZWxlY3RDYXRlZ29yeUNhbGxiYWNrfVxuICAgICAgICAvPlxuICAgICAgKVxuICAgIH0sIHRoaXMpO1xuXG4gICAgdmFyIHRpdGxlO1xuICAgIGlmICh0aGlzLnByb3BzLnRpdGxlICE9IG51bGwpIHtcbiAgICAgIHRpdGxlID0gPGg1Pnt0aGlzLnByb3BzLnRpdGxlfTwvaDU+XG4gICAgfSBlbHNlIHtcbiAgICAgIHRpdGxlID0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJjYXRlZ29yeVNlbGVjdG9yXCI+XG4gICAgICAgIHt0aXRsZX1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXBcIiBkYXRhLXRvZ2dsZT1cImJ1dHRvbnNcIj5cbiAgICAgICAgICB7Y2F0ZWdvcnlMaXN0SXRlbXN9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG59KTtcblxudmFyIENhdGVnb3J5TGlzdEl0ZW0gPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIGhhbmRsZVNlbGVjdDogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMucHJvcHMuc2VsZWN0Q2F0ZWdvcnlDYWxsYmFjayh0aGlzLnByb3BzLmNhdGVnb3J5LmlkKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYm9vdHN0cmFwX2NsYXNzO1xuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdGVkKSB7XG4gICAgICBib290c3RyYXBfY2xhc3MgPSBcImNhdGVnb3J5TGlzdEl0ZW0gYnRuIGJ0bi1wcmltYXJ5IGFjdGl2ZVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBib290c3RyYXBfY2xhc3MgPSBcImNhdGVnb3J5TGlzdEl0ZW0gYnRuIGJ0bi1wcmltYXJ5XCI7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8bGFiZWwgY2xhc3NOYW1lPXtib290c3RyYXBfY2xhc3N9IG9uQ2xpY2s9e3RoaXMuaGFuZGxlU2VsZWN0fT5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgdHlwZT1cInJhZGlvXCJcbiAgICAgICAgICBjaGVja2VkPXt0aGlzLnByb3BzLnNlbGVjdGVkfVxuICAgICAgICAgIHJlYWRPbmx5PXt0cnVlfVxuICAgICAgICAvPlxuICAgICAgICB7dGhpcy5wcm9wcy5jYXRlZ29yeS5uYW1lfVxuICAgICAgPC9sYWJlbD5cbiAgICApXG4gIH1cbn0pO1xuXG52YXIgQ2hhcnRCb3ggPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNoYXJ0Q29tcG9uZW50O1xuICAgIGlmICh0aGlzLnByb3BzLmNoYXJ0VHlwZSA9PSBcImhpc3RvZ3JhbVwiKSB7XG5cbiAgICAgIGNoYXJ0Q29tcG9uZW50ID0gKFxuICAgICAgICA8SGlzdG9ncmFtXG4gICAgICAgICAgcHJvamVjdHM9e3RoaXMucHJvcHMucHJvamVjdHN9XG4gICAgICAgICAgZnVlbFR5cGU9e3RoaXMucHJvcHMuZnVlbFR5cGV9XG4gICAgICAgICAgZW5lcmd5VW5pdD17dGhpcy5wcm9wcy5lbmVyZ3lVbml0fVxuICAgICAgICAgIG1ldGVyX3J1bl9saXN0X3VybD17dGhpcy5wcm9wcy5tZXRlcl9ydW5fbGlzdF91cmx9XG4gICAgICAgIC8+XG4gICAgICApXG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmNoYXJ0VHlwZSA9PSBcInRpbWVTZXJpZXNcIikge1xuICAgICAgY2hhcnRDb21wb25lbnQgPSAoXG4gICAgICAgIDxUaW1lU2VyaWVzXG4gICAgICAgIC8+XG4gICAgICApXG4gICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLmNoYXJ0VHlwZSA9PSBcInNjYXR0ZXJQbG90XCIpIHtcbiAgICAgIGNoYXJ0Q29tcG9uZW50ID0gKFxuICAgICAgICA8U2NhdHRlclBsb3RcbiAgICAgICAgLz5cbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuY2hhcnRUeXBlID09IFwibWFwXCIpIHtcbiAgICAgIGNoYXJ0Q29tcG9uZW50ID0gKFxuICAgICAgICA8TWFwXG4gICAgICAgIC8+XG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIGNoYXJ0Q29tcG9uZW50ID0gPHNwYW4+UGxlYXNlIFNlbGVjdCBhIENoYXJ0PC9zcGFuPlxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImNoYXJ0Qm94XCI+XG4gICAgICAgIDxoNT5DaGFydCBCb3g8L2g1PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsIHBhbmVsLWRlZmF1bHRcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsLWJvZHlcIj5cbiAgICAgICAgICAgIHtjaGFydENvbXBvbmVudH1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn0pO1xuXG52YXIgSGlzdG9ncmFtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBsb2FkTWV0ZXJSdW5zOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICB2YXIgbWV0ZXJSdW5MaXN0VVJMID0gbmV4dFByb3BzLm1ldGVyX3J1bl9saXN0X3VybCArIFwiP3N1bW1hcnk9VHJ1ZVwiO1xuXG4gICAgaWYgKHRoaXMucHJvcHMuZnVlbFR5cGUgPT0gXCJFXCIgfHwgdGhpcy5wcm9wcy5mdWVsVHlwZSA9PSBcIkJPVEhcIikge1xuICAgICAgbWV0ZXJSdW5MaXN0VVJMICs9IFwiJmZ1ZWxfdHlwZT1FXCJcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5mdWVsVHlwZSA9PSBcIk5HXCIgfHwgdGhpcy5wcm9wcy5mdWVsVHlwZSA9PSBcIkJPVEhcIikge1xuICAgICAgbWV0ZXJSdW5MaXN0VVJMICs9IFwiJmZ1ZWxfdHlwZT1OR1wiXG4gICAgfVxuXG4gICAgaWYgKG5leHRQcm9wcy5wcm9qZWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICBtZXRlclJ1bkxpc3RVUkwgKz0gXCImcHJvamVjdHM9XCIgKyBuZXh0UHJvcHMucHJvamVjdHMubWFwKGZ1bmN0aW9uKGQsIGkpe1xuICAgICAgICByZXR1cm4gZC5pZDtcbiAgICAgIH0pLmpvaW4oXCIrXCIpO1xuICAgIH1cblxuICAgIHZhciB0YXJnZXRTdGF0ZUNvdW50ZXIgPSB0aGlzLnN0YXRlLnJlbmRlckNvdW50ZXI7XG5cblxuICAgIGlmICh0aGlzLnN0YXRlLnNwaW5uZXIgPT0gbnVsbCkge1xuXG4gICAgICB2YXIgb3B0cyA9IHsgbGluZXM6IDksIGxlbmd0aDogOSwgd2lkdGg6IDUsIHJhZGl1czogMTAsIGNvcm5lcnM6IDEsXG4gICAgICAgIGNvbG9yOiAnIzAwMScsIG9wYWNpdHk6IDAuMiwgY2xhc3NOYW1lOiAnc3Bpbm5lcicsIHRvcDogJzk1cHgnLFxuICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgIH1cbiAgICAgIHZhciBzcGlubmVyID0gbmV3IFNwaW5uZXIob3B0cykuc3BpbihSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKS5wYXJlbnRFbGVtZW50KTtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NwaW5uZXI6IHNwaW5uZXJ9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGF0ZS5zcGlubmVyLnNwaW4oKVxuICAgIH1cblxuICAgICQuYWpheCh7XG4gICAgICB1cmw6IG1ldGVyUnVuTGlzdFVSTCxcbiAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIC8vIGRvbid0IHJlbmRlciBpZiBvbGQgKHNsb3cpIGFqYXggY2FsbC4gVE9ETyBmaW5kIHNvdXJjZSBvZiBlcnJvci5cbiAgICAgICAgaWYgKHRhcmdldFN0YXRlQ291bnRlciA9PSB0aGlzLnN0YXRlLnJlbmRlckNvdW50ZXIpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHttZXRlclJ1bnM6IGRhdGF9LCB0aGlzLnJlbmRlckNoYXJ0KTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKHhociwgc3RhdHVzLCBlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtZXRlclJ1bkxpc3RVUkwsIHN0YXR1cywgZXJyLnRvU3RyaW5nKCkpO1xuICAgICAgfS5iaW5kKHRoaXMpXG4gICAgfSk7XG4gIH0sXG4gIGhpc3RvZ3JhbUNoYXJ0OiBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICB2YXIgdyA9IHRoaXMuc3RhdGUud2lkdGg7XG4gICAgdmFyIGggPSAyMDA7XG4gICAgdmFyIGJpbnMgPSAxNTtcbiAgICB2YXIgbWFyZ2luID0geyB0b3A6IDMwLCByaWdodDogMTAsIGJvdHRvbTogNDAsIGxlZnQ6IDQwfSxcbiAgICAgIHdpZHRoID0gdyAtIG1hcmdpbi5yaWdodCAtIG1hcmdpbi5sZWZ0LFxuICAgICAgaGVpZ2h0ID0gaCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tLFxuICAgICAgYmFyV2lkdGggPSBNYXRoLmZsb29yKHdpZHRoIC8gYmlucykgLSAyO1xuXG4gICAgdmFyIGVuZXJneVVuaXQ7XG4gICAgaWYgKHRoaXMucHJvcHMuZW5lcmd5VW5pdCA9PSBcIktXSFwiKSB7XG4gICAgICBlbmVyZ3lVbml0ID0gXCJrV2hcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgZW5lcmd5VW5pdCA9IFwidGhlcm1zXCI7XG4gICAgfVxuXG4gICAgdmFyIGZ1ZWxUeXBlO1xuICAgIGlmICh0aGlzLnByb3BzLmZ1ZWxUeXBlID09IFwiRVwiKSB7XG4gICAgICBmdWVsVHlwZSA9IFwiRWxlY3RyaWNpdHlcIjtcbiAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZnVlbFR5cGUgPT0gXCJOR1wiKSB7XG4gICAgICBmdWVsVHlwZSA9IFwiTmF0dXJhbCBHYXNcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgZnVlbFR5cGUgPSBcIkNvbWJpbmVkXCI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hhcnQoc2VsZWN0aW9uKSB7XG4gICAgICBzZWxlY3Rpb24uZWFjaChmdW5jdGlvbigpIHtcblxuICAgICAgICAvLyBBIGZvcm1hdHRlciBmb3IgY291bnRzLlxuICAgICAgICB2YXIgZm9ybWF0Q291bnQgPSBkMy5mb3JtYXQoXCIsLjBmXCIpO1xuICAgICAgICB2YXIgZm9ybWF0QXhpcyA9IGQzLmZvcm1hdChcIi4yc1wiKTtcblxuICAgICAgICB2YXIgeCA9IGQzLnNjYWxlLmxpbmVhcigpXG4gICAgICAgICAgICAuZG9tYWluKGQzLmV4dGVudCh2YWx1ZXMsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQ7IH0pKVxuICAgICAgICAgICAgLnJhbmdlKFswLCB3aWR0aF0pO1xuXG4gICAgICAgIC8vIEdlbmVyYXRlIGEgaGlzdG9ncmFtIHVzaW5nIHR3ZW50eSB1bmlmb3JtbHktc3BhY2VkIGJpbnMuXG4gICAgICAgIHZhciBkYXRhID0gZDMubGF5b3V0Lmhpc3RvZ3JhbSgpXG4gICAgICAgICAgICAuYmlucyhiaW5zKVxuICAgICAgICAgICAgKHZhbHVlcyk7XG5cbiAgICAgICAgdmFyIHkgPSBkMy5zY2FsZS5saW5lYXIoKVxuICAgICAgICAgICAgLmRvbWFpbihbMCwgZDMubWF4KGRhdGEsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQueTsgfSldKVxuICAgICAgICAgICAgLnJhbmdlKFtoZWlnaHQsIDBdKTtcblxuICAgICAgICBjb25zb2xlLmxvZyh4LmRvbWFpbigpKTtcbiAgICAgICAgdmFyIHRlbXBTY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpLmRvbWFpbihbMCwgYmluc10pLnJhbmdlKHguZG9tYWluKCkpO1xuICAgICAgICB2YXIgdGlja0FycmF5ID0gZDMucmFuZ2UoYmlucyArIDEpLm1hcCh0ZW1wU2NhbGUpO1xuICAgICAgICB2YXIgeEF4aXMgPSBkMy5zdmcuYXhpcygpXG4gICAgICAgICAgICAuc2NhbGUoeClcbiAgICAgICAgICAgIC50aWNrVmFsdWVzKHRpY2tBcnJheSlcbiAgICAgICAgICAgIC50aWNrRm9ybWF0KGZvcm1hdEF4aXMpXG4gICAgICAgICAgICAub3JpZW50KFwiYm90dG9tXCIpO1xuXG4gICAgICAgIHZhciB0aXAgPSBkMy50aXAoKVxuICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdkMy10aXAnKVxuICAgICAgICAgIC5vZmZzZXQoWy0xMCwgMF0pXG4gICAgICAgICAgLmh0bWwoZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiPHNwYW4+XCIgKyBkLnkgKyBcIiBwcm9qZWN0czwvc3Bhbj5cIjtcbiAgICAgICAgICB9KVxuXG4gICAgICAgIHZhciBzdmcgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAgIHN2Zy5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpO1xuXG4gICAgICAgIHN2ZyA9IHN2Zy5hdHRyKFwid2lkdGhcIiwgdykuYXR0cihcImhlaWdodFwiLCBoKVxuICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbi5sZWZ0ICsgXCIsXCIgKyBtYXJnaW4udG9wICsgXCIpXCIpO1xuXG4gICAgICAgIHN2Zy5jYWxsKHRpcCk7XG5cbiAgICAgICAgdmFyIGJhciA9IHN2Zy5zZWxlY3RBbGwoXCIuYmFyXCIpXG4gICAgICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAgIC5lbnRlcigpLmFwcGVuZChcImdcIilcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJiYXJcIilcbiAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgeChkLngpICsgXCIsXCIgKyB5KGQueSkgKyBcIilcIjsgfSk7XG5cbiAgICAgICAgLy8gYmFyc1xuICAgICAgICBiYXIuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIDEpXG4gICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIGJhcldpZHRoKVxuICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gaGVpZ2h0IC0geShkLnkpOyB9KVxuICAgICAgICAgICAgLm9uKCdtb3VzZW92ZXInLCB0aXAuc2hvdylcbiAgICAgICAgICAgIC5vbignbW91c2VvdXQnLCB0aXAuaGlkZSk7XG5cbiAgICAgICAgLy8geCBheGlzXG4gICAgICAgIHN2Zy5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwieCBheGlzXCIpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZSgwLFwiICsgaGVpZ2h0ICsgXCIpXCIpXG4gICAgICAgICAgICAuY2FsbCh4QXhpcyk7XG5cbiAgICAgICAgLy8gcm90YXRlIHRoZSBheGlzIGxhYmVsc1xuICAgICAgICBzdmcuc2VsZWN0QWxsKFwiLnguYXhpcyB0ZXh0XCIpXG4gICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIC0xICogdGhpcy5nZXRCQm94KCkuaGVpZ2h0ICsgXCIsXCIgKyAwLjUqdGhpcy5nZXRCQm94KCkuaGVpZ2h0ICsgXCIpcm90YXRlKC0zMClcIjtcbiAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHRpdGxlXG4gICAgICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsICh3aWR0aCAvIDIpKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCAwIC0gKG1hcmdpbi50b3AgLyAyKSlcbiAgICAgICAgICAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpXG4gICAgICAgICAgICAgICAgLnN0eWxlKFwiZm9udC1zaXplXCIsIFwiMTZweFwiKVxuICAgICAgICAgICAgICAgIC50ZXh0KFwiSGlzdG9ncmFtIG9mIEFubnVhbCBQcm9qZWN0IFNhdmluZ3MgLSBcIiArIGZ1ZWxUeXBlICsgXCIgKFwiICsgZW5lcmd5VW5pdCArIFwiIC8geWVhcilcIik7XG5cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNoYXJ0Lm1hcmdpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG1hcmdpbjtcbiAgICAgIG1hcmdpbiA9IF87XG4gICAgICByZXR1cm4gY2hhcnQ7XG4gICAgfTtcblxuICAgIGNoYXJ0LndpZHRoID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gd2lkdGg7XG4gICAgICB3aWR0aCA9IF87XG4gICAgICByZXR1cm4gY2hhcnQ7XG4gICAgfTtcblxuICAgIGNoYXJ0LmhlaWdodCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGhlaWdodDtcbiAgICAgIGhlaWdodCA9IF87XG4gICAgICByZXR1cm4gY2hhcnQ7XG4gICAgfTtcblxuICAgIHJldHVybiBjaGFydDtcbiAgfSxcbiAgaGFuZGxlUmVzaXplOiBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB3aWR0aDogdGhpcy5nZXRDdXJyZW50V2lkdGgoKSxcbiAgICB9KTtcbiAgICB0aGlzLnJlbmRlckNoYXJ0KCk7XG4gIH0sXG4gIGdldEN1cnJlbnRXaWR0aDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICQoUmVhY3RET00uZmluZERPTU5vZGUodGhpcykpLnBhcmVudCgpLndpZHRoKCk7XG4gIH0sXG4gIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMubG9hZE1ldGVyUnVucyh0aGlzLnByb3BzKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHdpZHRoOiB0aGlzLmdldEN1cnJlbnRXaWR0aCgpLFxuICAgIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmhhbmRsZVJlc2l6ZSk7XG4gIH0sXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50OiBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5oYW5kbGVSZXNpemUpO1xuICB9LFxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbihuZXh0UHJvcHMpIHtcbiAgICB0aGlzLmxvYWRNZXRlclJ1bnMobmV4dFByb3BzKTtcbiAgfSxcbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlOiBmdW5jdGlvbihwcm9wcykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IDAsXG4gICAgICBzcGlubmVyOiBudWxsLFxuICAgICAgbWV0ZXJSdW5zOiBbXSxcbiAgICAgIHJlbmRlckNvdW50ZXI6IDAsIC8vIGNhdGNoaW5nIGFuIGV4dHJhIHJlcmVuZGVyIHRoYXQgKFRPRE8pIG5lZWRzIHRvIGJlIGZvdW5kXG4gICAgfVxuICB9LFxuICBpbmNyZW1lbnRSZW5kZXJDb3VudGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtyZW5kZXJDb3VudGVyOiB0aGlzLnN0YXRlLnJlbmRlckNvdW50ZXIgKyAxfSk7XG4gIH0sXG4gIHJlbmRlckNoYXJ0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmluY3JlbWVudFJlbmRlckNvdW50ZXIoKTtcbiAgICBkMy5zZWxlY3QoUmVhY3RET00uZmluZERPTU5vZGUodGhpcykpXG4gICAgICAuY2FsbCh0aGlzLmhpc3RvZ3JhbUNoYXJ0KHRoaXMuZ2V0Q2hhcnRWYWx1ZXMoKSkpO1xuICAgIHRoaXMuc3RhdGUuc3Bpbm5lci5zdG9wKCk7XG4gIH0sXG4gIGdldENoYXJ0VmFsdWVzOiBmdW5jdGlvbigpIHtcblxuICAgIHZhciBwcm9qZWN0X21ldGVyX3J1bnMgPSB7fTtcbiAgICB0aGlzLnN0YXRlLm1ldGVyUnVucy5mb3JFYWNoKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgIGlmIChkLnByb2plY3QgaW4gcHJvamVjdF9tZXRlcl9ydW5zKSB7XG4gICAgICAgIHByb2plY3RfbWV0ZXJfcnVuc1tkLnByb2plY3RdLnB1c2goZClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2plY3RfbWV0ZXJfcnVuc1tkLnByb2plY3RdID0gW2RdXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgZm9yICh2YXIgcHJvamVjdF9pZCBpbiBwcm9qZWN0X21ldGVyX3J1bnMpIHtcbiAgICAgIGlmIChwcm9qZWN0X21ldGVyX3J1bnMuaGFzT3duUHJvcGVydHkocHJvamVjdF9pZCkpIHtcblxuICAgICAgICB2YXIgYW5udWFsX3NhdmluZ3MgPSB7RTogMCwgTkc6IDB9O1xuICAgICAgICBwcm9qZWN0X21ldGVyX3J1bnNbcHJvamVjdF9pZF0uZm9yRWFjaChmdW5jdGlvbihtZXRlcl9ydW4pIHtcbiAgICAgICAgICBpZiAobWV0ZXJfcnVuLmFubnVhbF9zYXZpbmdzICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChtZXRlcl9ydW4uZnVlbF90eXBlID09IFwiRVwiKSB7XG4gICAgICAgICAgICAgIGFubnVhbF9zYXZpbmdzLkUgKz0gbWV0ZXJfcnVuLmFubnVhbF9zYXZpbmdzO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXRlcl9ydW4uZnVlbF90eXBlID09IFwiTkdcIikge1xuICAgICAgICAgICAgICBhbm51YWxfc2F2aW5ncy5ORyArPSBtZXRlcl9ydW4uYW5udWFsX3NhdmluZ3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5lbmVyZ3lVbml0ID09IFwiS1dIXCIpIHtcbiAgICAgICAgICB2YWx1ZXMucHVzaChhbm51YWxfc2F2aW5ncy5FICsgKGFubnVhbF9zYXZpbmdzLk5HICogMjkuMzAwMSkpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuZW5lcmd5VW5pdCA9PSBcIlRIRVJNXCIpIHtcbiAgICAgICAgICB2YWx1ZXMucHVzaCgoYW5udWFsX3NhdmluZ3MuRSAqIDAuMDM0KSArIChhbm51YWxfc2F2aW5ncy5ORykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG5cbiAgICByZXR1cm4gdmFsdWVzO1xuXG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzdmcgY2xhc3NOYW1lPVwiaGlzdG9ncmFtXCIgaGVpZ2h0PVwiMjAwXCI+PC9zdmc+XG4gICAgKVxuICB9XG59KTtcblxuXG52YXIgU2NhdHRlclBsb3QgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZTogZnVuY3Rpb24ocHJvcHMpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICB9XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICA8c3ZnIGNsYXNzTmFtZT1cInNjYXR0ZXJCbG90XCIgaGVpZ2h0PVwiMjAwXCI+PC9zdmc+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn0pO1xuXG52YXIgVGltZVNlcmllcyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0aW1lU2VyaWVzXCI+XG4gICAgICAgIFRpbWUgU2VyaWVzXG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn0pO1xuXG52YXIgTWFwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRpbWVTZXJpZXNcIj5cbiAgICAgICAgTWFwXG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbn0pO1xuXG52YXIgUHJvamVjdFRhYmxlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwcm9qZWN0cyA9IHRoaXMucHJvcHMucHJvamVjdHMubWFwKGZ1bmN0aW9uKGQsaSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFByb2plY3RUYWJsZUl0ZW1cbiAgICAgICAgICBrZXk9e2QuaWR9XG4gICAgICAgICAgcHJvamVjdD17ZH1cbiAgICAgICAgLz5cbiAgICAgIClcbiAgICB9KTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwcm9qZWN0VGFibGVcIj5cbiAgICAgICAgUHJvamVjdCBUYWJsZVxuICAgICAgICA8dWwgY2xhc3NOYW1lPVwibGlzdC1ncm91cFwiPlxuICAgICAgICAgIHtwcm9qZWN0c31cbiAgICAgICAgPC91bD5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxufSk7XG5cbnZhciBQcm9qZWN0VGFibGVJdGVtID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBoYW5kbGVTZWxlY3Q6IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKHRoaXMucHJvcHMucHJvamVjdCk7XG4gIH0sXG4gIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxsaSBjbGFzc05hbWU9XCJsaXN0LWdyb3VwLWl0ZW0gY2xlYXJmaXhcIj5cbiAgICAgICAgPGEgb25DbGljaz17dGhpcy5oYW5kbGVTZWxlY3R9PlxuICAgICAgICAgIHt0aGlzLnByb3BzLnByb2plY3QucHJvamVjdF9pZH1cbiAgICAgICAgPC9hPlxuICAgICAgPC9saT5cbiAgICApXG4gIH1cbn0pO1xuIl19
