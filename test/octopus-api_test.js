'use strict';

var should = require('should'),
    api = require('../lib/octopus-api.js'),
    settings = require('../settings.json'),
    testSettings = require('./test-settings.json');

describe('API', function() {

  this.timeout(testSettings.timeoutMs);

  before(function() {
    api.init(settings);
  });

  describe('getProjects', function(done) {
    it('should return at least one project', function (done) {
      api.getProjects(function(err, projects) {
        should.not.exist(err);
        projects.should.be.ok;
        projects.should.not.be.empty;
        done();
      });
    });
  });

  describe('getReleases', function(done) {
    it('should return a release for a given project', function (done) {
      api.getProjects(function(err, projects) {
        should.not.exist(err);
        projects.should.be.ok;
        projects.should.not.be.empty;
        api.getReleases(projects[0].Id, function(err, releaseCollection) {
          should.not.exist(err);
          releaseCollection.should.be.ok;
          releaseCollection.Items.should.be.ok;
          releaseCollection.Items.should.not.be.empty;
          done();
        });
      });
    });
  });

  describe('getProjectDeploymentProcessSnapshot', function(done) {
    it('should return a deployment snapshot for a given release', function (done) {
      api.getProjects(function(err, projects) {

        var releases, release;

        should.not.exist(err);
        projects.should.be.ok;
        projects.should.not.be.empty;

        api.getReleases(projects[0].Id, function(err, releaseCollection) {

          should.not.exist(err);
          releaseCollection.should.be.ok;
          releaseCollection.Items.should.be.ok;
          releaseCollection.Items.should.not.be.empty;

          releases = releaseCollection.Items,
          release = (releases && releases[0]) || null;

          api.getProjectDeploymentProcessSnapshot(release, function(err, snapshot) {

            should.not.exist(err);
            snapshot.should.be.ok;
            snapshot.Links.Template.should.be.ok;

            done();

          });

        });
      });
    });
  });

  describe('getTemplate', function(done) {
    it('should return a template for a given deployment snapshot', function (done) {
      api.getProjects(function(err, projects) {

        var releases, release;

        should.not.exist(err);
        projects.should.be.ok;
        projects.should.not.be.empty;

        api.getReleases(projects[0].Id, function(err, releaseCollection) {

          should.not.exist(err);
          releaseCollection.should.be.ok;
          releaseCollection.Items.should.be.ok;
          releaseCollection.Items.should.not.be.empty;

          releases = releaseCollection.Items,
          release = (releases && releases[0]) || null;

          api.getProjectDeploymentProcessSnapshot(release, function(err, snapshot) {

            should.not.exist(err);
            snapshot.should.be.ok;
            snapshot.Links.Template.should.be.ok;

            api.getTemplate(snapshot, function(err, template) {

              should.not.exist(err);
              template.should.be.ok;
              template.Packages.should.be.ok;
              template.Packages.should.not.be.empty;

              done();

            });
          });
        });
      });
    });
  });

  describe('getFeed', function(done) {
    it('should get a feed by id', function (done) {
      api.getProjects(function(err, projects) {

        var releases, release, pkg;

        should.not.exist(err);
        projects.should.be.ok;
        projects.should.not.be.empty;

        api.getReleases(projects[0].Id, function(err, releaseCollection) {

          should.not.exist(err);
          releaseCollection.should.be.ok;
          releaseCollection.Items.should.be.ok;
          releaseCollection.Items.should.not.be.empty;

          releases = releaseCollection.Items,
          release = (releases && releases[0]) || null;

          api.getProjectDeploymentProcessSnapshot(release, function(err, snapshot) {

            should.not.exist(err);
            snapshot.should.be.ok;
            snapshot.Links.Template.should.be.ok;

            api.getTemplate(snapshot, function(err, template) {

              should.not.exist(err);
              template.should.be.ok;
              template.Packages.should.be.ok;
              template.Packages.should.not.be.empty;

              pkg = template.Packages[0];

              pkg.should.be.ok;

              api.getFeed(pkg.NuGetFeedId, function(err, feed) {

                should.not.exist(err);
                feed.should.be.ok;
                feed.FeedUri.should.be.ok;

                done();

              });
            });
          });
        });
      });
    });
  });

  describe('getCurrentFeeds', function(done) {
    it('should get all feeds for the latest deployed packages', function (done) {
      api.getCurrentFeeds(function(err, feeds) {
        should.not.exist(err);
        feeds.should.be.ok;
        feeds.should.not.be.empty;
        console.log(feeds.length);
        console.log(feeds[0]);
        done();
      });
    });
  });

});