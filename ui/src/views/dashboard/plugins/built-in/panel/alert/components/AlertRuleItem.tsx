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

import { Box, Button, Divider, Flex, HStack, Image, StackDivider, Table, TableContainer, Tag, Tbody, Td, Text, Th, Thead, Tooltip, Tr, VStack, chakra, useColorMode, useToast } from "@chakra-ui/react"
import moment from "moment"
import React, { memo, useEffect, useId, useState } from "react"
import { Panel } from "types/dashboard"
import { AlertRule } from "../types"
import { formatDuration } from 'utils/date'
import { FiringIcon, PendingIcon } from "./Icons"
import { paletteColorNameToHex } from "utils/colors"
import { isFunction, upperFirst } from "lodash"
import CollapseIcon from "src/components/icons/Collapse"
import { dateTimeFormat } from "utils/datetime/formatter"
import { IoMdInformationCircleOutline } from "react-icons/io"
import { getLabelNameColor } from "../../log/utils"
import { FaCheck } from "react-icons/fa"
import { jsonToEqualPairs } from "utils/format"
import { commonInteractionEvent, genDynamicFunction } from "utils/dashboard/dynamicCall"
import { isEmpty } from "utils/validate"
import { externalDatasourcePlugins } from "../../../../external/plugins"


interface Props {
    rule: AlertRule
    panel: Panel
    collapsed: boolean
    onSelectLabel: any
    width: number
    colorGenerator: any
}

