---  
published: true  
layout: post  
title: JavaScript数组用例
date: 2016-05-24  
category: work  
---  

## 创建数组

```
var numbers = [];//长度为0 的空数组,推荐用法
```

 还可以调用Array 的构造函数创建数组：

```
 var numbers = new Array();
 var numbers = new Array(1,2,3,4,5);

 var numbers = new Array(10);//表示创建10长度
 console.log(numbers.length); // 显示10
```

## 由字符串生成数组split

调用字符串对象的split() 方法也可以生成数组。该方法通过一些常见的分隔符，比如分
隔单词的空格，将一个字符串分成几部分，并将每部分作为一个元素保存于一个新建的数
组中。

```
var str = "string"
console.log(str.split(''));//[ 's', 't', 'r', 'i', 'n', 'g' ]
console.log(str);//string原数组不变
```

## 数组的字符串表示

有两个方法可以将数组转化为字符串：join() 和toString()。
这两个方法都返回一个包含数组所有元素的字符串，
各元素之间用逗号分隔开。下面是一些例子：

```
var names = ["David", "Cynthia", "Raymond", "Clayton", "Mike", "Jennifer"];

var namestr = names.join('');//括弧里面表示字符串分隔的方式也可以join(','),etc
console.log(namestr); // DavidCynthiaRaymondClaytonMikeJennifer

namestr = names.toString();
console.log(namestr); // David,Cynthia,Raymond,Clayton,Mike,Jennifer

console.log(names);//[ 'David', 'Cynthia', 'Raymond', 'Clayton', 'Mike', 'Jennifer' ]
```

## 由已有数组创建新数组

concat() 和splice() 方法允许通过已有数组创建新数组。concat 方法可以合并多个数组
创建一个新数组，splice() 方法截取一个数组的子集创建一个新数组。

```
["Mike", "Clayton", "Jennifer"].concat([12,13]);
//输出[ 'Mike', 'Clayton', 'Jennifer', 12, 13 ]
```

```
var names = ["David", "Cynthia", "Raymond", "Clayton", "Mike", "Jennifer"];
console.log(names.splice(0, 2));//[ 'David', 'Cynthia' ]
console.log(names);//[ 'Raymond', 'Clayton', 'Mike', 'Jennifer' ]
```

## 为数组添加删除元素splice
unshift：将参数添加到原数组开头，并返回数组的长度 

shift：删除原数组第一项，并返回删除元素的值；如果数组为空则返回undefined 

```
var nums = [2,3,4,5];
nums.unshift(1);
//[ 1, 2, 3, 4, 5 ]

var nums = [2,3,4,5];
nums.push(6);
//[ 2, 3, 4, 5, 6 ]

// splice(start,deleteCount,val1,val2,...)：
// 从start位置开始删除deleteCount项，并从该位置起插入val1,val2
var names = ["David", "Cynthia", "Raymond", "Clayton"];
console.log(names.splice(0, 0, "Mike"));//[]
console.log(names);//[ 'Mike', 'David', 'Cynthia', 'Raymond', 'Clayton' ]
```

## 迭代器方法


#### 不生成新数组的迭代器方法

forEach()

```
var nums = [4,5,6,7,8,9,10];
nums.forEach(function(num) {
	console.log(num);
});
```

另一个迭代器方法是every()
接受一个返回值为布尔类型的函数，对数组中的每
个元素使用该函数。如果对于所有的元素，该函数均返回true，则该方法返回true。

```
var nums = [4,5,6,7,8,9,10];
var even = nums.every(function(num) {
	return num%2==0;
});
if (even) {
	console.log("all numbers are even");
}
else {
	console.log("not all numbers are even");
}
```

some() 方法也接受一个返回值为布尔类型的函数，只要有一个元素使得该函数返回true，
该方法就返回true

reduce() 方法接受一个函数，返回一个值。该方法会从一个累加值开始，不断对累加值和
数组中的后续元素调用该函数，直到数组中的最后一个元素，最后返回得到的累加值。下
面这个例子展示了如何使用reduce() 方法为数组中的元素求和：

```
var nums = [1,2,3,4,5,6,7,8,9,10];
var sum = nums.reduce(function(runningTotal, currentValue) {
	return runningTotal + currentValue;
});
console.log(sum); // 显示55
```

#### 生成新数组的迭代器方法 

有两个迭代器方法可以产生新数组：map() 和filter()。map() 和forEach() 有点儿像，对
数组中的每个元素使用某个函数。两者的区别是map() 返回一个新的数组，该数组的元素
是对原有元素应用某个函数得到的结果。下面给出一个例子：

```
var grades = [77, 65, 81, 92, 83];
var newgrades = grades.map(function (grade) {
	return grade += 5;
});
console.log(newgrades); // 82, 70, 86, 97, 88
```

下面是对一个字符串数组使用map() 方法的例子：

```
var words = ["for","your","information"];
var acronym = words.map(function (word) {
	return word[0];
});
console.log(acronym.join("")); // 显示"fyi"
```

在上面这个例子中，数组acronym 保存了数组words 中每个元素的第一个字母。然而，如
果想将数组显示为真正的缩略形式，必须想办法除掉连接每个数组元素的逗号，如果直接
调用toString() 方法，就会显示出这个逗号。使用join() 方法，为其传入一个空字符串
作为参数，则可以帮助我们解决这个问题。

filter() 和every() 类似，传入一个返回值为布尔类型的函数。
和every() 方法不同的是，
当对数组中的所有元素应用该函数，结果均为true 时，该方法并不返回true，而是返回
一个新数组，该数组包含应用该函数后结果为true 的元素。下面是一个例子：

```
var grades = [];
for (var i = 0; i < 20; ++i) {
	grades[i] = Math.floor(Math.random() * 101);
}
var passGrades = grades.filter(function (num) {
	return num >= 60;
});
console.log("All grades: );
console.log(grades);
console.log("Passing grades: ");
console.log(passGrades);
```

当然，还可以使用filter() 方法过滤字符串数组，下面这个例子过滤掉了那些不包含
“cie”的单词：

```
var words = ["recieve","deceive","percieve","deceit","concieve"];
var misspelled = words.filter(function (str) {
	if (str.indexOf("cie") > -1) {
			return true;
		}
		return false;
});
print(misspelled); // 显示recieve,percieve,concieve
```








































