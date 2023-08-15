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

import { Box, Button, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, StyleProps, useClipboard, useDisclosure } from "@chakra-ui/react"
import React, { useState } from "react"
import { BsShare } from "react-icons/bs"
import { Dashboard } from "types/dashboard"
import { parseVariableFormat } from "utils/format"
import { getCurrentTimeRange } from "components/DatePicker/TimePicker"
import queryString from 'query-string';
import { FaCopy, FaRegCopy } from "react-icons/fa"
import { useStore } from "@nanostores/react"
import { commonMsg } from "src/i18n/locales/en"
import { dispatch } from "use-bus"
import { ShareUrlEvent } from "src/data/bus-events"
import { $variables } from "../variables/store"

interface Props extends StyleProps {
    dashboard: Dashboard
    className: string
}

export const shareUrlParams = {}
const DashboardShare = ({ dashboard, ...rest }: Props) => {
    const variables = useStore($variables)
    const t = useStore(commonMsg)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const [shareUrl, setShareUrl] = useState(null)
    const { onCopy, setValue, hasCopied } = useClipboard("", 5000);

    const onShare = () => {
        let url = window.origin + location.pathname + '?'
        const dashData = JSON.stringify(dashboard.data)
        const usingVariables = parseVariableFormat(dashData)
        for (const k of Object.keys(shareUrlParams)) {
            delete shareUrlParams[k]
        }
    
        const timeRange = getCurrentTimeRange()
        shareUrlParams['from'] = timeRange.start.getTime()
        shareUrlParams['to'] = timeRange.end.getTime()
    
        for (const v of variables) {
            if (usingVariables.includes(v.name)) {
                shareUrlParams['var-'+ v.name] =  v.selected
                for (const v1 of variables) {
                    // to avoid circle refer evets: 
                    // A refer B : A send event to B, then B refer to A, B send event to A
                    if (v1.id == v.id) {
                        continue
                    }
                    if ((v.datasource?.toString())?.indexOf('${' + v1.name + '}') >= 0 || v.value?.indexOf('${' + v1.name + '}') >= 0) {
                        shareUrlParams['var-'+ v1.name] =  v1.selected
                    }
                }

            }
        }
        dispatch(ShareUrlEvent)
        setTimeout(() => {
            url += queryString.stringify(shareUrlParams,{sort: false})
            setShareUrl(url)
            setValue(url)
            onOpen()
        }, 150)
    }


    return (<>
        <Box onClick={onShare} {...rest}><BsShare /></Box>
        
        <Modal isOpen={isOpen} onClose={onClose} autoFocus={false}>
            <ModalOverlay />
            <ModalContent minWidth="500px">
                <ModalHeader>{t.share}</ModalHeader>
                <ModalBody>
                    <Box fontSize="1.1rem" wordBreak="break-all" p="2" className="code-bg" borderRadius={4} width="fit-content">{shareUrl}</Box>
                    <Button mt="4" leftIcon={<FaRegCopy />} onClick={onCopy} variant={hasCopied ? "solid" : "outline"}>{hasCopied ? t.copied : t.copy}</Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default DashboardShare