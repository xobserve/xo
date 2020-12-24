import { DashboardModel } from './DashboardModel'
import { PanelModel } from './PanelModel'
export const dashboardMock = new DashboardModel(
    {
        id: 1,
        uid: "cBgEAwiMk",
        title: "New dashboard Copy",
        editable: true,
        panels: [
            new PanelModel({
                id: 2,
                gridPos: { h: 8, w: 12, x: 0, y: 0 },
                type: "stat",
                title: "Panel Title",
                datasource: "test",
                hasRefreshed: true,
                isInView: true,
                isViewing: false,
                isEditing: false,
                collapsed: false,
                options: {
                    colorMode: "value",
                    graphMode: "area",
                    justifyMode: "auto",
                    orientation: "auto",
                    reduceOptions: {
                        calcs: ["mean"],
                        fields: "",
                        limit: undefined,
                        values: false
                    },
                },
                targets: [
                    {
                        expr: "sum (node_load1{app='sms'})",
                        interval: "",
                        legendFormat: "",
                        refId: "A"
                    }
                ],
                fieldConfig: {
                    defaults: {
                        custom: {},
                        decimals: undefined,
                        displayName: undefined,
                        links: undefined,
                        mappings: [],
                        max: undefined,
                        min: undefined,
                        noValue: undefined,
                        unit: undefined,
                        thresholds: {
                            mode: "absolute",
                            steps: [
                                { color: "green", value: -Infinity },
                            ]
                        }
                    },
                    overrides: []
                }
            }),
            new PanelModel({
                id: 3,
                gridPos: { h: 8, w: 12, x: 0, y: 0 },
                type: "graph",
                title: "Panel Title",
                datasource: "test",
                hasRefreshed: true,
                isInView: true,
                isViewing: false,
                isEditing: false,
                collapsed: false,
                options: {
                    lines: true,
                    colorMode: "value",
                    graphMode: "area",
                    justifyMode: "auto",
                    orientation: "auto",
                    reduceOptions: {
                        calcs: ["mean"],
                        fields: "",
                        limit: undefined,
                        values: false
                    },
                },
                targets: [
                    {
                        expr: "node_load1{app='sms'}",
                        interval: "",
                        legendFormat: "",
                        refId: "A"
                    }
                ],
                fieldConfig: {
                    defaults: {
                        custom: {},
                        decimals: undefined,
                        displayName: undefined,
                        links: undefined,
                        mappings: [],
                        max: undefined,
                        min: undefined,
                        noValue: undefined,
                        unit: undefined,
                        thresholds: {
                            mode: "absolute",
                            steps: [
                                { color: "green", value: -Infinity },
                                // { color: "red", value: 80 }
                            ]
                        }
                    },
                    overrides: []
                }
            })
        ]
    }
)



