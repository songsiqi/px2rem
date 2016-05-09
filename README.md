# px2rem

According to one stylesheet, generate rem version and @1x, @2x and @3x stylesheet.

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

[npm-image]: https://img.shields.io/npm/v/px2rem.svg?style=flat-square
[npm-url]: https://npmjs.org/package/px2rem
[travis-image]: https://img.shields.io/travis/songsiqi/px2rem.svg?style=flat-square
[travis-url]: https://travis-ci.org/songsiqi/px2rem
[coveralls-image]: https://img.shields.io/coveralls/songsiqi/px2rem.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/songsiqi/px2rem
[downloads-image]: http://img.shields.io/npm/dm/px2rem.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/px2rem

This set of tools contains:

* a CLI tool
* [gulp plugin](https://www.npmjs.com/package/gulp-px3rem)
* [webpack loader](https://www.npmjs.com/package/px2rem-loader)
* [postcss plugin](https://www.npmjs.com/package/postcss-px2rem)

## Usage

The raw stylesheet only contains @2x style, and if you

* don't intend to transform the original value, eg: 1px border, add `/*no*/` after the declaration
* intend to use px by force，eg: font-size, add `/*px*/` after the declaration

**Attention: Dealing with SASS or LESS, only `/*...*/` comment can be used, in order to have the comments persisted**

### CLI tool

```
$ npm install -g px2rem
```
```
$ px2rem -o build src/*.css
```

```
  Usage: px2rem [options] <file...>

  Options:

    -h, --help                      output usage information
    -V, --version                   output the version number
    -u, --remUnit [value]           set `rem` unit value (default: 75)
    -x, --threeVersion [value]      whether to generate @1x, @2x and @3x version stylesheet (default: false)
    -r, --remVersion [value]        whether to generate rem version stylesheet (default: true)
    -b, --baseDpr [value]           set base device pixel ratio (default: 2)
    -p, --remPrecision [value]      set rem value precision (default: 6)
    -o, --output [path]             the output file dirname
```

### API

```
var Px2rem = require('px2rem');
var px2remIns = new Px2rem([config]);
var originCssText = '...';
var dpr = 2;
var newCssText = px2remIns.generateRem(originCssText); // generate rem version stylesheet
var newCssText = px2remIns.generateThree(originCssText, dpr); // generate @1x, @2x and @3x version stylesheet
```

### Example

#### Pre processing:

One raw stylesheet: `test.css`

```
.selector {
    width: 150px;
    height: 64px; /*px*/
    font-size: 28px; /*px*/
    border: 1px solid #ddd; /*no*/
}
```

#### After processing:

Rem version: `test.debug.css`

```
.selector {
    width: 2rem;
    border: 1px solid #ddd;
}
[data-dpr="1"] .selector {
    height: 32px;
    font-size: 14px;
}
[data-dpr="2"] .selector {
    height: 64px;
    font-size: 28px;
}
[data-dpr="3"] .selector {
    height: 96px;
    font-size: 42px;
}
```

@1x version: `test1x.debug.css`

```
.selector {
    width: 75px;
    height: 32px;
    font-size: 14px;
    border: 1px solid #ddd;
}
```

@2x version: `test2x.debug.css`

```
.selector {
    width: 150px;
    height: 64px;
    font-size: 28px;
    border: 1px solid #ddd;
}
```

@3x version: `test3x.debug.css`

```
.selector {
    width: 225px;
    height: 96px;
    font-size: 42px;
    border: 1px solid #ddd;
}
```

## Technical proposal

comment hook + css parser

## Change Log

### 0.5.0

* Support Animation keyframes (no `/*px*/` comment).

### 0.4.2

* The generated [data-dpr] rules follow the origin rule, no longer placed at the end of the whole style sheet.
* Optimize 0px, do not generate 3 [data-dpr] rules.

### 0.3.1

* Change default remUnit to 75.
* Delete comment config.
* Don't generate @1x, @2x and @3x version stylesheet by default.

### 0.2.2

* Support media query.

### 0.1.8

* Fix cli option duplication bug.
* Fix regular expression bug.
* Fix common comments bug which affects rem transformation.

## License

MIT
