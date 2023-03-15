// 1. Run the query to get the data from datasource
// 2. Convert the data to the format which AiAPM expects

import { PanelQuery } from "types/dashboard"
import mockData from "./mocks/data.json"

export const run_prometheus_query = (queries: PanelQuery[]) => {
    console.log(queries)
}