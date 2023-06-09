import { Graph, Node } from "@antv/g6"
import { Box, Button, Center, Divider, Flex, HStack, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Text, Tooltip, VStack } from "@chakra-ui/react"
import { memo, useState } from "react"
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa"
import { useImmer } from "use-immer"

interface Props {
    selected: boolean
    graph: Graph
    panelId: number
    dashboardId: string
    onSelectChange: any
}

const HiddenItems = memo(({ selected, graph, panelId, dashboardId, onSelectChange }: Props) => {
    const [hidden, setHidden] = useState(false)
    const [hiddenNodes, setHiddenNodes] = useImmer<Node[]>(null)
    const hideSelected = () => {
        const nodes = graph.findAllByState('node', 'selected')
        nodes.forEach(node => {
            graph.hideItem(node)
            graph.setItemState(node, 'selected', false)
        })
        const edges = graph.findAllByState('edge', 'selected')
        edges.forEach(edges => {
            graph.hideItem(edges)
            graph.setItemState(edges, 'selected', false)
        })

        onSelectChange(false)
        if (nodes.length > 0) {
            setHidden(true)
        }
    }

    const showHidden = () => {
        const nodes = graph.getNodes()
        nodes.forEach(node => {
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
        nodes.forEach(node => {
            if (!node.isVisible()) {
                h.push(node)
            }
        })

        return h
    }

    const removeHiden = index => {
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
    return (<>
        <VStack position="absolute" top="30px" right="8px" opacity="0.7" fontSize="0.9rem" className="bordered-top" pt="2" >
            {selected && <Tooltip label="隐藏所选择的目标">
                <Box cursor="pointer" onClick={hideSelected} color="brand.500">
                    <FaEyeSlash />
                </Box>
            </Tooltip>}

            {!selected && hidden && <Tooltip label="显示被隐藏的目标">
                <Popover trigger="hover" onOpen={onShowOpen}>
                    <PopoverTrigger>
                        <Box cursor="pointer" color="brand.500" >
                            <FaEye color="brand.500" />
                        </Box>
                    </PopoverTrigger>
                    <PopoverContent width="240px">
                        <PopoverArrow />
                        <PopoverBody >
                            <Flex justifyContent="space-between">
                                <Text>被隐藏的目标</Text>
                                <Button size="xs" onClick={showHidden}>显示全部</Button>
                            </Flex>
                            <Divider pt="2" />
                            <Text fontSize="0.8rem" my="2" fontWeight="600">点击所在的行, 可移除隐藏</Text>
                            <VStack alignItems="left" mt="3" p="0" spacing="1">
                                {
                                    hiddenNodes && hiddenNodes.map((node: Node, index) => <HStack key={node.getID()} spacing="3" className="hover-bg" px="2" py="1" cursor="pointer" onClick={() => removeHiden(index)}>
                                        {/* <Box ><FaTimes /></Box> */}
                                        <Text fontSize="0.8rem" fontWeight="600">{node.getModel().label as string}</Text>
                                    </HStack>)
                                }
                            </VStack>
                        </PopoverBody>
                    </PopoverContent>
                </Popover>
            </Tooltip>}
        </VStack>
    </>)
})

export default HiddenItems