// Copyright (c) 2018 Uber Technologies, Inc.
//
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

import React, { Component } from 'react';
import { Table, Select } from 'antd';
import moment from 'moment';
import { ColumnProps } from 'antd/es/table';
import { TNil } from 'types/misc';
import { Trace, TraceSpan } from 'types/plugins/trace';
import { timeConversion } from '../../../../../../../../utils/date';
import { getTargetEmptyOrBlank } from '../../../utils/get-target';
import { Box, Button, Flex, HStack, Link, Text } from '@chakra-ui/react';

const Option = Select.Option;

function getNestedProperty(path: string, span: any): string {
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null;
    }, span);
}

type Props = {
    trace: Trace;
    uiFindVertexKeys: Set<string> | TNil;
    uiFind: string | null | undefined;
};

type State = {
    searchText: string;
    searchedColumn: string;
    data: TraceSpan[];
    serviceNamesList: string[];
    operationNamesList: string[];
    serviceNameOperationsMap: Map<string, string[]>;
    filtered: Record<string, string[]>;
    selectedServiceName: string[];
    selectedOperationName: string[];
    filteredData: TraceSpan[];
};





export default class TraceSpanView extends Component<Props, State> {
    constructor(props: Props, state: State) {
        super(props, state);
        const serviceNamesList = new Set<string>();
        const operationNamesList = new Set<string>();
        const serviceNameOperationsMap = new Map<string, string[]>();

        this.props.trace.spans.forEach(span => {
            serviceNamesList.add(span.process.serviceName);
            operationNamesList.add(span.operationName);
            const operationNames = serviceNameOperationsMap.get(span.process.serviceName) || [];
            operationNames.push(span.operationName);
            serviceNameOperationsMap.set(span.process.serviceName, operationNames);
        });

        this.state = {
            searchText: '',
            searchedColumn: '',
            data: this.props.trace.spans,
            serviceNamesList: [...serviceNamesList],
            operationNamesList: [...operationNamesList],
            serviceNameOperationsMap,
            filteredData: this.props.trace.spans,
            filtered: {},
            selectedServiceName: [],
            selectedOperationName: [],
        };
        this.handleResetFilter = this.handleResetFilter.bind(this);
        this.uniqueOperationNameOptions = this.uniqueOperationNameOptions.bind(this);
    }

    handleResetFilter() {
        this.setState(previousState => ({
            selectedServiceName: [],
            selectedOperationName: [],
            filteredData: previousState.data,
        }));
    }

    uniqueOperationNameOptions() {
        let operationNamesList: string[] = [];
        const serviceNameOperationsMap = this.state.serviceNameOperationsMap;
        if (this.state.filtered['process.serviceName']) {
            this.state.filtered['process.serviceName'].forEach((currentValue: any) => {
                operationNamesList = operationNamesList.concat(serviceNameOperationsMap.get(currentValue) || []);
            });
        } else {
            operationNamesList = this.state.operationNamesList;
        }
        return [...new Set(operationNamesList)];
    }

    onFilteredChangeCustom(selectedValues: string[], accessor: keyof TraceSpan) {
        const filtered = this.state.filtered;
        filtered[accessor] = selectedValues;
        const data = this.state.data.filter(span => {
            let isSpanIncluded;
            Object.keys(filtered).every(filterColumn => {
                if (filtered[filterColumn].length) {
                    const spanValue = getNestedProperty(filterColumn, span);
                    isSpanIncluded = filtered[filterColumn].includes(spanValue);
                } else {
                    isSpanIncluded = true;
                }
                return isSpanIncluded;
            });

            return isSpanIncluded;
        });

        this.setState(previousState => ({
            ...previousState,
            filtered,
            filteredData: data,
        }));
    }

    render() {
        const columns: ColumnProps<TraceSpan>[] = [
            {
                title: 'Service Name',
                width: '25%',
                sorter: (a, b) => a.process.serviceName.localeCompare(b.process.serviceName),
                render: (text: any, record: TraceSpan) => {
                    return (
                        <span
                        >
                            {record.process.serviceName}
                        </span>
                    );
                },
            },
            {
                title: 'Operation',
                dataIndex: 'operationName',
                width: '25%',
                sorter: (a, b) => a.operationName.localeCompare(b.operationName),
            },
            {
                title: 'ID',
                dataIndex: 'spanID',
                sorter: (a, b) => a.spanID.localeCompare(b.spanID),
                render: (text: any, record: TraceSpan) => {
                    return (
                        <Link
                            href={window.location.pathname + `?search=${text}`}
                            target={getTargetEmptyOrBlank()}
                            rel="noopener noreferrer"
                            color='brand.600'
                        >
                            {text}
                        </Link>
                    );
                },
            },
            {
                title: 'Duration',
                dataIndex: 'duration',
                sorter: (a, b) => a.duration - b.duration,
                render: (cell: string) => {
                    return timeConversion(parseInt(cell, 10));
                },
            },
            {
                title: 'Start Time',
                dataIndex: 'startTime',
                sorter: (a, b) => a.startTime - b.startTime,
                render: (cell: number) => {
                    return moment(cell / 1000).format('yy-MM-DD HH:mm:ss');
                },
            },
        ];


        return (
            <Box className="trace-span-table">
                <Flex justifyContent="space-between" alignItems="center" py="2">
                    <HStack>
                        <HStack>
                            <Text minWidth="fit-content">Service name</Text>
                            <Select
                                allowClear
                                showSearch
                                mode="multiple"
                                style={{ width: '200px' }}
                                maxTagCount={4}
                                value={this.state.selectedServiceName}
                                maxTagPlaceholder={`+ ${this.state.selectedServiceName.length - 4} Selected`}
                                placeholder="Please Select Service "
                                onChange={entry => {
                                    this.setState(previousState => ({
                                        ...previousState,
                                        selectedServiceName: entry as [],
                                    }));
                                    this.onFilteredChangeCustom(entry as [], 'process.serviceName' as keyof TraceSpan);
                                }}
                            >
                                {this.state.serviceNamesList.map(name => {
                                    return <Option key={name}>{name} </Option>;
                                })}
                            </Select>
                        </HStack>

                        <HStack>
                            <Text minWidth="fit-content">Operation name</Text>
                            <Select
                                allowClear
                                showSearch
                                mode="multiple"
                                style={{ width: '200px' }}
                                maxTagCount={4}
                                value={this.state.selectedOperationName}
                                maxTagPlaceholder={`+ ${this.state.selectedOperationName.length - 4} Selected`}
                                placeholder="Please Select Operation"
                                onChange={entry => {
                                    this.setState(previousState => ({
                                        ...previousState,
                                        selectedOperationName: entry as [],
                                    }));
                                    this.onFilteredChangeCustom(entry as [], 'operationName');
                                }}
                            >
                                {this.uniqueOperationNameOptions().map((name: string) => {
                                    return <Option key={name}>{name} </Option>;
                                })}
                            </Select>
                        </HStack>
                    </HStack>
                    <Button size="sm" onClick={this.handleResetFilter}>
                        Reset Filters
                    </Button>
                </Flex>


                <SpansTable columns={columns} data={this.state.filteredData} />

            </Box>
        );
    }
}

const SpansTable = ({ columns, data }) => {
    return (<Table
            className="span-table span-view-table"
            columns={columns}
            dataSource={data}
            pagination={{
                total: data.length,
                pageSizeOptions: ['10', '20', '50', '100'],
                showSizeChanger: true,
                showQuickJumper: true,
            }}
            rowKey="spanID"
            showSorterTooltip={false}
            size="small"
        />)
}