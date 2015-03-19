var css = require('css'); // https://www.npmjs.com/package/css
var extend = require('extend');
var _ = require('underscore');


var defaultConfig = {
    baseDpr: 2,             // 基准devicePixelRatio，默认为2
    remUnit: 64,            // rem基准像素，默认为64
    remPrecision: 6,        // rem计算精度，默认为6，即保留小数点后6位
    forcePxComment: 'px',   // 不转换为rem的注释，默认为"px"
    keepComment: 'no'       // 不参与转换的注释，默认为"no"，如1px的边框
};


function Px2rem(options) {
    var self = this;
    self.config = {};
    extend(self.config, defaultConfig, options);
}

// 生成3份版本
Px2rem.prototype.generateThree = function(cssText, dpr) {
    var self = this;
    var config = self.config;
    var astObj = css.parse(cssText);
    astObj.stylesheet.rules.forEach(function(rule) {
        if (rule.type !== 'rule') {
            return;
        }
        rule.declarations.forEach(function(declaration, i) {
            // 需要转换：样式规则声明 && 含有px
            if (declaration.type === 'declaration' && /px/.test(declaration.value)) {
                var nextDeclaration = rule.declarations[i + 1];
                if (nextDeclaration && nextDeclaration.type === 'comment') { // 下一条规则是注释
                    if (nextDeclaration.comment.trim() === config.keepComment) { // 不用转换标记
                        nextDeclaration.toDelete = true;
                        return;
                    }
                    if (nextDeclaration.comment.trim() === config.forcePxComment) { // 强制使用px
                        nextDeclaration.toDelete = true;
                    }
                } else { // 普通转换
                    declaration.value = self._getCalcValue('px', declaration.value, dpr);
                }
            }
        });
    });
    self._deleteNouseRules(astObj);
    var newCssText = css.stringify(astObj);
    return newCssText;
};

// 生成rem版本
Px2rem.prototype.generateRem = function(cssText) {
    var self = this;
    var config = self.config;
    var astObj = css.parse(cssText);
    var newRulesList = [];
    astObj.stylesheet.rules.forEach(function(rule) {
        if (rule.type !== 'rule') {
            return;
        }
        // 生成3份带[data-dpr]前缀的选择器，供强制用px的使用
        var newRules = [];
        for (var dpr = 1; dpr <= 3; dpr++) {
            var newRule = {};
            newRule.type = rule.type;
            newRule.selectors = [];
            rule.selectors.forEach(function(sel) {
                newRule.selectors.push('[data-dpr="' + dpr + '"] ' + sel);
            });
            newRule.declarations = [];
            newRules.push(newRule);
        }

        rule.declarations.forEach(function(declaration, i) {
            // 需要转换：样式规则声明 && 含有px
            if (declaration.type === 'declaration' && /px/.test(declaration.value)) {
                var nextDeclaration = rule.declarations[i + 1];
                if (nextDeclaration && nextDeclaration.type === 'comment') { // 下一条规则是注释
                    if (nextDeclaration.comment.trim() === config.forcePxComment) { // 强制使用px，不转换为rem
                        for (var dpr = 1; dpr <= 3; dpr++) { // 生成3份
                            var newDeclaration = {};
                            extend(true, newDeclaration, declaration);
                            newDeclaration.value = self._getCalcValue('px', newDeclaration.value, dpr);
                            newRules[dpr - 1].declarations.push(newDeclaration);
                        }
                        declaration.toDelete = true;
                        nextDeclaration.toDelete = true;
                    }
                    if (nextDeclaration.comment.trim() === config.keepComment) { // 不参与转换
                        nextDeclaration.toDelete = true;
                        return;
                    }
                } else { // 普通转换
                    declaration.value = self._getCalcValue('rem', declaration.value);
                }
            }
        });

        if (newRules[0].declarations.length) {
            newRules.forEach(function(rule) {
                newRulesList.push(rule);
            });
        }
    });

    // 在原样式表尾部追加新的强制使用px的样式规则
    newRulesList.forEach(function(rule) {
        astObj.stylesheet.rules.push(rule);
    });

    self._deleteNouseRules(astObj);
    var newCssText = css.stringify(astObj);
    return newCssText;
};

// 删除ast树中需要删除的内容，包括强制使用px的样式规则、标记注释
Px2rem.prototype._deleteNouseRules = function(astObj) {
    astObj.stylesheet.rules.forEach(function(rule) {
        if (rule.type !== 'rule') {
            return;
        }
        rule.declarations.forEach(function(declaration, i) {
            if (declaration.toDelete) {
                rule.declarations[i] = undefined;
            }
        });
    });
    astObj.stylesheet.rules.forEach(function(rule) {
        if (rule.type !== 'rule') {
            return;
        }
        rule.declarations = _.compact(rule.declarations);
    });
};

// 获取px或rem的计算值
Px2rem.prototype._getCalcValue = function(type, value, dpr) {
    var self = this;
    var config = self.config;
    var ret;
    switch (type) {
        case 'px':
            ret = value.replace(/(\d+)px/gi, function($0, $1) {
                var newSize = parseInt($1 * dpr / config.baseDpr);
                // var oldSize = $1;
                // var newSize = parseInt($1 * dpr / config.baseDpr);
                // if (oldSize == 1 && !newSize) { // FIXME: 在没写/*no*/的时候对1px像素处理
                //     newSize = 1;
                // }
                return newSize + 'px';
            });
            break;
        case 'rem':
        default:
            ret = value.replace(/(\d+)px/gi, function($0, $1) {
                var remValue = $1 / config.remUnit;
                if (parseInt(remValue) != remValue) { // 对小数控制精度
                    remValue = parseFloat(remValue.toFixed(config.remPrecision));
                }
                return remValue + 'rem';
            });
            break;
    }
    return ret;
};

module.exports = Px2rem;
