// Copyright 2023 xObserve.io Team

import { Graph, Node } from '@antv/g6'
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { memo, useEffect, useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { PanelData } from 'types/dashboard'
import { useImmer } from 'use-immer'
import React from 'react'

interface Props {
  selected: boolean
  graph: Graph
  panelId: number
  dashboardId: string
  onSelectChange: any
  data: PanelData[]
}

const HiddenItems = memo(
  ({ selected, graph, panelId, dashboardId, onSelectChange, data }: Props) => {
    // 0: no action taken 1: hide some nodes 2: only show some nodes
    const [hidden, setHidden] = useState(false)
    const [hiddenNodes, setHiddenNodes] = useImmer<Node[]>(null)

    useEffect(() => {
      if (graph) {
        showHidden()
      }
    }, [data])

    const hideSelected = () => {
      const nodes = graph.findAllByState('node', 'selected')
      nodes.forEach((node) => {
        graph.hideItem(node)
        graph.setItemState(node, 'selected', false)
      })
      const edges = graph.findAllByState('edge', 'selected')
      edges.forEach((edges) => {
        graph.hideItem(edges)
        graph.setItemState(edges, 'selected', false)
      })

      onSelectChange(false)
      if (nodes.length > 0) {
        setHidden(true)
      }
    }

    const onlyShowSelected = (showRelation) => {
      const show = []
      const nodes = graph.findAllByState('node', 'selected')
      nodes.forEach((node) => {
        show.push(node)
        if (showRelation) {
          //@ts-ignore
          node.getNeighbors().forEach((n) => {
            show.push(n)
          })
        }
      })

      graph.getNodes().forEach((node) => {
        if (!show.includes(node)) {
          graph.hideItem(node)
          graph.setItemState(node, 'selected', false)
        }
      })

      onSelectChange(false)
      if (nodes.length > 0) {
        setHidden(true)
      }
    }

    const showHidden = () => {
      const nodes = graph.getNodes()
      nodes.forEach((node) => {
        if (!node.isVisible()) {
          graph.showItem(node)
        }
      })

      setHidden(false)
    }

    const onShowOpen = () => {
      // find all nodes being hidden
      const nodes = getHiddenNodes
      setHiddenNodes(nodes)
    }

    const getHiddenNodes = () => {
      const h = []
      const nodes = graph.getNodes()
      nodes.forEach((node) => {
        if (!node.isVisible()) {
          h.push(node)
        }
      })

      return h
    }

    const removeHiden = (index) => {
      const h = []
      hiddenNodes.forEach((node, i) => {
        if (i !== index) {
          h.push(node)
        } else {
          graph.showItem(node)
        }
      })

      if (h.length == 0) {
        setHiddenNodes(null)
        setHidden(false)
      } else {
        setHiddenNodes(h)
      }
    }
    return (
      <>
        <VStack
          position='absolute'
          top='9px'
          left='140px'
          opacity='0.7'
          fontSize='1rem'
          className='bordered-left'
          pl='2'
          zIndex='2000'
        >
          {selected && (
            <Popover trigger='hover' onOpen={onShowOpen}>
              <PopoverTrigger>
                <Box cursor='pointer' color='brand.500'>
                  <FaEyeSlash />
                </Box>
              </PopoverTrigger>
              <PopoverContent width='240px'>
                <PopoverArrow />
                <PopoverBody>
                  <VStack alignItems={'left'} spacing={1}>
                    <Text
                      cursor='pointer'
                      className='hover-bg'
                      p='1'
                      onClick={() => onlyShowSelected(true)}
                    >
                      只显示选择的目标及关联节点
                    </Text>

                    <Divider />
                    <Text
                      cursor='pointer'
                      className='hover-bg'
                      p='1'
                      onClick={() => onlyShowSelected(false)}
                    >
                      只显示选择的目标节点
                    </Text>
                    <Divider />
                    <Text
                      cursor='pointer'
                      className='hover-bg'
                      p='1'
                      onClick={() => hideSelected()}
                    >
                      隐藏所选择的目标
                    </Text>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )}

          {!selected && hidden && (
            <Tooltip label='显示被隐藏的目标'>
              <Popover trigger='hover' onOpen={onShowOpen}>
                <PopoverTrigger>
                  <Box cursor='pointer' color='brand.500'>
                    <FaEye color='brand.500' />
                  </Box>
                </PopoverTrigger>
                <PopoverContent width='240px'>
                  <PopoverArrow />
                  <PopoverBody>
                    <Flex justifyContent='space-between'>
                      <Text>被隐藏的目标</Text>
                      <Button size='xs' onClick={showHidden}>
                        显示全部
                      </Button>
                    </Flex>
                    <Divider pt='2' />
                    <Text fontSize='0.8rem' my='2' fontWeight='600'>
                      点击所在的行, 可移除隐藏
                    </Text>
                    <VStack alignItems='left' mt='3' p='0' spacing='1'>
                      {hiddenNodes &&
                        hiddenNodes.map((node: Node, index) => (
                          <HStack
                            key={node.getID()}
                            spacing='3'
                            className='hover-bg'
                            px='2'
                            py='1'
                            cursor='pointer'
                            onClick={() => removeHiden(index)}
                          >
                            {/* <Box ><FaTimes /></Box> */}
                            <Text fontSize='0.8rem' fontWeight='600'>
                              {node.getModel().label as string}
                            </Text>
                          </HStack>
                        ))}
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Tooltip>
          )}
        </VStack>
      </>
    )
  },
)

export default HiddenItems
