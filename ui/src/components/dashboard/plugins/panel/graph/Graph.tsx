import { MarkdownRender } from "components/markdown/MarkdownRender"
import { Panel, PanelProps } from "types/dashboard"
import { DataFrame } from "types/dataFrame"



const GraphPanel = (props: PanelProps) => {
    console.log(props)
    return (<>
        <MarkdownRender md={props.panel.settings.text?.md ?? ""} width="100%"/>
    </>)
}

export default GraphPanel