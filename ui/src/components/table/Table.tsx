//@ts-nocheck
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
import React, { useEffect } from 'react'
import { useTable, useFilters, useGlobalFilter,  useSortBy, usePagination } from 'react-table'

import { HStack, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import { DefaultColumnFilter, fuzzyTextFilterFn, GlobalFilter } from './filters'
import { round } from 'lodash'


// Our table component
function ReactTable({ columns, data, enableGlobalSearch = false, enablePagination = false,pageSize=10,enableFilter=false,enableSort=false, showHeader=true,onRowClick=null }) {
    const filterTypes = React.useMemo(
        () => ({
            // Add a new fuzzyTextFilterFn filter type.
            fuzzyText: fuzzyTextFilterFn,
            // Or, override the default text filter to use
            // "startWith"
            text: (rows, id, filterValue) => {
                return rows.filter(row => {
                    const rowValue = row.values[id]
                    return rowValue !== undefined
                        ? String(rowValue)
                            .toLowerCase()
                            .startsWith(String(filterValue).toLowerCase())
                        : true
                })
            },
        }),
        []
    )

    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        state,
        visibleColumns,
        preGlobalFilteredRows,
        setGlobalFilter,
        page, // Instead of using 'rows', we'll use page,
        rows,
        // which has only the rows for the active page

        // The rest of these things are super handy, too ;)
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
    } = useTable(
        {
            columns,
            data,
            defaultColumn, // Be sure to pass the defaultColumn option
            filterTypes,
            initialState: { pageIndex: 0 },
        },
        useFilters, // useFilters!
        useGlobalFilter, // useGlobalFilter!
        useSortBy,
        usePagination
    )

    // We don't want to render all of the rows for this example, so cap
    // it for this use case
    // const firstPageRows = rows.slice(0, 10)
    
    useEffect(() => {
        setPageSize(pageSize)
    },[])
    
    return (
        <>
            <Table {...getTableProps()}>
                {showHeader && <Thead>
                    {headerGroups.map(headerGroup => (
                        <Tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => {
                                return (<Th>
                                    <span {...column.getHeaderProps(enableSort ? column.getSortByToggleProps() : '')}>{column.render('Header')}</span>
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                                ? ' 🔽'
                                                : ' 🔼'
                                            : ''}
                                    </span>
                                    {/* Render the columns filter UI */}
                                    <span>{enableFilter &&column.canFilter ? column.render('Filter') : null}</span>
                                </Th>
                                )
                            }
                            )}
                        </Tr>
                    ))}
                    {enableGlobalSearch && <Tr>
                        <Th
                            colSpan={visibleColumns.length}
                            style={{
                                textAlign: 'left',
                            }}
                        >
                            <GlobalFilter
                                preGlobalFilteredRows={preGlobalFilteredRows}
                                globalFilter={state.globalFilter}
                                setGlobalFilter={setGlobalFilter}
                            />
                        </Th>
                    </Tr>}
                </Thead>}
                <Tbody {...getTableBodyProps()}>
                    {(enablePagination ? page : rows).map((row, i) => {
                        prepareRow(row)
                        return (
                            <Tr {...row.getRowProps()} onClick={onRowClick ? () => {
                                const d = []
                                row.cells.forEach(cell => {
                                    d.push({
                                        name: cell.column.Header,
                                        value: cell.value
                                    })
                                })
                                
                                onRowClick(d)
                            }: null}>
                                {row.cells.map(cell => {
                                    return <Td {...cell.getCellProps()}>{cell.render('Cell')}</Td>
                                })}
                            </Tr>
                        )
                    })}
                </Tbody>
            </Table>
            {enablePagination && <HStack mt="2" className="pagination">
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                    {'<<'}
                </button>{' '}
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                    {'<'}
                </button>{' '}
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                    {'>'}
                </button>{' '}
                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                    {'>>'}
                </button>{' '}
                <span>
                    Page{' '}
                    <strong>
                        {state.pageIndex + 1}  of {pageOptions.length}
                    </strong>{' '}
                </span>
                <span>
                    | &nbsp; Go to page:{' '}
                    <input
                        type="number"
                        defaultValue={state.pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            gotoPage(page)
                        }}
                        style={{ width: '100px' }}
                    />
                </span>{' '}
            </HStack>}
        </>
    )
}

export default ReactTable;


