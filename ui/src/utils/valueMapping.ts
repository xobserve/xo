import { ValueMappingItem } from "types/dashboard";
import { isEmpty } from "./validate";

export const mapValueToText = (value: number | string, mapping: ValueMappingItem[]) => {
    let text;
    let color;
    for (const m of mapping) {
        if (isEmpty(m.text)) {
            continue
        }
        if (m.type == "value" && m.value == value) {
            text = m.text
            color = m.color
            break
        } else if (m.type == "range" && value >= m.value.from && value <= m.value.to) {
            text = m.text
            color = m.color
            break
        } else if (m.type == "null" && isEmpty(value)) {
            text = m.text
            color = m.color
            break
        } else if (m.type == "regex" && value?.toString().match(m.value)) {
            text = m.text
            color = m.color
            break
        }
    }
    
    return [text, color]
}