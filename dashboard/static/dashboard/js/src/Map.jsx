var map = require("./map");

var Map = React.createClass({
  propTypes: {
    height: React.PropTypes.number,
  },

  getPointsLayer: function(props) {
    if (!props) {
      props = this.props;
    }

    var features = props.points.map(function(p){
      var point = new ol.geom.Point(p.lon_lat);
      point.transform('EPSG:4326', 'EPSG:900913')
      var feature = new ol.Feature({
        geometry: point,
        name: p.name,
      });
      return feature;
    });

    var vectorSource = new ol.source.Vector({
      features: features,
    });

    var vectorLayer = new ol.layer.Vector({
      source: vectorSource,
    });

    return vectorLayer;
  },

  getInitialState: function() {
    return {
      vectorLayer: this.getPointsLayer(),
      selectInteraction: null,
      selectedFeature: null,
    }
  },

  componentDidMount: function() {
    var el = ReactDOM.findDOMNode(this).firstChild;
    map.setTarget(el);
    $(el).popover('show')
    map.addLayer(this.state.vectorLayer);
  },

  swapLayer: function(props) {
    map.removeLayer(this.state.vectorLayer);
    map.removeInteraction(this.state.selectInteraction);

    var newLayer = this.getPointsLayer(props);
    var newSelectInteraction = new ol.interaction.Select({
      condition: ol.events.condition.pointerMove,
      layers: [newLayer],
    });
    newSelectInteraction.getFeatures().on('change:length', function(e) {
      if (e.target.getArray().length === 0) {
        // this means it's changed to no features selected
        this.setState({selectedFeature: null});
      } else {
        // this means there is at least 1 feature selected
        var feature = e.target.item(0); // 1st feature in Collection
        this.setState({selectedFeature: feature.getProperties().name});
      }
    }.bind(this));

    this.setState({
      vectorLayer: newLayer,
      selectInteraction: newSelectInteraction,
    }, function () {
      map.addLayer(newLayer);
      map.addInteraction(newSelectInteraction);
    });
  },

  componentWillReceiveProps: function(nextProps) {
    if (this.props.points != nextProps.points) {
      this.swapLayer(nextProps);
    }
  },

  componentWillUnmount: function() {
    map.removeLayer(this.state.vectorLayer);
    map.removeInteraction(this.state.selectInteraction);
  },

  render: function() {

    var popover;
    if (this.state.selectedFeature != null) {
      var popover = (
        <div
          style={{top: "0px", left: "10px", display: "block"}}
          className="popover fade right in"
          role="tooltip"
        >
          <div className="popover-content">{this.state.selectedFeature}</div>
        </div>
      )
    } else {
      popover = null;
    }

    return (
      <div>
        <div id="map" className="map" style={{height: this.props.height + 4.5 + "px"}}>
        </div>
        {popover}
      </div>

    )
  }
});

module.exports = Map;
