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
import { Alert, Box, Button, Divider, Flex, HStack, Image, Input, Modal, ModalBody, ModalContent, ModalOverlay, NumberInput, NumberInputField, Select, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Switch, Text, Textarea, Tooltip, useDisclosure, useToast, VStack } from "@chakra-ui/react"
import { ColorPicker } from "components/ColorPicker"
import RadionButtons from "components/RadioButtons"
import { isEmpty } from "lodash"
import { useState } from "react"
import * as Icons from 'react-icons/fa'
import { MdEdit } from "react-icons/md"
import { initPanelPlugins, onClickCommonEvent } from "src/data/panel/initPlugins"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import { EditorNumberItem, EditorSliderItem } from "components/editor/EditorItem"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import {  Panel, PanelEditorProps } from "types/dashboard"
import { NodeGraphIcon, NodeGraphMenuItem } from "types/panel/plugins"
import { useImmer } from "use-immer"
import { isJSON } from "utils/is"
import CodeEditor from "components/CodeEditor/CodeEditor"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, nodeGraphPanelMsg } from "src/i18n/locales/en"



const NodeGraphPanelEditor = (props: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(nodeGraphPanelMsg)
    const { panel, onChange } = props
    return (<>
        <PanelAccordion title={t1.node}>
            <PanelEditItem title={t1.baseSize}>
                <EditorSliderItem value={panel.plugins.nodeGraph.node.baseSize} min={20} max={100} step={2} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.nodeGraph.node.baseSize = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={t1.maxSize}>
                <EditorNumberItem value={panel.plugins.nodeGraph.node.maxSize} min={1} max={5} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.nodeGraph.node.maxSize = v
                })} />
            </PanelEditItem>

            <IconSetting {...props} />

            <PanelEditItem title={t1.shape}>
                <RadionButtons options={[{ label: t1.donut, value: "donut" }, { label: t1.circle, value: "circle" }]} value={panel.plugins.nodeGraph.node.shape} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.nodeGraph.node.shape = v
                })} />
            </PanelEditItem>
            {panel.plugins.nodeGraph.node.shape == 'donut' && <DonutColorsSetting {...props} />}
        </PanelAccordion>


        <PanelAccordion title={t1.edge}>
            <PanelEditItem title={t1.shape}>
                <Select value={panel.plugins.nodeGraph.edge.shape} onChange={e => onChange((panel:Panel) => {
                    panel.plugins.nodeGraph.edge.shape = e.currentTarget.value
                })}>
                    <option value="quadratic">{t1.quadratic}</option>
                    <option value="line">{t1.line}</option>
                    <option value="polyline">{t1.polyline}</option>
                </Select>
            </PanelEditItem>
            <PanelEditItem title={t1.displayLabel} info={
                <Text>{t.applyToSeeEffect}</Text>
            }>
                <Switch defaultChecked={panel.plugins.nodeGraph.edge.display} onChange={e => {
                    const v = e.currentTarget.checked
                    onChange((panel:Panel) => {
                        panel.plugins.nodeGraph.edge.display = v
                    })
                }}/>
            </PanelEditItem>
            <PanelEditItem title={t1.arrow}>
                <Select value={panel.plugins.nodeGraph.edge.arrow} onChange={e => onChange((panel:Panel) => {
                    panel.plugins.nodeGraph.edge.arrow = e.currentTarget.value
                })}>
                    <option value="default">default</option>
                    <option value="triangle">triangle</option>
                    <option value="circle">circle</option>
                    <option value="vee">vee</option>
                    <option value="diamond">diamond</option>
                    <option value="triangleRect">triangleRect</option>
                </Select>
            </PanelEditItem>

            <PanelEditItem title={t.color}>
                <HStack>
                    <ColorPicker presetColors={[{ title: 'light-default', color: initPanelPlugins.nodeGraph.edge.color.light }]} color={panel.plugins.nodeGraph.edge.color.light} onChange={c => onChange((panel: Panel) => {
                        panel.plugins.nodeGraph.edge.color.light = c.hex
                    })} buttonText={t1.pickLightColor} />
                    <Box width="40px" height="30px" background={panel.plugins.nodeGraph.edge.color.light}></Box>
                </HStack>
                <HStack>
                    <ColorPicker presetColors={[{ title: 'dark-default', color: initPanelPlugins.nodeGraph.edge.color.dark }]} color={panel.plugins.nodeGraph.edge.color.dark} onChange={c => onChange((panel: Panel) => {
                        panel.plugins.nodeGraph.edge.color.dark = c.hex
                    })} buttonText={t1.pickDarkColor} />
                    <Box width="40px" height="30px" background={panel.plugins.nodeGraph.edge.color.dark}></Box>
                </HStack>
            </PanelEditItem>
            <PanelEditItem title={t.opacity} desc={t1.opacityTips}>
                <EditorSliderItem value={panel.plugins.nodeGraph.edge.opacity} min={0} max={1} step={0.1} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.nodeGraph.edge.opacity = v
                })} />
            </PanelEditItem>
            <PanelEditItem title={t1.highlightColor} desc={t1.highlightColorTips}>
                <HStack>
                    <ColorPicker presetColors={[{ title: 'light-default', color: initPanelPlugins.nodeGraph.edge.highlightColor.light }]} color={panel.plugins.nodeGraph.edge.highlightColor.light} onChange={c => onChange((panel: Panel) => {
                        panel.plugins.nodeGraph.edge.highlightColor.light = c.hex
                    })} buttonText={t1.pickLightColor} />
                    <Box width="40px" height="30px" background={panel.plugins.nodeGraph.edge.highlightColor.light}></Box>
                </HStack>
                <HStack>
                    <ColorPicker presetColors={[{ title: 'dark-default', color: initPanelPlugins.nodeGraph.edge.highlightColor.dark }]} color={panel.plugins.nodeGraph.edge.highlightColor.dark} onChange={c => onChange((panel: Panel) => {
                        panel.plugins.nodeGraph.edge.highlightColor.dark = c.hex
                    })} buttonText={t1.pickDarkColor} />
                    <Box width="40px" height="30px" background={panel.plugins.nodeGraph.edge.highlightColor.dark}></Box>
                </HStack>
            </PanelEditItem>
        </PanelAccordion>


        <PanelAccordion title={t.interaction}>
            <PanelEditItem title={t1.tooltipTrigger} info={
                <Text>{t.applyToSeeEffect}</Text>
            }>
                <RadionButtons options={[{ label: "Hover", value: "mouseenter" }, { label: "Click", value: "click" }]} value={panel.plugins.nodeGraph.node.tooltipTrigger} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.nodeGraph.node.tooltipTrigger = v
                })} />
            </PanelEditItem>

            <RightClickMenus {...props} />
        </PanelAccordion>

        <PanelAccordion title="legend">
            <PanelEditItem title={t.enable} info={
                <Text>{t.applyToSeeEffect}</Text>
            }>
                <Switch defaultChecked={panel.plugins.nodeGraph.legend.enable} onChange={e => onChange((panel:Panel) => {
                    panel.plugins.nodeGraph.legend.enable = e.currentTarget.checked
                })} />
            </PanelEditItem>
        </PanelAccordion>


        <PanelAccordion title={t1.layout}>
            <PanelEditItem title={t1.nodeStrength} desc={t1.nodeStrengthTips}>
                <EditorNumberItem value={panel.plugins.nodeGraph.layout.nodeStrength} min={100} max={10000} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.nodeGraph.layout.nodeStrength = v
                })} /> 
            </PanelEditItem>
            <PanelEditItem title={t1.nodeGravity} desc={t1.nodeGravityTips}>
                <EditorNumberItem value={panel.plugins.nodeGraph.layout.gravity} min={0} max={200} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.nodeGraph.layout.gravity = v
                })} />
            </PanelEditItem>

        </PanelAccordion>
    </>)
}

