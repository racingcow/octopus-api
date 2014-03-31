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
    },

    unwrapCollectionCareful: function(data) {
        if (data && data.Items) {
            return data.Items;
        }
        return data;
    },

    firstItemCareful: function(data) {

        data = _p.unwrapCollectionCareful(data);

        if (data && Array.isArray(data)) {
            data = data.length && data[0] || null;
        }

        return data;

    }

};

exports.init = function(settings) {
    ops = settings;
};

exports.getProjects = function(callback) {
    _p.httpGet('/api/projects/all', callback);
};

exports.getReleases = function(projectId, callback) {
    _p.httpGet('/api/projects/' + projectId + '/releases', callback);
};

exports.getProjectDeploymentProcessSnapshot = function(release, callback) {

    release = _p.firstItemCareful(release);

    if (!release) {
        callback(null, null);
        return;
    }

    var link = release.Links.ProjectDeploymentProcessSnapshot;
    _p.getLinkedItem(link, callback);

};

exports.getTemplate = function(snapshot, callback) {

    if (!snapshot) {
        callback(null, null);
        return;
    }

    var link = snapshot.Links.Template;
    _p.getLinkedItem(link, callback);

};

exports.getFeed = function(feedId, callback) {
    var url = '/api/feeds/' + feedId;
    _p.httpGet(url, callback);
};

exports.getFeeds = function(template, cb) {

    if (!template) {
        cb(null);
        return;
    }

    var feeds = [];
    async.each(template.Packages,
        function(pkg, templateCallback) {
            this.getFeed(pkg.NuGetFeedId,
                function(err, feed) {
                    feed.NuGetPackageId = pkg.NuGetPackageId;
                    feed.VersionSelectedLastRelease = pkg.VersionSelectedLastRelease;
                    feeds.push(feed);
                    templateCallback(err);
                }
            );
        }.bind(this),
        function(err) {
            cb(err, feeds);
        }
    );
};

exports.getEnvironments = function(callback) {
    _p.httpGet('/api/environments/all', callback);
};

exports.getCurrentFeeds = function(callback) {

    var cbCalled = false,
        feeds = [];

    var cbHandler = function(err) {
        if (!cbCalled) {
            cbCalled = true;
            callback(err, feeds);
        }
    };

    this.getProjects(function(err, projects) {
        async.each(projects, function(project, projectCallback) {
            async.waterfall([
                function(cb) { this.getReleases(project.Id, cb); }.bind(this),
                this.getProjectDeploymentProcessSnapshot,
                this.getTemplate,
                this.getFeeds.bind(this)
            ],
            function(err, fds) {
                feeds = feeds.concat(fds);
                projectCallback(err);
            });
        }.bind(this), cbHandler);
    }.bind(this));
};