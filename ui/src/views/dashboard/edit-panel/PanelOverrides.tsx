import { Box, Button, HStack, Select, Tooltip } from "@chakra-ui/react";
import { Form, FormSection } from "components/form/Form";
import FormItem from "components/form/Item";
import { flatten } from "lodash";
import { useMemo, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { Panel, PanelEditorProps, PanelType } from "types/dashboard";
import { GraphOverridesRules } from "../plugins/panel/graph/OverridesEditor";


const PanelOverrides = ({ panel, onChange, data }: PanelEditorProps) => {
    const overrides = panel.overrides
    const names = useMemo(() => flatten(data)?.map((s: any) => s.name), [data])

    const onAddOverride = () => {
        const o = {
            target: names[0],
            overrides: []
        }
        onChange((panel: Panel) => {
            panel.overrides.unshift(o)
        })
    }

    const onAddRule = (i) => {
        onChange((panel: Panel) => {
            panel.overrides[i].overrides.unshift({
                type: "",
                value: ""
            })
        })
    }

    const removeOverride = i => {
        onChange((panel: Panel) => {
            panel.overrides.splice(i, 1)
        })
    }

    const removeRule = (i,j) => {
        onChange((panel: Panel) => {
            panel.overrides[i].overrides.splice(j, 1)
        })
    }

    const getAllRules = ():string[] => {
        switch (panel.type) {
            case PanelType.Graph:
                return GraphOverridesRules
        
            default:
                return []
        }
    }
    return (<Form p="2">
        {
            overrides.map((o, i) => <FormSection title={"Override " + (i + 1)} p="1" titleSize="0.9rem" position="relative" bordered>
                <Box position="absolute" right="2" top="9px" cursor="pointer" onClick={() => removeOverride(i)}><FaTimes fontSize="0.8rem" /></Box>
                <FormItem title="target name">
                    <Tooltip label={o.target}>
                        <Select value={o.target} onChange={e => {
                            const v = e.currentTarget.value
                            onChange((panel: Panel) => {
                                const o = overrides[i]
                                o.target = v
                            })
                        }}>
                            {
                                names.map((name, i) => <option key={name} value={name}>{name}</option>)
                            }
                        </Select>
                    </Tooltip>


                </FormItem>
                {o.overrides.length > 0 && o.overrides.map((rule,j) => <FormSection title={`Rule ${j+1}`} pl="4" width="fit-content" titleSize="0.9rem" position="relative">

                    <FormItem title="type">
                        <Select>
                            {getAllRules().map(r => <option key={r} value={r}>{r}</option>)}
                        </Select>
                    </FormItem>
                    <Box position="absolute" right="1" top="5px" cursor="pointer" onClick={() => removeRule(i,j)}><FaTimes fontSize="0.8rem" /></Box>
                </FormSection>
                )}


                <Button size="sm" variant="ghost" onClick={() => onAddRule(i)}>Add override rule</Button>
            </FormSection>)
        }
        <Button width="100%" variant="outline" onClick={onAddOverride}>Add override</Button>
    </Form>)
}

export default PanelOverrides