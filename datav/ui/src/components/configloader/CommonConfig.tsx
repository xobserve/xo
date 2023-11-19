import React, { useEffect, useMemo, useState } from "react"
import { $config, UIConfig } from "../../data/configs/config";
import { requestApi } from "utils/axios/request";
import { useToast } from "@chakra-ui/react";

const CommonConfig = ({children}) => {
    const toast = useToast()
    const [cfg, setConfig] = useState<UIConfig>($config.get())

    const teamPath = useMemo(() => {
      let firstIndex;
      let secondIndex;
      let i = 0;
      for (const c of location.pathname) {
        if (c == '/') {
          if (firstIndex === undefined) {
            firstIndex = i;
            i++
            continue
          }
  
          if (secondIndex === undefined) {
            secondIndex = i
            break
          }
        }
        i++
      }
  
      const teamPath = location.pathname.slice(firstIndex + 1, secondIndex)
      return teamPath
    }, [location.pathname])
  
    const teamId = Number(teamPath)

    useEffect(() => {
        loadConfig()
    },[])
    
    const loadConfig = async () => {
        const res = await requestApi.get(`/config/ui${isNaN(teamId) ? '' : `?teamId=${teamId}`}`)
    
        const cfg: UIConfig = res.data
        if (cfg.currentTeam != teamId && location.pathname != "" && location.pathname != "/") {
          toast({
            title: `You have no privilege to view team ${teamPath}, please visit root path to navigate to your current team`,
            status: "warning",
            duration: 5000,
            isClosable: true,
          })
    
          // let newPath
          // if (location.pathname == "" || location.pathname == "/") {
          //   newPath = `/${cfg.currentTeam}`
          // } else {
          //   newPath = location.pathname.replace(`/${teamPath}`, `/${cfg.currentTeam}`)
          // }
          // setTimeout(() => {
          //   window.location.href = newPath
          // }, 1500)
          return 
        }
    
    
       
        cfg.sidemenu = (cfg.sidemenu as any).data.filter((item) => !item.hidden)
        setConfig(cfg)
        $config.set(cfg)
      }

    return (<>{cfg &&  children}</>)
}

export default CommonConfig
