const React              = require('react');
const fetch              = require('isomorphic-fetch');
const d                  = require('debug')('sfMovies:search');
const Autocompletions    = require('./autoCompletionsComponent.jsx');
const LoaderComponent    = require('./loaderComponent.jsx');


const SearchBarComponent = React.createClass({
  _onSearch: function(e) {
    d('onSearch: Query is %s', this.state.query);
    this.props.onSearch(this.state.query, e);
  },
  _autoComplete: function() {
    const self  = this;
    const value = React.findDOMNode(this.refs.searchInput).value;

    d('autoComplete: Going to make a completion request with params type: %s q %s', 'name', value);

    fetch('/complete?q='+value).then(function(res) {
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        var error = new Error(response.statusText);

        error.response = response
        throw error;
      }
    }).then(function(jsonRes) {
      d('autComplete: results %o', jsonRes);
      const completionsMap = new Map();

      jsonRes.forEach(loc => completionsMap.set(loc.id, loc));

      self.setState({
        completions: completionsMap
      });

      self.props.onAutoComplete(
        jsonRes.map(function(completion){
          return completion.id;
        })
      );
    }).catch(err => d('autoComplete: ', err));

    this.setState({
      query: value
    });

  },
  _onCompletionClick: function(locObj, val) {
    this.setState({
      query: val,
      completions: new Map()
    });
    this.props.onCompletionClick(locObj);
  },
  getInitialState: function() {
    return { query: 'San Francisco', completions: new Map() };
  },
  render: function() {
    return (
      <div className="searchbar-container">
        <LoaderComponent showLoader={ this.props.showLoader } />
        <input type="text" ref="searchInput" name="q" value={ this.state.query } onChange={ this._autoComplete } autoComplete="off" />
        <input type="button" className="btn" name="search" value="Search" onClick={ this._onSearch } />
        <Autocompletions results={ !this.state.query.length? new Map() : this.state.completions } onCompletionClick={ this._onCompletionClick } />
      </div>
    )
  }
});


module.exports = SearchBarComponent;
