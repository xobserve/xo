import { isEmpty } from "lodash";
import { ChPluginData } from "./types";
import { Panel, PanelQuery } from "types/dashboard";
import { TimeRange } from "types/time";
import { SeriesData } from "types/seriesData";
import { PanelTypeGraph } from "../../../built-in/panel/graph/types";
import { PanelTypeBar } from "../../../built-in/panel/bar/types";
import { PanelTypeStat } from "../../../built-in/panel/stat/types";


export const mysqlToSeriesData = (data: ChPluginData, panel: Panel, query: PanelQuery, range: TimeRange) => {
    if (isEmpty(data) || data.columns.length == 0 || data.data.length == 0) {
        return null
    }


    let expandTimeRange;
    const et = query.data["expandTimeline"]

    if (isEmpty(et) || et == "auto") {
        expandTimeRange = panel.type == PanelTypeGraph|| panel.type == PanelTypeBar || panel.type == PanelTypeStat
    } else {
        expandTimeRange = et == "always"
    }

    const series: SeriesData = {
        queryId: query.id,
        name: isEmpty(query.legend) ? query.id.toString() : query.legend,
        fields: []
    }

    data.columns.forEach((c,i) => {
        series.fields.push({
            name: c,
            values: []
        })
    })


    data.data.forEach((row,i) => {
        row.forEach((v,i) => {
            const f = series.fields[i]
            if (!f.type) {
                f.type = data.types[f.name] ?? typeof v as any
            }
            f.values.push(v)
        })
    })
    
    return [series]
}