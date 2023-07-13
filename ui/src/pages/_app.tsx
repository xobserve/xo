import React from "react"

import dynamic from "next/dynamic";
import AppView from "src/App";


// dynamic(import("echarts/extension/bmap/bmap"), { ssr: false });

const App =  dynamic(async () => (props) => {  
  return (
    //@ts-ignore
    <AppView {...props}>
    </AppView>
  )
}  , { ssr: false })

export default App
