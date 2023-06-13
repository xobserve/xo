import { Box } from "@chakra-ui/react"
import { variables } from "src/views/dashboard/Dashboard"
import { MarkdownRender } from "components/markdown/MarkdownRender"
import { Panel, PanelProps } from "types/dashboard"
import { DataFrame } from "types/dataFrame"
import { replaceWithVariables } from "utils/variable"



const TextPanel = (props: PanelProps) => {
    console.log(props)
    return (<Box px="2">
        <MarkdownRender md={replaceWithVariables(props.panel.settings.text?.md ?? "", variables)} width="100%"/>
    </Box>)
}

export default TextPanel
