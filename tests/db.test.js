'use strict';

const mockdb = require('./mockdb');
const db     = require('../data/db')('../tests/mockdb');

describe('db', function() {
  describe('#find', function() {
    it('should return the object which matches id', function() {
      db.find('abc').should.deepEqual(mockdb.abc);
      db.find.bind(null, 'alskd').should.throw();
    });
  });
  describe('#insert', function() {
    it('should insert a record into the db if it has all the mandatory fields', function() {
      const movieLoc = {
        id: 'xyz',
        name: 'dude what',
        year: 2012,
        address: 'City Hall, San Francisco, CA',
        director: 'Paul Mitchell',
        actors: ['abc', 'def']
      };

      db.insert(movieLoc);
      db.find('xyz').should.deepEqual(movieLoc);
      db.drop('xyz');
    });
    it('should throw if we try to insert a faulty record', function() {
      const badMovieLoc = {
        name: 'what'
      };

      db.insert.bind(null, badMovieLoc).should.throw();
    });
  });
  describe('#update', function() {
    it('should update the named properties for the object with give id', function() {
      const movieLoc = {
        id: 'xyz',
        name: 'dude what',
        year: 2012,
        address: 'City Hall, San Francisco, CA',
        director: 'Paul Mitchell',
        actors: ['abc', 'def']
      };

      db.insert(movieLoc);
      db.find('xyz').should.deepEqual(movieLoc);

      db.update('xyz', { name: 'omg' });
      db.find('xyz').name.should.be.exactly('omg');
      db.drop('xyz');
    });
    it('should throw when no object with given id is found', function() {
      db.update.bind(null, '1', { potato: 'potaato' }).should.throw();
    });
  });
  describe('#drop', function() {
    it('should delete the element with the given id from the db', function() {
      const data = {
        id: 'mud',
        name: 'nope.avi',
        year: 1956,
        address: 'Something st.',
        director: 'Omg Barbieson'
      };

      db.insert(data);
      db.find('mud').should.deepEqual(data);
      db.drop('mud');
      db.find.bind(null, 'mud').should.throw();
    });
  });
  describe('#sliceAsArrayFromIndex', function() {
    it('should return a slice of the db bounded by the given indices', function() {
      let mockdbAsArray = [];

      Object.keys(mockdb).forEach(key => mockdbAsArray.push(mockdb[key]));

      db.sliceAsArrayFromIndex(0).should.deepEqual(mockdbAsArray);
      db.sliceAsArrayFromIndex(0, -1).should.deepEqual(mockdbAsArray.slice(0, -1));
    });
    it('should throw when either of the indices are not integers', function() {
      db.sliceAsArrayFromIndex.bind(null, 1.2).should.throw();
      db.sliceAsArrayFromIndex.bind(null, 'asda').should.throw();
      db.sliceAsArrayFromIndex.bind(null, null, 2).should.throw();
      db.sliceAsArrayFromIndex.bind(null, '20', 10).should.throw();
    });
  });
});
