const React              = require('react');
const fetch              = require('isomorphic-fetch');
const d                  = require('debug')('sfMovies:map');
const SearchBarComponent = require('./searchBarComponent.jsx');
const SFCOORDS           = { lat: 37.7833, lng: -122.4167 };


const MapComponent       = React.createClass({
  _geocodeAddress: function(address, cb) {
    address = address.split(/\bfrom\b/i)[0].trim() + ', san francisco';
    d('geocodeAddress: Geocoding address %s', address);

    this.state.geocoder.geocode(
      { address: address },
      cb
    );
  },
  _showMarker: function(marker) {
    if (marker) marker.setMap(this.state.map);
    return marker;
  },
  _putMarker: function(locId, location, movieName) {
    // put this operation after the possible setState call
    // which is probably already enqueued
    const reallyPutMarker = function(locId, location) {
      const self = this;
      let marker = this.state.markers.get(locId);
      let info = 'Movie name: ' + movieName;

      // put a marker only if it doesn't already exist
      if (!marker) {
        const newMarkersMap = new Map(this.state.markers);
        const infowindow    = new this.props.gmap.InfoWindow({
          content: info
        });
        marker              = new this.props.gmap.Marker({
          map: self.state.completions.length && self.state.completions.indexOf(locId) < 0 ? null : self.state.map,
          position: location,
          title: movieName
        });

        marker.addListener('click', function() {
          infowindow.open(self.state.map, marker);
        });

        // store marker
        newMarkersMap.set(locId, marker);

        this.setState({
          markers: newMarkersMap
        });
      }
      else {
        this._showMarker(marker);
      }
    };

    setTimeout(reallyPutMarker.bind(this), 0, locId, location);
  },
  _hideMarker: function(marker) {
    marker.setMap(null);
    return marker;
  },
  _hideAllMarkers: function(){
    for (let marker of this.state.markers.values()) this._hideMarker(marker);
  },
  _deleteMarkers: function() {
    // hide all markers
    this._hideAllMarkers();

    // forget markers
    this.setState({
      markers: new Map()
    });
  },
  _panTo: function(loc) {
    this.state.map.panTo(loc);
  },
  _hideLoader: function() {
    this.setState({
      showLoader: false
    });
  },
  _fetchAndMarkLocations: function() {
    const self = this;
    const url  = '/locations?count=' + this.state.count + '&from=' + this.state.locations.size;

    d('fetchAndMarkLocations: fetching %d locations more from url %s', this.state.count, url);

    fetch(url, {
      credentials: 'same-origin' // enable sending cookies with ajax request
    })
      .then(res => {
        if (res.status >= 200 && res.status < 300) {
          return res.json();
        } else {
          var error = new Error(response.statusText);

          error.response = response
          throw error;
        }
      })
      .then(locations => {
        if (!locations.length) {
          d('fetchAndMarkLocations: No more locations to fetch. Total fetched %d', self.state.locations.size);
          clearInterval(self.state.intervalId);
          this._hideLoader();
          return 'done';
        }

        locations.map(loc => {
          const address = loc.address;

          d('fetchAndMarkLocations: Looking for address %s', address);

          // if we have already got the lat and long, dont make a geocode request
          // use em as is
          if (loc.lat && loc.long) {
            d('fetchAndMarkLocations: lat long already available. not making a geocoding request');
            d('fetchAndMarkLocations: lat %s long %s', loc.lat, loc.long);
            self._putMarker(loc.id, {lat: parseFloat(loc.lat, 10), lng: parseFloat(loc.long, 10)}, loc.name);
          }
          else self._geocodeAddress(address, self._putMarkerAndSendLatLngUpdate(loc));
        });

        // create new map from old locations map
        let newLocationsMap = new Map(self.state.locations);

        locations.forEach(loc => newLocationsMap.set(loc.id, loc));

        self.setState({
          locations: newLocationsMap
        });
      })
      .catch(e => d('fetchAndMarkLocations: Something went wrong!\n%o', e));
  },
  _putMarkerAndSendLatLngUpdate: function(loc, viaUserClick) {
    const self = this;

    return function(results, status) {
      d('putMarkerAndSendLatLngUpdate: results %o status %s', results, status);

      if (status === self.props.gmap.GeocoderStatus.OK) {
        const location = results[0].geometry.location;

        self._putMarker(loc.id, location, loc.name);

        if (viaUserClick) self._panTo(location);

        self._sendLatLngUpdateRequest(Object.assign(loc, location));
      }
      else throw new Error('Address not found' + loc.address);
    }
  },
  _sendLatLngUpdateRequest: function(loc) {
    d('sendLatLngUpdateRequest: Sending request to update lat long for location %o with address %s and id %s', location, loc.address, loc.id);
    // Make update call to backend with lat long for location
    fetch('/update/' + loc.id, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        lat: loc.G,
        long: loc.K
      })
    }).then(function(res) {
      if (res.status >= 200 && res.status < 300) {
        d('sendLatLngUpdateRequest: Updated lat long for id %s address %s to %f %f', loc.id, loc.address, loc.G, loc.K);
      }
    }).catch(e => d('putMarkerAndSendLatLngUpdate: Error \n%o', e));
  },
  _onSearch: function(address, e) {
    const self = this;

    this._geocodeAddress(address, function(results, status) {
      if (self.props.gmap.GeocoderStatus.OK) {
        const location = results[0].geometry.location;

        self._putMarker(null, location, results[0]['formatted_address']);
        self._panTo(location);
      } else {
        d('onSearch: Something went wrong!\n%o', e);
      }
    });
  },
  _onCompletionClick: function(locObj) {
    const marker = this.state.markers.get(locObj.id);

    // hide all markers
    this._hideAllMarkers();

    d('onCompletionClick: location id %s marker %o', locObj.id, marker);
    if (marker) {
      // show our marker
      this._showMarker(marker);
      this._panTo(marker.position);

      this.setState({
        markers: this.state.markers,
        completions: [locObj.id]
      });
    }
    else {
      d('onCompletionClick: No marker found for location id %s', locObj.id);
      d('onCompletionClick: Setting up a new marker');

      this._geocodeAddress(locObj.address, this._putMarkerAndSendLatLngUpdate(locObj, true));
    }
  },
  _onAutoComplete: function(locIds) {
    this.setState({
      completions: locIds
    }, function() {
      for (let marker of this.state.markers.values()) this._hideMarker(marker);
      for (let locId of locIds) this._showMarker(this.state.markers.get(locId));
    });
  },
  getInitialState: function() {
    let state = {
      zoomLevel: 12,
      geocoder: new this.props.gmap.Geocoder(),
      map: null,
      markers: new Map(), // map, indexable by location id
      locations: new Map(), // map, indexable by location id
      intervalId: null,
      count: 5, // no of locations to fetch per call to backend,
      interval: 5000,
      completions: [],
      showLoader: true
    };

    d('getInitialState: state %o', state);
    return state;
  },
  componentDidMount: function() {
    const domNode         = React.findDOMNode(this.refs.mapContainer);
    const map             = new this.props.gmap.Map(domNode, {
      zoom: this.state.zoomLevel,
      center: SFCOORDS,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      },
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.MEDIUM,
        position: google.maps.ControlPosition.RIGHT_CENTER
      },
      scaleControl: true,
      streetViewControl: true,
      streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
      },
      panControl: false
    });
    let intervalId        = setInterval(this._fetchAndMarkLocations, this.state.interval);

    d('componentDidMount: dom node is %o', domNode);
    d('componentDidMount: map is %o', map);

    this.setState({
      map: map,
      intervalId: intervalId
    });
  },
  render: function() {
    return (
      <div className="map-search-container">
        <div ref="mapContainer" className="map-container"></div>
        <SearchBarComponent onSearch={ this._onSearch } onCompletionClick={ this._onCompletionClick } onAutoComplete={ this._onAutoComplete } showLoader={ this.state.showLoader }/>
      </div>
    );
  }
});

module.exports = MapComponent;
