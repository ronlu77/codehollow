---
date: 2023-10-22
category: 
  - 前端
tag: 
  - vue
---

# Vue3

## 响应式原理

``` js
/** vue3 实现响应式原理的伪代码 */
function reactive() 
    return new Proxy(obj, {
        get(target, key) {
            track(target, key)
            return target[key]
        },
        set(target, key, value) {
            target[key] = value
            trigger(target, key)
        }
    })
}
```

`reactive` 声明的对象用 `===` 进行判断时和与原始对象不一样，会返回 `false`;

`reactive`声明的代理对象使用解构赋值会失去响应式；

如果使用新的重新赋值`reactive`声明的响应式对象，新的对象会覆盖原始对象，并且响应式连接丢失。

- `ref` 声明的对象也不能进行解构，否则将会失去响应式，示例如下：

  ```js
  const count = ref(0)
  const newCount = count.vlaue // disconnect reactivity
  const { value: newCount2 } = count // disconnect reactivity
  ```

- 将`ref`声名放在一个不同对象中，解构后保持响应式，示例如下：

  ``` js
  const person = {
      name: ref('ron'),
      age: ref(22),
  }
  const {name, age} = person // still reactive
  ```

### ref 自动解包

  在模板中使用`ref`定义的数据时可以不用使用`.value`，因为Vue提供一种方法`unref()`，该方法可以用来自动解包。即如果参数是一个`ref`则返回其内部的值，否则返回其本身。

  > 默认用 `ref`， 分组用 `reactive`，（分组可理解为归类，避免了重复写一堆 `ref`）

## 组件通信

### `props`

vue3 提供了props来实现*父组件向子组件*传值（只读）。具体实现如下：

```html
<Children :foo="foo" />
```

选项式的实现方式：

``` js
// Children 组件中接收 选项式
export default {
    props: ['foo']
}

export default {
    props: {
        title: String,
    }
}

```

组合式的实现方式：

```vue
// Children 组件中接收 组合式
<script setup>
    const props = defineProps({
        title: String,
        likes: Number,
    })
</script>
```

### 自定义事件

自定义事件实现*子组件向父组件*传参。具体实现如下

``` html
<template>
    <Father @close="handleClose" />
</template>
<sciprt>
 // 选项式实现方式
 export default {
    emits: ['close']
 }
</sciprt>

<script setup>
    // 组合式实现方式
    const props = defineEmits(['close'])
</script>
```

### 全局事件总线

全局事件总线可以实现*任意组件间*的通讯。与Vue2不同的是Vue3中不能直接使用，需要使用外部的事件出发接口的库`mitt`和`tiny-emitter`。实现步骤如下：

1. 安装`mitt` ，`npm install mitt -s`；

2. 在`main.js`中引入，`import mitt from "mitt"`；

3. 进行全局配置：

   ``` js
   const app = CreateApp(App)
   app.mount('#app')
   app.config.globalProperties.mittBus = new mitt()
   ```

4. 在组件中使用：

   ``` js
   import { getCurrentInstance } from 'vue'
   export default {
       setup(props) {
           let $bus = getCurrentInstance().appContext.config.globalProperties.$bus
           $bus.emit("eventDemo", '发布事件')
           $bus.on("eventDemo", "订阅事件")
           $bus.off("eventDemo", "关闭订阅事件")
           return {}
       }
   }
   ```

### `v-model`

`v-model` 在组件上使用可以实现双向绑定，同时可以实现*父子之间*传值。具体实现如下：

```html
<Children v-model="data" />

<!--> 模板编译器会对上述代码进行等价展开 <-->
<Children :modelValue="data" @update:modelValue="newValue => data = newValue" />
```

`v-model` 默认传递的参数值为`modelValue`，可以更改`modelValue`来指定传递的参数，同时Vue支持传递多个`v-model`。

### `useAttrs`

Vue3提供了`useAttrs`方法可以接收到父组件在子组件上的属性和方法。具体实现如下：

``` vue
// 父组件
<template>
 <Children :type="xxx" @close="xxFn"/>
</template>

// 子组件 children
<template>
 // 这里的元素将具有和父组件传递相同的属性和方法
 <div :="attr"></div>
</template>

<script>
import { useAttrs } from 'vue'
const attr = useAttrs()
</script>
```

:bulb: 如果同时使用`props`和`useAttrs`，`useAttrs`将不会获取到`props`接收到的属性。

