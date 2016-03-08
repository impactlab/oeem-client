var React = require('react');
var ProjectBlockFilter = require('./ProjectBlockFilter.jsx');
var DateRangeFilter = require('./DateRangeFilter.jsx');
var SaveProjectBlockModal = require('./SaveProjectBlockModal.jsx');

var ProjectFilterBox = React.createClass({
  toggleCollapsed: function() {
    this.setState({collapsed: !this.state.collapsed});
  },
  openSaveProjectBlockModal: function() {
    this.setState({saveProjectBlockModalIsOpen: true});
  },
  closeSaveProjectBlockModal: function() {
    // after a save, sometimes there will be a new project block.
    this.setState({saveProjectBlockModalIsOpen: false});
  },
  getInitialState: function() {
    return {
      collapsed: true,
      saveProjectBlockModalIsOpen: false,
    }
  },
  render: function() {
    var content;
    if (this.state.collapsed) {
      content = <div className="pull-right">
        <a onClick={this.toggleCollapsed}>Show filters</a>
      </div>
    } else {
      content = (
        <div className="projectFilterBox row">
          <div className="col-md-4">
            <ProjectBlockFilter
              {...this.props}
            />
          </div>
          <div className="col-md-4">
            <DateRangeFilter
              title="Baseline Period End Date"
              onSelect={this.props.selectBaselineEndDateRangeCallback}
            />
            <DateRangeFilter
              title="Reporting Period Start Date"
              onSelect={this.props.selectReportingStartDateRangeCallback}
            />
          </div>
          <div className="col-md-4">
            <div className="pull-right">
              <a className="btn btn-primary" onClick={this.toggleCollapsed}>Hide filters</a>
            </div>
            <div className="pull-right">
              <a className="btn btn-primary" onClick={this.openSaveProjectBlockModal}>Save</a>
            </div>
          </div>

          <SaveProjectBlockModal
            projects={this.props.projects}
            modalIsOpen={this.state.saveProjectBlockModalIsOpen}
            closeModalCallback={this.closeSaveProjectBlockModal}
            project_block_list_url={this.props.project_block_list_url}
            project_block_detail_url={this.props.project_block_detail_url}
            csrf_token={this.props.csrf_token}
          />
        </div>
      )
    }
    return (
      <div className="projectFilterBox row">
        <div className="col-md-12">
          <div className="panel panel-default">
            <div className="panel-body">
            {content}
            </div>
          </div>
        </div>
      </div>
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

module.exports = ProjectFilterBox;
