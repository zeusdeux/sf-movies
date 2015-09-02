'use strict';

const db = require('./db');

function getSlice(count, fromId) {
  return db.sliceAsArrayFromId(fromId, count);
}

function update(id, obj) {
  db.update(id, obj);
}

module.exports = {
  getSlice,
  update
};