### `defineExpose()`

使用`<script setup>` 的组件是默认关闭的，不会暴露任何在`<script setup>`中绑定的声明。所以Vue3中提供了`defineExpose`方法对外暴露属性和方法，实现父子组件之间的通信。具体实现如下：

- 实现子组件向父组件传值

``` vue
// Children 组件
<script setup>
import { ref } from 'vue'
const a = ref(1)
defineExpose({
    a
})
</script>

// Father 组件
<script setup>
import { ref } from 'vue'
const son = ref()
// 给父组件的按钮绑定点击事件
function handler() {
    son.value.a -= 10
}
</script>
```

- 实现父组件向子组件传值

```vue
// Children 组件
<script setup>
import { ref } from 'vue'

// 子组件中定义按钮点击事件修改父组件中暴露的属性
function handler($parent) {
    $parent.data -= 10
}
</script>

// Father 组件
<script setup>
import { ref } from 'vue'
const data = ref(100)
defineExpose({
    data
})
</script>
```

### `provide` 与 `inject`

Vue3提供了`provide` 和`inject`方法来实现隔代传值，可修改传递的值。具体实现如下：

```vue
// 父组件
<script setup>
import { ref, provide } from 'vue'
const car = ref('法拉利')
provide('TOKEN', car)
</script>

// 后代组件
<script setup>
import { ref, inject } from 'vue'
const car = inject('TOKEN')
</script>
```

- `provide`

  接收两个参数，第一个参数是要注入的key，可以是字符串或者是一个`symbol`，第二个参数是要注入的值。**`provide`必须在`setup()`阶段同步调用**。

- `inject`

  注入一个由祖先组件或整个应用（`app.provide()`）提供的值。第一个参数是注入的key，Vue会遍历父组件链，通过匹配key来确定所提供的值。如果父组件链上多个组件对用一个key提供了值，那么离的最近的组件将会覆盖链上更远的组件所提供的值。如果没有通过key匹配到值，`inject()`将会返回 `undefined`，除非提供一个默认值；

  第二个参数是可选的，即没有匹配到key时使用的默认值，还可以是一个工厂函数，如果默认值本身是一个函数，必须使用第三个参数传入`false`，表明这个函数就是默认值，而不是一个工厂函数。

### `pinia`

集中式管理状态容器，可以实现*任意组件之间*的通讯。（相当于Vue2中的`vuex`）

```js
// store 文件下 todo.js 组合式API仓库
import { defineStore } from 'pinia'
import { ref } from 'vue'

let useTodoStore = defineStore('todo', () => {
    let arr = ref([1,2])
    // 返回一个对象：属性和 方法可以提供给组件使用
    return {
        arr
    }
})

export default useTodoStore;
```

```js
// 在组件中使用
import { useTodoStore } from '@/store/todo.js'

export default {
    setup() {
        const counter = useTodoStore()
        counter.arr.reduce((pre, next) => {
            return pre + next
        },0)
    }
}
```

优点：

- 轻量级状态管理工具；
- 模块化设计，易于拆分；
- 没有`mutaions`，可以直接在`actions`中操作`state`，通过`this.xxx访问响应的状态`；
- 支持多个`store`；
- `store`的`action`被调度为常规的函数调用，而不是使用`dispatch`方法或者`MapAction`辅助函数；
- 支持Vue devtools、SSR、webpack 代码拆分。

### slot

作用域插槽进行*父子组件间*的传值。

## 自定义指令 Custom Directives

自定义指令主要是为了重用涉及普通元素的底层DOM访问的逻辑。自定义指令实现如下：

``` vue
/** 创建一个自定义指令的实例对象, 让DOM元素自动聚焦 */
<template>
 <el-input v-focus>
</template>
<script setup>
    const vFocus = {
        mounted: (el, binding) => el.focus()
    }
</script>
```

``` js
// 在没有使用<script setup>情况下，需要使用 directives选项注册
export default {
    setup() {},
    directives: {
        focus: {}
    }
}

// 全局注册自定义指令
// main.js 
import permission from 'xxxx';

Vue.directive('permission', permission)
```

> 只有当所需功能只能通过直接操作DOM来实现时，才应该使用该自定义指令。其他情况下应该尽可能使用`v-bind`这样的内置指令来声明式的使用模板，这样更加高效，也对**服务端渲染**更友好。

