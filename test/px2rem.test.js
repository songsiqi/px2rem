'use strict';

var assert = require('assert');
var Px2rem = require('../lib/px2rem');
var path = require('path');
var fs = require('fs');

describe('should work with @2x origin css file', function () {
  var px2remIns = new Px2rem(/*{remUnit: 75, baseDpr: 2}*/);
  var srcPath = path.join(__dirname, 'assets/test.2x.css');
  var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});

  it('[default] should output right rem file', function () {
    var expectedPath = path.join(__dirname, 'output/default.rem.css');
    var outputText = px2remIns.generateRem(srcText);
    assert.equal(outputText, fs.readFileSync(expectedPath, {encoding: 'utf8'}));
  });

  it('should output right @1x file', function () {
    var expectedPath = path.join(__dirname, 'output/default.1x.css');
    var outputText = px2remIns.generateThree(srcText, 1);
    assert.equal(outputText, fs.readFileSync(expectedPath, {encoding: 'utf8'}));
  });

  it('should output right @2x file', function () {
    var expectedPath = path.join(__dirname, 'output/default.2x.css');
    var outputText = px2remIns.generateThree(srcText, 2);
    assert.equal(outputText, fs.readFileSync(expectedPath, {encoding: 'utf8'}));
  });

  it('should output right @3x file', function () {
    var expectedPath = path.join(__dirname, 'output/default.3x.css');
    var outputText = px2remIns.generateThree(srcText, 3);
    assert.equal(outputText, fs.readFileSync(expectedPath, {encoding: 'utf8'}));
  });
});

describe('should work with @3x origin css file', function () {
  var px2remIns = new Px2rem({remUnit: 112.5, baseDpr: 3});
  var srcPath = path.join(__dirname, 'assets/test.3x.css');
  var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});

  it('[default] should output right rem file', function () {
    var expectedPath = path.join(__dirname, 'output/default.rem.css');
    var outputText = px2remIns.generateRem(srcText);
    assert.equal(outputText, fs.readFileSync(expectedPath, {encoding: 'utf8'}));
  });

  it('should output right @1x file', function () {
    var expectedPath = path.join(__dirname, 'output/default.1x.css');
    var outputText = px2remIns.generateThree(srcText, 1);
    assert.equal(outputText, fs.readFileSync(expectedPath, {encoding: 'utf8'}));
  });

  it('should output right @2x file', function () {
    var expectedPath = path.join(__dirname, 'output/default.2x.css');
    var outputText = px2remIns.generateThree(srcText, 2);
    assert.equal(outputText, fs.readFileSync(expectedPath, {encoding: 'utf8'}));
  });

  it('should output right @3x file', function () {
    var expectedPath = path.join(__dirname, 'output/default.3x.css');
    var outputText = px2remIns.generateThree(srcText, 3);
    assert.equal(outputText, fs.readFileSync(expectedPath, {encoding: 'utf8'}));
  });
});

describe('Px2rem.prototype._getCalcValue rem', function () {
  var px2remIns = new Px2rem({remUnit: 100});
  it('normal number px', function () {
    var outputText = px2remIns._getCalcValue('rem', '10px 20px')
    assert.equal('0.1rem 0.2rem', outputText)
  })

  it('float number px', function () {
    var outputText = px2remIns._getCalcValue('rem', '0.5px solid #000')
    assert.equal('0.005rem solid #000', outputText)
    var outputText2 = px2remIns._getCalcValue('rem', '0.5px 11.5px')
    assert.equal('0.005rem 0.115rem', outputText2)
  })

  it('float number px ignore first zero', function () {
    var outputText =  px2remIns._getCalcValue('rem', '.5px solid #000')
    assert.equal('0.005rem solid #000', outputText)

    var outputText2 = px2remIns._getCalcValue('rem', ' .5px solid #000')
    assert.equal(' 0.005rem solid #000', outputText2)

    var outputText3 = px2remIns._getCalcValue('rem', 'solid .5px #000')
    assert.equal('solid 0.005rem #000', outputText3)

    var outputText4 = px2remIns._getCalcValue('rem', 'solid #000 .5px')
    assert.equal('solid #000 0.005rem', outputText4)
  })
});
