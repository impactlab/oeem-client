var React = require('react');
var ScatterplotBox = require('./ScatterplotBox.jsx');
var HistogramBox = require('./HistogramBox.jsx');
var TimeseriesBox = require('./TimeseriesBox.jsx');
var MapBox = require('./MapBox.jsx');

var Tabs = require('material-ui/lib/tabs/tabs')
var Tab = require('material-ui/lib/tabs/tab')


var ChartBox = React.createClass({
  render: function() {
    return (
      <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--8-col">
        <Tabs>
          <Tab label="Realization rate" >
            <ScatterplotBox
              projects={this.props.projects}
              fuelType={this.props.fuelType}
              energyUnit={this.props.energyUnit}
              project_attribute_key_list_url={this.props.project_attribute_key_list_url}
              project_list_url={this.props.project_list_url}
              height={300}
            />
          </Tab>
          <Tab label="Gross savings" >
            <HistogramBox
              projects={this.props.projects}
              fuelType={this.props.fuelType}
              energyUnit={this.props.energyUnit}
              meter_run_list_url={this.props.meter_run_list_url}
              height={300}
            />
          </Tab>
          <Tab label="Annual savings" >
            <TimeseriesBox
              projects={this.props.projects}
              fuelType={this.props.fuelType}
              energyUnit={this.props.energyUnit}
              project_list_url={this.props.project_list_url}
              height={300}
            />
          </Tab>
          <Tab label="Map" >
            <MapBox
              projects={this.props.projects}
              project_list_url={this.props.project_list_url}
              height={300}
            />
          </Tab>
        </Tabs>




      </div>
    )
  }
});

module.exports = ChartBox;
