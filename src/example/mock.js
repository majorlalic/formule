import {
    InteractionType,
    ActionType,
    ElementType,
    SceneType,
    Colors,
    NameModes,
    ElementBehavior,
} from "/matrix/core/const.js";

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
                                bussinessId: "${bussinessId}",
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
                visible: true,
                color: "#fff",
                value: "${dataPoint1}",
            },
            conf: {
                nameMode: NameModes.Hover,
                trigger: [
                    {
                        type: InteractionType.Custom,

                        actionType: ActionType.RunEleBehavior.name,
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
