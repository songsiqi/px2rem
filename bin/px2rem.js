#!/usr/bin/env node

var program = require('commander');
var pkg = require('../package.json');
var Px2rem = require('../index');
var chalk = require('chalk');
var path = require('path');
var fs = require('fs-extra');


// 字符串转换为合适的类型（thanks to zepto）
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

// 保存文件内容
function saveFile(filePath, content) {
    fs.createFileSync(filePath);
    fs.writeFileSync(filePath, content, {encoding: 'utf8'});
    console.log(chalk.green.bold('[Success]: ') + filePath);
}


program.version(pkg.version)
    .option('-u, --remUnit [value]', 'set `rem` unit value (default: 64)', 64)
    .option('-x, --threeVersion [value]', 'whether to generate 3x version (default: true)', true)
    .option('-r, --remVersion [value]', 'whether to generate rem version (default: true)', true)
    .option('-b, --baseDpr [value]', 'set base device pixel ratio (default: 2)', 2)
    .option('-p, --remPrecision [value]', 'set rem precision (default: 2)', 6)
    .option('-f, --forcePxComment [value]', 'set force px comment (default: `px`)', 'px')
    .option('-p, --keepComment [value]', 'set not change value comment (default: `no`)', 'no')
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
    forcePxComment: deserializeValue(program.forcePxComment),
    keepComment: deserializeValue(program.keepComment)
};

var px2remIns = new Px2rem(config);

program.args.forEach(function(filePath) {

    if (path.extname(filePath) !== '.css') {
        return;
    }

    var cssText = fs.readFileSync(filePath, {encoding: 'utf8'});
    var outputPath = program.output || path.dirname(filePath);
    var fileName = path.basename(filePath);

    // 生成3份版本
    if (config.threeVersion) {
        for (var dpr = 1; dpr <= 3; dpr++) {
            var newCssText = px2remIns.generateThree(cssText, dpr);
            var newFileName = fileName.replace(/(.debug)?.css/, dpr + 'x.debug.css');
            var newFilepath = path.join(outputPath, newFileName);
            saveFile(newFilepath, newCssText);
        }
    }

    // 生成rem版本
    if (config.remVersion) {
        var newCssText = px2remIns.generateRem(cssText);
        var newFileName = fileName.replace(/(.debug)?.css/, '.debug.css');
        var newFilepath = path.join(outputPath, newFileName);
        saveFile(newFilepath, newCssText);
    }
});
