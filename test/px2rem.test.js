var assert = require('assert');
var Px2rem = require('../src/px2rem');
var path = require('path');
var fs = require('fs');
var cssmin = require('cssmin');

describe('px2rem', function () {
    it('[default] should output right rem file', function () {
        var px2rem = new Px2rem();
        var srcPath = path.join(__dirname, 'assets/test.css');
        var outputPath = path.join(__dirname, 'output/default.rem.css');
        var srcText = fs.readFileSync(srcPath, {encoding:'utf8'});
        var outputText = px2rem.generateRem(srcText);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding:'utf8'})));
    });

    it('should output right @1x rem file', function () {
        var px2rem = new Px2rem();
        var srcPath = path.join(__dirname, 'assets/test.css');
        var outputPath = path.join(__dirname, 'output/default.1x.css');
        var srcText = fs.readFileSync(srcPath, {encoding:'utf8'});
        var outputText = px2rem.generateThree(srcText, 1);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding:'utf8'})));
    });

    it('should output right @2x rem file', function () {
        var px2rem = new Px2rem();
        var srcPath = path.join(__dirname, 'assets/test.css');
        var outputPath = path.join(__dirname, 'output/default.2x.css');
        var srcText = fs.readFileSync(srcPath, {encoding:'utf8'});
        var outputText = px2rem.generateThree(srcText, 2);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding:'utf8'})));
    });

    it('should output right @3x rem file', function () {
        var px2rem = new Px2rem();
        var srcPath = path.join(__dirname, 'assets/test.css');
        var outputPath = path.join(__dirname, 'output/default.3x.css');
        var srcText = fs.readFileSync(srcPath, {encoding:'utf8'});
        var outputText = px2rem.generateThree(srcText, 3);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding:'utf8'})));
    });
})