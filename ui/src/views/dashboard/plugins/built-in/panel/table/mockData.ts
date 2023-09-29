import { flatten, isArray } from "lodash"
import { SeriesData } from "types/seriesData"

export const mockTableDataForTestDataDs = (panel, data) => {
    const res = []
    const d: SeriesData[] = flatten(data)
    if (d.length > 0) {
        if (isArray(d[0].fields)) {
            for (const f of d[0].fields) {
                res.push({
                    label: f.name,
                    value: f.name
                })
            }
        }
    }
    return res
}