### 指令钩子

- `created`，在事件监听器应用前调用；
- `beforeMount`，在元素被插入DOM前调用；
- `mouted`，在绑定元素的父组件或他自己的所有子组件都挂载完成后调用；
- `beforeUpdate`，绑定元素父组件更新前调用；
- `updated`，在绑定元素父组件及其所有子组件更新结束后调用；
- `beforeUnmount`，绑定元素父组件卸载前调用；
- `unmounted`，绑定元素父组件卸载后调用。

### 钩子参数

- `el`，指定绑定的元素。可以用于直接操作DOM；
- `binding`，一个对象包含一下属性：
  - `value`，传递给指令的值；
  - `oldValue`，之前的值，仅在`beforeUpdate`和`update`中可用。无论是否更改，它都可用；
  - `arg`，传递给指令的参数。:chestnut:`v-my-directive:foo` 中，传递的参数是`foo`；
  - `modifiers`，一个包含修饰符的对象。:chestnut: `v-my-directive.bar` 中，修饰对象`{bar: true}`；
  - `instance`，使用该指令的组件实例；
  - `dir`，指令的定义对象。

## 组件

### 透传

在Vue3中组件的根组件会继承组件身上所用的`class`，`v-bind`属性，`v-on`事件..这种现象被称为**"透传"**。be like：

```vue
<Mybutton class="btn" @click="handleBtnClick" />
```

```vue
<!--封装的组件Mybutton, 这里的Mybutton的根组件button将会继承Mybutton身上的 attributes -->
<template>
    <button></button>
</template>
```

想要**禁用透传**行为，可以在组件选项中设置`inheritAttrs: false`，如果是在`setup`组合式API中可以通过在`defineOptions`中定义`inheritAttrs: false`。

如果组件存在多个根组件，那么在发送透传的时候会报错。我们可以通过Vue3提供的特殊变量`$attrs`和禁用默认透传行为，来**显示声明哪一个根组件需要进行透传**（`$attrs`是一个包含所有透传属性的对象）。

:star: `$attrs`变量在模板里可以直接获取。

```vue
<template>
    <button v-bind="$attrs"></button>
    <div></div>
</template>
```

:star: <u>没有参数的</u>的`v-bind`会将对象的所有属性作为attribute绑定到元素上。

使用`$attrs`存在几个特殊的情况：

1. 如果组件的`v-bind`属性和`v-on`侦听函数被相应的`props`\\`emits`接收，那么，被接收的attributes将不会出现在`$attrs`透传对象中；
2. 虽然`$attrs`总是获取最新的属性对象，但是它并不是响应式的，所以不能使用侦听器来判断属性的变化。需要使用侦听器可以通过`prop`或`onUpdated`结合最新的`$attrs`来实现；
3. 组合式API中的`js`中可以通过`useAttr()`方法来获取透传对象，选项式里可以通过上下文中的`attrs`属性来访问。

## 内置特殊组件

### component

一个用于渲染动态组件或元素的 “原组件”。

#### 使用方法

实际需要渲染的组件通过`is` prop决定，当`is`是字符串，它既可以是HTML标签名也可以是组件的注册名，或者直接绑定到组件的定义。例如：

```vue
<script>
    export default {
        data(): {
            return {
                type:''
            }
        }
    }
</script>

<template>
<component :is="type"></component>
</template>
```

#### **注意事项**

使用组合式API可以无需注册组件，只要将组件本身传递给`is`即可；

如果在`<component>`上使用`v-model`，模板编译器将会将其拓展为`modelValue`prop和`update:modelValue`事件监听器，和其他任意组件一样。但是，这与原生HTML不兼容，例如将`is` 指定为`<input>` 或 `<select>` `<component :is="input" v-model="username">`，此时的`v-model`将会失效。

## 渲染函数

Vue提供了`h()`来创建虚拟节点`vnode`。

```js
h(type, props, children) 
```

`h()`是`hyperscript`的简称，表示能够生成”超文本标记语言的JavaScript“，更准确的名称应该是`createVnode()`，但是为了多次使用渲染函数更省力，所以使用`h()`这个更为简洁的名字。

`h()`函数一共有三个参数，第一个参数可以传入元素名（原生元素），也可以是自定义组件；第二个参数是需要传递的`prop`值，也可以是元素的属性，例如`class`；第三个参数是创建元素的节点。

