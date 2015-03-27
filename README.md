# px2rem

According to one stylesheet, generate rem version and @1x, @2x and @3x stylesheet.

This node module contains:

* a CLI tool
* [gulp plugin](https://www.npmjs.com/package/gulp-px3rem)

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
    -u, --remUnit [value]           set `rem` unit value (default: 64)
    -x, --threeVersion [value]      whether to generate @1x, @2x and @3x version stylesheet (default: true)
    -r, --remVersion [value]        whether to generate rem version stylesheet (default: true)
    -b, --baseDpr [value]           set base device pixel ratio (default: 2)
    -p, --remPrecision [value]      set rem value precision (default: 2)
    -f, --forcePxComment [value]    set force px comment (default: `px`)
    -p, --keepComment [value]       set no transform value comment (default: `no`)
    -o, --output [path]             the output file dirname
```

### API

```
var Px2rem = require('px2rem');
var px2remIns = new Px2rem([config]);
var originCssText = '...';
var dpr = 2;
var newCssText = px2remIns.generateThree(originCssText, dpr); // generate @1x, @2x and @3x version stylesheet
var newCssText = px2remIns.generateRem(originCssText); // generate rem version stylesheet
```

### Example

#### Pre processing:

One raw stylesheet: `test.css`

```
.selector {
    width: 128px;
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
    width: 64px;
    height: 32px;
    font-size: 14px;
    border: 1px solid #ddd;
}
```

@2x version: `test2x.debug.css`

```
.selector {
    width: 128px;
    height: 64px;
    font-size: 28px;
    border: 1px solid #ddd;
}
```

@3x version: `test3x.debug.css`

```
.selector {
    width: 192px;
    height: 96px;
    font-size: 42px;
    border: 1px solid #ddd;
}
```

## Technical proposal

comment hook + css parser

TODO:

* Support Media Query && Animation的keyframes

## License

MIT
