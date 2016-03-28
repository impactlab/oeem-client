var React = require('react');
var CategorySelector = require('./CategorySelector.jsx');

var ChartControl = React.createClass({
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

    return(
      <div className="ChartControl">
        <CategorySelector
          title={null}
          categories={fuelTypes}
          selectCategoryCallback={this.props.selectFuelTypeCallback}
          selectedCategoryId={this.props.selectedFuelTypeId}
        />

        <CategorySelector
          title={null}
          categories={energyUnits}
          selectCategoryCallback={this.props.selectEnergyUnitCallback}
          selectedCategoryId={this.props.selectedEnergyUnitId}
        />
      </div>
    );

  }
});

module.exports = ChartControl;