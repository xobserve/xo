import React, { useEffect, useMemo, useRef, useState } from 'react'


import {
    useReactTable,
    getCoreRowModel,
    ColumnDef,
    flexRender,
} from '@tanstack/react-table'
import { Box, Center, HStack, Spinner, Text, useColorModeValue } from '@chakra-ui/react'
import { BsThreeDotsVertical } from 'react-icons/bs'
import CustomScrollbar from 'components/CustomScrollbar/CustomScrollbar'
import {
    useInfiniteQuery,
} from '@tanstack/react-query'
import { isEmpty } from 'utils/validate'
import { cloneDeep } from 'lodash'

interface Props {
    totalRowCount: number
    data: Record<string, any>[]
    columns: ColumnDef<any>[]
    fontSize?: number
    wrapLine?: boolean
    stickyHeader?: boolean
    allowOverflow?: boolean
    height: number
    onLoadPage?: any
    onRowsCountChange?: any
    onRowClick?: any
}

const ColumnResizableTable = (props: Props) => {

    const { columns, fontSize = 13, wrapLine = true, stickyHeader = true, allowOverflow = false, height = "100%", totalRowCount, onLoadPage, onRowsCountChange, onRowClick } = props
    const [initData, setInitData] = useState<Record<string, any>[]>([])
    const currentPage = useRef(1)
    const tableContainerRef = React.useRef<HTMLDivElement>(null)
    useEffect(() => {
        const dashGrid = document.getElementById("resizable-table-top")
        dashGrid.scrollIntoView({ block: "center" })
        setTimeout(() => {
            setInitData(cloneDeep(props.data))
            currentPage.current = 1
            onRowsCountChange && onRowsCountChange(props.data.length)
        }, 500)

        // refetch()
    }, [props.data])

    //we need a reference to the scrolling element for logic down below

    const totalFetched = initData.length

    const { fetchNextPage, isFetching, isLoading } =
        useInfiniteQuery(
            ['table-data', []], //adding sorting state as key causes table to reset and fetch from new beginning upon sort
            async ({ pageParam = 0 }) => {
                // const start = pageParam * fetchSize
                // console.log("here333333:",start, totalFetched, fetchSize)
                // if (start - totalFetched <= fetchSize) {
                const fetchedData = await fetchData() //pretend api call
                return fetchedData
                // }
            },
            {
                getNextPageParam: (_lastGroup, groups) => groups.length,
                keepPreviousData: false,
                refetchOnWindowFocus: false,
            }
        )

    const fetchData = async () => {
        if (isEmpty(initData)) {
            return
        }

        const newPageData = await onLoadPage(currentPage.current)
        const d = [...initData, ...newPageData]
        setInitData(d)
        onRowsCountChange && onRowsCountChange(d.length)
        currentPage.current += 1
        return {
            data: d,
            meta: {
                totalRowCount: totalRowCount,
            },
        }
    }

    //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
    const fetchMoreOnBottomReached = React.useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
            if (containerRefElement) {
                const { scrollHeight, scrollTop, clientHeight } = containerRefElement

                //once the user has scrolled within 300px of the bottom of the table, fetch more data if there is any
                if (
                    scrollHeight - scrollTop - clientHeight < 400 &&
                    !isFetching &&
                    totalFetched < totalRowCount
                ) {
                    fetchNextPage()
                }
            }
        },
        [fetchNextPage, isFetching, totalFetched, totalRowCount]
    )

    useEffect(() => {
        fetchMoreOnBottomReached(tableContainerRef.current)
    }, [fetchMoreOnBottomReached])

    const table = useReactTable({
        data: initData,
        columns,
        columnResizeMode: "onChange",
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <Box className="column-resizable-table" sx={getStyles()} >
            <CustomScrollbar hideHorizontalTrack={!allowOverflow} onScroll={e => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
            >
                <div
                    style={{
                        height: height as number - (isFetching ? 40 : 0),
                        maxWidth: "100%",
                        //  overflowX: allowOverflow ? null : "hidden",
                    }}
                    ref={tableContainerRef}
                >
                    <div id="resizable-table-top" />
                    <table
                        style={{
                            width: "100%",
                            fontSize: fontSize,
                            tableLayout: 'fixed',
                            fontWeight: useColorModeValue(400, 500)
                        }}
                    >
                        <thead style={stickyHeader ? { position: "sticky", top: 0, margin: 0, zIndex: 1, background: useColorModeValue("rgb(252,254,255)", '#2a313E') } : null}>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header, i) => {
                                        return (
                                            <th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={{ width: header.getSize() }}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                                {i < headerGroup.headers.length - 1 && <Box

                                                    onMouseDown={header.getResizeHandler()}
                                                    onTouchStart={header.getResizeHandler()}
                                                    className={`resizer ${header.column.getIsResizing() ? 'isResizing' : ''}`}
                                                ><BsThreeDotsVertical fontSize="0.7rem" opacity="0.5" /></Box>}
                                            </th>
                                        )
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover-text" style={{ cursor: "pointer" }} onClick={() => onRowClick(row.original)}>
                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            className={wrapLine ? "" : "text-truncate"}
                                            key={cell.id}
                                            style={{
                                                verticalAlign: "top",
                                                overflow: allowOverflow ? null : "hidden"
                                            }}
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>

            </CustomScrollbar>
            {isFetching && <Center> <HStack>
                <Spinner
                    speed='0.65s'
                    emptyColor='gray.200'
                    color='brand.500'
                    size='sm'
                />
                <Text className="color-text">Loading logs...</Text>

            </HStack>
            </Center>}

        </Box >
    )
}


export default ColumnResizableTable


const getStyles = () => {
    return {
        'th,.th': {
            padding: '0px 4px',
            position: 'relative',
            fontWeight: 'bold',
            textAlign: 'left',
            height: '23px',
        },

        'td,.td': {
            height: '22px'
        },

        '.resizer': {
            position: 'absolute',
            right: 0,
            top: 0,
            height: '100%',
            cursor: 'col-resize',
            userSelect: 'none',
            touchAction: 'none',
            display: "flex",
            alignItems: "center",
        },

        '.resizer.isResizing': {
            opacity: 1
        },
    }
}