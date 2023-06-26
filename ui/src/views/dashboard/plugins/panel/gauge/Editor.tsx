import { Box, Button, Flex, HStack, Switch, VStack } from "@chakra-ui/react"
import IconButton from "components/button/IconButton"
import { ColorPicker } from "components/color-picker"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import { UnitPicker } from "components/unit"
import { cloneDeep } from "lodash"
import { FaArrowDown, FaArrowUp, FaTimes } from "react-icons/fa"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"

const GaugePanelEditor = (props: PanelEditorProps) => {
    const { panel, onChange } = props
    return (
        <>
            <PanelAccordion title="Basic setting">
                <PanelEditItem title="Animation" desc="display chart animation">
                    <Switch defaultChecked={panel.plugins.gauge.animation} onChange={e => onChange((panel: Panel) => {
                        panel.plugins.gauge.animation = e.currentTarget.checked
                    })} />
                </PanelEditItem>
            </PanelAccordion>
            <PanelAccordion title="Value setting">
                <PanelEditItem title="Show" desc="display data.name field">
                    <Switch defaultChecked={panel.plugins.gauge.value.show} onChange={e => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.show = e.currentTarget.checked
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Font size">
                    <EditorNumberItem value={panel.plugins.gauge.value.fontSize} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.fontSize = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Min" desc="the minmum your value can be">
                    <EditorNumberItem value={panel.plugins.gauge.value.min} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.min = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Max">
                    <EditorNumberItem value={panel.plugins.gauge.value.max} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.max = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Unit">
                    <EditorInputItem value={panel.plugins.gauge.value.unit} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.unit = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Decimal">
                    <EditorNumberItem value={panel.plugins.gauge.value.decimal} min={0} max={5} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.gauge.value.decimal = v })} />
                </PanelEditItem>

                <PanelEditItem title="Left" desc="moving right, initial is center">
                    <EditorInputItem value={panel.plugins.gauge.value.left} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.left = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Top" desc="moving down, initial is center">
                    <EditorInputItem value={panel.plugins.gauge.value.top} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.top = v
                    })} />
                </PanelEditItem>
            </PanelAccordion>

            <PanelAccordion title="Title">
                <PanelEditItem title="Show" desc="display data.name field">
                    <Switch defaultChecked={panel.plugins.gauge.title.show} onChange={e => onChange((panel: Panel) => {
                        panel.plugins.gauge.title.show = e.currentTarget.checked
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Font size">
                    <EditorNumberItem value={panel.plugins.gauge.title.fontSize} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.title.fontSize = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Left" desc="moving right, initial is center">
                    <EditorInputItem value={panel.plugins.gauge.title.left} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.title.left = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Top" desc="moving down, initial is center">
                    <EditorInputItem value={panel.plugins.gauge.title.top} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.title.top = v
                    })} />
                </PanelEditItem>
            </PanelAccordion>
            <PanelAccordion title="Axis">
                <PanelEditItem title="Width">
                    <EditorNumberItem value={panel.plugins.gauge.axis.width} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.axis.width = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Show ticks" >
                    <Switch defaultChecked={panel.plugins.gauge.axis.showTicks} onChange={e => onChange((panel: Panel) => {
                        panel.plugins.gauge.axis.showTicks = e.currentTarget.checked
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Split" desc="split axis into several part, each has a unique color, range is [0, 1]: 0 stands for start, 1 for ends, values must in ASC order" >
                    <AxisSplit {...props} />
                </PanelEditItem>
            </PanelAccordion>

            <PanelAccordion title="Scale">
                <PanelEditItem title="Dispaly scale line">
                    <Switch defaultChecked={panel.plugins.gauge.scale.enable} onChange={e => {
                        onChange((panel: Panel) => {
                            panel.plugins.gauge.scale.enable = e.currentTarget.checked
                        })
                    }} />
                </PanelEditItem>
                <PanelEditItem title="Split numbers">
                    <EditorNumberItem value={panel.plugins.gauge.scale.splitNumber} min={0} max={10} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.gauge.scale.splitNumber = v })} />
                </PanelEditItem>
                <PanelEditItem title="Font size">
                    <EditorNumberItem value={panel.plugins.gauge.scale.fontSize} min={12} max={20} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.gauge.scale.fontSize = v })} />
                </PanelEditItem>
            </PanelAccordion>
        </>
    )
}

export default GaugePanelEditor


const AxisSplit = ({ panel, onChange }: PanelEditorProps) => {
    const addSplit = () => {
        onChange((panel: Panel) => {
            panel.plugins.gauge.axis.split.push([1, "#000"])
        })
    }

    const moveUp = i => {
        onChange((panel: Panel) => {
            const split = panel.plugins.gauge.axis.split
            const temp = split[i]
            split[i] = split[i - 1]
            split[i - 1] = temp

            panel.plugins.gauge.axis.split = split
        })
    }

    const moveDown = i => {
        onChange((panel: Panel) => {
            const split = panel.plugins.gauge.axis.split
            const temp = split[i]
            split[i] = split[i + 1]
            split[i + 1] = temp

            panel.plugins.gauge.axis.split = split
        })
    }


    return (<Box><VStack alignItems="left">
        {panel.plugins.gauge.axis.split.map((s, i) => {
            return <Flex justifyContent="space-between" alignItems="center" key={s[0]}>
                <HStack>
                    <Box width="150px"><EditorNumberItem value={s[0]} min={0} max={1} step={0.1} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.gauge.axis.split[i][0] = v
                    })} /></Box>
                    <ColorPicker color={s[1]} onChange={v => onChange((panel: Panel) => {
                        panel.plugins.gauge.axis.split[i][1] = v.hex
                    })}>
                        <Button size="sm" background={s[1]} >Pick color</Button>
                    </ColorPicker>
                </HStack>
                <HStack>
                    {i != 0 && <FaArrowUp onClick={() => moveUp(i)} />}
                    {i != panel.plugins.gauge.axis.split.length - 1 && <FaArrowDown onClick={() => moveDown(i)} />}
                    <Box cursor="pointer" onClick={() => onChange((panel: Panel) => {
                        panel.plugins.gauge.axis.split.splice(i, 1)
                    })}><FaTimes /></Box>
                </HStack>
            </Flex>
        })}
    </VStack>
        <Button mt="2" size="sm" variant="outline" onClick={addSplit}>New split</Button>
    </Box>
    )
}