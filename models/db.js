'use strict';

const fs       = require('fs');
const assert   = require('assert');
const is       = require('../utils/is');
const d        = require('debug')('sfMovies:db');
let db         = require('../data/movie-locations-cleaned');

const and      = is.and;
const isNum    = is.isNum;
const isInt    = is.isInt;
const isYear   = is.isYear;
const isFalsy  = is.isFalsy;
const isArray  = is.isArray;
const isString = is.isString;


// make subset of db for dev
if (process.env.NODE_ENV !== 'production') {
  let i      = 0;
  let dbTemp = {};
  let keys   = Object.keys(require('../data/movie-locations-cleaned'));

  while(i < 20) dbTemp[keys[i]] = db[keys[i++]];

  db = dbTemp;
}

/*

data MovieLocation = { name :: String
                     , year :: Int
                     , address :: String
                     , funFact :: Maybe String
                     , production :: Maybe String
                     , distributor :: Maybe String
                     , director :: String
                     , writer :: Maybe String
                     , actors :: Maybe [String]
                     }

type Id = String
*/


// db :: [MovieLocation]


// isNonFalsyAndString :: a -> Bool
function isNonFalsyAndString(val) {
  return and(isFalsy, isString)(val);
}

// isMovieLocation :: Object -> Either Error Bool
function isMovieLocation(obj) {
  d('isMovieLocation: object to test is %o', obj);
  assert(obj.hasOwnProperty('name') && isNonFalsyAndString(obj.name), 'name should be a non-empty string');
  assert(obj.hasOwnProperty('year') && isYear(obj.year), 'year should be a 4 digit integer');
  assert(obj.hasOwnProperty('address') && isNonFalsyAndString(obj.address), 'address should be a non-empty string');
  assert(obj.hasOwnProperty('director') && isNonFalsyAndString(obj.director), 'director should be a non-empty string');

  if (obj.hasOwnProperty('funFact')) assert(isString(obj.funFact), 'funFact should be a non-empty string');
  if (obj.hasOwnProperty('production')) assert(isString(obj.production), 'production should be a non-empty string');
  if (obj.hasOwnProperty('distributor')) assert(isString(obj.distributor), 'distributor should be a non-empty string');
  if (obj.hasOwnProperty('writer')) assert(isString(obj.writer), 'writer should be a non-empty string');
  if (obj.hasOwnProperty('actors')) assert(isArray(obj.actors), 'actors should be an array');
  if (obj.hasOwnProperty('lat')) assert(isNum(obj.lat), 'lat should be an number');
  if (obj.hasOwnProperty('long')) assert(isNum(obj.long), 'long should be an number');

  return true;
}

// find :: Id -> MovieLocation
function find(id) {
  d('Id %s', id);
  assert(isNonFalsyAndString(id), 'id should be non-falsy and a string');

  return db[id];
}

// findIndex :: Id -> Int
function findIndex(id) {
  d('Id %s', id);
  assert(isNonFalsyAndString(id), 'id should be non-falsy and a string');

  for (let i = 0; i < db.length; i++) {
    let curr = db[i];

    if (id === curr.id) return i;
  }
  return -1;
}

// insert :: MovieLocation -> Either Error Int
function insert(movieLocation) {
  d('insert: movie location being inserted is %o', movieLocation);
  try {
    if (isMovieLocation(movieLocation)) return db.push(movieLocation);
  }
  catch (e) {
    throw e;
  }
}

// update :: Id -> Object -> IO ()
function update(id, obj) {
  d('update: id %s obj %o', id, obj);
  let location = db[id];

  if (location) Object.keys(obj).forEach(key => location[key] = obj[key]);
  else throw new Error('Id ' + id + ' not found');
}

// sliceAsArrayFromIndex :: Int -> Maybe [MovieLocation]
function sliceAsArrayFromIndex(fromIndex, toIndex) {
  d('from index %d toIndex %d count %d', fromIndex, toIndex, toIndex - fromIndex);

  const dbAsArray = [];

  Object.keys(db).forEach(key => {
    dbAsArray.push(db[key]);
  });

  assert(isInt(fromIndex), 'fromIndex should be an integer');
  if (toIndex) assert(isInt(toIndex), 'toIndex should be an integer');

  const slicedDb = toIndex ? dbAsArray.slice(fromIndex, toIndex) : dbAsArray.slice(fromIndex);

  d('db as array from index %d is %o', fromIndex, slicedDb);
  return slicedDb;
}

// writeToFile :: Maybe FilePath -> IO ()
function writeToFile(filePath, cb) {
  filePath = filePath || '../data/movie-locations-cleaned.json_backup' + new Date().toUTCString();
  d('filePath: %s', filePath);
  try {
    fs.writeFile(filePath, JSON.stringify(db), cb);
  }
  catch(e) {
    return cb(e);
  }
}

// call this only when things are going to complete shit
// for example, on app.error or on SIGINT/SIGTERM
// panicDumpToFile :: Maybe FilePath -> IO ()
function panicDumpToFile(filePath) {
  filePath = filePath || '../data/movie-locations-cleaned.json_backup' + new Date().toUTCString();
  d('PANIC! Filepath: %s', filePath);
  fs.writeFile(filePath, JSON.stringify(db)); // not catching errors as this is called during panic anyway
}

module.exports = {
  find,
  insert,
  update,
  findIndex,
  writeToFile,
  panicDumpToFile,
  sliceAsArrayFromIndex
};
