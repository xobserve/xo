import { Box } from "@chakra-ui/react"
import { variables } from "src/views/dashboard/Dashboard"
import { MarkdownRender } from "components/markdown/MarkdownRender"
import { PanelProps } from "types/dashboard"
import { replaceWithVariables } from "utils/variable"



const TextPanel = (props: PanelProps) => {
    return (<Box px="2" height="100%" id="text-panel" display="flex" alignItems={props.panel.plugins.text.alignItems} justifyContent={props.panel.plugins.text.justifyContent} >
        <MarkdownRender fontSize={props.panel.plugins.text.fontSize} fontWeight={props.panel.plugins.text.fontWeight} md={replaceWithVariables(props.panel.plugins.text?.md ?? "", variables)} width="100%"/>
    </Box>)
}

export default TextPanel
