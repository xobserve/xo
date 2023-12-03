import { flatten, isArray } from "lodash"
import { SeriesData } from "types/seriesData"

export const getSeriesDataOverrideTargets = (data) => {
    return flatten(data)?.map((s: any) => {
        return {
            label: s.name,
            value: s.name
        }
    })
}