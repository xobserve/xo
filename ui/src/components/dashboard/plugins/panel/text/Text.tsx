import { MarkdownRender } from "components/markdown/MarkdownRender"
import { Panel } from "types/dashboard"

interface Props {
    panel: Panel
}

const TextPanel = ({panel}: Props) => {
    return (<>
        <MarkdownRender md={panel.settings.text?.md ?? ""} width="100%"/>
    </>)
}

export default TextPanel