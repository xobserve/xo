// Copyright 2023 xobserve.io Team
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

import { Graph } from '@antv/g6'
import {
  chakra,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Input,
  Select,
  Text,
  Tooltip,
  useDisclosure,
  Wrap,
  useToast,
  NumberInput,
  NumberInputField,
  Alert,
  VStack,
  Switch,
  useMediaQuery,
} from '@chakra-ui/react'
import { cloneDeep, isNumber } from 'lodash'
import { useEffect, useState } from 'react'
import {
  FaArrowDown,
  FaArrowUp,
  FaEye,
  FaFilter,
  FaPlus,
  FaTimes,
} from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { useImmer } from 'use-immer'
import storage from 'utils/localStorage'
import React from 'react'
import { MobileBreakpoint } from 'src/data/constants'

interface Props {
  graph: Graph
  dashboardId: string
  panelId: number
  onFilterRulesChange: any
}

export const enum FilterOperator {
  GreaterThan = '>',
  LowerThan = '<',
  Equal = '=',
  Regex = 'regex',
}
export const enum FilterCombinition {
  And = 'AND',
  Or = 'OR',
}

export const FilteringStorageKey = 'node-filter-'
export const FilteringRelationKey = 'node-relation'

const NodeGraphFilter = ({
  graph,
  dashboardId,
  panelId,
  onFilterRulesChange,
}: Props) => {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [tempRule, setTempRule] = useImmer(null)
  const [rules, setRules] = useImmer<any[]>(null)
  const [edgeOptions, setEdgeOptions] = useState([])
  const [nodeOptions, setNodeOptions] = useState([])
  const [showRelation, setShowRelation] = useState(false)

  useEffect(() => {
    const nodes = graph.getNodes()
    const edges = graph.getEdges()
    if (nodes.length > 0) {
      const model = nodes[0].getModel()
      const option = []
      option.push({ name: 'label', type: typeof model.label })
      Object.keys(model.data).forEach((key) => {
        option.push({ name: key, type: typeof model.data[key] })
      })
      setNodeOptions(option)
    }

    if (edges.length > 0) {
      const model = edges[0].getModel()
      const option = []
      Object.keys(model.data).forEach((key) => {
        option.push({ name: key, type: typeof model.data[key] })
      })
      setEdgeOptions(option)
    }

    const rules = storage.get(FilteringStorageKey + dashboardId + '-' + panelId)
    setRules(rules ?? [])

    const relation = storage.get(
      FilteringRelationKey + dashboardId + '-' + panelId,
    )
    setShowRelation(relation)
  }, [])

  const options = tempRule?.type === 'node' ? nodeOptions : edgeOptions

  const onAddNewRule = () => {
    if (rules.length >= 5) {
      toast({
        description: "you can't add more than 5 rules",
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
      return
    }

    setTempRule({
      id: new Date().getTime(),
      type: 'node',
      key: nodeOptions[0].name,
      operator:
        nodeOptions[0].type == 'string'
          ? FilterOperator.Regex
          : FilterOperator.GreaterThan,
      value: nodeOptions[0].type == 'string' ? '' : 0,
      combination: FilterCombinition.And,
      disabled: false,
    })
  }
  const addRule = () => {
    if (tempRule.operator != FilterOperator.Regex) {
      if (!isNumber(tempRule.value)) {
        toast({
          description: 'value must be numers',
          status: 'warning',
          duration: 2000,
          isClosable: true,
        })
        return
      }
    } else {
      if (tempRule.value == '') {
        toast({
          description: "value can't be empty",
          status: 'warning',
          duration: 2000,
          isClosable: true,
        })
        return
      }
    }

    let exist = false
    let pos
    for (var i = 0; i < rules.length; i++) {
      const rule = rules[i]
      if (rule.id == tempRule.id) {
        exist = true
        pos = i
        break
      }
    }

    if (exist) {
      const newRules = cloneDeep(rules)
      newRules[pos] = tempRule
      setRules(newRules)
      setTempRule(null)
      storage.set(FilteringStorageKey + dashboardId + '-' + panelId, newRules)
    } else {
      const newRules = [...rules, tempRule]
      setRules(newRules)
      setTempRule(null)
      storage.set(FilteringStorageKey + dashboardId + '-' + panelId, newRules)
    }

    onFilterRulesChange()
  }

  const removeRule = (id) => {
    const newRules = rules.filter((r) => r.id != id)
    setRules(newRules)
    storage.set(FilteringStorageKey + dashboardId + '-' + panelId, newRules)
    onFilterRulesChange()
  }

  const moveRule = (id, direction) => {
    const index = rules.findIndex((r) => r.id == id)
    const newRules = [...rules]
    const temp = newRules[index]
    newRules[index] = newRules[index + direction]
    newRules[index + direction] = temp
    setRules(newRules)
    storage.set(FilteringStorageKey + dashboardId + '-' + panelId, newRules)
    toast({
      description: `moved ${direction == 1 ? 'down' : 'up'}`,
      status: 'success',
      duration: 1500,
      isClosable: true,
    })
    onFilterRulesChange()
  }

  const onDisableRule = (i) => {
    const rule = rules[i]
    rule.disabled = !rule.disabled
    const newRules = cloneDeep(rules)
    setRules(newRules)
    storage.set(FilteringStorageKey + dashboardId + '-' + panelId, newRules)
    onFilterRulesChange(newRules)
  }
  const getKeyType = () => {
    const option = options.find((o) => o.name == tempRule.key)
    return option?.type
  }

  const onChangeType = (v) => {
    setTempRule((draft) => {
      draft.type = v
      draft.key = (v == 'node' ? nodeOptions : edgeOptions)[0].name
      draft.operator =
        (v == 'node' ? nodeOptions : edgeOptions)[0].type == 'string'
          ? FilterOperator.Regex
          : FilterOperator.GreaterThan
      draft.value =
        (v == 'node' ? nodeOptions : edgeOptions)[0].type == 'string' ? '' : 0
    })
  }

  const onChangeKey = (v) => {
    setTempRule((draft) => {
      draft.key = v
      draft.operator =
        (v == 'node' ? nodeOptions : edgeOptions)[0].type == 'string'
          ? FilterOperator.Regex
          : FilterOperator.GreaterThan
    })
  }

  const onShowRelationChange = (e) => {
    setShowRelation(e.currentTarget.checked)
    storage.set(
      FilteringRelationKey + dashboardId + '-' + panelId,
      e.currentTarget.checked,
    )
    onFilterRulesChange()
  }

  const placeholder =
    tempRule?.operator == FilterOperator.Regex
      ? 'enter a regex to match'
      : 'enter a number'
  const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
  return (
    <>
      <Tooltip label='Filtering the nodes and edges you want to see'>
        <Box cursor='pointer' onClick={onOpen}>
          <FaFilter />
        </Box>
      </Tooltip>
      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent maxWidth={isLargeScreen ? '350px' : '200px'}>
          <DrawerHeader px='1' borderBottomWidth='1px' p='2'>
            <Flex justifyContent='space-between' alignItems='center'>
              <Text textStyle='title'>Filtering nodes and edges</Text>
              <Button
                fontWeight='normal'
                size='sm'
                cursor='pointer'
                onClick={onAddNewRule}
              >
                New rule
              </Button>
            </Flex>
          </DrawerHeader>
          <DrawerBody px='1'>
            {tempRule && (
              <>
                <Wrap fontSize='0.8rem' spacing='1' mt='1'>
                  {rules.length != 0 &&
                    (tempRule.combination == FilterCombinition.And ? (
                      <Button
                        size='xs'
                        variant='outline'
                        colorScheme='gray'
                        onClick={() => {
                          setTempRule((draft) => {
                            draft.combination = FilterCombinition.Or
                          })
                        }}
                      >
                        AND
                      </Button>
                    ) : (
                      <Button
                        size='xs'
                        variant='outline'
                        colorScheme='gray'
                        onClick={() => {
                          setTempRule((draft) => {
                            draft.combination = FilterCombinition.And
                          })
                        }}
                      >
                        OR
                      </Button>
                    ))}

                  <Text>Filter</Text>
                  <Select
                    value={tempRule.type}
                    width='fit-content'
                    size='xs'
                    onChange={(e) => {
                      const v = e.currentTarget.value
                      onChangeType(v)
                    }}
                  >
                    <option value='node'>Nodes</option>
                    <option value='edge'>Edges</option>
                  </Select>
                  <Text> IF </Text>
                  <Select
                    value={tempRule.key}
                    width='fit-content'
                    size='xs'
                    onChange={(e) => {
                      const v = e.currentTarget.value
                      onChangeKey(v)
                    }}
                  >
                    {options.map((option) => (
                      <option value={option.name}>{option.name}</option>
                    ))}
                  </Select>
                  <Select
                    value={tempRule.operator}
                    width='fit-content'
                    size='xs'
                    onChange={(e) => {
                      const v = e.currentTarget.value
                      const v1 = v == FilterOperator.Regex ? '' : 0
                      setTempRule((draft) => {
                        draft.operator = v
                        draft.value = v1
                      })
                    }}
                  >
                    {getKeyType() == 'number' ? (
                      <>
                        {' '}
                        <option value='>'>&gt;</option>
                        <option value='='>=</option>
                        <option value='<'>&lt;</option>
                      </>
                    ) : (
                      <option value='regex'>regex</option>
                    )}
                  </Select>

                  {tempRule.operator == FilterOperator.Regex ? (
                    <Input
                      variant='flushed'
                      value={tempRule.value}
                      size='xs'
                      width='fit-content'
                      placeholder={placeholder}
                      onChange={(e) => {
                        const v = e.currentTarget.value
                        setTempRule((draft) => {
                          draft.value = v
                        })
                      }}
                    />
                  ) : (
                    <NumberInput
                      size='xs'
                      width='100px'
                      variant='flushed'
                      value={tempRule.value}
                      onChange={(e) => {
                        const v = Number(e)
                        setTempRule((draft) => {
                          draft.value = v
                        })
                      }}
                    >
                      <NumberInputField />
                    </NumberInput>
                  )}

                  <Button size='xs' variant='outline' onClick={addRule}>
                    <FaPlus />
                  </Button>
                </Wrap>
                <Divider mt='3' />
              </>
            )}

            <VStack alignItems='left' mt='2' fontSize='0.9rem' spacing='1'>
              {rules?.map((rule, i) => {
                return (
                  rule.id != tempRule?.id && (
                    <HStack>
                      <Text>
                        {i > 0 && (
                          <chakra.span fontWeight='bold' color='brand.500'>
                            {rule.combination}
                          </chakra.span>
                        )}{' '}
                        Filter the{' '}
                        <chakra.span fontWeight='bold'>{rule.type}</chakra.span>
                        s if its data attr{' '}
                        <chakra.span fontWeight='bold'>
                          {rule.key} {rule.operator} {rule.value}{' '}
                        </chakra.span>
                      </Text>
                      <HStack opacity='0.7'>
                        {i > 0 && (
                          <Box
                            onClick={() => moveRule(rule.id, -1)}
                            cursor='pointer'
                          >
                            <FaArrowUp />
                          </Box>
                        )}
                        {i < rules.length - 1 && (
                          <Box
                            onClick={() => moveRule(rule.id, 1)}
                            cursor='pointer'
                          >
                            <FaArrowDown />
                          </Box>
                        )}
                        <Tooltip
                          label={
                            !rule.disabled
                              ? 'this rule is enabled, click to disable'
                              : 'this rule is disabled, click to enable'
                          }
                        >
                          <Box
                            onClick={() => onDisableRule(i)}
                            cursor='pointer'
                          >
                            <FaEye
                              color={
                                rule.disabled
                                  ? 'currentColor'
                                  : 'var(--chakra-colors-brand-500)'
                              }
                            />
                          </Box>
                        </Tooltip>
                        <Box onClick={() => setTempRule(rule)} cursor='pointer'>
                          <MdEdit />
                        </Box>
                        <Tooltip label={'remove this rule'}>
                          <Box
                            onClick={() => removeRule(rule.id)}
                            cursor='pointer'
                          >
                            <FaTimes />
                          </Box>
                        </Tooltip>
                      </HStack>
                    </HStack>
                  )
                )
              })}
            </VStack>

            {rules?.length > 0 && (
              <>
                <Divider my='2' />
                <HStack>
                  <Text fontSize='0.95rem'>
                    Show relation nodes of the results
                  </Text>
                  <Switch
                    defaultChecked={showRelation}
                    onChange={onShowRelationChange}
                  />
                </HStack>
              </>
            )}

            <Alert
              status='success'
              position='absolute'
              bottom='0'
              left='0'
              fontSize='0.9rem'
            >
              <VStack alignItems='left' spacing='1'>
                <Text fontWeight='600'>Rules will be evaluated :</Text>
                <Text>
                  1. <strong>from top to bottom</strong> e.g (((a AND b) OR c)
                  AND d)
                </Text>
                <Text>
                  2. <strong>from nodes to edges</strong>, edges rules will be
                  applied only if all of the nodes rules already be applied{' '}
                </Text>
                <Text>
                  3.{' '}
                  <strong>
                    edges rules are applied on the result of nodes rules
                  </strong>
                  , e.g if the nodes rules caused Node A to be invisible, as a
                  result it's edges A1 and A2 are also invisible, then the edges
                  rules will be applied, but they will have no effects on the
                  visible of A1, A2
                </Text>
                <Text>
                  {' '}
                  <strong>Rules will be stored in your browser</strong>, so you
                  will see them every time when opening this dashboard.
                </Text>
              </VStack>
            </Alert>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default NodeGraphFilter
