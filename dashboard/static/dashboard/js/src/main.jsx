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
    var params = [];

    var arrayLength = this.state.selectedProjectBlockIds.length;
    for (var i = 0; i < arrayLength; i++) {
      if (this.state.projectBlockIdFilterMode == "OR") {
        params.push( "projectblock_or" + "=" + this.state.selectedProjectBlockIds[i]);
      } else {
        params.push( "projectblock_and" + "=" + this.state.selectedProjectBlockIds[i]);
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
        this.setState({projects: data})
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
    });
    this.loadProjects();
  },
  getInitialState: function() {
    return {
      projects: [],
      selectedProjectBlockIds: [],
      projectBlockIdFilterMode: "OR",
    };
  },
  componentDidMount: function() {
    this.loadProjects();
  },
  render: function() {
    return (
      <div className="selectedProjectBlockBox">
        <ProjectFilterBox
          selectProjectBlocksCallback={this.selectProjectBlocksCallback}
          projectBlockIdFilterMode={this.state.projectBlockIdFilterMode}
          {...this.props}
        />
        <ProjectSummaryBox />
        <ChartSelector />
        <ChartBox />
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
    return (
      <div className="projectFilterBox">
        <h5>Project Filters</h5>
        <ul className="list-group">
          <li className="list-group-item">
            <ProjectBlockFilter
              {...this.props}
            />
          </li>
          <li className="list-group-item">
            <EnergyTypeFilter
              energyTypes={energyTypes}
              handleSelectEnergyType={this.handleSelectEnergyType}
              {...this.props}
            />
          </li>
          <li className="list-group-item"> <ClimateZoneFilter/> </li>
          <li className="list-group-item"> <DateRangesFilter/> </li>
          <li className="list-group-item"> <ZipCodeFilter/> </li>
          <li className="list-group-item"> <ProjectCostFilter/> </li>
          <li className="list-group-item"> <EnergyConservationMeasureFilter/> </li>
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
        this.setState({projectBlockList: data})
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleSelectProjectBlock: function(projectBlockId) {
    var ids = this.state.selectedProjectBlockIds;
    ids.push(projectBlockId);
    this.setState({selectedProjectBlockIds: ids});
    this.callCallback();
  },
  handleDeselectProjectBlock: function(projectBlockId) {
    var ids = this.state.selectedProjectBlockIds;
    var index = ids.indexOf(projectBlockId);
    if (index != -1) {
      ids.splice(index, 1);
    }
    this.setState({selectedProjectBlockIds: ids});
    this.callCallback();
  },
  toggleFilterModeCallback: function() {
    var filterMode = (this.state.filterMode == "OR") ? "AND" : "OR";
    this.setState({filterMode: filterMode});
    this.callCallback();
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

var ProjectSummaryBox = React.createClass({
  render: function() {
    return (
      <div className="projectSummaryBox">
        Project Summaries
      </div>
    )
  }
});

var ChartSelector = React.createClass({
  render: function() {
    return (
      <div className="chartSelector">
        Chart Selector
      </div>
    )
  }
});

var ChartBox = React.createClass({
  render: function() {
    return (
      <div className="chartBox">
        Chart Box
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
