const React              = require('react');
const fetch              = require('isomorphic-fetch');
const d                  = require('debug')('sfMovies:map');
const SearchBarComponent = require('./searchBarComponent.jsx');
const SFCOORDS           = { lat: 37.7833, lng: -122.4167 };


const MapComponent       = React.createClass({
  _showMarker(marker) {
    if (marker) marker.setMap(this.state.map);
    return marker;
  },
  _hideMarker(marker) {
    marker.setMap(null);
    return marker;
  },
  _panTo(marker) {
    this.state.map.panTo(marker.position);
    return marker;
  },
  _hideLoader() {
    this.setState({
      showLoader: false
    });
  },
  _jsonParseIfOk(res) {
    if (res.status >= 200 && res.status < 400) {
      return res.json();
    } else {
      var error = new Error(response.statusText);

      error.response = response
      throw error;
    }
  },
  _geocodeLocation(locationId) {
    d('geocodeLocation: Making geocode request for location id %s', locationId);

    fetch('/geocode/' + locationId, {
      credentials: 'same-origin'
    })
      .then(this._jsonParseIfOk)
      .then(loc => {
        this.state.locations.set(loc.id, loc);

        // all rendering of markers is done in render()
        // so just set state and forget about it
        this.setState({
          locations: this.state.locations
        });
      })
      .catch(e => d('_geocodeLocation: Something went wrong!\n%o', e));
  },
  _fetchAndMarkLocations() {
    const url  = '/locations?count=' + this.state.count + '&from=' + this.state.fromIndex;

    d('fetchAndMarkLocations: fetching %d locations more from url %s', this.state.count, url);

    fetch(url, {
      credentials: 'same-origin' // enable sending cookies with ajax request
    })
      .then(this._jsonParseIfOk)
      .then(locations => {
        let done = false;

        // if no more locations received or if no., of locations received is lesser than
        // how many we asked for and if any one of 'em (i am arbitrarily checking the 1st one)
        // we've already seen before then we are done
        if (!locations.length || (locations.length < this.state.count && this.state.locations.get(locations[0].id))) done = true;

        // if locations is empty, this will never execute
        locations.forEach(loc => {
          // if loc has lat & long, add it to state.locations map
          if (loc.lat & loc.long) this.state.locations.set(loc.id, loc);
          // else geocode that location
          else this._geocodeLocation(loc.id);
        });

        // update the locations and fromIndex based on response
        this.setState({
          locations: this.state.locations,
          fromIndex: this.state.fromIndex + locations.length
        });

        // if we are done, hide the loader and clear the interval so that no more requests are made
        if (done) {
          d('fetchAndMarkLocations: No more locations to fetch. Total fetched %d', this.state.locations.size);
          clearInterval(this.state.intervalId);
          this._hideLoader();
          return 'done';
        }
      })
      .catch(e => d('fetchAndMarkLocations: Something went wrong!\n%o', e));
  },
  _onSearch(address, e) {
    const self = this;

    this.state.geocoder.geocode({ address }, (results, status) => {
      if (this.props.gmap.GeocoderStatus.OK) {
        let location = results[0].geometry.location;

        location.lat = location.G;
        location.long = location.K;

        delete location.G;
        delete location.K;

        location.name = results[0].formatted_address;
        location.id = +new Date();

        this.state.locations.set(location.id, location);

        this.setState({
          locations: this.state.locations,
          completions: [location.id]
        });

      } else {
        d('onSearch: Something went wrong!\n%o', e);
      }
    });
  },
  _onCompletionClick(locObj) {
    const marker = this.state.markers.get(locObj.id);

    d('onCompletionClick: location id %s marker %o', locObj.id, marker);

    if (!marker) {
      d('onCompletionClick: No marker found for location id %s', locObj.id);

      this._geocodeLocation(locObj.id);
    }
    this.setState({
      completions: [locObj.id]
    });
  },
  _onAutoComplete(locIds) {
    this.setState({
      completions: locIds
    });
  },
  getInitialState() {
    let state = {
      zoomLevel: 12,
      geocoder: new this.props.gmap.Geocoder(),
      map: null,
      markers: new Map(), // map, indexable by location id
      locations: new Map(), // map, indexable by location id
      intervalId: null,
      count: 5, // no of locations to fetch per call to the backend
      interval: 800, // interval at which we keep asking the backend for <count> locations
      completions: [],
      showLoader: true,
      fromIndex: 0
    };

    d('getInitialState: state %o', state);
    return state;
  },
  componentDidMount() {
    const domNode  = React.findDOMNode(this.refs.mapContainer);
    const map      = new this.props.gmap.Map(domNode, {
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
    let intervalId = setInterval(this._fetchAndMarkLocations, this.state.interval);

    d('componentDidMount: dom node is %o', domNode);
    d('componentDidMount: map is %o', map);

    this.setState({
      map: map,
      intervalId: intervalId
    });
  },
  _paintMarkers() {
    // this.state.completions
    // this.state.locations
    // this.state.markers
    let marker;
    let self = this;

    for (let loc of this.state.locations.values()) {
      // if loc has lat & long, only then attempt to paint a marker for it
      if (loc.lat && loc.long) {
        // get marker for it (from state or create new one if none found)
        marker = this.state.markers.get(loc.id);

        if (!marker) {
          let infoContent = loc.name;

          infoContent += loc.director ? '<br />Directed by: ' + loc.director : '';
          infoContent += loc.actors && loc.actors.length? '<br />Actors: ' + loc.actors.filter(v => !!v).join(', ') : '';

          // setup info that is shown when marker is clicked
          const infoWindow = new this.props.gmap.InfoWindow({
            content: infoContent
          });

          marker           = new this.props.gmap.Marker({
            map: self.state.map,
            position: { lat: loc.lat, lng: loc.long },
            title: loc.name
          });

          marker.addListener('click', () => {
            /*for (let m of this.state.markers.values()) {
              if (m !== marker && m.__infoWindowOpen__) m.__infoWindow__.close();
            }*/
            marker.__infoWindow__ = infoWindow;
            if (marker.__infoWindowOpen__) {
              infoWindow.close(this.state.map, marker);
              marker.__infoWindowOpen__ = false;
            }
            else {
              infoWindow.open(this.state.map, marker);
              marker.__infoWindowOpen__ = true;
            }
          });
        }
        // if completions isn't empty and loc.id in completions, show it
        if (
          !this.state.completions.length ||
          this.state.completions.indexOf(loc.id) > -1
        ) {
          this._showMarker(marker);
          // if there's only one location id in completions, then pan to it.
          if (1 === this.state.completions.length) this._panTo(marker);
        }
        // if not, hide it (set map to null)
        else this._hideMarker(marker);

        this.state.markers.set(loc.id, marker);
      }
    }
  },
  render() {
    this._paintMarkers();

    return (
      <div className="map-search-container">
        <div ref="mapContainer" className="map-container"></div>
        <SearchBarComponent onSearch={ this._onSearch } onCompletionClick={ this._onCompletionClick } onAutoComplete={ this._onAutoComplete } showLoader={ this.state.showLoader } completionsDelay={ 200 } />
      </div>
    );
  }
});

module.exports = MapComponent;
