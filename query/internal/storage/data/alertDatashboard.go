package storageData

const AlertDashboard = `
{
    "id": "d-alert",
    "title": "Alert",
    "editable": true,
    "ownedBy": 1,
    "tags": [],
    "data": {
        "allowPanelsOverlap": false,
        "autoSaveInterval": 120,
        "description": "",
        "editable": true,
        "enableAutoSave": false,
        "enableUnsavePrompt": true,
        "hidingVars": "",
        "layout": "vertical",
        "lazyLoading": true,
        "panels": [
            {
                "collapsed": false,
                "datasource": {
                    "id": 1,
                    "queries": [
                        {
                            "data": {},
                            "id": 65,
                            "legend": "",
                            "metrics": "",
                            "visible": true
                        }
                    ],
                    "queryOptions": {
                        "maxDataPoints": 600,
                        "minInterval": "15s"
                    }
                },
                "desc": "",
                "enableTransform": true,
                "gridPos": {
                    "h": 42,
                    "w": 24,
                    "x": 0,
                    "y": 0
                },
                "id": 1,
                "overrides": [],
                "plugins": {
                    "alert": {
                        "chart": {
                            "height": "200px",
                            "show": true,
                            "showLabel": "auto",
                            "stack": "auto",
                            "tooltip": "single"
                        },
                        "clickActions": [
                            {
                                "action": "\n// setVariable: (varName:string, varValue:string) => void \n// navigate: react-router-dom -> useNavigate() -> navigate \n// setDateTime: (from: Timestamp, to: TimeStamp) => void\nfunction onRowClick(row, navigate, setVariable, setDateTime) {\n\n    const activeAt = new Date(row.activeAt).getTime() / 1000\n    const job = row.labels.job\n\n    setVariable(\"gtest\", job)\n    setDateTime(activeAt - 300, activeAt + 300)\n    console.log(\"here3333 dig1\",activeAt,job)\n}\n",
                                "color": "brand",
                                "name": "Dig",
                                "style": "solid"
                            }
                        ],
                        "disableDatasource": true,
                        "filter": {
                            "alertLabel": "",
                            "datasources": [
                                1
                            ],
                            "ruleLabel": "",
                            "ruleName": "",
                            "state": [
                                "firing",
                                "pending",
                                "resolved"
                            ]
                        },
                        "orderBy": "newest",
                        "stat": {
                            "color": "$red",
                            "colorMode": "bg-solid",
                            "layout": "vertical",
                            "showGraph": true,
                            "statName": "Alerts",
                            "style": "lines"
                        },
                        "toolbar": {
                            "show": true,
                            "width": 200
                        },
                        "viewMode": "list"
                    },
                    "text": {
                        "alignItems": "top",
                        "disableDatasource": true,
                        "fontSize": "1.2rem",
                        "fontWeight": "500",
                        "justifyContent": "left",
                        "md": "#Welcome to observex\n This is a new panel\n You can edit it by clicking the edit button on the top title\n ###Have fun!"
                    }
                },
                "styles": {
                    "border": "Normal",
                    "decoration": {
                        "height": "20px",
                        "justifyContent": "center",
                        "left": "",
                        "reverse": false,
                        "top": "-30px",
                        "type": "None",
                        "width": "100%"
                    },
                    "title": {
                        "color": "inherit",
                        "decoration": {
                            "height": "50px",
                            "margin": "10px",
                            "type": "None",
                            "width": "160px"
                        },
                        "fontSize": "1rem",
                        "fontWeight": "500",
                        "paddingBottom": "0px",
                        "paddingLeft": "0px",
                        "paddingRight": "0px",
                        "paddingTop": "0px"
                    }
                },
                "title": "",
                "transform": "function transform(rawData,lodash, moment) {\n    // for demonstration purpose: how to use 'moment'\n    const t = moment(new Date()).format(\"YY-MM-DD HH:mm::ss\")\n    console.log(t)\n    // DON'T modify rawData, use lodash.cloneDeep to create a new object\n    const data = lodash.cloneDeep(rawData)\n    return data\n}",
                "type": "alert",
                "valueMapping": null
            }
        ],
        "sharedTooltip": false,
        "styles": {
            "bgEnabled": false,
            "border": "None"
        },
        "tags": [],
        "variables": []
    }
}
`
