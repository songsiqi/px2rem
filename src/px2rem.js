var css = require('css');
var extend = require('extend');
var _ = require('underscore');


var defaultConfig = {
    baseDpr: 2,             // base device pixel ratio (default: 2)
    remUnit: 64,            // rem unit value (default: 64)
    remPrecision: 6,        // rem value precision (default: 6)
    forcePxComment: 'px',   // force px comment (default: `px`)
    keepComment: 'no'       // no transform value comment (default: `no`)
};


function Px2rem(options) {
    var self = this;
    self.config = {};
    extend(self.config, defaultConfig, options);
}

// generate @1x, @2x and @3x version stylesheet
Px2rem.prototype.generateThree = function(cssText, dpr) {
    dpr = dpr || 2;
    var self = this;
    var config = self.config;
    var astObj = css.parse(cssText);
    astObj.stylesheet.rules.forEach(function(rule) {
        if (rule.type !== 'rule') {
            return;
        }
        rule.declarations.forEach(function(declaration, i) {
            // need transform: declaration && commented 'px'
            if (declaration.type === 'declaration' && /px/.test(declaration.value)) {
                var nextDeclaration = rule.declarations[i + 1];
                if (nextDeclaration && nextDeclaration.type === 'comment') { // next next declaration is comment
                    if (nextDeclaration.comment.trim() === config.keepComment) { // no transform
                        nextDeclaration.toDelete = true;
                        return;
                    }
                    if (nextDeclaration.comment.trim() === config.forcePxComment) { // force px
                        nextDeclaration.toDelete = true;
                    }
                }
                declaration.value = self._getCalcValue('px', declaration.value, dpr); // common transform
            }
        });
    });
    self._deleteNouseRules(astObj);
    var newCssText = css.stringify(astObj);
    return newCssText;
};

// generate rem version stylesheet
Px2rem.prototype.generateRem = function(cssText) {
    var self = this;
    var config = self.config;
    var astObj = css.parse(cssText);
    var newRulesList = [];
    astObj.stylesheet.rules.forEach(function(rule) {
        if (rule.type !== 'rule') {
            return;
        }
        // generate 3 new rules which has [data-dpr]
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
            // need transform: declaration && commented 'px'
            if (declaration.type === 'declaration' && /px/.test(declaration.value)) {
                var nextDeclaration = rule.declarations[i + 1];
                if (nextDeclaration && nextDeclaration.type === 'comment') { // next next declaration is comment
                    if (nextDeclaration.comment.trim() === config.forcePxComment) { // force px
                        // generate 3 new declarations and put them in the new rules which has [data-dpr]
                        for (var dpr = 1; dpr <= 3; dpr++) {
                            var newDeclaration = {};
                            extend(true, newDeclaration, declaration);
                            newDeclaration.value = self._getCalcValue('px', newDeclaration.value, dpr);
                            newRules[dpr - 1].declarations.push(newDeclaration);
                        }
                        declaration.toDelete = true;
                        nextDeclaration.toDelete = true;
                    }
                    if (nextDeclaration.comment.trim() === config.keepComment) { // no transform
                        nextDeclaration.toDelete = true;
                        return;
                    }
                } else {
                    declaration.value = self._getCalcValue('rem', declaration.value); // common transform
                }
            }
        });

        if (newRules[0].declarations.length) {
            newRules.forEach(function(rule) {
                newRulesList.push(rule);
            });
        }
    });

    // append the declarations which are forced to use px in the end of origin stylesheet
    newRulesList.forEach(function(rule) {
        astObj.stylesheet.rules.push(rule);
    });

    self._deleteNouseRules(astObj);
    var newCssText = css.stringify(astObj);
    return newCssText;
};

// delete no use info in ast tree
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

// get calculated value of px or rem
Px2rem.prototype._getCalcValue = function(type, value, dpr) {
    var self = this;
    var config = self.config;
    var ret;
    switch (type) {
        case 'px':
            ret = value.replace(/(\d+)px/gi, function($0, $1) {
                var newSize = parseInt($1 * dpr / config.baseDpr);
                return newSize + 'px';
            });
            break;
        case 'rem':
        default:
            ret = value.replace(/(\d+)px/gi, function($0, $1) {
                var remValue = $1 / config.remUnit;
                if (parseInt(remValue) != remValue) { // control decimal precision
                    remValue = parseFloat(remValue.toFixed(config.remPrecision));
                }
                return remValue + 'rem';
            });
            break;
    }
    return ret;
};

module.exports = Px2rem;
