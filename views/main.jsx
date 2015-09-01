'use strict';

const React              = require('react');
const d                  = require('debug')('main');
const MapComponent       = require('./mapComponent.jsx');
const MainComponent      = React.createClass({
  getInitialState: function() {
    d('getInitialState: window.google.maps: %o', window.google.maps);
    return {
      gmap: window.google.maps
    };
  },
  render: function() {
    d('render: MainComponent render called');
    return (
      <MapComponent gmap={ this.state.gmap } />
    );
  }
});


React.render(<MainComponent />, document.body);

module.exports = React; // to enable react debugger in chrome
