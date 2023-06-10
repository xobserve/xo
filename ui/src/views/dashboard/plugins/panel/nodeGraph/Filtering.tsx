import { Graph } from "@antv/g6"
import { Box, Flex, HStack, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, Select, Text, Tooltip, useDisclosure } from "@chakra-ui/react"
import { useState } from "react"
import { FaFilter, FaPlus } from "react-icons/fa"

interface Props {
    graph: Graph
}

const Filtering = ({graph}: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [tempRule, setTempRule] = useState(null)
    const [rules, setRules] = useState([])

    console.log("33333,",graph.getNodes())
    return (
        <>
        <Tooltip label="Filtering the nodes and edges you want to see">
            <Box cursor="pointer" onClick={onOpen}><FaFilter /></Box>
        </Tooltip>
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader >
                <Flex justifyContent="space-between" alignItems="center">
                    <Text>Filtering nodes and edges</Text>
                    <Box fontWeight="normal" color="brand.500" cursor="pointer" onClick={() => setTempRule({})}><FaPlus /></Box>
                </Flex>
            </ModalHeader>
          <ModalBody>
                {tempRule && <HStack>
                    <Text>Filtering the</Text>
                    <Select width="fit-content">
                        <option value="node">Nodes</option>
                        <option value="edge">Edges</option>
                    </Select>
                    <Text> when </Text>
                </HStack>}
          </ModalBody>
        </ModalContent>
      </Modal>
      </>
    )
}

export default Filtering