var scatterplot = require('./scatterplot');

var Scatterplot = React.createClass({
  propTypes: {
    data: React.PropTypes.array,
    domain: React.PropTypes.object,
    fuelType: React.PropTypes.string,
    energyUnit: React.PropTypes.string,
  },

  componentDidMount: function() {
    var el = ReactDOM.findDOMNode(this);

    scatterplot.create(el, {
      height: this.props.height,
    }, this.getChartState());
  },

  componentDidUpdate: function() {
    var el = ReactDOM.findDOMNode(this);
    scatterplot.update(el, this.getChartState());
  },

  getChartState: function() {
    return {
      data: this.props.data,
      domain: this.props.domain,
      fuelType: this.props.fuelType,
      energyUnit: this.props.energyUnit,
    };
  },

  componentWillUnmount: function() {
    var el = ReactDOM.findDOMNode(this);
    scatterplot.destroy(el);
  },

  render: function() {
    return (
      <div className="scatterplot"></div>
    );
  }
});

module.exports = Scatterplot;
