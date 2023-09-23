export interface PanelPluginComponents {
    panel: any,
    editor: any,
    overrideEditor: any,
    overrideRules: any,
    getOverrideTargets: (panel, data) => any
    mockDataForTestDataDs: any // mock result data  when querying from TestData datasource
}

export interface DatasourcePluginComponents {
    datasourceEditor: any // editor in add/edit datasource page
    variableEditor: any // editor in variable editor page
    queryEditor: any // edtidor in panel editor page

    runQuery: any // run a query to datasource an get result data
    replaceQueryWithVariables: any // replace above query with variables

    testDatasource: any // test datasource connection status, used in add/edit datasource page

    queryVariableValues: any // query variable values from datasource, used in variable editor page

    queryAlerts: any // query alerts from datasource, used in Alert panel
}