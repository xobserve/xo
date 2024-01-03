package storageData

var HomeDashboard = `
{
    "title": "Home Dashboard",
    "editable": true,
    "data": {
        "allowPanelsOverlap": false,
        "annotation": {
            "color": "rgba(0, 211, 255, 1)",
            "enable": true,
            "enableRole": "Admin",
            "tagsFilter": ""
        },
        "autoSaveInterval": 120,
        "description": "",
        "enableAutoSave": false,
        "enableUnsavePrompt": true,
        "hiddenPanels": [],
        "hidingVars": "",
        "layout": "vertical",
        "lazyLoading": false,
        "panels": [
            {
                "collapsed": false,
                "conditionRender": {
                    "type": "variable",
                    "value": ""
                },
                "datasource": {
                    "id": 1,
                    "queries": [
                        {
                            "data": {},
                            "id": 65,
                            "legend": "",
                            "metrics": "go_gc_duration_seconds",
                            "visible": true
                        }
                    ],
                    "queryOptions": {
                        "maxDataPoints": 600,
                        "minInterval": "15s"
                    },
                    "type": "prometheus"
                },
                "desc": "",
                "enableConditionRender": false,
                "enableScopeTime": false,
                "enableTransform": false,
                "gridPos": {
                    "h": 20,
                    "w": 12,
                    "x": 5,
                    "y": 0
                },
                "id": 1704289622,
                "interactions": {},
                "overrides": [],
                "plugins": {
                    "text": {
                        "alignItems": "top",
                        "disableDatasource": true,
                        "fontSize": "1.2em",
                        "fontWeight": "500",
                        "justifyContent": "left",
                        "md": "#Welcome to xobserve\n This is a new panel\n You can edit it by clicking the edit button on the top title\n ###Have fun!",
                        "value": {
                            "decimal": 3,
                            "units": [],
                            "unitsType": "none"
                        }
                    }
                },
                "scopeTime": null,
                "styles": {
                    "border": "None",
                    "borderOnHover": true,
                    "decoration": {
                        "height": "20px",
                        "justifyContent": "center",
                        "left": "",
                        "reverse": false,
                        "top": "-30px",
                        "type": "None",
                        "width": "100%"
                    },
                    "heightReduction": 0,
                    "marginLeft": 0,
                    "marginTop": 0,
                    "palette": "echarts-light",
                    "title": {
                        "color": "inherit",
                        "decoration": {
                            "height": "50px",
                            "margin": "10px",
                            "type": "None",
                            "width": "160px"
                        },
                        "fontSize": "14px",
                        "fontWeight": "500",
                        "paddingBottom": "0px",
                        "paddingLeft": "0px",
                        "paddingRight": "0px",
                        "paddingTop": "0px",
                        "position": "left"
                    },
                    "widthReduction": 0
                },
                "templateId": 0,
                "thresholds": {
                    "enable": false,
                    "thresholdArrow": "none",
                    "thresholds": {
                        "enableTransform": false,
                        "mode": "absolute",
                        "thresholds": [
                            {
                                "color": "#9FE6B8",
                                "value": null
                            }
                        ],
                        "transform": "function transform(data, lodash){\n\n}"
                    },
                    "thresholdsDisplay": "None"
                },
                "title": "",
                "transform": "function transform(rawData,lodash, moment) {\n    // for demonstration purpose: how to use 'moment'\n    // const t = moment(new Date()).format(\"YY-MM-DD HH:mm::ss\")\n    return rawData\n}",
                "type": "text",
                "valueMapping": null
            }
        ],
        "sharedTooltip": false,
        "styles": {
            "bg": {
                "colorMode": "dark",
                "url": ""
            },
            "bgColor": "",
            "bgEnabled": false,
            "border": "None"
        },
        "variables": []
    },
    "weight": 0,
    "tags": []
}`
