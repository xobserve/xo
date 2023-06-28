import { Input, InputGroup, InputLeftAddon } from "@chakra-ui/react"
import { Datasource } from "types/datasource"
import isURL from "validator/lib/isURL"

interface Props {
    datasource: Datasource
    onChange: any
}

const JaegerDatasourceEditor = ({datasource, onChange}: Props) => {
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

export default JaegerDatasourceEditor

export const isJaegerDatasourceValid = (ds: Datasource) => {
    if (!isURL(ds.url, { require_tld: false })) {
        return 'invalid url'
    }
}