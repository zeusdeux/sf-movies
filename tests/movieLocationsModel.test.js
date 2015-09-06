'use strict';

const movieLocModel = require('../models/movieLocationsModel');
const dbData        = require('../data/movie-locations-cleaned');


describe('movieLocationModel', function() {
  describe('#getSlice', function() {
    it('should return a slice of the db bounded by given indices', function() {
      const dbAsArray = [];

      Object.keys(dbData).forEach(key => dbData[key] ? dbAsArray.push(dbData[key]) : -1);

      movieLocModel.getSlice(0, 2).should.deepEqual(dbAsArray.slice(0, 2));
      movieLocModel.getSlice(0, 20).should.deepEqual(dbAsArray.slice(0, 20));
      movieLocModel.getSlice(0, -1096).should.deepEqual(dbAsArray.slice(0, -1096));
    });
    it('should throw if either one of the indices are not integers', function() {
      movieLocModel.getSlice.bind(null, '10').should.throw();
      movieLocModel.getSlice.bind(null, 'asd', 20).should.throw();
    });
  });
  describe('#filter', function() {
    it('should return an array of movie locations that match the given predicate either in address or name', function () {
      const results = movieLocModel.filter('name', '50');

      results.should.be.an.Array();
      results[0].should.deepEqual(movieLocModel.find('2C57FAD1-FACA-48C1-B400-7BD2571BF109'));
    });
    it('should return an empty array if the search query is empty or if there are no results for given query', function() {
      const results1 = movieLocModel.filter('name', '');
      const results2 = movieLocModel.filter('name', '9832094');

      results1.should.be.an.Array();
      results2.should.be.an.Array();

      results1.length.should.be.exactly(0);
      results2.length.should.be.exactly(0);
    });
  });
  describe('#update', function() {
    it('should update the named properties for the object with give id', function() {
      movieLocModel.update('2C57FAD1-FACA-48C1-B400-7BD2571BF109', { name: 'some new name' });
      movieLocModel.find('2C57FAD1-FACA-48C1-B400-7BD2571BF109').name.should.be.exactly('some new name');
      movieLocModel.update('2C57FAD1-FACA-48C1-B400-7BD2571BF109', { name: '50 First Dates' });
      movieLocModel.find('2C57FAD1-FACA-48C1-B400-7BD2571BF109').name.should.be.exactly('50 First Dates');
    });
    it('should throw when no object with given id is found', function() {
      movieLocModel.update.bind(null, 'wrongid', { director: 'Jim Castly' }).should.throw();
    });
  });
  describe('#find', function() {
    it('should return the object that matches the given id if id found', function() {
      movieLocModel.find('54C693C7-B4A5-4A59-B4BE-723BCA266A93').should.deepEqual(dbData['54C693C7-B4A5-4A59-B4BE-723BCA266A93']);
    });
    it('should throw if id not found in db', function() {
      movieLocModel.find.bind(null, 'xyz').should.throw();
    });
  });
});
