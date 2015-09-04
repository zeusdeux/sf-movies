const React           = require('react');
const d               = require('debug')('sfMovies:autoComplete');


const Autocompletions = React.createClass({
  _onClick: function(e) {
    const id  = e.target.dataset.id;
    const val = e.target.textContent;

    d('autoCompletions: id %s val %s', id, val);
    this.props.onCompletionClick(this.props.results.get(id), val);
  },
  render: function() {
    let completionItems = [];
    const self          = this;
    const maybeHide     = !this.props.results.size? 'displayNone' : ''; // hide autocompletions drop down where there is no query

    // build auto-completion lis from the received results
    for (var res of this.props.results.values()) {
      completionItems.push(<li data-id={ res.id } key={ res.id } onClick={ self._onClick }>{'' + res.name + ' @ ' +  res.address }</li>);
    };

    return (
      <div className={ 'autocompletions-container ' + maybeHide }>
        <ul>
          {completionItems}
        </ul>
      </div>
    );
  }
});

module.exports = Autocompletions;
