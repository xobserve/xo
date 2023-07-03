import { Input } from "@chakra-ui/react"
import FormItem from "components/form/Item"
import { Datasource } from "types/datasource"
import isURL from "validator/lib/isURL"

interface Props {
    datasource: Datasource
    onChange: any
}

const PrometheusDatasourceEditor = ({ datasource, onChange }: Props) => {
    return (<>
        <FormItem title="URL">
            <Input value={datasource.url} placeholder="http://localhost:9090" onChange={e => {
                const v = e.currentTarget.value
                onChange((d: Datasource) => { d.url = v })
            }} />
        </FormItem>
    </>)
}

export default PrometheusDatasourceEditor

export const isPromethesDatasourceValid = (ds: Datasource) => {
    if (!isURL(ds.url, { require_tld: false })) {
        return 'invalid url'
    }
}