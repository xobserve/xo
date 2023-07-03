import { Datasource } from "types/datasource"

interface Props {
    datasource: Datasource
    onChange: any
}

const HttpDatasourceEditor = ({datasource, onChange}: Props) => {
    return (<></>)
}

export default HttpDatasourceEditor

export const isHttpDatasourceValid = (ds: Datasource) => {
    
}