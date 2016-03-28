var React = require('react');
var ScatterplotBox = require('./ScatterplotBox.jsx');
var HistogramBox = require('./HistogramBox.jsx');
var TimeseriesBox = require('./TimeseriesBox.jsx');
var MapBox = require('./MapBox.jsx');
var ChartControl = require('./ChartControl.jsx')

var Tabs = require('material-ui/lib/tabs/tabs')
var Tab = require('material-ui/lib/tabs/tab')


var ChartBox = React.createClass({
  getInitialState: function() {
    return {
      selectedFuelTypeId: "E",
      selectedEnergyUnitId: "KWH",
    };
  },
  selectFuelTypeCallback: function(fuelTypeId) {
    this.setState({selectedFuelTypeId: fuelTypeId});
  },
  selectEnergyUnitCallback: function(energyUnitId) {
    this.setState({selectedEnergyUnitId: energyUnitId});
  },
  render: function() {

    var fuelTypes = [
      { id: "E", name: "Electricity", },
      { id: "NG", name: "Natural Gas", },
      { id: "BOTH", name: "Combined", },
    ];

    var energyUnits = [
      { id: "KWH", name: "kWh", },
      { id: "THERM", name: "therms", },
    ];

    return (
      <div className="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--8-col">
        <Tabs>
          <Tab label="Realization rate" >
            <ScatterplotBox
              projects={this.props.projects}
              fuelType={this.state.selectedFuelTypeId}
              energyUnit={this.state.selectedEnergyUnitId}
              project_attribute_key_list_url={this.props.project_attribute_key_list_url}
              project_list_url={this.props.project_list_url}
              height={300}
            />

            <ChartControl
              selectedFuelTypeId={this.state.selectedFuelTypeId}
              selectedEnergyUnitId={this.state.selectedEnergyUnitId}
              selectFuelTypeCallback={this.selectFuelTypeCallback}
              selectEnergyUnitCallback={this.selectEnergyUnitCallback}
            />

          </Tab>
          <Tab label="Gross savings" >
            <HistogramBox
              projects={this.props.projects}
              fuelType={this.state.selectedFuelTypeId}
              energyUnit={this.state.selectedEnergyUnitId}
              meter_run_list_url={this.props.meter_run_list_url}
              height={300}
            />

            <ChartControl
              selectedFuelTypeId={this.state.selectedFuelTypeId}
              selectedEnergyUnitId={this.state.selectedEnergyUnitId}
              selectFuelTypeCallback={this.selectFuelTypeCallback}
              selectEnergyUnitCallback={this.selectEnergyUnitCallback}
            />

          </Tab>
          <Tab label="Annual savings" >
            <TimeseriesBox
              projects={this.props.projects}
              fuelType={this.state.selectedFuelTypeId}
              energyUnit={this.state.selectedEnergyUnitId}
              project_list_url={this.props.project_list_url}
              height={300}
            />

            <ChartControl
              selectedFuelTypeId={this.state.selectedFuelTypeId}
              selectedEnergyUnitId={this.state.selectedEnergyUnitId}
              selectFuelTypeCallback={this.selectFuelTypeCallback}
              selectEnergyUnitCallback={this.selectEnergyUnitCallback}
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
