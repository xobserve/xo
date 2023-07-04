import { Box, Button, HStack, Select, Tooltip } from "@chakra-ui/react";
import RadionButtons from "components/RadioButtons";
import { ColorPicker } from "components/color-picker";
import { EditorInputItem, EditorSliderItem } from "components/editor/EditorItem";
import { UnitPicker } from "components/unit";
import { OverrideRule, Panel } from "types/dashboard";
import { colors } from "utils/colors";

interface Props {
    override: OverrideRule
    onChange: any
}


const GraphOverridesEditor = ({ override, onChange }: Props) => {
    switch (override.type) {
        case 'Series.style':
            return <RadionButtons size="sm" options={[{ label: "Lines", value: "lines" }, { label: "Bars", value: "bars" }, { label: "points", value: "points" }]} value={override.value} onChange={onChange} />
        case 'Series.name':
            return <EditorInputItem value={override.value} onChange={onChange} size="sm" placeholder="change series name" />
        case 'Series.unit':
            return <UnitPicker size="sm" type={override.value.unitsType} value={override.value.units} onChange={
                (units, type) => onChange({
                    unitsType: type, 
                    units: units
                })
            } />
        case 'Series.color':
            return <ColorPicker presetColors={colors} color={override.value} onChange={v => onChange(v.hex)} ><Button size="sm" width="fit-content" bg={override.value}>Pick color</Button></ColorPicker>
        case 'Series.fill':
            return <EditorSliderItem value={override.value} min={0} max={100} step={1} onChange={onChange} />
        case 'Series.negativeY':
            return <></>
        default:
            return <></>
    }
    
}

export default GraphOverridesEditor

export const GraphOverridesRules =  ['Series.style', 'Series.name', 'Series.unit','Series.color', 'Series.fill', 'Series.negativeY' ]