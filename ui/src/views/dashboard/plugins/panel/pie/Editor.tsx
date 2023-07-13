import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Select, Switch, useDisclosure } from "@chakra-ui/react"
import CodeEditor from "components/CodeEditor/CodeEditor"
import RadionButtons from "components/RadioButtons"
import ValueCalculation from "components/ValueCalculation"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import { UnitPicker } from "components/Unit"
import { useState } from "react"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import { PieLegendPlacement } from "types/panel/plugins"
import React from "react";

const PiePanelEditor = ({ panel, onChange }: PanelEditorProps) => {
    return (<>
        <PanelAccordion title="Basic setting">
            <PanelEditItem title="Animation" desc="display chart animation">
                <Switch defaultChecked={panel.plugins.pie.animation} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.animation = e.currentTarget.checked
                })} />
            </PanelEditItem>

            <PanelEditItem title="Show label">
                <Switch defaultChecked={panel.plugins.pie.showLabel} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.showLabel = e.currentTarget.checked
                })} />
            </PanelEditItem>

            <OnClickEvent panel={panel} onChange={v => {
                onChange((panel: Panel) => {
                    panel.plugins.pie.onClickEvent = v
                })
            }} />
        </PanelAccordion>

        <PanelAccordion title="Shape">
            <PanelEditItem title="Type">
                <RadionButtons options={[{ label: "Normal", value: "normal" }, { label: "Rose", value: "rose" }]} value={panel.plugins.pie.shape.type} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.pie.shape.type = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Border radius">
                <EditorNumberItem value={panel.plugins.pie.shape.borderRadius} min={0} max={20} step={1} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.shape.borderRadius = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Pie radius">
                <EditorNumberItem value={panel.plugins.pie.shape.radius} min={0} max={100} step={5} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.shape.radius = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Inner radius">
                <EditorNumberItem value={panel.plugins.pie.shape.innerRadius} min={0} max={100} step={5} onChange={(v) => onChange((panel: Panel) => {
                    panel.plugins.pie.shape.innerRadius = v
                })} />
            </PanelEditItem>
        </PanelAccordion>

        <PanelAccordion title="Legend">
            <PanelEditItem title="Show">
                <Switch defaultChecked={panel.plugins.pie.legend.show} onChange={e => onChange((panel: Panel) => {
                    panel.plugins.pie.legend.show = e.currentTarget.checked
                })} />
            </PanelEditItem>
            <PanelEditItem title="Orient">
                <RadionButtons options={[{ label: "Vertical", value: "vertical" }, { label: "Horizontal", value: "horizontal" }]} value={panel.plugins.pie.legend.orient} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.pie.legend.orient = v
                })} />
            </PanelEditItem>
            <PanelEditItem title="Placement">
                <Select value={panel.plugins.pie.legend.placement} onChange={e => {
                    const v = e.currentTarget.value
                    onChange((panel: Panel) => {
                        panel.plugins.pie.legend.placement = v as any
                    })
                }}>
                    {
                        Object.keys(PieLegendPlacement).map(k => <option value={PieLegendPlacement[k]}>{k}</option>)
                    }
                </Select>
            </PanelEditItem>

        </PanelAccordion>

        <PanelAccordion title="Value">
            <PanelEditItem title="Unit">
                <UnitPicker type={panel.plugins.pie.value.unitsType} value={panel.plugins.pie.value.units} onChange={
                    (units, type) => onChange((panel: Panel) => {
                        panel.plugins.pie.value.units = units
                        panel.plugins.pie.value.unitsType = type
                    })
                } />
            </PanelEditItem>
            <PanelEditItem title="Decimal">
                <EditorNumberItem value={panel.plugins.pie.value.decimal} min={0} max={5} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.pie.value.decimal = v })} />
            </PanelEditItem>
            <PanelEditItem title="Caculation" desc="calculate results from series data with this reducer function">
                <ValueCalculation value={panel.plugins.pie.value.calc} onChange={v => {
                    onChange((panel: Panel) => { panel.plugins.pie.value.calc = v })
                }} />
            </PanelEditItem>
        </PanelAccordion>

    </>
    )
}

export default PiePanelEditor


const OnClickEvent = ({ panel, onChange }: PanelEditorProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [temp, setTemp] = useState(panel.plugins.pie.onClickEvent)

    const onSubmit = () => {
        onChange(temp)
        onClose()
    }

    return (<>
        <PanelEditItem title="On click event" desc="When click on the Pie chart, this event will be executed">
            <Button size="sm" onClick={onOpen}>Edit function</Button>
        </PanelEditItem>
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader py="2">
                    Edit onClick function
                    <ModalCloseButton />
                </ModalHeader>
                <ModalBody pt="2" pb="0" px="0">
                    <Box height="400px"><CodeEditor value={temp} onChange={v => setTemp(v)} /></Box>
                    <Button onClick={onSubmit} width="100%">Submit</Button>
                </ModalBody>

            </ModalContent>
        </Modal>
    </>
    )
}