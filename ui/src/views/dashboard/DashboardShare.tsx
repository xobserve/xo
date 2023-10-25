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

import { Box, Button, Modal, ModalBody, ModalContent, Text, ModalHeader, ModalOverlay, StyleProps, useClipboard, useDisclosure, Switch, HStack, Input, VStack, Tabs, TabList, Tab, TabPanels, TabPanel, ModalCloseButton, ModalFooter, Textarea, Tooltip } from "@chakra-ui/react"
import React, { useEffect, useState } from "react"
import { BsShare } from "react-icons/bs"
import { Dashboard } from "types/dashboard"
import { parseVariableFormat } from "utils/format"
import { getCurrentTimeRange } from "src/components/DatePicker/TimePicker"
import queryString from 'query-string';
import { FaFileDownload, FaRegCopy, FaShare, FaRegEye, FaInfoCircle, FaEye } from "react-icons/fa"
import { useStore } from "@nanostores/react"
import { commonMsg, dashboardMsg, dashboardSettingMsg } from "src/i18n/locales/en"
import { dispatch } from "use-bus"
import { ShareUrlEvent } from "src/data/bus-events"
import { $variables } from "../variables/store"
import { Form } from "components/form/Form"
import FormItem from "components/form/Item"
import CodeEditor from "src/components/CodeEditor/CodeEditor"
import saveFile from 'save-as-file';
import { isEmpty } from "utils/validate"
import { REFRESH_OFF } from "./DashboardRefresh"
import { Select } from "antd"
import { concat } from "lodash"
import RadionButtons from "components/RadioButtons"

interface Props extends StyleProps {
    dashboard: Dashboard
    className: string
}

