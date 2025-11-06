import { ActionTypes, Colors, ElementType, NameModes, SceneType, InteractionType } from "../js/const.js";

export const SCENE3D = {
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
            type: ElementType.Point,
            graph: {
                icon: "camera",
                position: {
                    x: 5,
                    y: 5,
                    z: 5,
                },
            },
            zIndex: 1,
            data: {
                bussinessId: "19824718923",
                bussinessType: "camera",
            },
            conf: {
                nameMode: NameModes.Hover,
                trigger: [
                    {
                        type: InteractionType.Click,
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
            type: ElementType.Point,
            graph: {
                icon: "building",
                position: {
                    x: 0,
                    y: 5,
                    z: 5,
                },
            },
            zIndex: 1,
            data: {},
            conf: {
                nameMode: NameModes.Hover,
                trigger: [
                    {
                        type: InteractionType.Click,
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
            type: ElementType.Polyline,
            graph: {
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
            zIndex: 1,
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
                    {
                        type: InteractionType.Click,
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
            type: ElementType.Label,
            graph: {
                position: {
                    x: 5,
                    y: 5,
                    z: 0,
                },
                value: "初始值",
            },
            zIndex: 1,
            data: {
                value: "${dataPoint1}",
            },
            conf: {
                nameMode: NameModes.Permanent,
                trigger: [
                    {
                        type: InteractionType.Click,
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
                        actionType: ActionTypes.RunEleBehavior.name,
                        actionOptions: {
                            behaviorName: "changeValue",
                            behaviorParam: {
                                value: "${data.value}",
                            },
                        },
                    },
                ],
            },
        },
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
};
