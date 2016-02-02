var scatterplot = require('./scatterplot');

var Scatterplot = React.createClass({
  propTypes: {
    data: React.PropTypes.array,
    domain: React.PropTypes.object
  },

  componentDidMount: function() {
    var el = ReactDOM.findDOMNode(this);
    scatterplot.create(el, {
      width: '100%',
      height: '200px'
    }, this.getChartState());
  },

  componentDidUpdate: function() {
    var el = ReactDOM.findDOMNode(this);
    scatterplot.update(el, this.getChartState());
  },

  getChartState: function() {
    return {
      data: this.props.data,
      domain: this.props.domain
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