const AlertRuleItem = memo((props: Props) => {
    const { rule, panel, onSelectLabel, width, colorGenerator } = props
    const alertId = useId()
    const toast = useToast()
    const [collapsed, setCollapsed] = useState(true)
    const { colorMode } = useColorMode()
    useEffect(() => {
        setCollapsed(props.collapsed)
    }, [props.collapsed])


    const getStateColor = state => {
        return paletteColorNameToHex(state == "firing" ? "$light-red" : (state == "pending" ? "$yellow" : "$green"), colorMode)
    }

    const onActionClick = (e, action, alert, ruleName) => {
        e.stopPropagation()

        alert.ruleName = ruleName
        const onClick = genDynamicFunction(action);
        if (!isFunction(onClick)) {
            toast({
                title: "Error",
                description: "The action function you defined is not valid",
                status: "error",
                duration: 4000,
                isClosable: true,
            })
        } else {
            commonInteractionEvent(onClick, alert)
        }

    }

    const dsIcon = externalDatasourcePlugins[rule.fromDs] ? `/plugins/external/datasource/${rule.fromDs}.svg` : `/plugins/datasource/${rule.fromDs}.svg`
    return (<Box fontSize={width > 600 ? "0.9rem" : "0.8rem"} py="1" pl={width < 400 ? 0 : 2} pr={width < 400 ? 1 : 2}>
        <Flex justifyContent="space-between" alignItems="center" cursor="pointer" onClick={() => setCollapsed(!collapsed)} >
            <HStack>
                {rule.state == "firing" ? <FiringIcon fill={getStateColor(rule.state)} width="14" height="14" /> : (rule.state == "pending" ? <PendingIcon width="14" height="14" fill={getStateColor(rule.state)} /> : <FaCheck color={getStateColor(rule.state)} />)}
                <Box>
                    <Text>{rule.name}</Text>
                    <HStack textStyle="annotation" spacing={1} mt={width > 400 ? 2 : 1}>
                        <CollapseIcon collapsed={collapsed} fontSize="0.6rem" opacity="0.6" />
                        <Text>{rule.alerts.length} alerts</Text>
                        {width > 400 && <Text>|</Text>}
                        {width > 600 && <><Text>group: {rule.groupName}</Text>
                            <Text>|</Text></>}
                        {width > 400 && <HStack>
                            {Object.keys(rule.labels).map((k) => {
                                return <Flex key={k}>
                                    <Text>{k}=</Text>
                                    <Text className="color-text">{rule.labels[k]}</Text>
                                </Flex>
                            })}
                        </HStack>}
                    </HStack>
                </Box>
            </HStack>
            {rule.alerts.length > 0 && width > 250 && <Text fontSize="0.8rem">
                <chakra.span color={getStateColor(rule.state)} fontSize={width > 400 ? "0.9rem" : "0.8rem"} fontWeight="500">{upperFirst(rule.state)}</chakra.span>
                {width > 400 && <chakra.span> for {formatDuration((new Date().getTime() - new Date(rule.alerts[0].activeAt).getTime()) * 1000)}</chakra.span>}
            </Text>}
        </Flex>
        {
            !collapsed && <>
                {width > 600
                    ?
                    <Box className="bordered" px="2" py="2" ml="6" mt="2" >
                        <Flex justifyContent="space-between" alignItems="top">
                            <Box>
                                <VStack alignItems="left" spacing={3}>
                                    <HStack>
                                        <Text width="100px">annotations</Text>
                                        <HStack textStyle="annotation">
                                            {Object.keys(rule.annotations).map((k) => {
                                                return <Flex key={k}>
                                                    <Text>{k}=</Text>
                                                    <Text>{rule.annotations[k]}</Text>
                                                </Flex>
                                            })}
                                        </HStack>
                                    </HStack>
                                    <HStack>
                                        <HStack width="100px" spacing={1}>
                                            <Text>evaluation</Text>
                                            <Tooltip label="time info of executing your alert expression, first value is the executing time point, second is how long the executing takes, if it take long, maybe you need to optimize the expression or using cache, e.g use Prometheus recording rules"><Box><IoMdInformationCircleOutline /></Box></Tooltip>
                                        </HStack>
                                        <Text textStyle="annotation">
                                            {dateTimeFormat(rule.lastEvaluation)} / {formatDuration(rule.evaluationTime * 1e6)}
                                        </Text>
                                    </HStack>
                                    <HStack>
                                        <HStack width="100px" spacing={1}>
                                            <Text>Rule labels</Text>
                                        </HStack>
                                        <Text textStyle="annotation">
                                            {jsonToEqualPairs(rule.labels)}
                                        </Text>
                                    </HStack>
                                    <HStack>
                                        <Text width="100px">expression</Text>
                                        <Text textStyle="annotation" className="color-text" fontWeight={600}>
                                            {rule.query}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </Box>
                            <VStack alignItems="left" fontSize="0.85rem" spacing={3}>
                                <Box>
                                    <Text>Datasource</Text>
                                    <HStack alignItems="end">
                                        <Image width="20px" height="20px" src={dsIcon} />
                                        <Text mt="2" textStyle="annotation">{rule.fromDs}</Text>
                                    </HStack>
                                </Box>
                                <Box>
                                    <Text>Namespace / Group</Text>
                                    <HStack>
                                        <Text mt="2" textStyle="annotation">{rule.groupNamespace} / {rule.groupName}</Text>
                                    </HStack>
                                </Box>
                            </VStack>
                        </Flex>
                        <Divider mt="2" />
                        <TableContainer mt="2">
                            <Table variant='simple'>
                                <Thead>
                                    <Tr>
                                        <Th>Labels</Th>
                                        <Th>State</Th>
                                        <Th>Active</Th>
                                        <Th>Value</Th>
                                        {panel.plugins.alert?.clickActions && <Th>Actions</Th>}
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {
                                        rule.alerts.map((alert) => {
                                            const color = getLabelNameColor(alert.name, colorMode, colorGenerator)
                                            return <Tr key={alertId}>
                                                <Td>
                                                    <HStack>
                                                        <Text fontSize="0.8rem" py="2px" px="2" borderColor={color} className="bordered"  onClick={() => onSelectLabel(alert.name)} cursor="pointer">{alert.name}</Text>

                                                    </HStack>
                                                </Td>
                                                <Td>
                                                    <chakra.span color={getStateColor(alert.state)} fontSize="0.9rem">{upperFirst(alert.state)}</chakra.span>
                                                </Td>
                                                <Td>
                                                    <Text>{dateTimeFormat(alert.activeAt)}</Text> <Text textStyle="annotation">{moment(alert.activeAt).fromNow()}</Text>
                                                </Td>
                                                <Td>
                                                    {alert.value}
                                                </Td>
                                                {panel.plugins.alert?.clickActions && <Td>
                                                    <HStack spacing={1}>
                                                        {
                                                            panel.plugins.alert.clickActions.map((action, i) =>
                                                                !isEmpty(action.name) && <Button key={i + action.name} size="sm" variant={action.style} colorScheme={action.color} onClick={(e) => onActionClick(e, action.action, alert, rule.name)}>{action.name}</Button>)
                                                        }
                                                    </HStack>
                                                </Td>}
                                            </Tr>
                                        })
                                    }
                                </Tbody>

                            </Table>
                        </TableContainer>
                    </Box>
                    :
                    <VStack alignItems="left" className="bordered" py="1" px="2" mt="2" >
                        <HStack alignItems="top">
                            <Text width="100px">Datasource</Text>
                            <HStack alignItems="end">
                                <Image width="15px" height="15px" src={`/plugins/datasource/${rule.fromDs}.svg`} />
                                <Text textStyle="annotation">{rule.fromDs}</Text>
                            </HStack>
                        </HStack>
                        <HStack alignItems="top">
                            <HStack width="100px" spacing={1}>
                                <Text>Rule labels</Text>
                            </HStack>
                            <Text textStyle="annotation">
                                {jsonToEqualPairs(rule.labels)}
                            </Text>
                        </HStack>
                        <HStack alignItems="top">
                            <Text width="100px">annotations</Text>
                            <HStack textStyle="annotation">
                                {Object.keys(rule.annotations).map((k) => {
                                    return <Text key={k}>{k}={rule.annotations[k]}</Text>
                                })}
                            </HStack>
                        </HStack>
                        <HStack alignItems="top">
                            <Text width="100px">expression</Text>
                            <Text textStyle="annotation" className="color-text" fontWeight={600} fontSize="0.75rem">
                                {rule.query}
                            </Text>
                        </HStack>
                        <Divider />
                        <VStack alignItems="left" divider={<StackDivider />}>
                            {
                                rule.alerts.map((alert) => {
                                    const color = getLabelNameColor(alert.name, colorMode, colorGenerator)
                                    return <Box fontSize="0.8rem" key={alert.name}>
                                        <Text size="sm" onClick={() => onSelectLabel(alert.name)} cursor="pointer" fontWeight={500}>{jsonToEqualPairs(alert.labels)}</Text>
                                        <HStack mt="2">
                                            <Text color={getStateColor(alert.state)}>{upperFirst(alert.state)}</Text>
                                            <Text>{dateTimeFormat(alert.activeAt)}</Text> <Text>{moment(alert.activeAt).fromNow()}</Text>
                                        </HStack>
                                        <Text mt="2">{alert.value}</Text>
                                        {panel.plugins.alert?.clickActions &&
                                            <HStack spacing={1}>
                                                {
                                                    panel.plugins.alert.clickActions.map((action, i) =>
                                                        !isEmpty(action.name) && <Button key={i + action.name} size={width > 600 ? "sm" : "xs"} variant={action.style} colorScheme={action.color} onClick={(e) => onActionClick(e, action.action, alert, rule.name)}>{action.name}</Button>)
                                                }
                                            </HStack>}
                                    </Box>
                                })
                            }
                        </VStack>
                    </VStack>}
            </>

        }
    </Box>)
})

export default AlertRuleItem