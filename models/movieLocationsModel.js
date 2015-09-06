'use strict';

const db        = require('../data/db')();
const subSearch = require('subsequence-search');
const d         = require('debug')('sfMovies:movieLocModel');


function getSlice(fromIndex, count) {
  d('getSlice: fromIndex %d count %d', fromIndex, count);
  return db.sliceAsArrayFromIndex(fromIndex, count);
}

function update(id, obj) {
  db.update(id, obj);
}

function filter(type, predicate) {
  d('filter: type %s predicate %s', type, predicate);

  if (predicate.length) {
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
  // if the predicate is empty, return an empty array of completions
  // doing this here because by default, subsequence search returns
  // the whole data list when you search for an empty string
  return [];
}

function find(id) {
  return db.find(id);
}

module.exports = {
  getSlice,
  filter,
  update,
  find
};
