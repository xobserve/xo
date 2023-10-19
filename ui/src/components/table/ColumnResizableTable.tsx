import React from 'react'


import {
    useReactTable,
    getCoreRowModel,
    ColumnDef,
    flexRender,
} from '@tanstack/react-table'
import { Box, useColorModeValue } from '@chakra-ui/react'
import { BsThreeDotsVertical } from 'react-icons/bs'
import CustomScrollbar from 'components/CustomScrollbar/CustomScrollbar'


interface Props {
    data: Record<string, any>[]
    columns: ColumnDef<any>[]
    fontSize?: number
    wrapLine?: boolean
    stickyHeader?: boolean
    allowOverflow?: boolean
    height: string
}

const ColumnResizableTable = (props: Props) => {

    const { data, columns, fontSize = 13, wrapLine = true, stickyHeader=true, allowOverflow=false,height="100%"} = props


    const table = useReactTable({
        data,
        columns,
        columnResizeMode: "onChange",
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <Box className="column-resizable-table" sx={getStyles()}>
            <CustomScrollbar hideHorizontalTrack={!allowOverflow} >
            <div style={{
                 height: height,
                 maxWidth: "100%",
                //  overflowX: allowOverflow ? null : "hidden",
            }}>
                <table
                    style={{
                        width: "100%",
                        fontSize: fontSize,
                        tableLayout: 'fixed',
                        fontWeight: useColorModeValue(400, 500)
                    }}
                >
                    <thead style={stickyHeader ? {position: "sticky", top:0, margin:0, zIndex: 1, background: useColorModeValue("rgb(252,254,255)", '#2a313E')} : null}>
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
                                )})}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover-text" style={{cursor: "pointer"}}>
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
            height: '26px',
        },

        'td,.td': {
            height: '24px'
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