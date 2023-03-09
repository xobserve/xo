import { Modal, ModalContent, ModalOverlay, Text } from "@chakra-ui/react"

interface Props {
    isOpen: any
    text: string
}

const ModalSpinner = ({isOpen,text}:Props) => {
    return (
        <Modal isOpen={isOpen} onClose={null} isCentered>
            <ModalOverlay bg='none'
                backdropFilter='auto'
                backdropInvert='80%'
                backdropBlur='2px' />
            <ModalContent mt="0" px="10" py="6">
                <Text>{text}</Text>
            </ModalContent>
        </Modal>
    )
}

export default ModalSpinner