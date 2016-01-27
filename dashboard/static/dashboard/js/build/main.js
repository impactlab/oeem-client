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
    var params = [];

    var arrayLength = this.state.selectedProjectBlockIds.length;
    for (var i = 0; i < arrayLength; i++) {
      if (this.state.projectBlockIdFilterMode == "OR") {
        params.push("projectblock_or" + "=" + this.state.selectedProjectBlockIds[i]);
      } else {
        params.push("projectblock_and" + "=" + this.state.selectedProjectBlockIds[i]);
      }
    }

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
    });
    this.loadProjects();
  },
  getInitialState: function () {
    return {
      projects: [],
      selectedProjectBlockIds: [],
      projectBlockIdFilterMode: "OR"
    };
  },
  componentDidMount: function () {
    this.loadProjects();
  },
  render: function () {
    return React.createElement(
      "div",
      { className: "selectedProjectBlockBox" },
      React.createElement(ProjectFilterBox, _extends({
        selectProjectBlocksCallback: this.selectProjectBlocksCallback,
        projectBlockIdFilterMode: this.state.projectBlockIdFilterMode
      }, this.props)),
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
          React.createElement(ProjectBlockFilter, this.props)
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
  handleSelectProjectBlock: function (projectBlockId) {
    var ids = this.state.selectedProjectBlockIds;
    ids.push(projectBlockId);
    this.setState({ selectedProjectBlockIds: ids });
    this.callCallback();
  },
  handleDeselectProjectBlock: function (projectBlockId) {
    var ids = this.state.selectedProjectBlockIds;
    var index = ids.indexOf(projectBlockId);
    if (index != -1) {
      ids.splice(index, 1);
    }
    this.setState({ selectedProjectBlockIds: ids });
    this.callCallback();
  },
  toggleFilterModeCallback: function () {
    var filterMode = this.state.filterMode == "OR" ? "AND" : "OR";
    this.setState({ filterMode: filterMode });
    this.callCallback();
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