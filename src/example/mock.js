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
                // 基础绑定
                { tag: "dataPoint1", to: "data.value" },
                // 节流绑定（500ms）
                { tag: "dataPoint1", to: "data.value", throttleMs: 500 },
            ],
            conf: {
                nameMode: NameModes.Hover,
                rules: [
                    {
                        when: "data.value != null",
                        do: "changeValue",
                        params: {
                            // 直接路径
                            value: "data.value",
                            // 前缀写法
                            // value: "@data.value",
                            // value: "$data.value",
                        },
                    },
                    {
                        when: "data.value > 10",
                        do: "changeColor",
                        params: {
                            color: "#ff3040",
                        },
                    },
                    {
                        when: "data.value > 15",
                        do: "changeColor",
                        params: {
                            color: "#3040ff",
                        },
                    },
                    {
                        // 使用 tag() 直接访问数据点
                        when: "tag('dataPoint1') > 20",
                        do: "changeColor",
                        params: {
                            color: "#00ff99",
                        },
                    },
                ],
                trigger: [],
                
            },
        },
    ],
    anchors: [],
};
    
