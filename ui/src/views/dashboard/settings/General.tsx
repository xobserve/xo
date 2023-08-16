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

import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, Divider, HStack, Input, Select, Switch, Tag, TagCloseButton, TagLabel, useDisclosure, useToast } from "@chakra-ui/react"
import { EditorNumberItem } from "components/editor/EditorItem"
import { Form, FormSection } from "components/form/Form"
import FormItem from "components/form/Item"
import { useState } from "react"
import { Dashboard, DashboardLayout } from "types/dashboard"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, dashboardSettingMsg } from "src/i18n/locales/en"
import ColorTag from "../../../components/ColorTag"
import { requestApi } from "utils/axios/request"
import useSession from "hooks/use-session"
import { useNavigate } from "react-router"

interface Props {
    dashboard: Dashboard
    onChange: any
}

const GeneralSettings = ({ dashboard, onChange }: Props) => {
    const { session } = useSession()
    const navigate = useNavigate()
    const t = useStore(commonMsg)
    const t1 = useStore(dashboardSettingMsg)

    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()

    const toast = useToast()
    const [title, setTitle] = useState(dashboard.title)
    const [desc, setDesc] = useState(dashboard.data.description)
    const [hidingVars, setHidingVars] = useState(dashboard.data.hidingVars)
    const [tag, setTag] = useState('')

    const addTag = () => {
        if (dashboard.tags?.length >= 5) {
            toast({
                title: t1.tagsExceedLimit,
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        if (dashboard.tags?.includes(tag)) {
            setTag('')
            return
        }
        onChange((draft: Dashboard) => { draft.tags.push(tag) })
        setTag('')
    }

    const onDelete = async () => {
        await requestApi.delete(`/dashboard/${dashboard.id}`)
        toast({
            title: t.isDeleted({ name: t.dashboard }),
            status: "success",
            duration: 3000,
            isClosable: true,
        })

        setTimeout(() => {
            navigate(`/cfg/team/${dashboard.ownedBy}/dashboards`)
        }, 500)
    }

    return (<>
        <Form spacing={5} maxW="600px" sx={{
            '.form-item-label': {
                width: '180px'
            }
        }}>
            <FormSection title={t.basicSetting}>
                <FormItem title={t.title} >
                    <Input value={title} onChange={e => setTitle(e.currentTarget.value)} onBlur={() => onChange((draft: Dashboard) => { draft.title = title })} />
                </FormItem>
                <FormItem title={t.description}>
                    <Input value={desc} onChange={e => setDesc(e.currentTarget.value)} onBlur={() => onChange((draft: Dashboard) => { draft.data.description = desc })} placeholder={t.inputTips({ name: t.description })} />
                </FormItem>
                {/* <Box>
                <Text textStyle="title">Editable</Text>
                <Text textStyle="annotation">Make this dashboard editable to anyone who has edit permissions. </Text>
                <Switch isChecked={dashboard.data.editable} onChange={e => { dashboard.data.editable = e.currentTarget.checked; onChange() }} mt="1" />
            </Box> */}
                <FormItem title={t1.tootip} desc={t1.tootipTips} alignItems="center" >
                    <Switch isChecked={dashboard.data.sharedTooltip} onChange={e => onChange((draft: Dashboard) => { draft.data.sharedTooltip = e.currentTarget.checked })} />
                </FormItem>

                <FormItem title={t1.hideVars}>
                    <Input value={hidingVars} onChange={e => setHidingVars(e.currentTarget.value)} onBlur={() => onChange((draft: Dashboard) => { draft.data.hidingVars = hidingVars })} placeholder={t1.hideVarsTips} />
                </FormItem>
                <FormItem title={t.tags} desc={t1.tagTips} >
                    <Input value={tag} onChange={e => setTag(e.currentTarget.value)} placeholder={t1.tagInputTips} onKeyDown={e => {
                        if (e.key === 'Enter') {
                            addTag()
                        }
                    }} />

                </FormItem>
                {dashboard.tags.length > 0 && <HStack width="100%">
                    {
                        dashboard.tags.map(t => <ColorTag name={t} onRemove={_ => {
                            onChange((draft: Dashboard) => { draft.tags.splice(draft.tags.indexOf(t), 1) })
                        }} />)
                    }

                </HStack>}
                <FormItem title={t1.panelLayout} desc={t1.panelLayoutTips} >
                    <Select value={dashboard.data.layout} onChange={e => {
                        const v = e.currentTarget.value
                        onChange((draft: Dashboard) => { draft.data.layout = v as DashboardLayout })
                    }}>
                        {
                            Object.keys(DashboardLayout).map(k => <option value={[DashboardLayout[k]]}>{t1[k]}</option>)
                        }
                    </Select>
                </FormItem>

                <FormItem title={t1.panelOverlap} desc={t1.panelOverlapTips} alignItems="center">
                    <Switch isChecked={dashboard.data.allowPanelsOverlap} onChange={e => onChange((draft: Dashboard) => { draft.data.allowPanelsOverlap = e.currentTarget.checked })} />
                </FormItem>
                <FormItem title={t1.hiddenPanel} desc={t1.hiddenPanelTips} alignItems="center">
                    <HStack>
                        {
                            dashboard.data.hiddenPanels.map(id => <Tag colorScheme="gray">
                                <TagLabel>{id} / {dashboard.data.panels.find(p => p.id == id).title}</TagLabel>
                                <TagCloseButton onClick={() => {
                                    onChange((draft: Dashboard) => { draft.data.hiddenPanels.splice(draft.data.hiddenPanels.indexOf(id), 1) })
                                }} />
                            </Tag>)
                        }
                    </HStack>
                </FormItem>
            </FormSection>
            <FormSection title={t1.loadData}>
                <FormItem title={t1.lazyRender} desc={t1.lazyRenderTips} alignItems="center">
                    <Switch isChecked={dashboard.data.lazyLoading} onChange={e => onChange((draft: Dashboard) => { draft.data.lazyLoading = e.currentTarget.checked })} />
                </FormItem>
            </FormSection>
            <FormSection title={t1.saveDash}>
                <FormItem title={t1.savePromt} desc={t1.savePromtTips} alignItems="center">
                    <Switch isChecked={dashboard.data.enableUnsavePrompt} onChange={e => onChange((draft: Dashboard) => { draft.data.enableUnsavePrompt = e.currentTarget.checked })} />
                </FormItem>

                <FormItem title={t1.autoSave} desc={t1.autoSaveTips} alignItems="center">
                    <Switch isChecked={dashboard.data.enableAutoSave} onChange={e => onChange((draft: Dashboard) => { draft.data.enableAutoSave = e.currentTarget.checked })} />
                </FormItem>

                {dashboard.data.enableAutoSave && <FormItem title={t1.autoSaveInterval} >
                    <EditorNumberItem size="lg" min={10} max={3600} step={30} value={dashboard.data.autoSaveInterval} notNull defaultZero={false} onChange={v => onChange((draft: Dashboard) => { draft.data.autoSaveInterval = v })} />
                </FormItem>}
            </FormSection>
            <FormSection title={t.dangeSection}>
                <Divider borderColor="red.500" mt="2" />
                <Button mt="3" colorScheme='red' onClick={onOpen} width="fit-content">
                    {t.deleteItem({ name: t.dashboard })}
                </Button>
            </FormSection>
        </Form>

        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        {t.deleteItem({ name: t.dashboard })}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {t.deleteAlert}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            {t.cancel}
                        </Button>
                        <Button colorScheme='red' onClick={onDelete} ml={3}>
                            {t.delete}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>)
}

export default GeneralSettings