import { Select } from "chakra-react-select"
import { useEffect, useState } from "react"
import { DatasourceType } from "types/dashboard"
import { Datasource } from "types/datasource"
import { requestApi } from "utils/axios/request"

interface Props {
    value: number
    onChange: any
    allowTypes?: DatasourceType[]
}

const DatasourceSelect = ({ value, onChange,allowTypes=[] }:Props) => {
    const [datasources, setDatasources] = useState<Datasource[]>([])

    useEffect(() => {
        load()
    })

    const load = async () => {
        const res = await requestApi.get("/datasource/all")
        setDatasources(res.data)
    }

    const options = []
    datasources.forEach((ds) => { 
        if (allowTypes.length > 0 && !allowTypes.includes(ds.type)) {
            return
        }

        options.push({ label: ds.name, value: ds.id })
    })

    return (<Select value={value} menuPlacement="bottom" placeholder="Metrics" variant="unstyled" size="sm" options={options} onChange={(v) => {
        onChange(v)
    }}
    />)
}

export default DatasourceSelect