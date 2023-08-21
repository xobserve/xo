package storageData

var HomeDashboard = `
{
    "id":  "d-home",
    "title": "Home Dashboard",
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
                    },
                    "type": "testdata"
                },
                "desc": "",
                "enableTransform": true,
                "gridPos": {
                    "h": 23,
                    "w": 15,
                    "x": 3,
                    "y": 5
                },
                "id": 1,
                "overrides": [],
                "plugins": {
                    "text": {
                        "alignItems": "center",
                        "disableDatasource": true,
                        "fontSize": "1.2rem",
                        "fontWeight": "500",
                        "justifyContent": "center",
                        "md": "#Welcome to Datav\n This is a new panel\n You can edit it by clicking the edit button on the top title\n ###Have fun!"
                    }
                },
                "styles": {
                    "border": "Border5",
                    "decoration": {
                        "height": "20px",
                        "justifyContent": "center",
                        "left": "",
                        "reverse": false,
                        "top": "-30px",
                        "type": "Decoration3",
                        "width": "50%"
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
                "type": "text"
            }
        ],
        "sharedTooltip": false,
        "styles": {
            "bgEnabled": false,
            "border": "None"
        },
        "variables": []
    }
}`
