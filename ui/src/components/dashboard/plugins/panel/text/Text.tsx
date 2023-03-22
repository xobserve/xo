import { Box } from "@chakra-ui/react"
import { MarkdownRender } from "components/markdown/MarkdownRender"
import { Panel, PanelProps } from "types/dashboard"
import { DataFrame } from "types/dataFrame"



const TextPanel = (props: PanelProps) => {
    console.log(props)
    return (<Box px="2">
        <MarkdownRender md={props.panel.settings.text?.md ?? ""} width="100%"/>
    </Box>)
}

export default TextPanel