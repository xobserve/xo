import "src/theme/css/react-grid.css"
import "src/theme/css/echarts.css"
import dynamic from "next/dynamic";
import AppView from "src/views/App";

// local css
import "src/views/dashboard/plugins/panel/trace/components/TraceCompare/renderNode.css"
import "src/views/dashboard/plugins/panel/trace/components/common/EmphasizedNode.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/SpanGraph/Scrubber.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/SpanGraph/ViewingLayer.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/Header/TimelineHeader.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/Header/TimelineLayer.css"
import "src/components/VerticalResizer/VerticalResizer.css"

dynamic(import("echarts/extension/bmap/bmap"), { ssr: false });

const App =  dynamic(async () => (props) => {  
  return (
    //@ts-ignore
    <AppView {...props}>
    </AppView>
  )
}  , { ssr: false })

export default App
