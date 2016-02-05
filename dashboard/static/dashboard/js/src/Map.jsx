var Map = React.createClass({
  render: function() {
    return (
      <svg className="map" height={this.props.height + "px"} width="100%" />
    )
  }
});
module.exports = Map;
