import { Box, Button, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure, useToast } from "@chakra-ui/react"
import { useStore } from "@nanostores/react"
import ColorTag from "components/ColorTag"
import { EditorInputItem } from "components/editor/EditorItem"
import { FormSection } from "components/form/Form"
import FormItem from "components/form/Item"
import { cloneDeep } from "lodash"
import React, { useEffect, useState } from "react"
import { commonMsg, dashboardSettingMsg } from "src/i18n/locales/en"
import { Annotation } from "types/annotation"
import { requestApi } from "utils/axios/request"
import { isEmpty } from "utils/validate"
import { $dashAnnotations } from "../dashboard/store/annotation"
import { dispatch } from "use-bus"
import { PanelForceRebuildEvent } from "src/data/bus-events"
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
            $dashAnnotations.set([...$dashAnnotations.get(), annotation])
        } else {
            const index = $dashAnnotations.get().findIndex(a => a.id == id)
            const annos = $dashAnnotations.get()
            annos[index] = annotation
            $dashAnnotations.set([...annos])
        }

        dispatch(PanelForceRebuildEvent + annotation.group)

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
                            <FormItem title={t.description} labelWidth="70px">
                                <EditorInputItem type="textarea" placeholder={t.inputTips({ name: t.description })} value={annotation.text} onChange={v => {
                                    setAnnotation({ ...annotation, text: v })
                                }} />
                            </FormItem>
                            <FormItem title={t.tags} labelWidth="70px">
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
                            <FormItem title="Duration" labelWidth="70px">
                                <Box>
                                    <EditorInputItem size="lg" value={annotation.duration} onChange={v => {
                                        setAnnotation({ ...annotation, duration: v })
                                    }} placeholder="e.g 1s 2m 1h 3h20m30s" />
                                </Box>
                            </FormItem>
                            <FormItem title="Start time" alignItems="center" labelWidth="70px">
                                <Text textStyle="annotation">{dateTimeFormat(annotation.time * 1000)}</Text>
                            </FormItem>
                            <FormItem title="End time" alignItems="center" labelWidth="70px">
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