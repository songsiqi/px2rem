var assert = require('assert');
var Px2rem = require('../lib/px2rem');
var path = require('path');
var fs = require('fs');
var cssmin = require('cssmin');

describe('px2rem should work with @2x origin css file', function() {
    var px2remIns = new Px2rem(/*{remUnit: 75, baseDpr: 2}*/);
    var srcPath = path.join(__dirname, 'assets/test.2x.css');
    var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});

    it('[default] should output right rem file', function() {
        var outputPath = path.join(__dirname, 'output/default.rem.css');
        var outputText = px2remIns.generateRem(srcText);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });

    it('should output right @1x file', function() {
        var outputPath = path.join(__dirname, 'output/default.1x.css');
        var outputText = px2remIns.generateThree(srcText, 1);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });

    it('should output right @2x file', function() {
        var outputPath = path.join(__dirname, 'output/default.2x.css');
        var outputText = px2remIns.generateThree(srcText, 2);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });

    it('should output right @3x file', function() {
        var outputPath = path.join(__dirname, 'output/default.3x.css');
        var outputText = px2remIns.generateThree(srcText, 3);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });
});

describe('px2rem should work with @3x origin css file', function() {
    var px2remIns = new Px2rem({remUnit: 112.5, baseDpr: 3});
    var srcPath = path.join(__dirname, 'assets/test.3x.css');
    var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});

    it('[default] should output right rem file', function() {
        var outputPath = path.join(__dirname, 'output/default.rem.css');
        var outputText = px2remIns.generateRem(srcText);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });

    it('should output right @1x file', function() {
        var outputPath = path.join(__dirname, 'output/default.1x.css');
        var outputText = px2remIns.generateThree(srcText, 1);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });

    it('should output right @2x file', function() {
        var outputPath = path.join(__dirname, 'output/default.2x.css');
        var outputText = px2remIns.generateThree(srcText, 2);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });

    it('should output right @3x file', function() {
        var outputPath = path.join(__dirname, 'output/default.3x.css');
        var outputText = px2remIns.generateThree(srcText, 3);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });
});


describe('px2rem should should not transform specified properties', function() {
    var px2remIns = new Px2rem({
        noTransformProperties: [
            'border',
            'border-width',
            'border-top-width',
            'border-right-width',
            'border-bottom-width',
            'border-left-width',
            'font',
            'font-size',
            'border-radius',
            '-webkit-box-shadow',
            '-moz-box-shadow',
            'box-shadow'
        ]
    });
    var srcPath = path.join(__dirname, 'assets/no-transform.css');
    var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});

    it('[default] should output right rem file', function() {
        var outputPath = path.join(__dirname, 'output/no-transform.rem.css');
        var outputText = px2remIns.generateRem(srcText);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });

    it('[default] should output right @1x px file', function() {
        var outputPath = path.join(__dirname, 'output/no-transform.px.css');
        var outputText = px2remIns.generateThree(srcText, 1);
        assert.equal(cssmin(outputText), cssmin(fs.readFileSync(outputPath, {encoding: 'utf8'})));
    });
});
