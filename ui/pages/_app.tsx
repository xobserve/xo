import "src/theme/css/react-grid.css"
import "src/theme/css/echarts.css"
import dynamic from "next/dynamic";
import AppView from "src/views/App";

dynamic(import("echarts/extension/bmap/bmap"), { ssr: false });

const App =  dynamic(async () => (props) => {  
  return (
    //@ts-ignore
    <AppView {...props}>
    </AppView>
  )
}  , { ssr: false })

export default App
