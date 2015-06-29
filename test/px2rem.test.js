var assert = require('assert');
var Px2rem = require('../lib/px2rem');
var path = require('path');
var fs = require('fs');
var cssmin = require('cssmin');

describe('px2rem', function() {
    var px2remIns = new Px2rem({remUnit: 64});

    it('[default] should output right rem file', function() {
        var srcPath = path.join(__dirname, 'assets/test.css');
        var outputPath = path.join(__dirname, 'output/default.rem.css');
        var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});
        var outputText = px2remIns.generateRem(srcText);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });

    it('should output right @1x file', function() {
        var srcPath = path.join(__dirname, 'assets/test.css');
        var outputPath = path.join(__dirname, 'output/default.1x.css');
        var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});
        var outputText = px2remIns.generateThree(srcText, 1);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });

    it('should output right @2x file', function() {
        var srcPath = path.join(__dirname, 'assets/test.css');
        var outputPath = path.join(__dirname, 'output/default.2x.css');
        var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});
        var outputText = px2remIns.generateThree(srcText, 2);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });

    it('should output right @3x file', function() {
        var srcPath = path.join(__dirname, 'assets/test.css');
        var outputPath = path.join(__dirname, 'output/default.3x.css');
        var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});
        var outputText = px2remIns.generateThree(srcText, 3);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });
});
