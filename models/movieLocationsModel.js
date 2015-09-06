'use strict';

const db        = require('../data/db');
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
  const loc = db.find(id);

  if (!loc) throw new Error('No location found for given id ' + id);
  else return loc;
}

module.exports = {
  getSlice,
  filter,
  update,
  find
};
