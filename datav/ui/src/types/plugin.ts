import { Panel, PanelDatasource, PanelQuery } from "types/dashboard"
import { TimeRange } from "types/time"

export interface PanelPluginComponents {
    panel: any,
    editor: any,
    overrideEditor?: any,
    overrideRules?: any,
    getOverrideTargets?: (panel, data) => any
    mockDataForTestDataDs?: (panel: Panel, timeRange: TimeRange,ds: PanelDatasource,q: PanelQuery) => any // mock result data  when querying from TestData datasource
    settings: {
        type: string;
        icon: string;
        initOptions: Record<string,any>
        disableAutoQuery?: boolean
    },
}

export interface DatasourcePluginComponents {
    datasourceEditor: any // editor in add/edit datasource page
    variableEditor?: any // editor in variable editor page
    queryEditor?: any // edtidor in panel editor page
    getDocs?: any, //docs showing in panel editor

    runQuery: any // run a query to datasource an get result data
    replaceQueryWithVariables?: any // replace above query with variables

    testDatasource: any // test datasource connection status, used in add/edit datasource page

    queryVariableValues?: any // query variable values from datasource, used in variable editor page

    queryAlerts?: any // query alerts from datasource, used in Alert panel

    settings: {
        type: string;
        icon: string;
        disabled?: () => boolean
    },
}

export interface QueryPluginResult {
    status: "success" | "error"
    error: string 
    data: QueryPluginData
}

export interface QueryPluginData  {
    columns: string[] 
    data: any
    types: Record<string,string>
}