'use strict';

const is = require('../utils/is');


describe('is', function() {
  it('#isString', function() {
    is.isString('asad').should.be.exactly(true);
    is.isString(123).should.be.exactly(false);
    is.isString(null).should.be.exactly(false);
  });
  it('#isArray', function() {
    is.isArray([]).should.be.exactly(true);
    is.isArray([1, 2]).should.be.exactly(true);
    is.isArray({}).should.be.exactly(false);
    is.isArray(null).should.be.exactly(false);
  });
  it('#isFalsy', function() {
    is.isFalsy([]).should.be.exactly(false);
    is.isFalsy('').should.be.exactly(true);
    is.isFalsy(null).should.be.exactly(true);
    is.isFalsy(void 0).should.be.exactly(true);
    is.isFalsy({}).should.be.exactly(false);
  });
  it('#isYear', function() {
    is.isYear(1234).should.be.exactly(true);
    is.isYear(12345).should.be.exactly(false);
    is.isYear(12).should.be.exactly(false);
    is.isYear('123').should.be.exactly(false);
  });
  it('#isInt', function() {
    is.isInt(123).should.be.exactly(true);
    is.isInt(-123).should.be.exactly(true);
    is.isInt(123.123).should.be.exactly(false);
    is.isInt('123').should.be.exactly(false);
    is.isInt(null).should.be.exactly(false);
  });
  it('#not', function() {
    is.not(is.isFalsy)('').should.be.exactly(false);
    is.not(is.isString)(213).should.be.exactly(true);
    is.not(is.isInt)(123).should.be.exactly(false);
  });
  it('#and', function() {
    const test = is.and(is.not(is.isFalsy), is.isString);

    test('as').should.be.exactly(true);
    test('').should.be.exactly(false);
    test(123).should.be.exactly(false);
  });
  it('#or', function() {
    const test = is.or(is.isArray, is.isString);

    test('as').should.be.exactly(true);
    test('').should.be.exactly(true);
    test(123).should.be.exactly(false);
    test({}).should.be.exactly(false);
    test([]).should.be.exactly(true);
    test([1, 2]).should.be.exactly(true);
  });
});
