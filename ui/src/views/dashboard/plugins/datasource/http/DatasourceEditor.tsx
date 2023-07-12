import { Datasource } from "types/datasource"
import React from "react";
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