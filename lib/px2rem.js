'use strict';

var css = require('css');
var extend = require('extend');

var defaultConfig = {
  baseDpr: 2,             // base device pixel ratio (default: 2)
  remUnit: 75,            // rem unit value (default: 75)
  remPrecision: 6,        // rem value precision (default: 6)
  remResetMeidas: [],     // rem reset medias config
  remResetPropertys: [],  // rem reset propertys
  forcePxComment: 'px',   // force px comment (default: `px`)
  keepComment: 'no'       // no transform value comment (default: `no`)
};

var pxRegExp = /\b(\d+(\.\d+)?)px\b/;

function Px2rem(options) {
  this.config = {};
  extend(this.config, defaultConfig, options);
}

// generate @1x, @2x and @3x version stylesheet
Px2rem.prototype.generateThree = function (cssText, dpr) {
  dpr = dpr || 2;
  var self = this;
  var config = self.config;
  var astObj = css.parse(cssText);

  function processRules(rules) {
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.type === 'media') {
        processRules(rule.rules); // recursive invocation while dealing with media queries
        continue;
      } else if (rule.type === 'keyframes') {
        processRules(rule.keyframes); // recursive invocation while dealing with keyframes
        continue;
      } else if (rule.type !== 'rule' && rule.type !== 'keyframe') {
        continue;
      }

      var declarations = rule.declarations;
      for (var j = 0; j < declarations.length; j++) {
        var declaration = declarations[j];
        // need transform: declaration && has 'px'
        if (declaration.type === 'declaration' && pxRegExp.test(declaration.value)) {
          var nextDeclaration = rule.declarations[j + 1];
          if (nextDeclaration && nextDeclaration.type === 'comment') { // next next declaration is comment
            if (nextDeclaration.comment.trim() === config.keepComment) { // no transform
              declarations.splice(j + 1, 1); // delete corresponding comment
              continue;
            } else if (nextDeclaration.comment.trim() === config.forcePxComment) { // force px
              declarations.splice(j + 1, 1); // delete corresponding comment
            }
          }
          declaration.value = self._getCalcValue('px', declaration.value, dpr); // common transform
        }
      }
    }
  }

  processRules(astObj.stylesheet.rules);

  return css.stringify(astObj);
};

// generate rem version stylesheet
Px2rem.prototype.generateRem = function (cssText) {
  var self = this;
  var config = self.config;
  var astObj = css.parse(cssText);

  function processRules(rules, noDealPx) { // FIXME: keyframes do not support `force px` comment
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (rule.type === 'media') {
        processRules(rule.rules); // recursive invocation while dealing with media queries
        continue;
      } else if (rule.type === 'keyframes') {
        processRules(rule.keyframes, true); // recursive invocation while dealing with keyframes
        continue;
      } else if (rule.type !== 'rule' && rule.type !== 'keyframe') {
        continue;
      }

      if (!noDealPx) {
        // generate 3 new rules which has [data-dpr]
        var newRules = [];
        for (var dpr = 1; dpr <= 3; dpr++) {
          var newRule = {};
          newRule.type = rule.type;
          newRule.selectors = rule.selectors.map(function (sel) {
            return '[data-dpr="' + dpr + '"] ' + sel;
          });
          newRule.declarations = [];
          newRules.push(newRule);
        }
      }

      // get rem reset media handle
      var rsmh = self._getRsmh(rule);

      var declarations = rule.declarations;
      for (var j = 0; j < declarations.length; j++) {
        var declaration = declarations[j];
        // need transform: declaration && has 'px'
        if (declaration.type === 'declaration' && pxRegExp.test(declaration.value)) {
          var nextDeclaration = declarations[j + 1];
          if (nextDeclaration && nextDeclaration.type === 'comment') { // next next declaration is comment
            if (nextDeclaration.comment.trim() === config.forcePxComment) { // force px
              // do not transform `0px`
              if (declaration.value === '0px') {
                declaration.value = '0';
                declarations.splice(j + 1, 1); // delete corresponding comment
                continue;
              }
              if (!noDealPx) {
                // generate 3 new declarations and put them in the new rules which has [data-dpr]
                for (var dpr = 1; dpr <= 3; dpr++) {
                  var newDeclaration = {};
                  extend(true, newDeclaration, declaration);
                  newDeclaration.value = self._getCalcValue('px', newDeclaration.value, dpr);
                  newRules[dpr - 1].declarations.push(newDeclaration);
                }
                declarations.splice(j, 2); // delete this rule and corresponding comment
                j--;
              } else { // FIXME: keyframes do not support `force px` comment
                if (!self._checkRsp(declaration)) {
                  rsmh.addDeclaration(declaration);
                  declaration.value = self._getCalcValue('rem', declaration.value); // common transform
                }
                declarations.splice(j + 1, 1); // delete corresponding comment
              }
            } else if (nextDeclaration.comment.trim() === config.keepComment) { // no transform
              declarations.splice(j + 1, 1); // delete corresponding comment
            } else {
              if (!self._checkRsp(declaration)) {
                rsmh.addDeclaration(declaration);
                declaration.value = self._getCalcValue('rem', declaration.value); // common transform
              }
            }
          } else {
            if (!self._checkRsp(declaration)) {
              rsmh.addDeclaration(declaration);
              declaration.value = self._getCalcValue('rem', declaration.value); // common transform
            }
          }
        }
      }

      // if the origin rule has no declarations, delete it
      if (!rules[i].declarations.length) {
        rules.splice(i, 1);
        i--;
      }

      if (!noDealPx) {
        // add the new rules which contain declarations that are forced to use px
        if (newRules[0].declarations.length) {
          rules.splice(i + 1, 0, newRules[0], newRules[1], newRules[2]);
          i += 3; // skip the added new rules
        }
      }

      // check for each rsmh's media
      rsmh.medias.forEach(function (media) {
        if (media.mSubRule.declarations.length) {
          rules.splice(i + 1, 0, media.mRule);
          i += 1; // skip the added new rules
        }
      })
    }
  }

  processRules(astObj.stylesheet.rules);
  return css.stringify(astObj);
};