export default NodeGraphPanelEditor

const initIcon = { key: '', value: '', icon: '' }
const IconSetting = ({ panel, onChange }: PanelEditorProps) => {
    const t1 = useStore(nodeGraphPanelMsg)
    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp, setTemp] = useImmer<NodeGraphIcon>(initIcon)
    const onSubmit = () => {
        if (isEmpty(temp.key) || isEmpty(temp.value) || isEmpty(temp.icon)) {
            toast({
                description: "field cannot be empty",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }

        for (const icon of panel.plugins.nodeGraph.node.icon) {
            if (icon.key == temp.key && icon.value == temp.value) {
                toast({
                    description: "the same key/value already exist",
                    status: "warning",
                    duration: 2000,
                    isClosable: true,
                });
                return
            }
        }

        onChange(panel => { panel.plugins.nodeGraph.node.icon.unshift(temp) })
        setTemp(initIcon)
        onClose()
    }

    const removeIcon = i => {
        onChange(panel => {
            panel.plugins.nodeGraph.node.icon.splice(i, 1)
        })
    }

    return (<><PanelEditItem title={t1.icon}>

        <Button size="xs" onClick={onOpen}>{t1.setIcon}</Button>
        <Divider mt="2" />
        <VStack alignItems="sleft" mt="1">
            {
                panel.plugins.nodeGraph.node.icon.map((icon, i) => <Flex justifyContent="space-between" alignItems="center">
                    <HStack>
                        <Text>{icon.key} : {icon.value} -&gt;</Text>
                        <Image src={icon.icon} width="30px" height="30px" />
                    </HStack>
                    <Box layerStyle="textFourth" cursor="pointer" onClick={() => removeIcon(i)}><Icons.FaTimes /></Box>
                </Flex>)
            }
        </VStack>
    </PanelEditItem>

        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minWidth="700px">
                <ModalBody>
                    <HStack>
                        <Text fontWeight="600">When </Text>
                        <Input onChange={e => {
                            const v = e.currentTarget.value.trim()
                            setTemp(draft => {
                                draft.key = v
                            })
                        }} placeholder="attribute name, e.g: service_type" size="sm" width="250px" />
                        <Text fontWeight="600">=</Text>
                        <Input onChange={e => {
                            const v = e.currentTarget.value.trim()
                            setTemp(draft => {
                                draft.value = v
                            })
                        }} placeholder="attribute value, e.g: java" size="sm" width="250px" />
                    </HStack>
                    <HStack>
                        <Text fontWeight="600">show icon </Text>
                        <Input onChange={e => {
                            const v = e.currentTarget.value.trim()
                            setTemp(draft => {
                                draft.icon = v
                            })
                        }} placeholder="icon url" size="sm" width="250px" />
                        {/* {Icon && <Icon />} */}
                        {temp.icon && <Image src={temp.icon} width="30px" height="30px" />}
                    </HStack>
                    <Button my="4" size="sm" onClick={onSubmit}>Submit</Button>
                    <Alert status='success' flexDir="column" alignItems="left">
                        <Text>
                            1. You can find node attributes by hovering on a node, e.g 'error: 45' , 'error' is attribute name, '45' is value
                        </Text>
                        {/* <Text mt="2">
                            2. Find icons on https://react-icons.github.io/react-icons/icons?name=fa
                        </Text> */}
                    </Alert>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

const DonutColorsSetting = ({ panel, onChange }: PanelEditorProps) => {
    const t1 = useStore(nodeGraphPanelMsg)

    const toast = useToast()
    const [temp, setTemp] = useState<string>(panel.plugins.nodeGraph.node.donutColors)
    const onSubmit = () => {
        if (!isJSON(temp)) {
            toast({
                description: "not valid json format",
                status: "warning",
                duration: 2000,
                isClosable: true,
            });
            return
        }
        onChange(panel => {
            panel.plugins.nodeGraph.node.donutColors = temp
        })
    }
    return (
        <PanelEditItem title={t1.donutColors} info={<VStack alignItems='left' fontWeight="600">
            <Text>{t1.donutTips1}</Text>
            <Text>1. {t1.donutTips2}</Text>
            <Text>2. {t1.donutTips3}</Text>
            <Text>3. {t1.donutTips4}</Text>
            <Alert status="success">
                {t1.donutTips5}
            </Alert>
        </VStack>}>
            <Textarea value={temp} onChange={e => {
                const v = e.currentTarget.value.trim()
                setTemp(v)
            }} onBlur={onSubmit} />
        </PanelEditItem>
    )
}



const RightClickMenus = ({ panel, onChange }: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(nodeGraphPanelMsg)

    const initMenuItem = {
        name: '',
        event: onClickCommonEvent
    }

    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp, setTemp] = useImmer<NodeGraphMenuItem>(initMenuItem)

    const onSubmit = () => {
        for (const item of panel.plugins.nodeGraph.node.menu) {
            if (item.name == temp.name && item.id != temp.id) {
                toast({
                    description: "same name exist",
                    status: "warning",
                    duration: 2000,
                    isClosable: true,
                });
                return
            }
        }

        if (!temp.id) {
            // add new menu item
            temp.id = new Date().getTime()
            onChange((panel: Panel) => {
                panel.plugins.nodeGraph.node.menu.unshift(temp)
            })

        } else {
            onChange((panel: Panel) => {
                for (let i = 0; i < panel.plugins.nodeGraph.node.menu.length; i++) {
                    if (panel.plugins.nodeGraph.node.menu[i].id == temp.id) {
                        panel.plugins.nodeGraph.node.menu[i] = temp
                    }
                }
            })

        }

        setTemp(initMenuItem)
        onClose()
    }

    const removeItem = i => {
        onChange(panel => {
            panel.plugins.nodeGraph.node.menu.splice(i, 1)
        })
    }

    const moveUp = (i) => {
        onChange(panel => {
            const menu = panel.plugins.nodeGraph.node.menu
            const item = menu[i - 1]
            menu[i - 1] = menu[i]
            menu[i] = item
        })
    }

    const moveDown = (i) => {
        onChange(panel => {
            const menu = panel.plugins.nodeGraph.node.menu
            const item = menu[i + 1]
            menu[i + 1] = menu[i]
            menu[i] = item
        })
    }

    return (<>
        <PanelEditItem title={t1.rightClick} info={
                <Text>{t.applyToSeeEffect}</Text>
            }>
            <Button size="xs" onClick={() => { onOpen(); setTemp(initMenuItem) }}>{t1.addMenuItem}</Button>
            <Divider my="2" />
            <VStack alignItems="left" pl="2">
                {
                    panel.plugins.nodeGraph.node.menu.map((item, i) => <Flex alignItems="center" justifyContent="space-between">
                        <Tooltip label={item.event}><Text>{item.name}</Text></Tooltip>

                        <HStack layerStyle="textFourth">
                            {i != 0 && <Icons.FaArrowUp cursor="pointer" onClick={() => moveUp(i)} />}
                            {i != panel.plugins.nodeGraph.node.menu.length - 1 && <Icons.FaArrowDown cursor="pointer" onClick={() => moveDown(i)} />}
                            <MdEdit onClick={() => { setTemp(item); onOpen() }} cursor="pointer" />
                            <Icons.FaTimes onClick={() => removeItem(i)} cursor="pointer" />
                        </HStack>
                    </Flex>)
                }
            </VStack>
        </PanelEditItem>
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent minWidth="800px">
                <ModalBody p="0">
                    <HStack>
                        <Text fontWeight="600">{t1.menuItemName}</Text>
                        <Input value={temp.name} onChange={e => {
                            const v = e.currentTarget.value
                            setTemp(draft => {
                                draft.name = v
                            })
                        }} placeholder="e.g view service" size="sm" width="250px" />
                    </HStack>

                    <Text fontWeight="600" mt="4">{t1.defineClickEvent}</Text>
                    <Box height="300px">
                    <CodeEditor value={temp.event} onChange={v => {
                        setTemp(draft => {
                            draft.event = v
                        })
                    }} />
                    </Box>
                    <Button my="4" size="sm" onClick={onSubmit}>{t.submit}</Button>
                    <Alert status='success' flexDir="column" alignItems="left">
                        <Text>
                        </Text>
                    </Alert>
                </ModalBody>
            </ModalContent>
        </Modal>
    </>
    )
}