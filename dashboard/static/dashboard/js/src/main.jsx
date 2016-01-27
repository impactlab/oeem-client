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
    $.ajax({
      url: this.props.project_list_url,
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
  getInitialState: function() {
    return {
      projects: [],
    };
  },
  componentDidMount: function() {
    this.loadProjects();
  },
  render: function() {
    return (
      <div className="selectedProjectBlockBox">
        <ProjectFilterBox
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
  handleSelectProjectBlock: function(data) {
    console.log(data);
  },
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
              handleSelectProjectBlock={this.handleSelectProjectBlock}
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
  getInitialState: function() {
    return {
      projectBlockList: [],
    };
  },
  componentDidMount: function() {
    this.loadProjectBlocks();
  },
  render: function() {

    var handleSelectProjectBlock = this.props.handleSelectProjectBlock;
    var projectBlockListItems = this.state.projectBlockList.map(function(d, i) {
      return (
        <ProjectBlockListItem
          key={d.id}
          handleSelectProjectBlock={handleSelectProjectBlock}
          projectBlock={d}
        />
      );
    });

    projectBlockListItems.push(
      <ProjectBlockListItem
        key={"all-projects"}
        handleSelectProjectBlock={handleSelectProjectBlock}
        projectBlock={null}
      />
    );
    return (
      <div className="projectBlockFilter">
        <span>Filter by project blocks</span>
        <ul className="list-group">
         {projectBlockListItems}
        </ul>
      </div>
    )
  }
});

var ProjectBlockListItem = React.createClass({
  handleSelect: function() {
    this.props.handleSelectProjectBlock(this.props.projectBlock);
  },
  render: function() {

    var projectBlockListItemDescriptor;
    if (this.props.projectBlock == null) {
      projectBlockListItemDescriptor = "All projects";
    } else {
      projectBlockListItemDescriptor = this.props.projectBlock.name;
    }

    return (
      <li className="projectBlockListItem list-group-item clearfix">
        <a onClick={this.handleSelect}>{projectBlockListItemDescriptor}</a>
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
        <li className="list-group-item clearfix">
          <a onClick={this.handleSelect}>
            {d.project_id}
          </a>
        </li>
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
