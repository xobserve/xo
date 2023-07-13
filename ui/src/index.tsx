import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// global css
import "src/theme/css/react-grid.css"
import "src/theme/css/echarts.css"

// local css
import "src/views/dashboard/plugins/panel/trace/components/TraceCompare/renderNode.css"
import "src/views/dashboard/plugins/panel/trace/components/common/NameSelector.css"
import "src/views/dashboard/plugins/panel/trace/components/common/FilteredList/index.css"
import "src/views/dashboard/plugins/panel/trace/components/common/FilteredList/ListItem.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/SpanGraph/Scrubber.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/SpanGraph/ViewingLayer.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/Header/TimelineHeader.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/Header/TimelineLayer.css"
import "src/components/VerticalResizer/VerticalResizer.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/SpanRow/SpanDetail/index.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/SpanRow/SpanDetail/AccordianKeyValues.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/SpanRow/SpanDetail/AccordianLogs.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/SpanRow/SpanDetail/AccordianReferences.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/SpanRow/SpanDetail/KeyValuesTable.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/SpanRow/SpanDetail/TextList.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/SpanRow/SpanBar.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/SpanRow/SpanBarRow.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/SpanRow/SpanDetailRow.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/SpanRow/SpanTreeOffset.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceTimeline/TimelineRow.css"
import "src/views/dashboard/plugins/panel/trace/components/TraceDetail/TraceGraph/TraceGraph.css"




ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
)
