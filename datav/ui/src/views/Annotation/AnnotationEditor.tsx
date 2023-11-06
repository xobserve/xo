// Copyright 2023 xObserve.io Team
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

import { Box, Button, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, useToast } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import ColorTag from "src/components/ColorTag"
import { EditorInputItem } from "src/components/editor/EditorItem"
import { FormSection } from "src/components/form/Form"
import FormItem from "src/components/form/Item"
import { cloneDeep } from "lodash"
import React, { useEffect, useState } from "react"
import { commonMsg, dashboardSettingMsg } from "src/i18n/locales/en"
import { Annotation } from "types/annotation"
import { requestApi } from "utils/axios/request"
import { isEmpty } from "utils/validate"
import { $rawDashAnnotations } from "../dashboard/store/annotation"
import { dateTimeFormat } from "utils/datetime/formatter"
import { durationToSeconds } from "utils/date"

interface Props {
    annotation: Annotation
    onEditorClose: any
}
const AnnotationEditor = (props: Props) => {
    const { onEditorClose } = props
    const [annotation, setAnnotation] = useState<Annotation>(cloneDeep(props.annotation))
    const t = useStore(commonMsg)
    const t1 = useStore(dashboardSettingMsg)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [tag, setTag] = useState('')
    const toast = useToast()

    useEffect(() => {
        annotation ? onOpen() : onClose()
    }, [annotation])

    const onModalClose = () => {
        onEditorClose()
        onClose()
    }

    const addTag = () => {
        if (annotation.tags?.length >= 3) {
            toast({
                title: t1.tagsExceedLimit,
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        if (annotation.tags?.includes(tag)) {
            setTag('')
            return
        }

        setTag('')
        annotation.tags.push(tag)
    }

    const onSubmit = async () => {
        const id = annotation.id
        if (isEmpty(annotation.text)) {
            toast({
                title: t.isInvalid({ name: t.description }),
                status: "error",
                duration: 3000,
                isClosable: true,
            })
            return
        }

        const res = await requestApi.post(`/annotation`, annotation)
        annotation.id = res.data
        if (id == 0) {
            $rawDashAnnotations.set([...$rawDashAnnotations.get(), annotation])
        } else {
            const index = $rawDashAnnotations.get().findIndex(a => a.id == id)
            const annos = $rawDashAnnotations.get()
            annos[index] = annotation
            $rawDashAnnotations.set([...annos])
        }

        onModalClose()
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={(onModalClose)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit annotation</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormSection>
                            <FormItem title={t.description} labelWidth="90px">
                                <EditorInputItem type="textarea" placeholder={t.inputTips({ name: t.description })} value={annotation.text} onChange={v => {
                                    setAnnotation({ ...annotation, text: v })
                                }} />
                            </FormItem>
                            <FormItem title={t.tags} labelWidth="90px">
                                <Input value={tag} onChange={e => setTag(e.currentTarget.value)} placeholder={t1.tagInputTips} onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        addTag()
                                    }
                                }} />

                            </FormItem>
                            {annotation.tags.length > 0 && <HStack width="100%">
                                {
                                    annotation.tags.map(t => <ColorTag name={t} onRemove={_ => {
                                        annotation.tags.splice(annotation.tags.indexOf(t), 1)
                                        setAnnotation({ ...annotation })
                                    }} />)
                                }

                            </HStack>}
                            <FormItem title="Duration" labelWidth="90px">
                                <Box>
                                    <EditorInputItem size="lg" value={annotation.duration} onChange={v => {
                                        setAnnotation({ ...annotation, duration: v })
                                    }} placeholder="e.g 1s 2m 1h 3h20m30s" />
                                </Box>
                            </FormItem>
                            <FormItem title="Start time" alignItems="center" labelWidth="90px">
                                <Text textStyle="annotation">{dateTimeFormat(annotation.time * 1000)}</Text>
                            </FormItem>
                            <FormItem title="End time" alignItems="center" labelWidth="90px">
                                <Text textStyle="annotation">{dateTimeFormat((annotation.time + durationToSeconds(annotation.duration)) * 1000)}</Text>
                            </FormItem>
                        </FormSection>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onModalClose}>
                            {t.cancel}
                        </Button>
                        <Button variant='ghost' onClick={onSubmit}>{t.submit}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default AnnotationEditor