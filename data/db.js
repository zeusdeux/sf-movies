'use strict';

const assert   = require('assert');
const is       = require('../utils/is');
const resolve  = require('path').resolve;
const d        = require('debug')('sfMovies:db');
const and      = is.and;
const not      = is.not;
const isNum    = is.isNum;
const isInt    = is.isInt;
const isYear   = is.isYear;
const isFalsy  = is.isFalsy;
const isArray  = is.isArray;
const isString = is.isString;


// changing db to return a function that accepts a path
// to the json it should treat as the db
// This is similar to specifying what db you want the client
// to connect to from the model
module.exports = function(pathToDbJson) {
  pathToDbJson = resolve(__dirname, pathToDbJson ? pathToDbJson : './movie-locations-cleaned');
  d('db: db path %s', pathToDbJson);

  let db       = require(pathToDbJson);

  // make subset of db for dev
  if (process.env.NODE_ENV !== 'production') {
    let i      = 0;
    let dbTemp = {};
    let keys   = Object.keys(require(pathToDbJson));

    while(i < 20) dbTemp[keys[i]] = db[keys[i++]];

    db = dbTemp;
  }

  /*

    data MovieLocation = {
      name :: String
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


  // isNonFalsyAndString :: a -> Bool
  function isNonFalsyAndString(val) {
    return and(not(isFalsy), isString)(val);
  }

  // isMovieLocation :: Object -> Either Error Bool
  function isMovieLocation(obj) {
    d('isMovieLocation: object to test is %o', obj);
    assert(obj.hasOwnProperty('id') && isNonFalsyAndString(obj.id), 'Id should be a non-falst string');
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

    if (!db[id]) throw new Error('No location found for given id ' + id);
    else return db[id];
  }

  // insert :: MovieLocation -> Either Error MovieLocation
  function insert(movieLocation) {
    d('insert: movie location being inserted is %o', movieLocation);
    try {
      if (isMovieLocation(movieLocation)) {
        db[movieLocation.id] = movieLocation;
        return db[movieLocation.id];
      }
    }
    catch (e) {
      throw e;
    }
  }

  // update :: Id -> Object -> IO ()
  function update(id, obj) {
    d('update: id %s obj %o', id, obj);
    let location = db[id];

    Object.keys(obj).forEach(key => location[key] = obj[key]);
  }

  // drop :: Id -> IO ()
  function drop(id) {
    d('drop: %s', id);
    if (find(id)) delete db[id];
  }

  // sliceAsArrayFromIndex :: Int -> Maybe Int -> [MovieLocation]
  function sliceAsArrayFromIndex(fromIndex, toIndex) {
    d('from index %d toIndex %d count %d', fromIndex, toIndex, toIndex - fromIndex);

    let dbAsArray = [];

    Object.keys(db).forEach(key => {
      if (db[key]) dbAsArray.push(db[key]);
    });

    assert(isInt(fromIndex), 'fromIndex should be an integer');
    if (toIndex) assert(isInt(toIndex), 'toIndex should be an integer');

    const slicedDb = toIndex ? dbAsArray.slice(fromIndex, toIndex) : dbAsArray.slice(fromIndex);

    d('db as array from index %d is %o', fromIndex, slicedDb);
    return slicedDb;
  }

  return {
    find,
    insert,
    update,
    drop,
    sliceAsArrayFromIndex
  };
};
