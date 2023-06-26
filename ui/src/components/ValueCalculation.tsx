import { Select } from "@chakra-ui/react"
import { ValueCalculationType } from "types/value"

interface Props {
    value: ValueCalculationType
    onChange: any
}
const ValueCalculation = ({value,onChange}:Props) => {
    return (<>
        <Select value={value} onChange={onChange}>
            {
                Object.keys(ValueCalculationType).map(k  => <option key={k} value={ValueCalculationType[k]}>{k}</option>)
            }
        </Select>
    </>)
}

export default ValueCalculation