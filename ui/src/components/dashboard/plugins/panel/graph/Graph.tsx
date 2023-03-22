import UplotReact from "components/uPlot/UplotReact"
import { useEffect, useMemo, useState } from "react"
import { Panel, PanelProps } from "types/dashboard"
import 'uplot/dist/uPlot.min.css';
import uPlot from "uplot"

import { useOptions } from './use-options';
import { DataFrame } from "types/dataFrame";
import { cloneDeep, isEmpty } from "lodash";

import Tooltip from "./Tooltip";
import SeriesTable, { seriesFilterType } from "components/Tooltip/SeriesTable";
import { Box } from "@chakra-ui/react";
import { GraphLayout } from "layouts/plugins/GraphLayout";




const GraphPanel = (props: PanelProps) => {

    const [uplot, setUplot] = useState<uPlot>(null)


    const transformed = transformDataToUplot(props.data)

    return (
        <GraphLayout width={props.width} height={props.height} legend={<SeriesTable placement="bottom" data={props.data} filterType={seriesFilterType.Current} />}>
            {(vizWidth: number, vizHeight: number) => {
                const options = useOptions(props, vizWidth, vizHeight)    
                // if (uplot) {
                //     if (props.width != vizWidth || props.height != vizHeight) {
                //         uplot.setSize({width: vizWidth, height:vizHeight})   
                //     }
                  
                // }
               
                return (options && <UplotReact
                    options={options}
                    data={transformed}
                    onDelete={(chart: uPlot) => { }}
                    onCreate={(chart) => { setUplot((chart)) }}
                >
                    <Tooltip props={props} options={options} />
                </UplotReact>
                )
            }}



        </GraphLayout>)
}

export default GraphPanel


// transform Dataframes to uplot data
const transformDataToUplot = (data: DataFrame[]) => {
    const transformed = []

    // push x-axes data first
    if (isEmpty(data)) {
        return []
    }

    const xField = data[0].fields[0]
    transformed.push(xField.values)

    // push y-axes series data
    for (const d of data) {
        transformed.push(d.fields[1].values)
    }

    return transformed
}