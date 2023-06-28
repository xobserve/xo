import { Input, InputGroup, InputLeftAddon, useToast } from "@chakra-ui/react"
import { useState } from "react"
import { Datasource } from "types/datasource"
import isURL from "validator/lib/isURL"

interface Props {
    datasource: Datasource
    onChange: any
}

const PrometheusDatasourceEditor = ({ datasource, onChange }: Props) => {
    return (<>
        <InputGroup size="sm" mt="4">
            <InputLeftAddon children='URL' />
            <Input value={datasource.url} placeholder="http://localhost:9090" onChange={e => {
                const v = e.currentTarget.value
                onChange((d: Datasource) => { d.url = v })
            }} />
        </InputGroup>
    </>)
}

export default PrometheusDatasourceEditor

export const isPromethesDatasourceValid = (ds: Datasource) => {
    if (!isURL(ds.url, { require_tld: false })) {
        return 'invalid url'
    }
}