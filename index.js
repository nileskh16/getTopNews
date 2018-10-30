#!/usr/bin/env node
'use strict';

const request = require('request'),
    optimist = require('optimist'),
    validUrl = require('valid-url'),
    fsCache = require('cache-manager-fs'),
    cache = require('cache-manager'),
    diskCache = cache.caching({
        store: fsCache,
        options: {
            ttl: 10000,
            maxsize: 1000 * 1000 * 1000,
            path: 'diskcache',
            preventfill: false
        }
    }),
    maxPosts = 100,
    postCount = optimist.argv["posts"],
    ifShowHelp = optimist.argv["help"],
    topPostsUrl = "https://hacker-news.firebaseio.com/v0/topstories.json",
    output = [];
let itemUrl = "https://hacker-news.firebaseio.com/v0/item/**id**.json?print=pretty";
let obj = {};

const app = {
    init: function (numOfPosts) {
        let self = this;
        if (!ifShowHelp && !numOfPosts) {
            self.showHelp();
            return false;
        }
        else if (ifShowHelp) self.showHelp();
        if (numOfPosts === undefined || numOfPosts === null) {
            console.log('Provide count of posts with --posts option');
            return false;
        } else if (isNaN(numOfPosts) || typeof numOfPosts !== 'number') {
            console.log('Count of posts should be a valid number.');
            return false;
        } else if (numOfPosts && numOfPosts <= maxPosts && numOfPosts > 0) {
            self.initRequest(topPostsUrl);
        } else {
            if (numOfPosts <= 0) {
                console.log(`Count of posts cannot be zero`);
            } else if (numOfPosts > maxPosts)
                console.log(`${numOfPosts} count of posts cannot exceed ${maxPosts}.`);
            return false;
        }
    },
    showHelp: function () {
        console.log(`
gettopnews is a command line tool to get most trending news in technologies
Few options to use with the tool are:
    --help: show help about the tool
    --posts: number of news posts you want to see.
`);
    },
    initRequest: function (targetUrl) {
        let self = this;
        request.get(targetUrl, function (err, resp, body) {
            if (err) throw err;
            self.checkCache(body);
            self.handleRequest(body).then(self.finalOutput.bind(self));
            diskCache.set('topPosts', body, { ttl: 3600 }, (err) => {
                if (err) throw err;
            });
        });
    },
    checkCache: function (dataToCheck) {
        let self = this;
        diskCache.get('topPosts', (err, cachedData) => {
            if (err) throw err;
            if (!cachedData) return;
            if (self.isArrayEqual(JSON.parse(cachedData), JSON.parse(dataToCheck))) {
                self.getDataFromCache();
            }
        });
    },
    getDataFromCache: function () {
        let self = this;
        diskCache.get('cachedPosts', (err, cachedResults) => {
            if (err) throw err;
            if (!cachedResults) return;
            self.finalOutput(cachedResults);
        });
    },
    isValid: function (data) {
        if (!data.title || (data.title.length >= 256)) return false;
        else if (data.score < 0 || (data.kids && data.kids.length < 0)) return false;
        else if (!validUrl.isUri(data.url)) return false;
        return true;
    },
    isArrayEqual: function (array1, array2) {
        if (array1.length !== array2.length) {
            return false;
        }
        for (let el = 0; el < array1.length; el++) {
            if (array1[el] !== array2[el]) return false;
        }
        return true;
    },
    handleRequest: function (newData) {
        let self = this,
            requests = [];
        const postArray = JSON.parse(newData);
        for (let i = 0; i < postCount; i++) {
            const tempUrl = itemUrl.replace('**id**', postArray[i]);
            requests.push(self.performRequest(tempUrl));
        }
        diskCache.set('cachedPosts', requests, { ttl: 3600 }, (err) => {
            if (err) throw err;
        });
        return Promise.all(requests);
    },
    performRequest: function (url) {
        return new Promise((resolve, reject) => {
            request.get(url, (err, resp, body) => {
                if (err) reject(err);
                else resolve(body);
            });
        });
    },
    finalOutput: function (resultSet) {
        let self = this;
        for (let i = 0; i < resultSet.length; i++) {
            const resultPost = JSON.parse(resultSet[i]);
            if (self.isValid(resultPost)) {
                obj = {
                    "title": resultPost.title,
                    "url": resultPost.url,
                    "author": resultPost.by,
                    "points": resultPost.score,
                    "comments": (resultPost.kids && resultPost.kids.length) || 0,
                    "rank": i + 1
                };
                output.push(obj);
            }
        }
        output.sort((el1, el2) => {
            if (el1.points > el2.points) return -1;
            if (el1.points < el2.points) return 1;
            return 0;
        });
        console.log(output);
    }
}
app.init(postCount);
module.exports = app;