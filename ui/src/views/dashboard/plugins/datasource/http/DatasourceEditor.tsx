import { Input, InputGroup, InputLeftAddon } from "@chakra-ui/react"
import { Datasource } from "types/datasource"
import isURL from "validator/lib/isURL"

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