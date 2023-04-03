import { useEffect, useState } from "react"
import { requestApi } from "utils/axios/request"
import useSWR from 'swr'
import { removeToken } from "utils/axios/getToken"
import { Session } from "src/types/user"
import { Variable } from "types/variable"


const useVariables = (localVars?: Variable[]) => {
  const [variables,setVariables] = useState<Variable[]>(null)
  const { data } = useSWR(
      '/variable/all', 
      () =>
        requestApi.get('/variable/all').then(res => {
          return res.data
        })
  )
  
  useEffect(() => {
    const vars = []
    if (localVars) {
        for (const v of localVars) {
            v.values = v.value.split(",")
        }
        vars.push(...localVars)
    }

    if (data) {
        for (const v of data) {
            v.values = v.value.split(",")
        }
        vars.push(...data)
    }
    
    setVariables(vars)
  },[data,localVars])
  


  return { variables }
}


export default useVariables