'use strict';

const db        = require('./db');
const subSearch = require('subsequence-search');
const d         = require('debug')('sfMovies:movieLocModel');

function getSlice(count, fromIndex) {
  return db.sliceAsArrayFromIndex(fromIndex, count);
}

function update(id, obj) {
  db.update(id, obj);
}

function filter(type, predicate) {
  d('filter: type %s predicate %s', type, predicate);
  const rankByType = subSearch.transforms.rank(type);
  const dataObj = {
    data: db.sliceAsArrayFromIndex(0),
    searchInProps: ['name', 'address']
  };

  return subSearch.search({
    rank: rankByType,
    noHighlight: subSearch.transforms.noHighlight,
    pluck: function(obj) {
      return obj.data;
    }
  }, dataObj, predicate);
}

module.exports = {
  getSlice,
  filter,
  update
};
