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

    var params = this.state.selectedProjectBlockIds.map(function(d, i) {
      return ((this.state.projectBlockIdFilterMode == "OR") ?
        "projectblock_or" : "projectblock_and") + "=" + d;
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
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  selectProjectBlocksCallback: function(data) {
    console.log(data);
    this.setState({
      selectedProjectBlockIds: data.ids,
      projectBlockIdFilterMode: data.filterMode,
    }, this.loadProjects);
  },
  selectChartTypeCallback: function(chartTypeId) {
    this.setState({selectedChartTypeId: chartTypeId});
  },
  getInitialState: function() {
    return {
      projects: [],
      selectedProjectBlockIds: [],
      projectBlockIdFilterMode: "OR",
      selectedChartTypeId: "histogram"
    };
  },
  componentDidMount: function() {
    this.loadProjects();
  },
  render: function() {

    return (
      <div className="selectedProjectBlockBox">
        <ChartBox
          selectedChartTypeId={this.state.selectedChartTypeId}
          projects={this.state.projects}
          recent_meter_run_list_url={this.props.recent_meter_run_list_url}
        />
        <ChartSelector
          selectChartTypeCallback={this.selectChartTypeCallback}
          selectedChartTypeId={this.state.selectedChartTypeId}
        />
        <ProjectFilterBox
          selectProjectBlocksCallback={this.selectProjectBlocksCallback}
          projectBlockIdFilterMode={this.state.projectBlockIdFilterMode}
          {...this.props}
        />
        <ProjectSelectionSummaryBox
          projects={this.state.projects}
        />
        <ProjectTable
          projects={this.state.projects}
        />
      </div>
    )
  }
});

var ProjectFilterBox = React.createClass({
  handleSelectEnergyType: function(data) {
    console.log(data);
  },
  render: function() {

    var energyTypes = [
      {name: "Electricity"},
      {name: "Natural Gas"},
    ];

    var filters = [
      (<li className="list-group-item" key={"projectBlockFilter"}>
        <ProjectBlockFilter
          {...this.props}
        />
      </li>),
      (<li className="list-group-item" key={"energyTypeFilter"}>
        <EnergyTypeFilter
          energyTypes={energyTypes}
          handleSelectEnergyType={this.handleSelectEnergyType}
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
        console.error(this.props.url, status, err.toString());
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


var EnergyTypeFilter = React.createClass({
  render: function() {
    var handleSelectEnergyType = this.props.handleSelectEnergyType;
    var energyTypeListItems = this.props.energyTypes.map(function(d,i) {
      return (
        <EnergyTypeListItem
          key={i}
          energyType={d}
          handleSelectEnergyType={handleSelectEnergyType}
        />
      );
    });
    return (
      <div className="energyTypeFilter">
        <span>Filter by energy Type</span>
        <ul className="list-group">
         {energyTypeListItems}
        </ul>
      </div>
    )
  }
});

var EnergyTypeListItem = React.createClass({
  handleSelect: function() {
    this.props.handleSelectEnergyType(this.props.energyType);
  },
  render: function() {
    return (
      <li className="energyTypeListItem list-group-item clearfix">
        <a onClick={this.handleSelect}>
          {this.props.energyType.name}
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
        <h5>Project Selection Summary</h5>
        <ul className="list-group">
          <li className="list-group-item">Number of projects: {this.props.projects.length}</li>
        </ul>
      </div>
    )
  }
});

var ChartSelector = React.createClass({
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

    var selectChartTypeCallback = this.props.selectChartTypeCallback;

    var selectedChartTypeId = this.props.selectedChartTypeId;

    var chartTypeListItems = chartTypes.map(function(d, i) {
      var selected = (selectedChartTypeId == d.id);
      return (
        <ChartTypeListItem
          key={i}
          chartType={d}
          selected={selected}
          selectChartTypeCallback={selectChartTypeCallback}
        />
      )
    });

    return (
      <div className="chartSelector">
        <h5>Chart Selector</h5>
        <ul className="list-group">
          {chartTypeListItems}
        </ul>
      </div>
    )
  }
});

var ChartTypeListItem = React.createClass({
  handleSelect: function() {
    this.props.selectChartTypeCallback(this.props.chartType.id);
  },
  render: function() {
    var toggleSelect;
    if (this.props.selected) {
      toggleSelect = <span>Selected</span>
    } else {
      toggleSelect = <a onClick={this.handleSelect}>Select</a>
    }
    return (
      <li className="chartTypeListItem list-group-item">
        <span>{this.props.chartType.name}&nbsp;</span>
        {toggleSelect}
      </li>
    )
  }
});

var ChartBox = React.createClass({
  render: function() {

    var chartComponent;
    if (this.props.selectedChartTypeId == "histogram") {
      chartComponent = (
        <Histogram
          projects={this.props.projects}
          recent_meter_run_list_url={this.props.recent_meter_run_list_url}
        />
      )
    } else if (this.props.selectedChartTypeId == "timeSeries") {
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
  loadMeterRuns: function() {
    var meterRunListURL = this.props.recent_meter_run_list_url;

    if (this.props.projects.length > 0) {
      meterRunListURL += "?projects=" + this.props.projects.map(function(d, i){
        return d.id;
      }).join("+");
    }

    $.ajax({
      url: meterRunListURL,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log(data);
        this.setState({meterRuns: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  histogramChart: function() {
    var margin = {top: 20, right: 25, bottom: 25, left: 20},
      width = 760,
      height = 120;

    function chart(selection) {
      selection.each(function() {

        // Generate a Bates distribution of 10 random variables.
        var values = d3.range(1000).map(d3.random.bates(10));

        // A formatter for counts.
        var formatCount = d3.format(",.0f");

        var x = d3.scale.linear()
            .domain([0, 1])
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
  componentDidMount: function() {
    this.loadMeterRuns();
    this.renderChart(this.props);
  },
  shouldComponentUpdate: function(props) {
    this.renderChart(this.props);
    return false;
  },
  renderChart: function(props) {
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
