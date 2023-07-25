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
import TimePicker, { TimePickerKey, convertRawToRange, getNewestTimeRange } from "./TimePicker"
import { TimeRange } from "types/time"
import { FaRegClock } from "react-icons/fa"
import IconButton from "../button/IconButton"
import React, { useEffect, useState } from "react"
import useBus, { dispatch } from "use-bus"
import { SetTimeEvent, TimeChangedEvent, TimeRefreshEvent } from "src/data/bus-events"
import { subMinutes } from "date-fns"
import storage from "utils/localStorage"
import { addParamToUrl } from "utils/url"
import { Moment } from "moment"
import { useSearchParam } from "react-use"

interface Props {
    showTime?: boolean
}


const DatePicker = ({ showTime = false }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [value, setValue] = useState<TimeRange>(getNewestTimeRange())

    const from = useSearchParam("from")
    const to = useSearchParam("to")
    useEffect(() => {
        if (from && to) {
            // from and to can only be two types:
            // 1. from and to are all timestamp strings, e.g from: 1690284107553 to: 1690300803000
            // 2. from and to are all quick time strings, e.g from: now-5m to: now
            if (from == value.startRaw && to == value.endRaw) {
                return
            }
            const fn = Number(from)
            const ft = Number(to)

            // timestamp strings
            let tr
            if ((fn != 0 && !isNaN(fn)) && (ft != 0 && !isNaN(ft))) {
                const start = new Date(fn)
                const end = new Date(ft)
                tr = {
                    start: start,
                    end: end,
                    startRaw: start.toLocaleString(),
                    endRaw: end.toLocaleString(),
                    sub: 0
                }

            }

            // quick time strings
            if (from.startsWith('now') && to.startsWith('now')) {
                const r: { from: Moment; to: Moment } = convertRawToRange(from, to)
                const s = r.from.toDate()
                const e = r.to.toDate()
                tr = {
                    start: s,
                    end: e,
                    startRaw: from,
                    endRaw: to,
                    sub: r.to.diff(r.from) / 60000
                }
            }

            if (tr) {
                storage.set(TimePickerKey, JSON.stringify(tr))
                setValue(tr)
                dispatch({ type: TimeChangedEvent, data: tr })
                return
            }
        }
    }, [from, to])



    const onTimeChange = (t: TimeRange) => {
        setValue(t)
        onClose()
        dispatch({ type: TimeChangedEvent, data: t })
        syncTimeToUrl(
            t.sub == 0 ? t.start.getTime() : t.startRaw,
            t.sub == 0 ? t.end.getTime() : t.endRaw
        )
    }

    useBus(
        TimeRefreshEvent,
        () => {
            refresh()
        },
        []
    )

    useBus(
        (e) => { return e.type == SetTimeEvent },
        (e) => {
            const start = new Date(e.data.from * 1000)
            const end = new Date(e.data.to * 1000)
            const tr = {
                start: start,
                end: end,
                startRaw: start.toLocaleString(),
                endRaw: end.toLocaleString(),
                sub: 0
            }

            storage.set(TimePickerKey, JSON.stringify(tr))
            onTimeChange(tr)
        }
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


// from, to : timestamp in seconds
export const setDateTime = (from: number, to: number) => {
    dispatch({ type: SetTimeEvent, data: { from, to } })


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

export const syncTimeToUrl = (from, to) => {
    addParamToUrl({ from, to })
}