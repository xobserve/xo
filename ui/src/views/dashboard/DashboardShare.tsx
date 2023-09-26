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

import { Box, Button, Modal, ModalBody, ModalContent, Text, ModalHeader, ModalOverlay, StyleProps, useClipboard, useDisclosure, Switch, HStack, Input, VStack, Tabs, TabList, Tab, TabPanels, TabPanel, ModalCloseButton, ModalFooter } from "@chakra-ui/react"
import React, { useState } from "react"
import { BsShare } from "react-icons/bs"
import { Dashboard } from "types/dashboard"
import { parseVariableFormat } from "utils/format"
import { getCurrentTimeRange } from "src/components/DatePicker/TimePicker"
import queryString from 'query-string';
import { FaFileDownload, FaRegCopy, FaShare, FaRegEye } from "react-icons/fa"
import { useStore } from "@nanostores/react"
import { commonMsg } from "src/i18n/locales/en"
import { dispatch } from "use-bus"
import { ShareUrlEvent } from "src/data/bus-events"
import { $variables } from "../variables/store"
import { Form } from "components/form/Form"
import FormItem from "components/form/Item"
import CodeEditor from "src/components/CodeEditor/CodeEditor"
import saveFile from 'save-as-file';

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
    const [enableCurrentTimeRange, setEnableCurrentTimeRange] = useState(true)
    const onShare = () => {
        let url = window.origin + location.pathname + '?'
        const dashData = JSON.stringify(dashboard.data)
        const usingVariables = parseVariableFormat(dashData)
        for (const k of Object.keys(shareUrlParams)) {
            delete shareUrlParams[k]
        }

        const timeRange = getCurrentTimeRange()
        setEnableCurrentTimeRange(s => {
            if (s) {
                shareUrlParams['from'] = timeRange.start.getTime()
                shareUrlParams['to'] = timeRange.end.getTime()
            }
            return s
        })

        for (const v of variables) {
            if (usingVariables.includes(v.name)) {
                shareUrlParams['var-' + v.name] = v.selected
                for (const v1 of variables) {
                    // to avoid circle refer evets: 
                    // A refer B : A send event to B, then B refer to A, B send event to A
                    if (v1.id == v.id) {
                        continue
                    }
                    if ((v.datasource?.toString())?.indexOf('${' + v1.name + '}') >= 0 || v.value?.indexOf('${' + v1.name + '}') >= 0) {
                        shareUrlParams['var-' + v1.name] = v1.selected
                    }
                }

            }
        }
        dispatch(ShareUrlEvent)
        setTimeout(() => {
            url += queryString.stringify(shareUrlParams, { sort: false })
            setShareUrl(url)
            setValue(url)
            onOpen()
        }, 150)
    }


    return (<>
        <Box onClick={onShare} {...rest}><BsShare /></Box>
        
        <Modal isOpen={isOpen} onClose={onClose} autoFocus={false}>
            <ModalOverlay />
            <ModalContent minWidth="600px">
                <Tabs size='sm'>
                    <ModalHeader maxHeight='20' paddingBottom={'1'}>
                        <HStack spacing={8}>
                            <HStack>
                                <FaShare />
                                <Text fontSize='md'>
                                    {t.share}
                                </Text>
                            </HStack>
                            <TabList>
                                <Tab>{t.link}</Tab>
                                <Tab>{t.export}</Tab>
                            </TabList>
                        </HStack>
                    </ModalHeader>
                    <ModalBody>
                        <TabPanels>
                            <TabPanel>
                                <VStack spacing={3} alignItems='inherit' justify='flex-start'>
                                    <Text fontSize='sm'>{t.shareHelp}</Text>
                                    <Form>
                                        <FormItem title={t.currentTimeRange} size="sm" alignItems={'center'}>
                                            <Switch
                                                defaultChecked={enableCurrentTimeRange}
                                                checked={enableCurrentTimeRange}
                                                onChange={(e) => {
                                                    setEnableCurrentTimeRange(e.currentTarget.checked)
                                                    onShare()
                                                }} />
                                        </FormItem>
                                    </Form>
                                    <HStack spacing={1}>
                                        <Input fontSize='xs' mr='1.5' wordBreak='break-all' p='1' className="code-bg" bgColor='#09090b' overflow='hidden' textOverflow='ellipsis' value={shareUrl} readOnly />
                                        <Button size="sm" leftIcon={<FaRegCopy />} onClick={onCopy} variant={hasCopied ? "solid" : "outline"}>
                                            {hasCopied ? t.copied : t.copy}
                                        </Button>
                                    </HStack>
                                </VStack>
                                <Box h='4'></Box>
                            </TabPanel>
                            <TabPanel>
                                <ExportComponent dashboard={dashboard} />
                            </TabPanel>
                        </TabPanels>
                    </ModalBody>
                </Tabs>
            </ModalContent>
        </Modal>
    </>)
}

function ExportComponent({ dashboard }: {
    dashboard: Dashboard
}) {
    const t = useStore(commonMsg)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [downFile, setDownFile] = useState(false)
    const { onCopy, setValue, hasCopied } = useClipboard("", 5000);
    const dash = JSON.stringify(dashboard, null, 4)

    return (
        <>
            <VStack alignItems='inherit' justify='flex-start' spacing={4}>
                <Text fontSize='sm'>{t.exportHelp}</Text>
                <Box>
                    <HStack spacing={4}>
                        <Button size="sm" variant='outline' colorScheme='green' leftIcon={<FaFileDownload />}
                            isLoading={downFile}
                            onClick={() => {
                                setDownFile(true)
                                setTimeout(() => {
                                    const file = new File([dash], "", { type: 'application/json' })
                                    saveFile(file, `${dashboard.title}-${dashboard.id}.json`)
                                    setDownFile(false)
                                }, 500)
                            }}
                        >{t.saveToFile}</Button>
                        <Button size="sm" variant='outline' leftIcon={<FaRegEye />} onClick={() => {
                            setValue(dash)
                            onOpen()
                        }} >{t.viewJson}</Button>
                    </HStack>
                </Box>
            </VStack>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent minWidth='600px'>
                    <ModalHeader paddingBottom={1} >JSON</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack alignItems='flex-start'  justify='flex-start' spacing={2}>
                            <Box width="100%" height="500px" className="bordered" mb="3">
                                <CodeEditor value={dash} language="json" />
                            </Box>
                            <Button onClick={onCopy}
                                leftIcon={<FaRegCopy />}
                                variant={hasCopied ? "solid" : "outline"}
                            >
                                {hasCopied ? t.copied : t.copy}
                            </Button>
                        </VStack>
                        <Box h='4'></Box>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}

export default DashboardShare