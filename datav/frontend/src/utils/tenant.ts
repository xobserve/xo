import { UIConfig } from "src/data/configs/config"
import { requestApi } from "./axios/request"
import { isEmpty } from "./validate"
import { CreateToastFnReturn } from "@chakra-ui/react"

export const selectTenant = async (tenantId:number, teamId:string, config:UIConfig, toast: CreateToastFnReturn, url?: string) => {
    if (tenantId === config?.currentTenant) {
        toast({
            title: "Already in this tenant",
            status: "info",
            duration: 3000,
            isClosable: true,
        })
        return
    }
    const res = await requestApi.post(`/tenant/switch/${tenantId}`)
    const newTeamId = res.data
    setTimeout(() => {
        if (!url) {
            if (isEmpty(teamId)) {
                window.location.reload()
            } else {
                const path = window.location.pathname
                window.location.href = path.replace(`/${teamId}`, `/${newTeamId}`)
            }
        } else {
            window.location.href = (`/${newTeamId}` +  url)
        }
      
    }, 1000)
    toast({
        title: "Tenant switched, reloading...",
        status: "success",
        duration: 3000,
        isClosable: true,
    })
}