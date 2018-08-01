#!/usr/bin/env node

var program = require('commander');
var pkg = require('../package.json');
var Px2rem = require('../index');
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
  .option('-u, --remUnit [value]', 'set `rem` unit value (default: 75)', 75)
  .option('-x, --threeVersion [value]', 'whether to generate @1x, @2x and @3x version stylesheet (default: false)', false)
  .option('-r, --remVersion [value]', 'whether to generate rem version stylesheet (default: true)', true)
  .option('-b, --baseDpr [value]', 'set base device pixel ratio (default: 2)', 2)
  .option('-p, --remPrecision [value]', 'set rem value precision (default: 6)', 6)
  .option('-m, --remResetCfg [path]', 'rem reset config', '')
  .option('-o, --output [path]', 'the output file dirname')
  .parse(process.argv);

if (!program.args.length) {
  console.log(chalk.yellow.bold('[Info]: ') + 'No files to process!');
  return false;
}

var config = {
  remUnit: deserializeValue(program.remUnit),
  threeVersion: deserializeValue(program.threeVersion),
  remVersion: deserializeValue(program.remVersion),
  baseDpr: deserializeValue(program.baseDpr),
  remPrecision: deserializeValue(program.remPrecision),
  remResetMeidas: [],
  remResetPropertys: []
};

if (deserializeValue(program.remResetCfg)) {
  var remResetCfg = require(path.resolve(process.cwd(), program.remResetCfg));
  config.remResetMeidas = remResetCfg.remResetMeidas;
  config.remResetPropertys = remResetCfg.remResetPropertys;
}

var px2remIns = new Px2rem(config);

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
      var newCssText = px2remIns.generateThree(cssText, dpr);
      var newFileName = fileName.replace(/(.debug)?.css/, dpr + 'x.debug.css');
      var newFilepath = path.join(outputPath, newFileName);
      saveFile(newFilepath, newCssText);
    }
  }

  // generate rem version stylesheet
  if (config.remVersion) {
    var newCssText = px2remIns.generateRem(cssText);
    var newFileName = fileName.replace(/(.debug)?.css/, '.debug.css');
    var newFilepath = path.join(outputPath, newFileName);
    saveFile(newFilepath, newCssText);
  }
});
