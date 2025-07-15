import { InteractionType, ActionTypes, ElementType, SceneType, Colors, NameModes, ElementBehaviors } from "./const.js";
export const scenes = [
    {
        id: "9832789237491283",
        name: "场景A",
        type: SceneType.ThreeD.name,
        conf: {
            position: {
                camera: {
                    x: 10.202314732145368,
                    y: 12.387200675792423,
                    z: 10.05116639909836,
                },
                target: {
                    x: 1.459859267841335,
                    y: 1.2200253011432654,
                    z: 1.3087150956830444,
                },
            },
        },
        elements: [
            {
                id: "5198273901235323",
                name: "大门球机",
                color: Colors.Normal,
                visible: true,
                layer: ["device", "area"],
                graph: {
                    type: ElementType.Point,
                    icon: "camera",
                    position: {
                        x: 5,
                        y: 5,
                        z: 5,
                    },
                },
                data: {
                    bussinessId: "19824718923",
                    bussinessType: "camera",
                },
                conf: {
                    nameMode: NameModes.Hover,
                    trigger: [
                        {
                            type: InteractionType.Click,
                            condition: "",
                            actionType: ActionTypes.PopComponent.name,
                            actionOptions: {
                                name: "live-camera",
                                props: {
                                    bussinessId: "${data.bussinessId}",
                                    bussinessType: "",
                                },
                                theme: "default",
                            },
                        },
                    ],
                },
            },
            {
                id: "5123123123",
                name: "切换场景B",
                color: Colors.Normal,
                visible: true,
                layer: ["device"],
                graph: {
                    type: ElementType.Point,
                    icon: "building",
                    position: {
                        x: 0,
                        y: 5,
                        z: 5,
                    },
                },
                data: {},
                conf: {
                    nameMode: NameModes.Hover,
                    trigger: [
                        {
                            type: InteractionType.Click,
                            condition: "",
                            actionType: ActionTypes.ChangeScene.name,
                            actionOptions: {
                                sceneId: "1231235435123123",
                            },
                        },
                    ],
                },
            },
            {
                id: "129846712984321",
                name: "测试防区",
                color: Colors.Normal,
                visible: true,
                layer: ["area"],
                graph: {
                    type: ElementType.Polyline,
                    positions: [
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
                    ],
                },
                data: {
                    test1: {
                        test2: {
                            test3: "${testPoint3}",
                            test4: [1, 2, 3, "${testPoint4}"],
                        },
                    },
                    bussinessId: "1208971927410",
                    bussinessType: "",
                },
                conf: {
                    nameMode: NameModes.Hover,
                    trigger: [
                        // {
                        //     type: InteractionType.Click,
                        //     condition: "",
                        //     // actionType: ActionTypes.OpenUrl.name,
                        //     // actionOptions: {
                        //     //     url: "http://www.baidu.com?bussinessId=${data.bussinessId}",
                        //     //     theme: "default",
                        //     // },
                        //     actionType: ActionTypes.ChangeAnchor.name,
                        //     actionOptions: {
                        //         anchorId: "defencearea",
                        //     },
                        // },
                        {
                            type: InteractionType.Click,
                            condition: "",
                            actionType: ActionTypes.RunEleBehavior.name,
                            actionOptions: {
                                behaviorName: "changeVisible",
                                // behaviorParam: ['${data.value}'],
                                behaviorParam: {
                                    visible: false,
                                },
                            },
                        },
                    ],
                },
            },
            {
                id: "8912749812734",
                name: "数据点1",
                color: Colors.Normal,
                visible: true,
                layer: ["device"],
                graph: {
                    type: ElementType.Label,
                    position: {
                        x: 5,
                        y: 5,
                        z: 0,
                    },
                },
                data: {
                    value: "${dataPoint1}",
                },
                conf: {
                    nameMode: NameModes.Permanent,
                    trigger: [
                        {
                            type: InteractionType.Click,
                            condition: "",
                            actionType: ActionTypes.PopComponent.name,
                            actionOptions: {
                                name: "line-chart",
                                props: {
                                    bussinessId: "",
                                    bussinessType: "",
                                },
                                theme: "default",
                            },
                        },
                        {
                            type: InteractionType.Custom,
                            condition: "${data.value} == 2",
                            actionType: ActionTypes.ChangePosition.name,
                            actionOptions: {
                                position: {
                                    x: 0,
                                    y: 1,
                                    z: 0,
                                },
                                duration: 1,
                            },
                        },
                        {
                            type: InteractionType.Custom,
                            condition: "",
                            actionType: ActionTypes.RunEleBehavior.name,
                            actionOptions: {
                                behaviorName: "changeValue",
                                // behaviorParam: ['${data.value}'],
                                behaviorParam: {
                                    value: "${data.value}",
                                },
                            },
                        },
                        // {
                        //     type: InteractionType.Custom,
                        //     condition: "",
                        //     actionType: ActionTypes.ExecuteScript.name,
                        //     actionOptions: {
                        //         url: "/matrix/scripts/testScript.js",
                        //     },
                        // },
                    ],
                },
            },
            // {
            //     id: "5123153232123",
            //     name: "理工光科模型",
            //     color: '#2F7CEE',
            //     visible: true,
            //     graph: {
            //         type: ElementType.Modal,
            //         path: "./modal/LGGK/LGGK.dae",
            //         position: {
            //             x: 1,
            //             y: -0.2,
            //             z: 2,
            //         },
            //         scale: 5,
            //     },
            //     data: {},
            //     conf: {},
            // },
        ],
        anchors: [
            {
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
                    },
                },
            },
            {
                id: "defencearea",
                name: "防区",
                position: {
                    camera: {
                        x: 8.01491119916642,
                        y: 1.2200253011432667,
                        z: 7.947393753870351,
                    },
                    target: {
                        x: -1.103397394987877,
                        y: 1.2200253011432658,
                        z: -1.16556062846603,
                    },
                },
            },
        ],
        layers: [
            {
                name: "device",
                label: "设备",
                checked: true,
            },
            {
                name: "area",
                label: "防区",
                checked: true,
            },
        ],
    },
    {
        id: "1231235435123123",
        name: "场景B",
        type: SceneType.ThreeD.name,
        conf: {
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
            },
        },
        elements: [
            {
                id: "9871273612873",
                name: "切换场景A-${data.value}",
                color: Colors.Normal,
                visible: true,
                graph: {
                    type: ElementType.Point,
                    icon: "building",
                    position: {
                        x: 5,
                        y: 5,
                        z: 0,
                    },
                },
                data: {
                    value: "${testPoint3}",
                },
                conf: {
                    showName: true,
                    trigger: [
                        {
                            type: InteractionType.Click,
                            condition: "",
                            actionType: ActionTypes.ChangeScene.name,
                            actionOptions: {
                                sceneId: "9832789237491283",
                            },
                        },
                    ],
                },
            },
        ],
    },
    {
        id: "9871231235",
        name: "2D场景",
        type: SceneType.TwoD.name,
        conf: {
            background: {
                url: "/matrix/engine/2d/image/bg.png",
                width: 1075,
                height: 653,
                x: 422.5,
                y: 128.5,
            },
        },
        elements: [
            {
                id: "5231231231",
                name: "摄像机A",
                color: Colors.Normal,
                visible: true,
                layer: [],
                zIndex: 3,
                graph: {
                    type: ElementType.Point,
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
                        //     condition: "",
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
                        //     condition: "",
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
                            condition: "",
                            actionType: ActionTypes.ChangeColor.name,
                            actionOptions: {
                                color: Colors.Offline,
                            },
                        },
                    ],
                },
            },
            // {
            //     id: "5123123523",
            //     name: "背景图片",
            //     color: Colors.Normal,
            //     visible: true,
            //     layer: [],
            //     zIndex: 4,
            //     graph: {
            //         type: ElementType.Picture,
            //         x: 410,
            //         y: 100,
            //         url: "/matrix/engine/2d/image/bg.png",
            //         width: 200,
            //         height: 100,
            //     },
            //     data: {
            //         bussinessId: "19824718923",
            //         bussinessType: "camera",
            //     },
            //     conf: {
            //         nameMode: NameModes.Permanent,
            //         trigger: [],
            //     },
            // },
            {
                id: "512116351141232",
                name: "巡检机器人",
                color: Colors.Normal,
                visible: true,
                layer: [],
                zIndex: 4,
                graph: {
                    type: ElementType.PointLine,
                    line: [
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
                    position: -10,
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
                            condition: "",
                            actionType: ActionTypes.ExecuteScript.name,
                            actionOptions: {
                                url: "/matrix/scripts/robot.js",
                            },
                        },
                    ],
                },
            },
            {
                id: "5121163511",
                name: "线段一",
                color: Colors.Normal,
                visible: true,
                layer: [],
                zIndex: 4,
                graph: {
                    type: ElementType.Polyline,
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
                id: "5121163511",
                name: "线段一",
                color: Colors.Normal,
                visible: true,
                layer: [],
                zIndex: 4,
                graph: {
                    type: ElementType.Polyline,
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
                graph: {
                    type: ElementType.Polygon,
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
                graph: {
                    type: ElementType.Label,
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
                            condition: "",
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
    },
    {
        id: "9871231235",
        name: "Gis场景",
        type: SceneType.Gis.name,
        conf: {
            // tileLayer: "http://10.11.3.25:8899/788865972/{z}/{x}/{y}",
            center: [43.0367, 88.84643],
            minZoom: 5,
            maxZoom: 18,
            zoom: 9,
            zoomControl: false,
            isSite: true,
        },
        elements: [
            {
                id: "5231231231",
                name: "无人机-点击会移动",
                color: Colors.Normal,
                visible: true,
                layer: [],
                zIndex: 3,
                graph: {
                    type: ElementType.Point,
                    icon: "uav",
                    position: {
                        lat: 43.37311218382002,
                        lng: 88.12957763671876,
                    },
                },
                data: {},
                conf: {
                    nameMode: NameModes.Hover,
                    trigger: [
                        {
                            type: InteractionType.Click,
                            condition: "",
                            actionType: ActionTypes.ChangePosition.name,
                            actionOptions: {
                                position: {
                                    lat: 43.01268088642034,
                                    lng: 90.94482421875001,
                                },
                            },
                        },
                    ],
                },
            },
            {
                id: "5123123123",
                name: "雷达",
                color: Colors.Normal,
                visible: true,
                layer: [],
                zIndex: 3,
                graph: {
                    type: ElementType.CirclePoint,
                    icon: "radar",
                    position: {
                        lat: 42.76516228327469,
                        lng: 87.39898681640626,
                    },
                    radius: 20000,
                },
                data: {},
                conf: {
                    nameMode: NameModes.Hover,
                    trigger: [
                        {
                            type: InteractionType.Click,
                            condition: "",
                            actionType: ActionTypes.ChangeAnchor.name,
                            actionOptions: {
                                anchorId: "123123",
                            },
                        },
                    ],
                },
            },
            {
                id: "63413123",
                name: "管线A",
                color: Colors.Normal,
                visible: true,
                layer: [],
                zIndex: 3,
                graph: {
                    type: ElementType.Polyline,
                    positions: [
                        [43.37710501700073, 88.41796875000001],
                        [43.16512263158296, 88.95904541015625],
                        [43.177141346631714, 89.57977294921876],
                        [43.36512572875844, 90.00549316406251],
                    ],
                },
                data: {},
                conf: {
                    nameMode: NameModes.Hover,
                    trigger: [],
                },
            },
            {
                id: "51234436",
                name: "防区A",
                color: Colors.Normal,
                visible: true,
                layer: [],
                zIndex: 3,
                graph: {
                    type: ElementType.Polygon,
                    positions: [
                        [42.982548873720326, 88.25592041015626],
                        [42.91620643817353, 89.27490234375001],
                        [42.53891577257117, 89.15679931640626],
                        [42.66628070564928, 88.20648193359376],
                    ],
                },
                data: {},
                conf: {
                    nameMode: NameModes.Hover,
                    trigger: [],
                },
            },
            {
                id: "6123125235",
                name: "文本",
                color: Colors.Default,
                visible: true,
                layer: [],
                zIndex: 3,
                graph: {
                    type: ElementType.Label,
                    position: {
                        lat: 42.563195832927384,
                        lng: 89.7857666015625,
                    },
                    bgShadow: true,
                    value: "初始文本",
                },
                data: {
                    value: "${dataPoint1}",
                },
                conf: {
                    nameMode: NameModes.Permanent,
                    trigger: [
                        {
                            type: InteractionType.Custom,
                            condition: "",
                            actionType: ActionTypes.RunEleBehavior.name,
                            actionOptions: {
                                behaviorName: "changeValue",
                                // behaviorParam: ['${data.value}'],
                                behaviorParam: {
                                    value: "${data.value}",
                                },
                            },
                        },
                        {
                            type: InteractionType.Click,
                            condition: "",
                            actionType: ActionTypes.RunEleBehavior.name,
                            actionOptions: {
                                behaviorName: "changeColor",
                                // behaviorParam: ['${data.value}'],
                                behaviorParam: {
                                    color: Colors.Error,
                                },
                            },
                        },
                    ],
                },
            },
        ],
        anchors: [
            {
                id: "123123",
                name: "雷达",
                center: [42.76118909934483, 87.49237830544907],
                zoom: 11,
            },
        ],
    },
];

const triggerTemplate = [];
