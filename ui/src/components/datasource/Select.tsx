import { Image } from "@chakra-ui/react"
import { Select, chakraComponents } from "chakra-react-select"
import { Variant } from "chakra-react-select/dist/types/types"
import { useEffect, useState } from "react"
import { DatasourceType } from "types/dashboard"
import { Datasource } from "types/datasource"
import { requestApi } from "utils/axios/request"

interface Props {
    value: number
    onChange: any
    allowTypes?: DatasourceType[]
    variant?: Variant
}

const DatasourceSelect = ({ value, onChange, allowTypes = [], variant = "unstyled" }: Props) => {
    const [datasources, setDatasources] = useState<Datasource[]>([])

    useEffect(() => {
        load()
    },[])

    const load = async () => {
        const res = await requestApi.get("/datasource/all")
        setDatasources(res.data)
    }

    const options = []
    datasources.forEach((ds) => {
        if (allowTypes.length > 0 && !allowTypes.includes(ds.type)) {
            return
        }

        options.push({
            label: ds.name,
            value: ds.id,
            icon: <Image width="30px" height="30px" mr="2" src={`/plugins/datasource/${ds.type}.svg`} />
        })
    })


    return (<Select value={{value: value,label: datasources.find(ds => ds.id == value)?.name}} menuPlacement="bottom" placeholder="select datasource" variant={variant} size="sm" options={options} onChange={(v: any) => {
        onChange(v.value)
    }}
        components={customComponents}
    />)
}

export default DatasourceSelect


const customComponents = {
    Option: ({ children, ...props }) => (
        //@ts-ignore
        <chakraComponents.Option {...props}>
            {props.data.icon} {children}
        </chakraComponents.Option>
    ),
};