export const shareUrlParams = {}
const DashboardShare = ({ dashboard, ...rest }: Props) => {
    const variables = useStore($variables)
    const t = useStore(commonMsg)
    const t1 = useStore(dashboardMsg)
    const t2 = useStore(dashboardSettingMsg)

    const { isOpen, onOpen, onClose } = useDisclosure()

    const [shareUrl, setShareUrl] = useState(null)

    const { onCopy, setValue, hasCopied } = useClipboard("", 5000);
    const [enableCurrentTimeRange, setEnableCurrentTimeRange] = useState(false)
    const [useRawTime, setUseRawTime] = useState(false)
    const [useToolbar, setUserToolbar] = useState(false)
    const [embedding, setEmbedding] = useState(true)
    const [refresh, setRefresh] = useState(REFRESH_OFF)
    const [embeddingPanel, setEmbeddingPanel] = useState<number>(0)
    const [colorMode, setColorMode] = useState('dark')

    useEffect(() => {
        let url = window.origin + location.pathname + "?"
        const dashData = JSON.stringify(dashboard.data)
        const usingVariables = parseVariableFormat(dashData)
        for (const k of Object.keys(shareUrlParams)) {
            delete shareUrlParams[k]
        }

        const timeRange = getCurrentTimeRange()
        if (enableCurrentTimeRange) {
            shareUrlParams['from'] = useRawTime ? timeRange.startRaw : timeRange.start.getTime()
            shareUrlParams['to'] = useRawTime ? timeRange.endRaw : timeRange.end.getTime()
        }


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
            if (embedding) {
                url += "&embed=true&fullscreen=on"
                if (!isEmpty(shareUrlParams)) {
                    const params = queryString.stringify(shareUrlParams, { sort: false })
                    url += params
                }

                if (useToolbar) {
                    url += "&toolbar=on"
                }

                if (refresh != REFRESH_OFF) {
                    url += "&refresh=" + refresh
                }

                if (embeddingPanel > 0) {
                    url += "&viewPanel=" + embeddingPanel
                }

                url += "&colorMode=" + colorMode
            }

            setShareUrl(url)
            setValue(url)
        }, 150)
    }, [enableCurrentTimeRange, embedding, useRawTime, variables, useToolbar, refresh, embeddingPanel, colorMode])

    const filterPanels = (input: string, option?: { label: string; value: number }) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

    return (<>
        <Tooltip label={t1.shareDashboard}><Box onClick={onOpen} {...rest}><BsShare /></Box></Tooltip>

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
                                    <Form sx={{
                                        '.form-item-label': {
                                            width: "150px"
                                        }
                                    }}
                                        spacing={2}
                                    >
                                        <FormItem title={t2.visibleTo} size="sm" alignItems={'center'}>
                                            <RadionButtons
                                                size="sm"
                                                theme="brand"
                                                options={[{ label: t2.visibleToAnonymous, value: "anonymous" }, { label: t2.visibleToTeam, value: "team" }, { label: t2.visibleToAll, value: "all" }]}
                                                value={dashboard.visibleTo}
                                                onChange={() => { }} />
                                        </FormItem>

                                        <FormItem title={t.options} size="sm" desc={t1.shareHelp}></FormItem>

                                        <FormItem title={t.currentTimeRange} size="sm" alignItems={'center'}>
                                            <Switch
                                                isChecked={enableCurrentTimeRange}
                                                onChange={(e) => {
                                                    setEnableCurrentTimeRange(e.currentTarget.checked)
                                                }} />
                                        </FormItem>
                                        {enableCurrentTimeRange && <FormItem title="Use raw time" size="sm" alignItems={'center'}>
                                            <Switch
                                                isChecked={useRawTime}
                                                onChange={(e) => {
                                                    setUseRawTime(e.currentTarget.checked)
                                                }} />
                                        </FormItem>}
                                        <FormItem title={t.embedding} size="sm" alignItems={'center'} desc={t1.embedHelp}>
                                            <Switch
                                                isChecked={embedding}
                                                onChange={(e) => {
                                                    setEmbedding(e.currentTarget.checked)
                                                }} />
                                        </FormItem>
                                        {
                                            embedding && <>
                                                <FormItem title={t.showToolbar} size="sm" alignItems={'center'} desc={t.showToolbarTip}>
                                                    <Switch
                                                        isChecked={useToolbar}
                                                        onChange={(e) => {
                                                            setUserToolbar(e.currentTarget.checked)
                                                        }} />
                                                </FormItem>
                                                <FormItem title={"Use refresh"} size="sm" alignItems={'center'}>
                                                    <Select popupMatchSelectWidth={false} bordered={false} value={refresh} onChange={(v) => setRefresh(v)} options={[REFRESH_OFF, '5s', '10s', '30s', '1m', '5m', '10m'].map(v => ({ value: v, label: v }))} />
                                                </FormItem>
                                                <FormItem title={"Color mode"} size="sm" alignItems={'center'}>
                                                    <RadionButtons size="sm" value={colorMode} options={[{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }]} onChange={v => setColorMode(v)} />
                                                </FormItem>
                                                <FormItem title={"Embedding panel"} size="sm" alignItems={'center'}>
                                                    <Select popupMatchSelectWidth={false} bordered={false} value={embeddingPanel} onChange={(v) => setEmbeddingPanel(v)} options={concat([{ value: 0, label: "OFF" }], dashboard.data.panels.map(p => ({ label: p.title, value: p.id })))} showSearch filterOption={filterPanels} style={{ width: "200px" }} />
                                                </FormItem>
                                            </>
                                        }
                                    </Form>
                                    <HStack spacing={1}>
                                        <Textarea fontSize='xs' mr='1.5' wordBreak='break-all' p='1' className="code-bg" bgColor='#09090b' overflow='hidden' textOverflow='ellipsis' value={shareUrl} readOnly />
                                        <Button size="sm" leftIcon={<FaRegCopy />} onClick={onCopy} variant={hasCopied ? "solid" : "outline"}>
                                            {hasCopied ? t.copied : t.copy}
                                        </Button>
                                    </HStack>
                                </VStack>
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
    const t1 = useStore(dashboardMsg)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [downFile, setDownFile] = useState(false)
    const { onCopy, setValue, hasCopied } = useClipboard("", 5000);
    const dash = JSON.stringify(dashboard, null, 4)

    return (
        <>
            <VStack alignItems='inherit' justify='flex-start' spacing={4}>
                <Text fontSize='sm'>{t1.exportHelp}</Text>
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
                        <VStack alignItems='flex-start' justify='flex-start' spacing={2}>
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