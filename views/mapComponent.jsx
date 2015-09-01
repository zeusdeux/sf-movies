'use strict';

const React              = require('react');
const d                  = require('debug')('map');
const SearchBarComponent = require('./searchBarComponent.jsx');
const MapComponent       = React.createClass({
  _onSearch: function(address, e) {
    var self = this;

    this.state.geocoder.geocode(
      { address: address },
      function(results, status) {
        if (self.props.gmap.GeocoderStatus.OK) {
          new self.props.gmap.Marker({
            map: self.state.map,
            position: results[0].geometry.location
          });
          self.state.map.panTo(results[0].geometry.location);
        } else {
          alert('failed');
        }
      }
    );
  },
  getInitialState: function() {
    var state = {
      zoom: 12,
      center: { lat: 37.7833, lng: -122.4167 },
      geocoder: new this.props.gmap.Geocoder(),
      map: null
    };

    d('getInitialState: state %o', state);
    return state;
  },
  componentDidMount: function() {
    var domNode = React.findDOMNode(this.refs.mapContainer);
    var map = new this.props.gmap.Map(domNode, {
      zoom: this.state.zoom,
      center: this.state.center
    });
    var marker = new this.props.gmap.Marker({
      map: map,
      position: { lat: 37.7833, lng: -122.4167 }
    });
    d('componentDidMount: dom node is %o', domNode);
    d('componentDidMount: map is %o', map);
    this.setState({
      map: map
    });
  },
  render: function() {
    return (
      <div className="map-search-container">
        <div ref="mapContainer" className="map-container"></div>
        <SearchBarComponent onSearch={ this._onSearch }/>
      </div>
    );
  }
});

module.exports = MapComponent;
