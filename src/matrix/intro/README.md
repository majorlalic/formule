# 物联网数字化平台配置文档


## 快速上手

1. 修改nginx配置

   ```conf
   location  ^~/matrix/ {	
   	alias $webpath/matrix/;
   }
   ```

2. 配置一个简单的三维场景

   **在这个配置中, 我们创建了一个场景, 在场景中配置了一个摄像机点位, 并且给摄像机添加了一个点击弹窗动作**, 详细配置项可参考[**配置**](#配置)章节

   ```javascript
   // 场景示例
   const scene = {
       id: "1231235435123123",
       name: '场景名称',
       type: SceneType.ThreeD,
       conf: {
           // 场景配置
       },
       elements: [
           {
               id: "9871273612873",
               name: "切换场景A",
               color: "#2F7CEE",
               visible: true,
               graph: {
                   type: ElementType.Point,
                   icon: "camera",
                   position: {
                       x: 5,
                       y: 5,
                       z: 0,
                   },
               },
               data: {
                   bussinessId: "12312312",
                   bussinessType: "camera"
               },
               bindings: [
                   { tag: "camera_state", to: "data.state" },
               ],
               conf: {
                   showName: true,
                   actions: [
                       {
                           when: "data.state === 1",
                           do: "changeColor",
                           params: { color: "#FF3040" }
                       }
                   ],
                   trigger: [
                       {
                           type: InteractionType.Click,
                           actionType: ActionType.PopComponent,
                           actionOptions: {
                               name: "LiveCamera",
                               props: {
                                   bussinessId: "",
                                   bussinessType: ""
                               }
                           }
                       }
                   ]
               }
           }
       ]
   }
   ```

3. 在html定义有宽度和高度的容器

   ```html
   <div id="scene" style="width: 100%;height:100%;"></div>
   ```

4. 引入并初始化解释器

   ```javascript
   import Resolver from "/matrix/common/core/resolver.js";
   
   /**
     * 初始化场景
     * @param {String} containerId 场景容器id
     * @param {SceneDef} scene 场景配置, 参照步骤2中的配置
    */
   let resolver = new Resolver("scene", scene);
   ```

5. 访问页面即可查看你创建的第一个场景

## 关键对象

### 场景 

-   作为容器用来统一管理图元对象
-   图元和解释器通信的中间件

### 图元

-   图元用于记录可视化对象的属性, 配置
-   可由此扩展出点, 线, 面, 文本等可视化对象
-   提供可视化图形的闪烁,颜色变化等方法, 可扩展图元能力
-   可发布图形的 Click,Hover 等事件, 解释器订阅交互事件做出弹窗等动作
-   通过 `bindings` 绑定数据点, 通过 `actions` 设置数据驱动行为

### 解释器

-   将按照规范输入的业务数据解释为图元的动作和颜色变化
-   将图元的交互事件依据配置解释为弹窗等动作



## 配置

### 场景配置

```javascript
// 场景配置结构
{
    id: "9832789237491283",
    name: "场景A",    
    type: SceneType.ThreeD,
    conf: {

    },
    elements: [
        
    ],
    anchors: []
}
```

#### id

`string` = ' '

场景id, 可通过接口查询场景详细配置

------

#### name 

`string` = ' '

场景名称

---

#### type

`string` = [**SceneType**](#SceneType).Gis

场景类型 

---

#### conf 

- 场景的全局配置, 如初始视角, 图源地址, 初始缩放级别

- 不同类型的场景有各自的配置项

##### 3D

1. position - 初始视角 

   `Object`

   ```json
   // 示例
   position: {
       camera: {
           x: 8.346787561819795,
           y: 9.803761252703204,
           z: 9.53865674517326,
       },
       target: {
           x: -1.103397394987877,
           y: 1.2200253011432658,
           z: -1.16556062846603,
       },
   }
   ```

---

##### 2D

待施工

---

##### Gis

待施工

---

#### elements 

`Array` 

图元集合, 配置格式参考[**图元配置**](#图元配置)

---

### bindings / actions

```javascript
// 图元数据绑定与行为
{
    bindings: [
        { tag: "temp_c", to: "data.value", calc: "return value.toFixed(1) + ' ℃';" },
        { tag: "temp_c", to: "data.color", range: [
            { gt: 80, value: "#FF3040" },
            { lte: 80, value: "#2F7CEE" }
        ]}
    ],
    conf: {
        actions: [
            { when: "data.value != null", do: "changeValue", params: { value: "@data.value" } },
            { when: "data.color != null", do: "changeColor", params: { color: "@data.color" } }
        ]
    }
}
```

#### anchors

`Array`

锚点集合, 不同场景类型的锚点为不同的数据结构

##### 3D

```json
// 示例
[{
   id: "camera1",
   name: "大门球机",
   position: {
      camera: {
         x: 8.336226974306731,
         y: 6.061127903362533,
         z: 8.399705309490527,
      },
      target: {
        x: -1.103397394987877,
        y: 1.2200253011432658,
        z: -1.16556062846603,
      }
   }
}]
```

1. id 

   `string` = ' '

   锚点的唯一标识符

2. name

   `string` = ' '

   锚点名称

3. position

   `Object`

   - 锚点结构为以上示例
   - 可在控制台中通过 `scene.logVision()` 打印当前锚点信息 **控制台需切换到场景所在iframe**



---

##### 2D

待施工

---

##### Gis

待施工



#### layers

`Array` 

图层集合, 图元的[**layer**](#layer)原则上应引用此处的name

```json
// 配置示例
[{
    name: "device",
    label: "设备",
    checked: true,
},
{
    name: "area",
    label: "防区",
    checked: true,
}]
```

1. name

   `string` = ' '

   图层的唯一标识, 可用于外层的图标命名

2. label

   `string` = ' '

   图层名称

3. checked

   `Boolean`

   是否默认勾选

### 图元配置

```json
{
    id: "5198273901235323",
    name: "大门球机",
    color: '#2F7CEE',
    visible: true,
    graph: {
        
    },
    data: {
        
    },
    conf: {
        
    }
}
```

#### id

`string`

图元id, 图元的唯一标识符

---

#### name 

`string`

图元名称, 通常显示在图元上方

---

#### color

`string` = '#2F7CEE'

图元颜色, 用来表示图元的状态

---

#### visible

`boolean` = true

图元是否显示

---

#### layer

`Array` = [ ]

图元所属的图层

- 可配置多个图层
- 图层原则上应参照[**layers**](#layers)中定义的图层name

---

#### graph

`Object`

- 用于配置图元的类型, 位置等信息
- 不同场景, 图元类型的配置各有差异

##### 3D

###### Point

1. type 图元类型

   `string` = [**ElementType**](#ElementType).Point

2. icon 图标

   `string` = [**ICONS**]().value

3. position 位置

   `Object` 

   ```json
   {
       x: 0,
       y: 5,
       z: 5,
   }
   ```

---

###### Polyline

1. type 图元类型

   `string` = [**ElementType**]().Polyline

2. positions 位置

   `Array` 

   ```json
   [
       {
           x: 5,
           y: 0,
           z: 0,
       },
       {
           x: 5,
           y: 0,
           z: 5,
       },
       {
           x: 0,
           y: 0,
           z: 5,
       },
   ]
   ```

---

###### Polygon

待施工

---

###### Label

1. type 图元类型

   `string` = [**ElementType**]().Label

2. position 位置

   `Object` 

   ```json
   {
       x: 0,
       y: 5,
       z: 5,
   }
   ```

---

###### Modal

1. type 图元类型

   `string` = [**ElementType**]().Modal

2. path 模型访问路径

   `string` = ' '

3. position 位置

   `Object` 

   ```json
   {
       x: 0,
       y: 5,
       z: 5,
   }
   ```

 4. scale 缩放倍数

    `number` = 1

##### 2D

待施工

---

##### Gis

待施工



#### data

`Object` 

自定义属性

- 可使用嵌套结构
- 在此声明的属性可在图元其他属性中引用, 当前支持`name`, `color`, `visible` 

```
{
    test1: {
    	test2: {
       		test3: "${testPoint3}",
       		test4: [1, 2, 3, "${testPoint4}"],
    	},
    },
    bussinessId: "1208971927410",
    bussinessType: "camera"
}
```



#### conf

##### showName

`boolean` = true

是否展示名称

---

##### trigger 

`Array` `object`

###### type

`string` = [**InteractionType**]().Click

事件类型

---

---

###### actionType

`string`

动作类型, 目前支持的动作类型可点击 [**ActionType** ]()查看

---

###### actionOptions 

`Ojbect`

动作配置, 不同的动作类型存在不同的配置结构, 请到 [**ActionType** ]() 章节查看



## 字典

### SceneType

场景类型

#### Gis

地图场景

#### ThreeD

三维场景

#### TwoD

平面场景





### ElementType

图元类型

- Point 点
- Polyline 线
- Polygon 面
- Label 文本
- Modal 模型



### InteractionType

交互类型

- Click 点击
- Hover 鼠标移入
- HoverOut 鼠标移出
- Custom 自定义



### ActionType

动作类型

#### PopComponent

打开组件弹窗

参数: 

	- name :`string` 标题
	- props: `Object` 组件属性

组件列表:

- **LiveCamera** 实时视频
  - bussinessId: `string` 业务对象id
  - bussinessType: `string`  业务对象类型
- **LineChart** 折线图
  - bussinessId: `string` 业务对象id
  - bussinessType: `string`  业务对象类型

---

#### OpenUrl

浏览器新打开指定地址

参数: 

- url: `string` 地址

---

#### ChangeColor

修改颜色

参数: 

- color: `string` 图元颜色

---

#### ExecuteScript

执行指定脚本, 脚本需在Scripts中声明

参数: 

- name: `string` 脚本名称

---

#### ChangeScene

切换场景

参数:

- sceneId: `string` 场景id

---

#### ChangeAnchor

跳转锚点

参数: 

- anchorId: `string` 锚点id

---

#### ChangePosition

修改图元位置

参数: 

- position: `Object` 位置   待施工

---

#### ChangeVisible

显示/隐藏图元

参数:

- visible: `boolean` 是否显示



## 开发&扩展

### 扩展场景

1. 添加场景常量

   ```js
   // const.js
   // SceneTypes
   export const SceneType = {
       Gis: 'Gis'
   };
   export const SceneTypeMeta = {
       [SceneType.Gis]: {
        dir: "gis",
        supportElementTypes: [
            ElementType.Point,
            ElementType.Polyline,
            ElementType.Polygon,
            ElementType.Label,
            ElementType.CirclePoint,
        ],
    },
   };
   ```

   



### 扩展图元类型

---

### 扩展动作

---

### 扩展弹窗组件

---

### 扩展脚本







