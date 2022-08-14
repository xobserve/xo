import { Box, Center, Modal, ModalBody, ModalContent, ModalOverlay, Table, Tbody, Td, Text, Th, Thead, Tooltip, Tr, useDisclosure } from "@chakra-ui/react"
import { memo } from "react"
import { FaQuestion } from "react-icons/fa"
import { Help } from "types/misc"

interface Props {
    data: Help[]
    size?: 'sm' | 'md' | 'lg'
    iconSize?: string
}

const Help = memo(({ data,size="sm",iconSize="0.9rem" }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    return (<>
        <Tooltip label="click to view the help doc"><Box opacity="0.7" position="absolute" right="10px" top="8px" zIndex="1000" cursor="pointer" onClick={onOpen} fontSize={iconSize}><FaQuestion /></Box></Tooltip>
        <Modal isOpen={isOpen} onClose={onClose} >
            <ModalOverlay />
            <ModalContent minWidth="600px">
                <ModalBody  >
                    {
                        data.map(help => <Box key={help.title}>
                            <Center><Text textStyle="title">{help.title}</Text></Center>
                            <Table variant='simple' size={size} mt="2">
                                <Thead>
                                    <Tr>
                                        {help.headers.map(header => <Th key={header}>{header}</Th>)}
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {
                                        help.contents.map((content, j) => <Tr key={j}>
                                            {
                                                content.map((c, i) => <Td key={i} fontWeight={i == 0 ? 600 : 450}>{c}</Td>)
                                            }
                                        </Tr>)
                                    }
                                </Tbody>
                            </Table></Box>
                        )
                    }
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
})

export default Help