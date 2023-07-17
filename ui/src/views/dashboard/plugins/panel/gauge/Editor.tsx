import { Box, Button, Flex, HStack, Switch, VStack } from "@chakra-ui/react"
import ValueCalculation from "components/ValueCalculation"
import { ColorPicker } from "components/ColorPicker"
import { EditorInputItem, EditorNumberItem } from "components/editor/EditorItem"
import { FaArrowDown, FaArrowUp, FaTimes } from "react-icons/fa"
import PanelAccordion from "src/views/dashboard/edit-panel/Accordion"
import PanelEditItem from "src/views/dashboard/edit-panel/PanelEditItem"
import { Panel, PanelEditorProps } from "types/dashboard"
import React from "react";
import { useStore } from "@nanostores/react"
import { commonMsg, gaugePanelMsg } from "src/i18n/locales/en"

const GaugePanelEditor = (props: PanelEditorProps) => {
    const t = useStore(commonMsg)
    const t1 = useStore(gaugePanelMsg)
    const { panel, onChange } = props
    return (
        <>
            <PanelAccordion title={t.basicSetting}>
                <PanelEditItem title={t.animation} desc={t.animationTips}>
                    <Switch defaultChecked={panel.plugins.gauge.animation} onChange={e => onChange((panel: Panel) => {
                        panel.plugins.gauge.animation = e.currentTarget.checked
                    })} />
                </PanelEditItem>
            </PanelAccordion>
            <PanelAccordion title={t1.valueSettings}>
                <PanelEditItem title={t.display}>
                    <Switch defaultChecked={panel.plugins.gauge.value.show} onChange={e => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.show = e.currentTarget.checked
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Font size">
                    <EditorNumberItem value={panel.plugins.gauge.value.fontSize} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.fontSize = v
                    })} />
                </PanelEditItem>


                <PanelEditItem title="Left" desc={t1.leftTips}>
                    <EditorInputItem value={panel.plugins.gauge.value.left} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.left = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Top" desc={t1.topTips}>
                    <EditorInputItem value={panel.plugins.gauge.value.top} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.top = v
                    })} />
                </PanelEditItem>

                <PanelEditItem title={t.unit}>
                    <EditorInputItem value={panel.plugins.gauge.value.unit} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.unit = v
                    })} />
                </PanelEditItem>

                <PanelEditItem title={t.decimal}>
                    <EditorNumberItem value={panel.plugins.gauge.value.decimal} min={0} max={5} step={1} onChange={v => onChange((panel: Panel) => { panel.plugins.gauge.value.decimal = v })} />
                </PanelEditItem>
                <PanelEditItem title={t.calc} desc={t.calcTips}>
                    <ValueCalculation value={panel.plugins.gauge.value.calc} onChange={v => {
                        onChange((panel: Panel) => { panel.plugins.gauge.value.calc = v })
                    }} />
                </PanelEditItem>
            </PanelAccordion>

            <PanelAccordion title={t.title}>
                <PanelEditItem title={t.display}>
                    <Switch defaultChecked={panel.plugins.gauge.title.show} onChange={e => onChange((panel: Panel) => {
                        panel.plugins.gauge.title.show = e.currentTarget.checked
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Font size">
                    <EditorNumberItem value={panel.plugins.gauge.title.fontSize} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.title.fontSize = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Left" desc={t1.leftTips}>
                    <EditorInputItem value={panel.plugins.gauge.title.left} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.title.left = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Top" desc={t1.topTips}>
                    <EditorInputItem value={panel.plugins.gauge.title.top} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.title.top = v
                    })} />
                </PanelEditItem>
            </PanelAccordion>
            <PanelAccordion title={t.axis}>
                <PanelEditItem title="Min">
                    <EditorNumberItem value={panel.plugins.gauge.value.min} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.min = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="Max">
                    <EditorNumberItem value={panel.plugins.gauge.value.max} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.value.max = v
                    })} />
                </PanelEditItem>

                <PanelEditItem title="Width">
                    <EditorNumberItem value={panel.plugins.gauge.axis.width} onChange={(v) => onChange((panel: Panel) => {
                        panel.plugins.gauge.axis.width = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title={t1.showTicks} >
                    <Switch defaultChecked={panel.plugins.gauge.axis.showTicks} onChange={e => onChange((panel: Panel) => {
                        panel.plugins.gauge.axis.showTicks = e.currentTarget.checked
                    })} />
                </PanelEditItem>
                <PanelEditItem title={t1.split} desc={t1.splitTips} >
                    <AxisSplit {...props} />
                </PanelEditItem>
            </PanelAccordion>

            <PanelAccordion title={t.scale}>
                <PanelEditItem title={t.display}>
                    <Switch defaultChecked={panel.plugins.gauge.scale.enable} onChange={e => {
                        onChange((panel: Panel) => {
                            panel.plugins.gauge.scale.enable = e.currentTarget.checked
                        })
                    }} />
                </PanelEditItem>
                <PanelEditItem title={t1.splitNum}>
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