// get calculated value of px or rem
Px2rem.prototype._getCalcValue = function (type, value, dpr) {
  var config = this.config;
  var pxGlobalRegExp = new RegExp(pxRegExp.source, 'g');

  function getValue(val) {
    val = parseFloat(val.toFixed(config.remPrecision)); // control decimal precision of the calculated value
    return val == 0 ? val : val + type;
  }

  return value.replace(pxGlobalRegExp, function ($0, $1) {
    return type === 'px' ? getValue($1 * dpr / config.baseDpr) : getValue($1 / config.remUnit);
  });
};

// get rem reset media handle
Px2rem.prototype._getRsmh = function (rule) {
  var config = this.config;
  var result = {
    medias: []
  };

  // generate media rules
  config.remResetMeidas.forEach(function (mediaCfg) {
    var mRule = {};
    var mSubRule = {};

    mRule.type = 'media';
    mRule.media = mediaCfg.media;
    mRule.rules = [];
    mSubRule.type = rule.type;
    mSubRule.selectors = rule.selectors;
    mSubRule.declarations = [];
    mRule.rules.push(mSubRule);

    result.medias.push({
      'mRule': mRule,
      'mSubRule': mSubRule,
      'mSubRulePropertys': mediaCfg.propertys
    });
  })

  // add declaration func for each media
  result.addDeclaration = function (declaration) {
    result.medias.forEach(function (media) {
      var propertys = media.mSubRulePropertys;
      var matched = false;

      for (var i = 0; i < propertys.length; i++) {
        if ((typeof propertys[i] === 'string' && propertys[i] === declaration.property) ||
          (typeof propertys[i] === 'object' && declaration.property.match(propertys[i]))) {
          matched = true;
          break;
        }
      }

      if (!matched) return;

      var mDeclaration = {};
      extend(true, mDeclaration, declaration);
      media.mSubRule.declarations.push(mDeclaration);
    })
  }

  return result;
}

// check for rem reset property
Px2rem.prototype._checkRsp = function (declaration) {
  var config = this.config;
  var matched = false;
  var propertys = config.remResetPropertys;

  for (var i = 0; i < propertys.length; i++) {
    if ((typeof propertys[i] === 'string' && propertys[i] === declaration.property) ||
      (typeof propertys[i] === 'object' && declaration.property.match(propertys[i]))) {
      matched = true;
      break;
    }
  }

  return matched;
}

module.exports = Px2rem;
