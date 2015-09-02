'use strict';

// isString :: a -> Bool
function isString(val) {
  return 'string' === typeof val;
}

// isArray :: a -> Bool
function isArray(a) {
  return Array.isArray(a);
}

// isNum :: a -> Bool
function isNum(val) {
  return !isNaN(parseFloat(val, 10));
}

// isInt :: a -> Bool
function isInt(val) {
  const valAsStr = val + '';

  return isNum(val) && -1 === valAsStr.indexOf('.');
}

// isYear :: a -> Bool
function isYear(val) {
  const valAsStr = val + '';

  return isInt(val) && 4 === valAsStr.length;
}

// isFalse :: a -> Bool
function isFalsy(val) {
  return !!val;
}

// and :: (a -> Bool) -> (a -> Bool) -> (a -> Bool)
function and(f, g) {
  return (p) => f(p) && g(p);
}

// or :: (a -> Bool) -> (a -> Bool) -> (a -> Bool)
function or(f, g) {
  return (p) => f(p) || g(p);
}

module.exports = {
  isString,
  isArray,
  isFalsy,
  isYear,
  isInt,
  and,
  or
};
