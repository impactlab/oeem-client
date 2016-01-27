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
    $.ajax({
      url: this.props.project_list_url,
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
  getInitialState: function () {
    return {
      projects: []
    };
  },
  componentDidMount: function () {
    this.loadProjects();
  },
  render: function () {
    return React.createElement(
      "div",
      { className: "selectedProjectBlockBox" },
      React.createElement(ProjectFilterBox, this.props),
      React.createElement(ProjectSummaryBox, null),
      React.createElement(ChartSelector, null),
      React.createElement(ChartBox, null),
      React.createElement(ProjectTable, {
        projects: this.state.projects
      })
    );
  }
});

var ProjectFilterBox = React.createClass({
  displayName: "ProjectFilterBox",

  handleSelectProjectBlock: function (data) {
    console.log(data);
  },
  handleSelectEnergyType: function (data) {
    console.log(data);
  },
  render: function () {
    var energyTypes = [{ name: "Electricity" }, { name: "Natural Gas" }];
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
        React.createElement(
          "li",
          { className: "list-group-item" },
          React.createElement(ProjectBlockFilter, _extends({
            handleSelectProjectBlock: this.handleSelectProjectBlock
          }, this.props))
        ),
        React.createElement(
          "li",
          { className: "list-group-item" },
          React.createElement(EnergyTypeFilter, _extends({
            energyTypes: energyTypes,
            handleSelectEnergyType: this.handleSelectEnergyType
          }, this.props))
        ),
        React.createElement(
          "li",
          { className: "list-group-item" },
          " ",
          React.createElement(ClimateZoneFilter, null),
          " "
        ),
        React.createElement(
          "li",
          { className: "list-group-item" },
          " ",
          React.createElement(DateRangesFilter, null),
          " "
        ),
        React.createElement(
          "li",
          { className: "list-group-item" },
          " ",
          React.createElement(ZipCodeFilter, null),
          " "
        ),
        React.createElement(
          "li",
          { className: "list-group-item" },
          " ",
          React.createElement(ProjectCostFilter, null),
          " "
        ),
        React.createElement(
          "li",
          { className: "list-group-item" },
          " ",
          React.createElement(EnergyConservationMeasureFilter, null),
          " "
        )
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
  getInitialState: function () {
    return {
      projectBlockList: []
    };
  },
  componentDidMount: function () {
    this.loadProjectBlocks();
  },
  render: function () {

    var handleSelectProjectBlock = this.props.handleSelectProjectBlock;
    var projectBlockListItems = this.state.projectBlockList.map(function (d, i) {
      return React.createElement(ProjectBlockListItem, {
        key: d.id,
        handleSelectProjectBlock: handleSelectProjectBlock,
        projectBlock: d
      });
    });

    projectBlockListItems.push(React.createElement(ProjectBlockListItem, {
      key: "all-projects",
      handleSelectProjectBlock: handleSelectProjectBlock,
      projectBlock: null
    }));
    return React.createElement(
      "div",
      { className: "projectBlockFilter" },
      React.createElement(
        "span",
        null,
        "Filter by project blocks"
      ),
      React.createElement(
        "ul",
        { className: "list-group" },
        projectBlockListItems
      )
    );
  }
});

var ProjectBlockListItem = React.createClass({
  displayName: "ProjectBlockListItem",

  handleSelect: function () {
    this.props.handleSelectProjectBlock(this.props.projectBlock);
  },
  render: function () {

    var projectBlockListItemDescriptor;
    if (this.props.projectBlock == null) {
      projectBlockListItemDescriptor = "All projects";
    } else {
      projectBlockListItemDescriptor = this.props.projectBlock.name;
    }

    return React.createElement(
      "li",
      { className: "projectBlockListItem list-group-item clearfix" },
      React.createElement(
        "a",
        { onClick: this.handleSelect },
        projectBlockListItemDescriptor
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

var ProjectSummaryBox = React.createClass({
  displayName: "ProjectSummaryBox",

  render: function () {
    return React.createElement(
      "div",
      { className: "projectSummaryBox" },
      "Project Summaries"
    );
  }
});

var ChartSelector = React.createClass({
  displayName: "ChartSelector",

  render: function () {
    return React.createElement(
      "div",
      { className: "chartSelector" },
      "Chart Selector"
    );
  }
});

var ChartBox = React.createClass({
  displayName: "ChartBox",

  render: function () {
    return React.createElement(
      "div",
      { className: "chartBox" },
      "Chart Box"
    );
  }
});

var ProjectTable = React.createClass({
  displayName: "ProjectTable",

  render: function () {
    var projects = this.props.projects.map(function (d, i) {
      return React.createElement(
        "li",
        { className: "list-group-item clearfix" },
        React.createElement(
          "a",
          { onClick: this.handleSelect },
          d.project_id
        )
      );
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