var Map = require("./Map.jsx");

var MapBox = React.createClass({
  getInitialState: function() {
    return {
      points: [],
    }
  },

  getPoints: function(props) {
    if (!props) {
      props = this.props;
    }

    var points = props.projects.map(function(p) {
      return {
        lon_lat: [p.longitude, p.latitude],
        name: p.project_id,
      }
    });

    this.setState({points: points});
  },

  componentDidMount: function() {
    this.getPoints();
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.props.projects != nextProps.projects) {
      this.getPoints(nextProps);
    }
  },

  render: function() {
    return (
      <Map
        points={this.state.points}
        height={this.props.height}
      />
    )
  }
});

module.exports = MapBox;
