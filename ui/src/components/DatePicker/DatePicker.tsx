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
import { Box, HStack, Modal, ModalBody, ModalContent, ModalOverlay, Text, Tooltip, useDisclosure } from "@chakra-ui/react"
import TimePicker, { TimePickerKey, getNewestTimeRange } from "./TimePicker"
import { TimeRange } from "types/time"
import { FaRegClock } from "react-icons/fa"
import IconButton from "../button/IconButton"
import React, { useState } from "react"
import useBus, { dispatch } from "use-bus"
import { TimeChangedEvent, TimeRefreshEvent } from "src/data/bus-events"
import { subMinutes } from "date-fns"
import storage from "utils/localStorage"

interface Props {
    showTime?: boolean
}


const DatePicker = ({ showTime = false }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [value, setValue] = useState<TimeRange>(getNewestTimeRange())

    const onTimeChange = (t: TimeRange) => {
        setValue(t)
        onClose()
        dispatch({ type: TimeChangedEvent, data: t })
    }

    useBus(
        TimeRefreshEvent,
        () => {
            refresh()
        },
        []
    )
    const refresh = () => {
        const tr: TimeRange = updateTimeToNewest()
        setValue(tr)
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
                            showTime && <Text layerStyle="textSecondary" fontSize="0.9rem" fontWeight="500">{value.startRaw} to {value.endRaw}</Text>
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



export const setDateTime= (from: number, to: number) => {
    const start = new Date(from * 1000)
    const end = new Date(to * 1000)
    const tr = {
        start: start,
        end: end,
        startRaw: start.toLocaleString(),
        endRaw: end.toLocaleString(),
        sub: 0
    }

    storage.set(TimePickerKey, JSON.stringify(tr))
    dispatch({ type: TimeChangedEvent, data: tr })
    dispatch({ type: TimeRefreshEvent })
}

export const updateTimeToNewest = () => {
    const tr: TimeRange = getNewestTimeRange()
    if (tr.sub > 0) {
        const now = new Date()
        tr.start = subMinutes(now, tr.sub)
        tr.end = now
        storage.set(TimePickerKey, JSON.stringify(tr))
        dispatch({ type: TimeChangedEvent, data: tr })
    } 

    return tr
}