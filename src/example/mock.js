import {
    InteractionType,
    ActionType,
    ElementType,
    SceneType,
    Colors,
    NameModes,
    ElementBehavior,
} from "/matrix/common/core/const.js";

export const scene = {
    id: "9871231235",
    name: "2D场景",
    type: SceneType.TwoD,
    conf: {
        center: {
            x: 100,
            y: 100,
        },
        zoom: 1,
        draggable: true,
        dragDirection: ['x'],
    },
    elements: [
        {
            id: "5231231231",
            name: "摄像机A",
            color: Colors.Normal,
            visible: true,
            layer: [],
            zIndex: 3,
            type: ElementType.Point,
            graph: {
                icon: "camera",
                position: {
                    x: 200,
                    y: 200,
                },
            },
            data: {},
            conf: {
                nameMode: NameModes.Hover,
                trigger: [
                    {
                        type: InteractionType.Click,
                        actionType: ActionType.PopComponent,
                        actionOptions: {
                            name: "LiveCamera",
                            props: {
                                bussinessId: "",
                                bussinessType: "",
                            },
                            theme: "default",
                        },
                    },
                ],
            },
        },
        {
            id: "5123123523",
            name: "背景图片",
            color: Colors.Normal,
            visible: true,
            layer: [],
            zIndex: 4,
            type: ElementType.Picture,
            graph: {
                url: "/matrix/engine/2d/image/bg.png",
                width: 1075,
                height: 653,
                x: 422.5,
                y: 128.5,
                repeatXTimes: 2,
                repeatYTimes: 2,
            },
            data: {
                bussinessId: "19824718923",
                bussinessType: "camera",
            },
            conf: {
                nameMode: NameModes.Permanent,
                trigger: [],
            },
        },
        {
            id: "51231635121",
            name: "文字",
            color: Colors.Default,
            visible: true,
            layer: [],
            zIndex: 4,
            type: ElementType.Label,    
            graph: {
                position: {
                    x: 422.5,
                    y: 228.5,  
                },
                value: "初始文字",
            },
            data: {
                value: "",
                bussinessId: "123123123"
            },
            bindings: [
                {
                    tag: "dataPoint1",
                    to: "data.value",
                    calc: "return value + ' ℃';",
                },
                {
                    tag: "dataPoint1",
                    to: "data.color",
                    range: [
                        { gt: 15, value: "#3040ff" },
                        { gt: 10, value: "#ff3040" },
                        { lte: 10, value: "#2F7CEE" },
                    ],
                    throttleMs: 500,
                },
            ],
            conf: {
                nameMode: NameModes.Hover,
                actions: [
                    {
                        when: "data.value != null",
                        do: "changeValue",
                        params: {
                            value: "@data.value",
                        },
                    },
                    {
                        when: "data.color != null",
                        do: "changeColor",
                        params: {
                            color: "@data.color",
                        },
                    },
                ],
                trigger: [],
                
            },
        },
        {
            id: "label-state",
            name: "状态枚举",
            color: Colors.Default,
            visible: true,
            layer: [],
            zIndex: 4,
            type: ElementType.Label,
            graph: {
                position: { x: 160, y: 120 },
                value: "状态",
            },
            data: {
                value: "",
                color: Colors.Default,
            },
            bindings: [
                {
                    tag: "device_state",
                    to: "data.value",
                    map: { 0: "正常", 1: "告警", 2: "离线", 3: "维护" },
                },
                {
                    tag: "device_state",
                    to: "data.color",
                    map: { 0: "#2F7CEE", 1: "#FF3040", 2: "#7B7A82", 3: "#FABE11" },
                },
            ],
            conf: {
                nameMode: NameModes.Permanent,
                actions: [
                    {
                        when: "data.value != null",
                        do: "changeValue",
                        params: { value: "@data.value" },
                    },
                    {
                        when: "data.color != null",
                        do: "changeColor",
                        params: { color: "@data.color" },
                    },
                ],
                trigger: [],
            },
        },
        {
            id: "label-speed",
            name: "实时数值单位转换，添加单位",
            color: Colors.Default,
            visible: true,
            layer: [],
            zIndex: 4,
            type: ElementType.Label,
            graph: {
                position: { x: 160, y: 160 },
                value: "速度",
            },
            data: {
                value: "",
            },
            bindings: [
                {
                    tag: "speed_ms",
                    to: "data.value",
                    calc: "return (value * 3.6).toFixed(1) + ' km/h';",
                },
            ],
            conf: {
                nameMode: NameModes.Hidden,
                actions: [
                    {
                        when: "data.value != null",
                        do: "changeValue",
                        params: { value: "@data.value" },
                    },
                ],
                trigger: [],
            },
        },
        {
            id: "label-temp",
            name: "数值区间+文案",
            color: Colors.Default,
            visible: true,
            layer: [],
            zIndex: 4,
            type: ElementType.Label,
            graph: {
                position: { x: 160, y: 200 },
                value: "温度",
            },
            data: {
                value: "",
                color: Colors.Default,
            },
            bindings: [
                {
                    tag: "temp_c",
                    to: "data.value",
                    calc: "return value.toFixed(1) + ' ℃';",
                    default: "--",
                },
                {
                    tag: "temp_c",
                    to: "data.color",
                    range: [
                        { gt: 100, value: "#FF0000" },
                        { gt: 80, value: "#FF9900" },
                        { lte: 80, value: "#00CC66" },
                    ],
                },
            ],
            conf: {
                nameMode: NameModes.Hidden,
                actions: [
                    {
                        when: "data.value != null",
                        do: "changeValue",
                        params: { value: "@data.value" },
                    },
                    {
                        when: "data.color != null",
                        do: "changeColor",
                        params: { color: "@data.color" },
                    },
                ],
                trigger: [],
            },
        },
        {
            id: "label-online",
            name: "显示/隐藏",
            color: Colors.Default,
            visible: true,
            layer: [],
            zIndex: 4,
            type: ElementType.Label,
            graph: {
                position: { x: 160, y: 280 },
                value: "在线",
            },
            data: {
                online: true,
                value: "在线",
            },
            bindings: [
                { tag: "device_online", to: "data.online" },
            ],
            conf: {
                nameMode: NameModes.Hidden,
                actions: [
                    {
                        when: "data.online === true",
                        do: "changeVisible",
                        params: { visible: true },
                    },
                    {
                        when: "data.online === false",
                        do: "changeVisible",
                        params: { visible: false },
                    },
                ],
                trigger: [],
            },
        },
        {
            id: "label-alarm",
            name: "动画触发",
            color: Colors.Default,
            visible: true,
            layer: [],
            zIndex: 4,
            type: ElementType.Label,
            graph: {
                position: { x: 160, y: 320 },
                value: "告警动画",
            },
            data: {
                value: "告警动画",
            },
            bindings: [
                { tag: "alarm", to: "data.alarm" },
            ],
            conf: {
                nameMode: NameModes.Hidden,
                actions: [
                    {
                        when: "data.alarm === true",
                        do: "changePosition",
                        params: { position: { x: 200, y: 320 } },
                    },
                    {
                        when: "data.alarm === false",
                        do: "changePosition",
                        params: { position: { x: 160, y: 320 } },
                    },
                ],
                trigger: [],
            },
        },
        {
            id: "label-combo",
            name: "多字段组合",
            color: Colors.Default,
            visible: true,
            layer: [],
            zIndex: 4,
            type: ElementType.Label,
            graph: {
                position: { x: 160, y: 360 },
                value: "组合告警",
            },
            data: {
                temp: 0,
                state: 0,
                color: Colors.Default,
            },
            bindings: [
                { tag: "temp_c", to: "data.temp" },
                { tag: "device_state", to: "data.state" },
            ],
            conf: {
                nameMode: NameModes.Hidden,
                actions: [
                    {
                        when: "data.state === 1 && data.temp > 80",
                        do: "changeColor",
                        params: { color: "#FF3040" },
                    },
                    {
                        when: "data.state !== 1 || data.temp <= 80",
                        do: "changeColor",
                        params: { color: "#2F7CEE" },
                    },
                ],
                trigger: [],
            },
        },
    ],
    anchors: [],
};
    
