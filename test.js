'use strict';

var Px2rpx = require('./lib/px2rpx');
var path = require('path');
var fs = require('fs');

  var px2rpxIns = new Px2rpx({rpxUnit: 1});
  var srcPath = path.join(__dirname, 'test/assets/test.2x.css');
  var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});

    var outputText = px2rpxIns.generaterpx(srcText);

  // it('should output right @1x file', function () {
  //   var expectedPath = path.join(__dirname, 'output/default.1x.css');
  //   var outputText = px2rpxIns.generateThree(srcText, 1);
  //   assert.equal(outputText, fs.readFileSync(expectedPath, {encoding: 'utf8'}));
  // });

  // it('should output right @2x file', function () {
  //   var expectedPath = path.join(__dirname, 'output/default.2x.css');
  //   var outputText = px2rpxIns.generateThree(srcText, 2);
  //   assert.equal(outputText, fs.readFileSync(expectedPath, {encoding: 'utf8'}));
  // });

  // it('should output right @3x file', function () {
  //   var expectedPath = path.join(__dirname, 'output/default.3x.css');
  //   var outputText = px2rpxIns.generateThree(srcText, 3);
  //   assert.equal(outputText, fs.readFileSync(expectedPath, {encoding: 'utf8'}));
  // });
