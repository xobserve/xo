import { Variable } from "types/variable";
import { parseVariableFormat } from "./format";

// replace ${xxx} format with corresponding variable
export const replaceWithVariables = (s: string, vars: Variable[]) => {
    const formats = parseVariableFormat(s);
    for (const f of formats) {
        const v = vars.find(v => v.name ==f)
        if (v) {
            s = s.replace(`\${${f}}`, v.selected);
        }
    }

    return s
}