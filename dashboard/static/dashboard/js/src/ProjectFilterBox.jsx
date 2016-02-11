var React = require('react');
var ProjectBlockFilter = require('./ProjectBlockFilter.jsx');
var DateRangeFilter = require('./DateRangeFilter.jsx');

var ProjectFilterBox = React.createClass({
  toggleCollapsed: function() {
    this.setState({collapsed: !this.state.collapsed});
  },
  getInitialState: function() {
    return {
      collapsed: true,
    }
  },
  render: function() {
    var content;
    if (this.state.collapsed) {
      content = <div className="pull-right">
        <a onClick={this.toggleCollapsed}>Show filters</a>
      </div>
    } else {
      content = <div className="projectFilterBox row">
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
            <a onClick={this.toggleCollapsed}>Hide filters</a>
          </div>
        </div>
      </div>;
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
