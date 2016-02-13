var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
  ],
  view: new ol.View({
    center: [30000000, 4000000],
    zoom: 3
  }),
  interactions: ol.interaction.defaults({
    mouseWheelZoom:false
  }),
});

module.exports = map;
