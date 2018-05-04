/*
  一定范围内（media query），将以 rem 为单位的特定属性，还原回原始值。
  常用于为宽度小于制定设计稿的手机，还原 font-size 与 line-height，提供更好的阅读体验。

  TODO:
  1. 支持配置多个 remHackMeida，即：remHackMeidas
  2. 补充测试代码
*/

var assert = require('assert');
var Px2rem = require('../lib/px2rem');
var path = require('path');
var fs = require('fs');

var px2remIns = new Px2rem({
  remHackMeida: {
    enabled: true,
    propertys: ['font-size', 'line-height'],
    media: 'screen and (max-width: 374px)'
  }
});

var srcPath = path.join(__dirname, 'assets/test.remHackMedia.css');
var srcText = fs.readFileSync(srcPath, {encoding: 'utf8'});
var outputText = px2remIns.generateRem(srcText);

console.log(outputText);
