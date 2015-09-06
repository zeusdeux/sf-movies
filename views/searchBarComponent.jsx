const React              = require('react');
const fetch              = require('isomorphic-fetch');
const d                  = require('debug')('sfMovies:search');
const Autocompletions    = require('./autoCompletionsComponent.jsx');
const LoaderComponent    = require('./loaderComponent.jsx');


const SearchBarComponent = React.createClass({
  _onSearch(e) {
    d('onSearch: Query is %s', this.state.query);
    this.props.onSearch(this.state.query, e);
  },
  _simpleDebounce(fn, time) {
    let timeout;

    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(fn, time, ...args);
    }
  },
  _makeCompletionsRequest(query) {
    d('autoComplete: Going to make a completion request with params type: %s q %s', 'name', query);

    fetch('/complete?q='+query).then(res => {
      if (res.status >= 200 && res.status < 300) {
        return res.json();
      } else {
        var error = new Error(response.statusText);

        error.response = response
        throw error;
      }
    }).then(jsonRes => {
      d('autComplete: results %o', jsonRes);
      const completionsMap = new Map();

      jsonRes.forEach(loc => completionsMap.set(loc.id, loc));

      this.setState({
        completions: completionsMap
      });

      this.props.onAutoComplete(
        jsonRes.map(function(completion){
          return completion.id;
        })
      );
    }).catch(err => d('autoComplete: ', err));
  },
  _autoComplete() {
    const query = React.findDOMNode(this.refs.searchInput).value;

    this._debouncedMakeCompletionRequest(query);

    this.setState({
      query
    });

  },
  _onCompletionClick(locObj, val) {
    this.setState({
      query: val,
      completions: new Map()
    });
    this.props.onCompletionClick(locObj);
  },
  getInitialState() {
    // set up a debounced version of the function that makes completion requests
    this._debouncedMakeCompletionRequest = this._simpleDebounce(this._makeCompletionsRequest, this.props.completionsDelay);

    return { query: '', completions: new Map() };
  },
  render() {
    return (
      <div className="searchbar-container">
        <LoaderComponent showLoader={ this.props.showLoader } />
        <input type="text" ref="searchInput" name="q" value={ this.state.query } onChange={ this._autoComplete } autoComplete="off" placeholder="Enter movie name or address here" />
        <input type="button" className="btn" name="search" value="Search" onClick={ this._onSearch } />
        <Autocompletions results={ !this.state.query.length? new Map() : this.state.completions } onCompletionClick={ this._onCompletionClick } />
      </div>
    )
  }
});


module.exports = SearchBarComponent;
