---
date: 2023-10-22
category: 
  - 前端
tag: 
  - vue
---

# Vue2

## 简介

一套用于构建用户页面的渐进式JavaScript框架。自底向上逐层的应用。

## watch监听

通过`watch`侦听器，我们可以响应数据的变化。当需要在数据变化时进行一些异步操作，就可以使用`watch`实现。具体实现有两种：

1. `new Vue`时开启`watch`配置项；
2. 通过`vm.$watch('被监听属性'，{配置})`。

### 深度监听

Vue中`watch`默认不能监听对象内部值的变化，只能监听对象的第一层，如果配置项里开启`deep:ture`则可以对对象内部属性进行监听，开启`deep:ture`被称为深度监听。

```js
watch: {
    // 简写方式
    change: function(newVal, oldVal) {
    },
    change： {
        handler(newVal, oldVal) {},
        immediate: true, // 立即执行监听
        deep: true, // 开启深度监听
    }
}
```
