const mocha = require('mocha'),
chai = require('chai'),
request = require('request'),
chaiHttp = require('chai-http'),
should = chai.should(),
expect = chai.expect,
assert = chai.assert,
app = require('../index'),
appPostUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json',
getPostByIdUrl = 'https://hacker-news.firebaseio.com/v0/item/**id**.json?print=pretty';

describe('All test cases for app to work fine', () => {
    it('Number of posts should not exceed limit', () => {
        const result = app.init("1000");
        expect(result, "Number of posts should not exceed limit").equal(false);
    });

    it("initRequest() should return valid response", (done) => {
        request.get(appPostUrl, function (err, resp, body) {
            expect(resp.statusCode, 'Status code should be 200').equal(200);
            //expect(resp).to.be.json;
            const jsonResult = JSON.parse(body);
            jsonResult.should.be.a('array', 'Response should include list of ids');
            done();
        });
    });

    it("Init request should fail for wrong url", (done) => {
        request.get('we are having fun', (err, resp, body) => {
            //expect(err).to.be.not.null;
            should.exist(err);
            done();
        });
    });

    it("handleRequest() should handle all promises", (done) => {
        app.handleRequest('[1000, 1243, 2233, 4567, 4312]').then((result) => {
            //result.should.be.an('array', 'Promise should return object');
            expect(result, "Promise should return object").to.be.an('array');
            done();
        });
    });

    it("Post should be valid json", (done) => {
        request.get(getPostByIdUrl.replace('**id**', 8863), (err, resp, body) => {
            assert.equal(resp.statusCode, 200, "Status code should be 200");
            //expect(resp).to.be.json;
            const singlePost = JSON.parse(body),
            isValidResult = app.isValid(singlePost);
            isValidResult.should.be.a('boolean');
            expect(singlePost, "title property check").to.have.property('title');
            expect(singlePost, "score property check").to.have.property('score');
            expect(singlePost, "kids property check").to.have.property('kids');
            expect(singlePost, "url property check").to.have.property('url');
            expect(singlePost, "author property check").to.have.property('by');
            done();
        });
    });

    it("performRequest() should return a promise", () => {
        const result = app.performRequest(getPostByIdUrl.replace('**id**', 8863));
        expect(result).to.be.a('promise');
    });

    it("isArrayEqual() should return true for equal arrays", () => {
        const areArraysEqual = app.isArrayEqual([5, 7, 1985], [5, 7, 1985]);
        assert.equal(areArraysEqual, true, "Arrays should be equal");
    });

    it("isArrayEqual() should return false for unequal arrays", () => {
        const areArraysEqual = app.isArrayEqual([5, 7, 1985], [5, 7, 1986]);
        assert.equal(areArraysEqual, false, "Arrays should be equal");
    });

    it("isArrayEqual() should return false for unequal arrays", () => {
        const areArraysEqual = app.isArrayEqual([5, 7, 1985], ['5', '7', '1985']);
        assert.equal(areArraysEqual, false, "Arrays should be equal");
    });

    it("isArrayEqual() should return false for unequal arrays", () => {
        const areArraysEqual = app.isArrayEqual([5, 7, 1985, 445], [5, 7, 1985]);
        assert.equal(areArraysEqual, false, "Arrays should be equal");
    });

    it("isValid() shoud properly validate json", () => {
        const invalidJson = {
            title: '*&' * 256,
            url: 'performing invalid url check',
            score: -1,
            kids: ''
        },
        validJson = {
            title: 'IBM has acquired RedHat',
            url: 'http://karma-runner.github.io/3.0/intro/how-it-works.html',
            score: 1240,
            kids: ['', '', '']
        };

        expect(app.isValid(invalidJson), "Invalid should be invalid").equal(false);
        expect(app.isValid(validJson), "Invalid should be invalid").equal(true);
    });

});
