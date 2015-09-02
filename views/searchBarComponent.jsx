const React              = require('react/addons');
const d                  = require('debug')('sfMovies:search');
const SearchBarComponent = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  _onSearch: function(e) {
    d('onSearch: Query is %s', this.state.query);
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
