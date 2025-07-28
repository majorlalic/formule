import { ActionTypes, Colors, ElementType, NameModes, SceneType, InteractionType } from "../js/const.js";

export const SCENE2D = {
    id: "9871231235",
    name: "2D场景",
    type: SceneType.TwoD.name,
    conf: {
        position: { x: -960, y: -455 },
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
                    // {
                    //     type: InteractionType.Click,
                    //
                    //     actionType: ActionTypes.PopComponent.name,
                    //     actionOptions: {
                    //         name: "live-camera",
                    //         props: {
                    //             bussinessId: "${bussinessId}",
                    //             bussinessType: "",
                    //         },
                    //         theme: "default",
                    //     },
                    // },
                    // {
                    //     type: InteractionType.Click,
                    //
                    //     actionType: ActionTypes.RunEleBehavior.name,
                    //     actionOptions: {
                    //         behaviorName: "changeColor",
                    //         // behaviorParam: ['${data.value}'],
                    //         behaviorParam: {
                    //             color: Colors.Warning
                    //         }
                    //     },
                    // },
                    {
                        type: InteractionType.Click,

                        actionType: ActionTypes.ChangeColor.name,
                        actionOptions: {
                            color: Colors.Offline,
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
            id: "512116351141232",
            name: "巡检机器人",
            color: Colors.Normal,
            visible: true,
            layer: [],
            zIndex: 4,
            type: ElementType.PointLine,
            graph: {
                positions: [
                    {
                        x: 1250,
                        y: 348,
                    },
                    {
                        x: 982,
                        y: 545,
                    },
                    {
                        x: 1263,
                        y: 553,
                    },
                    {
                        x: 974,
                        y: 750,
                    },
                ],
                percent: -10,
                icon: "uav",
            },
            data: {
                position: "${512116351141232-position}",
            },
            conf: {
                nameMode: NameModes.Hover,
                trigger: [
                    {
                        type: InteractionType.Custom,

                        actionType: ActionTypes.ExecuteScript.name,
                        actionOptions: {
                            url: "/matrix/scripts/robot.js",
                        },
                    },
                ],
            },
        },
        {
            id: "51211635411",
            name: "线段一",
            color: Colors.Normal,
            visible: true,
            layer: [],
            zIndex: 4,
            type: ElementType.Polyline,
            graph: {
                positions: [
                    {
                        x: 800,
                        y: 500,
                    },
                    {
                        x: 800,
                        y: 550,
                    },
                    {
                        x: 850,
                        y: 600,
                    },
                    {
                        x: 850,
                        y: 400,
                    },
                ],
            },
            data: {
                visible: true,
                color: "",
            },
            conf: {
                nameMode: NameModes.Hover,
                trigger: [],
            },
        },
        {
            id: "23235121163511",
            name: "线段二",
            color: Colors.Normal,
            visible: true,
            layer: [],
            zIndex: 4,
            type: ElementType.Polyline,
            graph: {
                positions: [
                    {
                        x: 800,
                        y: 500,
                    },
                    {
                        x: 800,
                        y: 550,
                    },
                    {
                        x: 850,
                        y: 600,
                    },
                    {
                        x: 850,
                        y: 400,
                    },
                ],
            },
            data: {
                visible: true,
                color: "",
            },
            conf: {
                nameMode: NameModes.Hover,
                trigger: [],
            },
        },
        {
            id: "5123163512",
            name: "多边形",
            color: Colors.Normal,
            visible: true,
            layer: [],
            zIndex: 4,
            type: ElementType.Polygon,
            graph: {
                positions: [
                    {
                        x: 500,
                        y: 500,
                    },
                    {
                        x: 500,
                        y: 550,
                    },
                    {
                        x: 550,
                        y: 600,
                    },
                    {
                        x: 550,
                        y: 400,
                    },
                ],
            },
            data: {
                visible: true,
                color: "#fff",
            },
            conf: {
                nameMode: NameModes.Hover,
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
                visible: true,
                color: "#fff",
                value: "${dataPoint1}",
            },
            conf: {
                nameMode: NameModes.Hover,
                trigger: [
                    {
                        type: InteractionType.Custom,

                        actionType: ActionTypes.RunEleBehavior.name,
                        actionOptions: {
                            behaviorName: "changeValue",
                            // behaviorParam: ['${data.value}'],
                            behaviorParam: {
                                value: "${data.value}",
                            },
                        },
                    },
                ],
            },
        },
    ],
    anchors: [],
};
