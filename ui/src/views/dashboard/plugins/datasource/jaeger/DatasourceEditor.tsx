import { Datasource } from "types/datasource"
import isURL from "validator/lib/isURL"

interface Props {
    datasource: Datasource
    onChange: any
}

const JaegerDatasourceEditor = ({datasource, onChange}: Props) => {
    return (<>
    </>)
}

export default JaegerDatasourceEditor

export const isJaegerDatasourceValid = (ds: Datasource) => {
    if (!isURL(ds.url, { require_tld: false })) {
        return 'invalid url'
    }
}