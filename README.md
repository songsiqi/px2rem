# px2rem

根据一份css样式，生成3份尺寸样式和rem样式

## 使用

### 基本使用

在css中只写用2x的尺寸，如果：

* 不想转换，例如1px的边框，在样式规则后面添加注释 `/*no*/`
* 强制使用px，例如字体大小，在样式规则后面添加注释 `/*px*/`

**注意：相应的sass或less文件中的注释钩子只能使用/* */，这样能在编译后的css文件中保留注释。不能使用//**

**建议直接sass、less输出到build目录下，然后运行脚本**

```
var px2rem = require('px2rem');
px2rem('build/*.css', [config]);
```

### 配置参数

```
var config = {
    baseDpr: 2,             // 基准devicePixelRatio，默认为2
    threeVersion: true,     // 是否生成1x、2x、3x版本，默认为true
    remVersion: true,       // 是否生成rem版本，默认为true
    remUnit: 64,            // rem基准像素，默认为64
    remPrecision: 6,        // rem计算精度，默认为6，即保留小数点后6位
    forcePxComment: 'px',   // 不转换为rem的注释，默认为"px"
    keepComment: 'no',      // 不参与转换的注释，默认为"no"，如1px的边框
    deleteOriginFile: true  // 是否删除原css文件，默认删除
};
```

### 效果示例

#### 处理前：

一份样式模板：

```
.selector {
    width: 128px;
    height: 64px; /*px*/
    font-size: 28px; /*px*/
    border: 1px solid #ddd; /*no*/
}
```

#### 处理后：

rem版本：

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

1x版本：

```
.selector {
    width: 64px;
    height: 32px;
    font-size: 14px;
    border: 1px solid #ddd;
}
```

2x版本：

```
.selector {
    width: 128px;
    height: 64px;
    font-size: 28px;
    border: 1px solid #ddd;
}
```

3x版本：

```
.selector {
    width: 192px;
    height: 96px;
    font-size: 42px;
    border: 1px solid #ddd;
}
```

## 实现方案

注释钩子 + css语法树解析

后期优化：

* 支持Media Query和Animation的keyframes
* 命令行版本 + gulp插件
