import { Datasource } from "types/datasource"
import { isHttpDatasourceValid } from "./DatasourceEditor"

export const checkAndTestHttp = async (ds:Datasource) => {
    // check datasource setting is valid
    const res = isHttpDatasourceValid(ds)
    if (res != null) {
        return res
    }

    return true
}