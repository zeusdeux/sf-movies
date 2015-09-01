'use strict';

const React              = require('react/addons');
const SearchBarComponent = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  _onSearch: function(e) {
    this.props.onSearch(this.state.query, e);
  },
  getInitialState: function() {
    return { query: 'San Francisco' };
  },
  render: function() {
    return (
      <div className="searchbar-container">
        <input type="text" name="q" valueLink={this.linkState('query')} />
        <input type="button" className="btn" name="search" value="Search" onClick={ this._onSearch } />
      </div>
    )
  }
});

module.exports = SearchBarComponent;
