// Copyright 2023 Datav.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { Box, Center, Text, useMediaQuery, VStack } from "@chakra-ui/react"
import { PanelProps } from "types/dashboard"
import React, { memo, useMemo } from "react";
import {  DatavLogPanel } from "./types";
import ColumnResizableTable from "components/table/ColumnResizableTable";
import { ColumnDef } from "@tanstack/react-table";
import { IsSmallScreen } from "src/data/constants";
import moment from "moment";
import { isEmpty } from "utils/validate";
import NoData from "src/views/dashboard/components/PanelNoData";
import DatavLogChart from "./Chart";
import Search from "./Search";

interface Props extends PanelProps {
    panel: DatavLogPanel
}

const PanelWrapper = memo((props: Props) => {
    const data = props.data.flat()

    if (isEmpty(data)) {
        return <Center height="100%"><NoData /></Center>
    }

    return (<>
        {
            !isLogData(data[0])
                ?
                <Center height="100%">
                    <VStack>
                        <Text fontWeight={500} fontSize="1.1rem">Data format not support!</Text>
                        <Text className='color-text'>Try to change to Datav datasource to use this panel</Text>
                    </VStack>
                </Center>
                :
                <Panel {...props} data={data[0]} />
        }
    </>
    )
})



export default PanelWrapper


const Panel = (props: Props) => {
    const { panel, data } = props

    const [isMobileScreen] = useMediaQuery(IsSmallScreen)

    const wrapLine = false

    const defaultColumns: ColumnDef<any>[] = useMemo(() => ([
        {
            accessorKey: 'timestamp',
            header: 'Timestamp',
            size: isMobileScreen ? 100 : 170,
            cell: info => <Text opacity={0.7} fontWeight={550} fontSize={12}>{info.getValue() as any}</Text> ,
        },
        // {
        //     accessorFn: row => row.lastName,
        //     id: 'lastName',
        //     cell: info => info.getValue(),
        //     header: () => <span>Last Name</span>,
        // },

        {
            accessorKey: 'severity_text',
            header: "Level",
            cell: info => {
                const severity = info.getValue() as any
            return <Text className={severity == "error" && "error-text"}>{severity}</Text>
            } ,
            size: isMobileScreen ? 50 : 90
        },
        {
            accessorKey: '_service',
            header: "Service",
            size: isMobileScreen ? 150 : 120
        },
        {
            accessorKey: 'body',
            header: 'Message',
            size: wrapLine ? 500 : 800
        }
    ]), [isMobileScreen, wrapLine])

    const logs = useMemo(() => {
        const logs = []
        for (const log of data.logs) {
            logs.push({
                ...log,
                timestamp: isMobileScreen ? moment(log.timestamp).format("MM-DD hh:mm:ss") : new Date(log.timestamp).toLocaleString()
            })
        }
        return logs
    }, [isMobileScreen, data])

    return (<Box px="2" height="100%" id="datav-log-panel" >
        <Search />
        <Box height="120px" mb="2">
        <DatavLogChart panel={panel} width={props.width} data={data.chart} />
        </Box>
        <ColumnResizableTable columns={defaultColumns} data={logs} wrapLine={wrapLine} fontSize={13} allowOverflow={false} height={props.height + 'px'} />
    </Box>)
}


const isLogData = (data: any)  => {
    if (!data.logs) {
        return false 
    }

    return true
}