import { Box, HStack, Modal, ModalBody, ModalContent, ModalOverlay, Text, Tooltip, useDisclosure } from "@chakra-ui/react"
import TimePicker, { getInitTimeRange, initTimeRange } from "./TimePicker"
import { TimeRange } from "types/time"
import { FaRegClock } from "react-icons/fa"
import IconButton from "../button/IconButton"
import { useState } from "react"
import { dispatch } from "use-bus"
import { TimeChangedEvent } from "src/data/bus-events"

interface Props {
    showTime?: boolean
}
const DatePicker = ({ showTime = false }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [value, setValue] = useState<TimeRange>(getInitTimeRange())

    const onTimeChange = (t: TimeRange) => {
        setValue(t)
        onClose()
        dispatch({ type: TimeChangedEvent, data: t })
    }

    return (
        <>
            <Box>
                <Tooltip label={`${value?.start.toLocaleString()} - ${value?.end.toLocaleString()}`}>
                    <HStack spacing={0} onClick={onOpen} cursor="pointer">
                        <IconButton variant="ghost">
                            <FaRegClock />
                        </IconButton>
                        {
                            showTime && <Text layerStyle="textSecondary" fontSize="1rem">{value.startRaw} to {value.endRaw}</Text>
                        }
                    </HStack>
                </Tooltip>
            </Box>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent minW="fit-content">
                    <ModalBody>
                        <TimePicker onClose={onClose} onTimeChange={onTimeChange} />
                    </ModalBody>

                </ModalContent>
            </Modal>
        </>
    )
}

export default DatePicker