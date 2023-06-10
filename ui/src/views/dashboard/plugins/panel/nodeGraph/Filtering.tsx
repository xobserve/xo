import { Graph } from "@antv/g6"
import { chakra, Box, Button, Divider, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Flex, HStack, Input, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, Select, Text, Tooltip, useDisclosure, Wrap, useToast, NumberInput, NumberInputField, Alert, VStack } from "@chakra-ui/react"
import { isNumber } from "lodash"
import { useEffect, useState } from "react"
import { FaArrowDown, FaArrowUp, FaEye, FaEyeSlash, FaFilter, FaPlus, FaTimes } from "react-icons/fa"
import { useImmer } from "use-immer"
import storage from "utils/localStorage"

interface Props {
    graph: Graph
    dashboardId: string
    panelId: number
}

const enum FilteringOperator {
    GreaterThan = '>',
    LowerThan = '<',
    Equal = '=',
    Regex = 'regex'
}
const enum FilterCombinition {
    And = 'AND',
    Or = 'OR'
}

const FilteringStorageKey = "node-filter-"

const Filtering = ({ graph, dashboardId, panelId }: Props) => {
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [tempRule, setTempRule] = useImmer(null)
    const [rules, setRules] = useImmer(null)
    const [edgeOptions, setEdgeOptions] = useState([])
    const [nodeOptions, setNodeOptions] = useState([])
    useEffect(() => {
        const nodes = graph.getNodes()
        const edges = graph.getEdges()
        if (nodes.length > 0) {
            const model = nodes[0].getModel()
            const option = []
            option.push('label')
            option.push(...Object.keys(model.data))
            setNodeOptions(option)
        }

        if (edges.length > 0) {
            const model = edges[0].getModel()
            const option = []
            option.push(...Object.keys(model.data))
            setEdgeOptions(option)
        }

        const rules = storage.get(FilteringStorageKey + dashboardId + '-' + panelId)
        setRules(rules ?? [])
    }, [])

    useEffect(() => {
        if (rules == null) {
            return 
        }
        const nodes = graph.getNodes()
        const hiddenNodes = []
        const showNodes = []
        nodes.filter(n => {
            const model = n.getModel()
            let passed = true;
            for (let i = 0; i < rules.length; i++) {
                const rule = rules[i]
                if (rule.disabled) {
                    continue
                }
                let stepPassed = true
                if (rule.type == 'node') {
                    if (rule.key == 'label') {
                        if (!(model.label as string).includes(rule.value)) {
                            stepPassed = false
                        }
                    } else {
                        const v = model.data[rule.key]
                        switch (rule.operator) {
                            case FilteringOperator.GreaterThan:
                                stepPassed = v > rule.value
                                break;
                            case FilteringOperator.LowerThan:
                                stepPassed = v < rule.value
                                break;
                            case FilteringOperator.Equal:
                                stepPassed = v == rule.value
                                break;
                            case FilteringOperator.Regex:
                                stepPassed = ((v as string).match(rule.value) != null)
                                break
                        }
                    }
                }

                if (rule.combination == FilterCombinition.And) {
                    passed = passed && stepPassed
                } else {
                    passed = passed || stepPassed
                }
            }

            if (!passed) {
                hiddenNodes.push(n)
            } else {
                showNodes.push(n)
            }
        })
        console.log("here3333, hiden:", hiddenNodes)
        hiddenNodes.forEach(n => {
            graph.hideItem(n)
        })
        showNodes.forEach(n => {
            graph.showItem(n)
        })
        console.log("here33333:,", rules)
    }, [rules])

    const onAddNewRule = () => {
        if (rules.length >= 5) {
            toast({
                description: "you can't add more than 5 rules",
                status: "error",
                duration: 2000,
                isClosable: true,
            });
            return
        }
        setTempRule({
            id: new Date().getTime(),
            type: 'node',
            key: options[0],
            operator: FilteringOperator.GreaterThan,
            value: '',
            combination: FilterCombinition.And,
            disabled: false
        })
    }
    const addRule = () => {
        if (tempRule.operator != FilteringOperator.Regex) {
            if (!isNumber(tempRule.value)) {
                toast({
                    description: "value must be numers",
                    status: "warning",
                    duration: 2000,
                    isClosable: true,
                });
                return
            }
        } else {
            if (tempRule.value == '') {
                toast({
                    description: "value can't be empty",
                    status: "warning",
                    duration: 2000,
                    isClosable: true,
                });
                return
            }
        }

        const newRules = [...rules, tempRule]
        setRules(newRules)
        setTempRule(null)
        storage.set(FilteringStorageKey + dashboardId + '-' + panelId, newRules)
    }

    const removeRule = id => {
        const newRules = rules.filter(r => r.id != id)
        setRules(newRules)
        storage.set(FilteringStorageKey + dashboardId + '-' + panelId, newRules)
    }

    const moveRule = (id, direction) => {
        const index = rules.findIndex(r => r.id == id)
        const newRules = [...rules]
        const temp = newRules[index]
        newRules[index] = newRules[index + direction]
        newRules[index + direction] = temp
        setRules(newRules)
        storage.set(FilteringStorageKey + dashboardId + '-' + panelId, newRules)
        toast({
            description: `moved ${direction == 1 ? 'down' : 'up'}`,
            status: "success",
            duration: 1500,
            isClosable: true,
        });
    }

    const options = tempRule?.type === 'node' ? nodeOptions : edgeOptions
    const placeholder = tempRule?.operator == FilteringOperator.Regex ? 'enter a regex to match' : 'enter a number'
    return (
        <>
            <Tooltip label="Filtering the nodes and edges you want to see">
                <Box cursor="pointer" onClick={onOpen}><FaFilter /></Box>
            </Tooltip>
            <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent minW="300px">
                    <DrawerHeader px="1" borderBottomWidth='1px'>
                        <Flex justifyContent="space-between" alignItems="center">
                            <Text textStyle="subTitle">Filtering nodes and edges</Text>
                            <Button fontWeight="normal" size="sm" cursor="pointer" onClick={onAddNewRule}>New rule</Button>
                        </Flex>
                    </DrawerHeader>
                    <DrawerBody px="1">
                        {tempRule && <><Wrap fontSize="0.8rem" spacing="1" mt="1">
                            {rules.length != 0 && (tempRule.combination == FilterCombinition.And ? <Button size="xs" variant="outline" colorScheme="gray" onClick={
                                () => {
                                    setTempRule(draft => { draft.combination = FilterCombinition.Or })
                                }
                            }>AND</Button> : <Button size="xs" variant="outline" colorScheme="gray" onClick={
                                () => {
                                    setTempRule(draft => { draft.combination = FilterCombinition.And })
                                }
                            }>OR</Button>)}

                            <Text>Filter</Text>
                            <Select value={tempRule.type} width="fit-content" size="xs" onChange={e => {
                                const v = e.currentTarget.value
                                setTempRule(draft => { draft.type = v })
                            }}>
                                <option value="node">Nodes</option>
                                <option value="edge">Edges</option>
                            </Select>
                            <Text> IF </Text>
                            <Select value={tempRule.key} width="fit-content" size="xs" onChange={e => {
                                const v = e.currentTarget.value
                                setTempRule(draft => { draft.key = v })
                            }}>
                                {
                                    options.map(option => <option value={option}>{option}</option>)
                                }
                            </Select>
                            <Select value={tempRule.operator} width="fit-content" size="xs" onChange={e => {
                                const v = e.currentTarget.value
                                const v1 = v == FilteringOperator.Regex ? '' : 0
                                setTempRule(draft => { draft.operator = v; draft.value = v1 })
                            }}>
                                <option value=">">&gt;</option>
                                <option value="=">=</option>
                                <option value="<">&lt;</option>
                                <option value="regex">regex</option>
                            </Select>

                            {
                                tempRule.operator == FilteringOperator.Regex ? <Input variant='flushed' value={tempRule.value} size="xs" width="fit-content" placeholder={placeholder} onChange={e => {
                                    const v = e.currentTarget.value;
                                    setTempRule(draft => { draft.value = v })
                                }}
                                /> :
                                    <NumberInput size="xs" width="100px" variant='flushed' value={tempRule.value} onChange={e => {
                                        const v = Number(e);
                                        setTempRule(draft => { draft.value = v })
                                    }} >
                                        <NumberInputField />
                                    </NumberInput>
                            }

                            <Button size="xs" variant="outline" onClick={addRule}><FaPlus /></Button>
                        </Wrap>
                            <Divider mt="3" />
                        </>
                        }



                        <VStack alignItems="left" mt="2">
                            {rules?.map((rule, i) => <HStack>
                                <Text>
                                    {i > 0 && <chakra.span fontWeight="bold" color="brand.500">{rule.combination}</chakra.span>} Filter the <chakra.span fontWeight="bold">{rule.type}</chakra.span>s if its data attr <chakra.span fontWeight="bold">{rule.key} {rule.operator} {rule.value} </chakra.span>
                                </Text>
                                <HStack opacity="0.7">
                                    {i > 0 && <Box onClick={() => moveRule(rule.id, -1)} cursor="pointer"><FaArrowUp /></Box>}
                                    {i < rules.length - 1 && <Box onClick={() => moveRule(rule.id, 1)} cursor="pointer"><FaArrowDown /></Box>}
                                    <Tooltip label={!rule.disabled ? "this rule is enabled, click to disable" : "this rule is disabled, click to enable"}><Box onClick={() => setRules(draft => {
                                        const rule = draft[i]
                                        rule.disabled = !rule.disabled
                                    })} cursor="pointer"><FaEye color={rule.disabled ? "currentColor" : 'var(--chakra-colors-brand-500)'}/></Box></Tooltip>
                                    <Tooltip label={"remove this rule"}><Box onClick={() => removeRule(rule.id)} cursor="pointer"><FaTimes /></Box></Tooltip>
                                </HStack>
                            </HStack>)}
                        </VStack>


                        <Alert status='success' position="absolute" bottom="0" left="0">
                            <VStack alignItems="left">
                                <Text fontWeight="600">Rules will be evaluated from top to bottom,e.g (((a AND b) OR c) AND d),  so arranged their order carefully</Text>
                                <Text> Rules will be stored in your browser, so you can see them next time you open this dashboard.</Text>
                            </VStack>
                        </Alert>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default Filtering