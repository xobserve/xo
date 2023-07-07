import { Box, Button, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react"
import { Trace } from "types/plugins/trace"

interface Props {
    traces: Trace[]
}
const TraceCompare = ({traces}:Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const compareTraces = () => {
        onOpen()
    }

    console.log("here3333 compre:",traces)

    return (
      <>
        <Button size="sm" variant="outline" onClick={compareTraces} isDisabled={traces.length <= 1}>Compare</Button>
  
        <Modal isOpen={isOpen} onClose={onClose} size="full">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
                <Box width="45%">
                    
                </Box>
                <Box width="45%">

                </Box>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    )
}

export default TraceCompare