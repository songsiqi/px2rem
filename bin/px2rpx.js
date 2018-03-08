#!/usr/bin/env node

var program = require('commander');
var pkg = require('../package.json');
var Px2rpx = require('../index');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs-extra');


// string to variables of proper type（thanks to zepto）
function deserializeValue(value) {
  var num;
  try {
    return value ?
      value == "true" || value == true ||
      (value == "false" || value == false ? false :
        value == "null" ? null :
        !/^0/.test(value) && !isNaN(num = Number(value)) ? num :
        /^[\[\{]/.test(value) ? JSON.parse(value) :
        value)
      : value;
  } catch (e) {
    return value;
  }
}

function saveFile(filePath, content) {
  fs.createFileSync(filePath);
  fs.writeFileSync(filePath, content, {encoding: 'utf8'});
  console.log(chalk.green.bold('[Success]: ') + filePath);
}


program.version(pkg.version)
  .option('-u, --rpxUnit [value]', 'set `rpx` unit value (default: 75)', 75)
  .option('-x, --threeVersion [value]', 'whether to generate @1x, @2x and @3x version stylesheet (default: false)', false)
  .option('-r, --rpxVersion [value]', 'whether to generate rpx version stylesheet (default: true)', true)
  .option('-b, --baseDpr [value]', 'set base device pixel ratio (default: 2)', 2)
  .option('-p, --rpxPrecision [value]', 'set rpx value precision (default: 6)', 6)
  .option('-o, --output [path]', 'the output file dirname')
  .parse(process.argv);

if (!program.args.length) {
  console.log(chalk.yellow.bold('[Info]: ') + 'No files to process!');
  return false;
}

var config = {
  rpxUnit: deserializeValue(program.rpxUnit),
  threeVersion: deserializeValue(program.threeVersion),
  rpxVersion: deserializeValue(program.rpxVersion),
  baseDpr: deserializeValue(program.baseDpr),
  rpxPrecision: deserializeValue(program.rpxPrecision)
};

var px2rpxIns = new Px2rpx(config);

program.args.forEach(function (filePath) {

  if (path.extname(filePath) !== '.css') {
    return;
  }

  var cssText = fs.readFileSync(filePath, {encoding: 'utf8'});
  var outputPath = program.output || path.dirname(filePath);
  var fileName = path.basename(filePath);

  // generate @1x, @2x and @3x version stylesheet
  if (config.threeVersion) {
    for (var dpr = 1; dpr <= 3; dpr++) {
      var newCssText = px2rpxIns.generateThree(cssText, dpr);
      var newFileName = fileName.replace(/(.debug)?.css/, dpr + 'x.debug.css');
      var newFilepath = path.join(outputPath, newFileName);
      saveFile(newFilepath, newCssText);
    }
  }

  // generate rpx version stylesheet
  if (config.rpxVersion) {
    var newCssText = px2rpxIns.generaterpx(cssText);
    var newFileName = fileName.replace(/(.debug)?.css/, '.debug.css');
    var newFilepath = path.join(outputPath, newFileName);
    saveFile(newFilepath, newCssText);
  }
});
