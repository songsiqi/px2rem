'use strict';

var assert = require('assert');
var Px2rem = require('../lib/px2rem');
var path = require('path');
var fs = require('fs');

var remResetCfg = require('./assets/test.remReset.cfg.js');

describe('should work with test rem reset css origin file', function () {
  var px2remIns = new Px2rem({
    remResetMeidas: remResetCfg.remResetMeidas,
    remResetPropertys: remResetCfg.remResetPropertys,
  });

  var srcPath = path.join(__dirname, 'assets/test.remReset.css');
  var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});

  it('[default] should output right rem reset file', function () {
    var expectedPath = path.join(__dirname, 'output/default.remReset.css');
    var outputText = px2remIns.generateRem(srcText);
    assert.equal(outputText, fs.readFileSync(expectedPath, {encoding: 'utf8'}));
  });
});
