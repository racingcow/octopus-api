'use strict';

var chai = require('chai').should();
var octopusApi = require('../lib/octopus-api.js');

var assert = require('assert');

describe('API', function() {
  describe('getProjects', function(done) {
    it('should return at least one project', function (done) {
      octopusApi.getProjects(function(err, projects) {
        should.not.exist(err);
        projects.should.not.be.empty;
        done();
      });
    });
  });
});