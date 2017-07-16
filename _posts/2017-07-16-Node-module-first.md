---  
published: true  
layout: post  
title: Node 模块初始化
date: 2017-07-16  
category: work  
---  

## 模块初始化

一个模块中的JS代码仅在模块第一次被使用时执行一次，并在执行过程中初始化模块的导出对象。之后，缓存起来的导出对象被重复利用。

## 主模块

通过命令行参数传递给NodeJS以启动程序的模块被称为主模块。主模块负责调度组成整个程序的其它模块完成工作。例如通过以下命令启动程序时，main.js就是主模块。

```
$ node main.js
```

## 完整示例

例如有以下目录。

```
- /home/user/hello/
    - util/
        counter.js
    main.js
```

其中`counter.js`内容如下：

```
var i = 0;

function count() {
    return ++i;
}

exports.count = count;
```

该模块内部定义了一个私有变量`i`，并在`exports`对象导出了一个公有方法`count`。

主模块`main.js`内容如下：

```
var counter1 = require('./util/counter');
var counter2 = require('./util/counter');

console.log(counter1.count());
console.log(counter2.count());
console.log(counter2.count());
```

运行该程序的结果如下：

```
$ node main.js
1
2
3
```

可以看到，`counter.js`并没有因为被require了两次而初始化两次。

总结起来有以下知识点：

+ NodeJS是一个JS脚本解析器，任何操作系统下安装NodeJS本质上做的事情都是把NodeJS执行程序复制到一个目录，然后保证这个目录在系统PATH环境变量下，以便终端下可以使用`node`命令。

+ NodeJS使用[CMD](http://wiki.commonjs.org/wiki/CommonJS)模块系统，主模块作为程序入口点，所有模块在执行过程中只初始化一次。
