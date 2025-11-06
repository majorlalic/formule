import { ActionTypes, Colors, ElementType, NameModes, SceneType, InteractionType } from "../js/const.js";

export const SCENEGIS = {
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
            type: ElementType.Point,
            graph: {
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
            type: ElementType.CirclePoint,
            graph: {
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
            type: ElementType.Polyline,
            graph: {
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
            type: ElementType.Polygon,
            graph: {
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
            type: ElementType.Label,
            graph: {
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
};
