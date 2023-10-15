import { DatasourcePluginComponents } from "types/plugin";
import DemoDatasourceEditor from "./DatasourceEditor";
import DemoVariableEditor from "./VariableEditor";
import DemoQueryEditor from "./QueryEditor";
import { queryAlerts, queryVariableValues, replaceQueryWithVariables, runQuery, testDatasource } from "./query_runner";
import getDocs from "./docs";
import { DatasourceTypeVM } from "./types";
import icon from './icon.svg'

const demoComponents: DatasourcePluginComponents = {
    datasourceEditor: DemoDatasourceEditor,
    variableEditor:DemoVariableEditor,
    queryEditor: DemoQueryEditor,
    getDocs: getDocs, //docs showing in panel editor

    // defined in query_runner.ts
    runQuery: runQuery,
    testDatasource: testDatasource,
    replaceQueryWithVariables: replaceQueryWithVariables,
    queryVariableValues: queryVariableValues,
    queryAlerts: queryAlerts,

    settings:{
        type: DatasourceTypeVM,
        icon,
    }
}

export default  demoComponents