/*
 * octopus-api
 * https://github.com/racingcow/octopus-api
 *
 * Copyright (c) 2014 David Miller
 * Licensed under the MIT license.
 */

'use strict';

var extend = require('xtend'),
    http = require('http'),
    async = require('async'),
    ops;

var _p = {

    httpGet: function(path, callback) {

        var opts = extend(ops, { path: path }),
            body = '';

        http.get(opts, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                body += chunk;
            })
            .on('end', function() {
                callback(null, JSON.parse(body));
            })
            .on('error', function(e) {
                callback(e);
            });
        }).on('error', function(e) {
            callback(e);
        });
    },

    getLinkedItem: function(link, callback) {
        _p.httpGet(link, callback);
    }

};

exports.init = function(settings) {
    ops = settings;
};

exports.getProjects = function(callback) {
    _p.httpGet('/api/projects/all', function(err, projects) {
        callback(err, projects);
    });
};

exports.getReleases = function(projectId, callback) {
    var url = '/api/projects/' + projectId + '/releases';
    _p.httpGet(url, function(err, releaseCollection) {
        callback(err, releaseCollection);
    });
};

exports.getProjectDeploymentProcessSnapshot = function(release, callback) {
    var link = release.Links.ProjectDeploymentProcessSnapshot;
    _p.getLinkedItem(link, callback);
};

exports.getTemplate = function(snapshot, callback) {
    var link = snapshot.Links.Template;
    _p.getLinkedItem(link, callback);
};

exports.getFeed = function(feedId, callback) {
    var url = '/api/feeds/' + feedId;
    _p.httpGet(url, callback);
};

exports.getCurrentFeeds = function(callback) {

    var cbCalled = false,
        feeds = [],
        mapped;

    var cbHandler = function(err, result) {
        if (!cbCalled) {
            cbCalled = true;
            callback(err, feeds);
        }
    };

    this.getProjects(function(err, projects) {
        async.each(projects, function(project, projectCallback) {
            async.waterfall([
                function(cb) {
                    this.getReleases(project.Id, cb);
                }.bind(this),
                function(releaseCollection, cb) {
                    this.getProjectDeploymentProcessSnapshot(releaseCollection.Items[0], cb)
                }.bind(this),
                this.getTemplate.bind(this),
                function(template, cb) {
                    async.each(template.Packages, function(pkg, templateCallback) {
                        this.getFeed(pkg.NuGetFeedId, function(err, feed) {
                            mapped = feeds.map(function(e) { return e.Id; });
                            if (mapped.indexOf(feed.Id) === -1) {
                                feeds.push(feed);
                                console.log(feed.Id);
                            }
                            templateCallback(err);
                        });
                        }.bind(this), 
                        function(err, callback) {
                            projectCallback();
                            if (err) cbHandler(err);
                        }
                    );
                }.bind(this)
            ], cbHandler);
        }.bind(this), cbHandler);
    }.bind(this));
};