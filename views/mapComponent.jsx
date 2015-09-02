const React              = require('react');
const fetch              = require('isomorphic-fetch');
const d                  = require('debug')('sfMovies:map');
const SFCOORDS           = { lat: 37.7833, lng: -122.4167 };
const SearchBarComponent = require('./searchBarComponent.jsx');
const MapComponent       = React.createClass({
  _geocodeAddress: function(address, cb) {
    this.state.geocoder.geocode(
      { address: address },
      cb
    );
  },
  _showMarker: function(marker) {
    marker.setMap(this.state.map);
  },
  _putMarker: function(location) {
    var self = this;
    var marker = new self.props.gmap.Marker({
      map: self.state.map,
      position: location
    });

    // store marker
    this.state.markers.push(marker);

    this.setState({
      markers: this.state.markers
    });
  },
  _hideMarker: function(marker) {
    marker.setMap(null);
  },
  /*_deleteMarker: function(marker) {
    var indexOfMarker =
    this.setState({
      markers: []
    });
  },*/
  _deleteMarkers: function() {
    var self = this;

    this.state.markers.map(function(marker) {
      self._hideMarker(marker);
      return marker;
    });
    this.setState({
      markers: []
    });
  },
  _panTo: function(location) {
    this.state.map.panTo(location);
  },
  _fetchAndMarkLocations: function() {
    var self = this;
    var url = '/locations?count=' + this.state.count + '&from=' + this.state.locations.length;

    d('fetchAndMarkLocations: fetching %d locations more from url %s', this.state.count, url);
    fetch(url, {
      credentials: 'same-origin' // enable sending cookies with ajax request
    })
      .then(function(res) {
        if (res.status >= 200 && res.status < 300) {
          return res.json();
        } else {
          var error = new Error(response.statusText);

          error.response = response
          throw error;
        }
      })
      .then(function(locations) {
        if (!locations.length) {
          d('fetchAndMarkLocations: No more locations to fetch. Total fetched %d', self.state.locations.length);
          clearInterval(self.state.intervalId);
          return 'done';
        }
        self.setState({
          locations: self.state.locations.concat(locations)
        });
        locations.map(function(loc) {
          var address = loc.address + ', san francisco';

          d('fetchAndMarkLocations: Looking for address %s', address);
          if (loc.lat && loc.long) {
            d('fetchAndMarkLocations: lat long found. not making request');
            d('fetchAndMarkLocations: lat %s long %s', loc.lat, loc.long);
            self._putMarker({lat: parseFloat(loc.lat, 10), lng: parseFloat(loc.long, 10)});
          }
          else {
            self._geocodeAddress(address, function(results, status) {
              d('fetchAndMarkLocations: results %o status %s', results, status);
              if (status === self.props.gmap.GeocoderStatus.OK) {
                var location = results[0].geometry.location;
                // TODO: make update call to backend with lat long for location

                self._putMarker(location);

                d('fetchAndMarkLocations: Sending request to update lat long for location %o with address %s and id %s', location, loc.address, loc.id);

                fetch('/update/' + loc.id, {
                  method: 'post',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    lat: location.G,
                    long: location.K
                  })
                }).then(function(res) {
                  if (res.status >= 200 && res.status < 300) {
                    d('fetchAndMarkLocations: Updated lat long for id %s address %s to %d %d', loc.id, loc.address, location.G, location.K);
                  }
                });
              }
              else {
                throw new Error('Address not found' + loc.address + ', san francisco');
              }
            });
          }
        });
      })
      .catch(function(e){
        d('fetchAndMarkLocations: Something went wrong!\n%o', e);
      });
  },
  _onSearch: function(address, e) {
    var self = this;

    this._geocodeAddress(address, function(results, status) {
      if (self.props.gmap.GeocoderStatus.OK) {
        var location = results[0].geometry.location;

        self._putMarker(location);
        self._panTo(location);
      } else {
        d('onSearch: Something went wrong!\n%o', e);
      }
    })
  },
  getInitialState: function() {
    var state = {
      zoom: 12,
      center: SFCOORDS,
      geocoder: new this.props.gmap.Geocoder(),
      map: null,
      markers: [],
      locations: [],
      intervalId: null,
      count: 5 // no of locations to fetch per call to backend
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
    var defaultSFmarker = new this.props.gmap.Marker({
      map: map,
      position: { lat: 37.7833, lng: -122.4167 }
    });
    var intervalId = setInterval(this._fetchAndMarkLocations, 5000);

    d('componentDidMount: dom node is %o', domNode);
    d('componentDidMount: map is %o', map);
    this.setState({
      map: map,
      intervalId: intervalId
    }, function(){
      d('componentDidMount: updated state is %o', this.state);
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