```js
import { h } from 'vue'
// 除了第一参数类型是必填以外，其他两个参数都是可选的
h('div') // 实现一个简单的虚拟节点
h('div', { class: 'box', innerHTML: 'box' })
h('div', { class: ['foo', {'box'}], style: { color: 'red'}})
h('div', { onClick: () => {} }) // 添加侦听器形式
h('div', 'hello') // 如果 children 只有是一个字符串可以简写
h('div', ['hello', h('span', 'ron')]) // children 含有多个字符串
```

### 声明渲染函数

```js
import { h } from 'vue'
export default {
    name: '',
    props: {},
    setup(props) {
        return () => h('div', props.data)
    }
}
```

:star: `setup()`返回值是用于暴露数据给模板的，而当我们使用渲染函数时，可以直接把渲染函数返回。并且返回必须是一个函数，因为`setup()`在每个组件中只会被执行一次，而`setup()`返回的渲染函数会被多次执行。

```js
import { h } from 'vue'
// 除了返回vnode还可以返回字符串或数组
export default {
 setup(props) {
        return () => 'hello world'
    }
}

export default {
    setup(props) {
        return () => [
            h('div', '01'),
            h('div', '02'),
            h('div', '03'),
        ]
    }
}
```

### vnode必须唯一

```js
// 错误实例， 没有保证vnode的唯一性
import {h} from 'vue'
export default {
    setup(props) {
        const p = div('p', '123')
        return () => [
            p,
            p
        ]
    }
}

// 如果想要重复使用渲染函数创建的虚拟节点，可以通过工厂函数来实现
return () => {
    return h('div', Array.from({length: 2}).map(() => {
     return h('p', '123')
    }))
}
```

:star: 如果使用重复的虚拟节点，Vue不会发生报错，但是会影响后续操作重新渲染的不确定性。例如通过循环创建相同的节点时，需要指定唯一的key值来确保更新DOM树更高效。

## 函数式组件

### 简介

函数式组件是定义自身没有任何状态组件的方式。可以看作一个纯函数，接收`props`，返回`vnodes`。函数式组件在渲染过程中不会创建组件实例（意味着没有`this`），也就不会触发组件的生命周期。

```js
function FComponent(props, context: { slots, emit, attrs}) {
 // ...
}
```

## Transition

Vue提供了两个内置的组件用来实现状态变化的过渡和动画：

- `<Transition>` 会在一个元素或者组件进入或离开DOM时应用动画。
- `<TransitionGroup>` 会在一个`v-for`列表中的元素或组件被插入，移动，或移除时应用动画。

:star:`<Transition>` 只支持一个组件或元素插入，如果是组件的话，组件必须有且仅有一个根元素。

![image-20230810105716249](https://raw.githubusercontent.com/ronlu77/pichost/main/image-20230810105716249.png)

`<Transition>` 提供的过渡效果，从大的方面来看分为两部分，`v-enter-active`\ `v-leave-active`，从小的方面分为六个部分，下面具体来分析六个部分的触发时机：

- `v-enter-from`： 进入动画的起始状态，在元素插入之前添加，元素插入完成后下一帧移除；
- `v-enter-active`：进入动画生效状态，在元素插入之前添加，在动画，过渡效果结束后移除；
- `v-enter-to`：进入动画结束状态，在元素插入完成后的下一帧被添加（也就是在``v-enter-from`被移除的时候），在过渡、动画结束后移除；
- `v-leave-from`：离开动画的起始状态，在离开动画效果被触发的立即添加，在一帧后被移除；
- `v-leave-active`：离开动画生效状态，应用于整个离开效果阶段，当离开效果被触发时立即添加，当动画、过渡效果结束后移除；
- `v-leave-to`：离开结束状态，当离开效果被触发下一帧添加（也就是`v-leave-from`被移除的时候），在过渡、动画结束后移除。

同时`<Transition>`还提供一个`name`属性来声明一个过多效果名。如果声明了过渡效果名，则`v-`开头的`class`命名将替换为`name`对应的过渡效果名开头。

在使用`<Transition>`同时使用`css transition` 或动画帧。

分`v-enter-from`, `v-enter-to`, `v-leave-from`, `v-leave-to`

### 深层过渡和显示过渡时长

### 使用Javascript钩子

### 特殊的过渡情况
