import { Button, Input, NumberInput, NumberInputField, Select, Switch, Textarea, useColorMode, useColorModeValue } from "@chakra-ui/react"
import { ColorPicker } from "components/color-picker"
import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import customColors from "src/theme/colors"
import { Panel } from "types/dashboard"
import { PanelBorderType, PanelTitleDecorationType } from "types/panel/styles"
import PanelAccordion from "./Accordion"
import { EditorInputItem } from "./EditorItem"
import PanelEditItem from "./PanelEditItem"

interface Props {
    panel: Panel
    onChange: any
}

const PanelStyles = ({ panel, onChange }: Props) => {
    return (
        <>
            <PanelAccordion title="Panel border" defaultOpen>
                <Select size="sm" value={panel.styles?.border} onChange={e => {
                    const v = e.currentTarget.value
                    onChange(panel => {
                        panel.styles.border = v
                    })
                }}>
                    {
                        Object.keys(PanelBorderType).map(key => <option value={PanelBorderType[key]}>{key}</option>)
                    }
                </Select>
            </PanelAccordion>
            <PanelAccordion title="Title decoration">
                <PanelEditItem title="type">
                    <Select size="sm" value={panel.styles?.title?.decoration.type} onChange={e => {
                        const v = e.currentTarget.value
                        onChange(panel => {
                            panel.styles.title.decoration.type = v
                        })
                    }}>
                        {
                            Object.keys(PanelTitleDecorationType).map(key => <option value={PanelTitleDecorationType[key]}>{key}</option>)
                        }
                    </Select>
                </PanelEditItem>
                <PanelEditItem title="width">
                    <EditorInputItem type="input" value={panel.styles.title?.decoration.width} onChange={v => onChange(panel => {
                        panel.styles.title.decoration.width = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="height">
                    <EditorInputItem type="input" value={panel.styles.title?.decoration.height} onChange={v => onChange(panel => {
                        panel.styles.title.decoration.height = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="margin">
                    <EditorInputItem type="input" value={panel.styles.title?.decoration.margin} onChange={v => onChange(panel => {
                        panel.styles.title.decoration.margin = v
                    })} />
                </PanelEditItem>
                {/* <NumberInputItem target={panel.styles.title?.decoration} attr="width" onChange={onChange} title="width" min={0} max={100} /> */}
            </PanelAccordion>

            <PanelAccordion title="Title styles">
                <PanelEditItem title="font size">
                    <EditorInputItem type="input" value={panel.styles.title?.fontSize} onChange={v => onChange(panel => {
                        panel.styles.title.fontSize = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="font weight">
                    <EditorInputItem type="input" value={panel.styles.title?.fontWeight} onChange={v => onChange(panel => {
                        panel.styles.title.fontWeight = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="color">
                    <ColorPicker  presetColors={[{ title: 'default', color: useColorModeValue(customColors.textColor.light,'#fff') }]} color={panel.styles.title.color} onChange={c => onChange((panel: Panel) => {
                        panel.styles.title.color = c.hex
                    })}>
                        <Button size="sm" variant="outline">Pick color</Button>
                    </ColorPicker>
                </PanelEditItem>
                <PanelEditItem title="padding top">
                    <EditorInputItem type="input" value={panel.styles.title?.paddingTop} onChange={v => onChange(panel => {
                        panel.styles.title.paddingTop = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="padding right">
                    <EditorInputItem type="input" value={panel.styles.title?.paddingRight} onChange={v => onChange(panel => {
                        panel.styles.title.paddingRight = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="padding bottom">
                    <EditorInputItem type="input" value={panel.styles.title?.paddingBottom} onChange={v => onChange(panel => {
                        panel.styles.title.paddingBottom = v
                    })} />
                </PanelEditItem>
                <PanelEditItem title="padding left">
                    <EditorInputItem type="input" value={panel.styles.title?.paddingLeft} onChange={v => onChange(panel => {
                        panel.styles.title.paddingLeft = v
                    })} />
                </PanelEditItem>
            </PanelAccordion>
        </>
    )
}

export default PanelStyles




