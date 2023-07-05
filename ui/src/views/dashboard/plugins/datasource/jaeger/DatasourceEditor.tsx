import { Input } from "@chakra-ui/react"
import FormItem from "components/form/Item"
import { Datasource } from "types/datasource"
import isURL from "validator/lib/isURL"

interface Props {
    datasource: Datasource
    onChange: any
}

const JaegerDatasourceEditor = ({datasource, onChange}: Props) => {
    return (<>
        <FormItem title="URL">
            <Input value={datasource.url} placeholder="http://localhost:16686" onChange={e => {
                const v = e.currentTarget.value
                onChange((d: Datasource) => { d.url = v })
            }} />
        </FormItem>
    </>)
}

export default JaegerDatasourceEditor

export const isJaegerDatasourceValid = (ds: Datasource) => {
    if (!isURL(ds.url, { require_tld: false })) {
        return 'invalid url'
    }
}