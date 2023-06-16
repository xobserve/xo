import { Input, NumberInput, NumberInputField, Select, Switch } from "@chakra-ui/react"
import { useEffect, useLayoutEffect, useMemo, useState } from "react"
import { Panel } from "types/dashboard"
import { PanelBorderType, PanelTitleDecorationType } from "types/panel"
import PanelAccordion from "./Accordion"
import PanelEditItem from "./PanelEditItem"

interface Props {
    panel: Panel
    onChange: any
}

const PanelStyles = ({ panel, onChange }: Props) => {
    return (
        <>
            <PanelAccordion title="Panel border">
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
            </PanelAccordion>
        </>
    )
}

export default PanelStyles


interface NumberInputProps {
    target: Object
    attr: string
    onChange: any
    title: string
    desc?: string
    min: number
    max: number
}

const NumberInputItem = ({ target, attr, onChange, title, desc, min, max }: NumberInputProps) => {
    const [temp, setTemp] = useState(target[attr].toString())
    return (
        <PanelEditItem title={title} desc={desc}>
            <NumberInput value={temp} min={min} max={max} size="sm" onChange={v => setTemp(v)} onBlur={e => onChange(panel => {
                target[attr] = Number(temp)
            })}>
                <NumberInputField />
            </NumberInput>
        </PanelEditItem>
    )
}

interface EditorInputProps {
    type: string
    value: string
    onChange: any
}

const EditorInputItem = ({ value, onChange, type }: EditorInputProps) => {
    const [temp, setTemp] = useState(value)
    switch (type) {
        case "input":
            return (
                <Input size="sm" value={temp} onChange={e => setTemp(e.currentTarget.value)} onBlur={() => onChange(temp)} />
            )
    }
}