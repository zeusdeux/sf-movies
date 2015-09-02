'use strict';

const fs       = require('fs');
const assert   = require('assert');
const d        = require('debug')('sfMovies:db');
const is       = require('../utils/is');
const db       = require('../data/movie-locations-cleaned').slice(0, 20);

const and      = is.and;
const isNum    = is.isNum;
const isInt    = is.isInt;
const isYear   = is.isYear;
const isFalsy  = is.isFalsy;
const isArray  = is.isArray;
const isString = is.isString;

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

*/


// db :: [MovieLocation]


// isNonFalsyAndString :: a -> Bool
function isNonFalsyAndString(val) {
  return and(isFalsy, isString)(val);
}

// isMovieLocation :: Object -> Either Error Bool
function isMovieLocation(obj) {
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

// makeMovieLocation :: String -> Int -> String -> String -> Object -> MovieLocation
function makeMovieLocation(name, year, address, director, optionals) {
  d('name: %s, year: %d, address: %s, director: %s, optionals: %o', optionals);
  assert(name && isString(name), 'name should be a non-empty string');
  assert(year && isYear(year), 'year should be an 4 digit integer');
  assert(address && isString(address), 'address should be a non-empty string');
  assert(director && isString(director), 'director should be a non-empty string');

  return {
    name,
    year,
    address,
    funFact: optionals.funFact,
    production: optionals.production,
    distributor: optionals.distributor,
    director,
    writer: optionals.writer,
    actors: optionals.actors,
    lat: optionals.lat,
    long: optionals.long
  };
}

// find :: Int -> MovieLocation
function find(id) {
  d('Id %d', id);
  assert(isYear(id), 'id should be an integer');
  return db[id];
}

// insert :: MovieLocation -> Either Error Int
function insert(movieLocation) {
  try {
    if (isMovieLocation(movieLocation)) return db.push(movieLocation);
  }
  catch (e) {
    throw e;
  }
}

// sliceAsArrayFromId :: Int -> Maybe [MovieLocation]
function sliceAsArrayFromId(id) {
  assert(isYear(id), 'id should be an integer');
  const slicedDb = db.slice(id);

  d('db as array from id %d is %o', id, slicedDb);
  return db.slice(id);
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
  writeToFile,
  panicDumpToFile,
  makeMovieLocation,
  sliceAsArrayFromId
};
