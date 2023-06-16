import { Box, Center, Image, Input, SimpleGrid, Switch, Text, Textarea } from "@chakra-ui/react"
import { upperFirst } from "lodash"
import { Panel, PanelType } from "types/dashboard"
import PanelAccordion from "./Accordion"
import { EditorInputItem } from "./EditorItem"
import PanelEditItem from "./PanelEditItem"

interface Props {
    panel: Panel
    onChange: any
}

const PanelSettings = ({ panel, onChange }: Props) => {
    const onChangeVisualization = type => {
        onChange(tempPanel => {
            tempPanel.type = type

            tempPanel.useDatasource = true
            // text panel doesn't need datasource
            if (type == PanelType.Text) {
                tempPanel.useDatasource = false
            }

            // init settings for panel render plugin
            if (!tempPanel.settings[type]) {
                tempPanel.settings[type] = {}
            }
        })
    }


    return (
        <>
            <PanelAccordion title="Basic setting" defaultOpen>
                <PanelEditItem title="Panel title">
                    <EditorInputItem value={panel.title} onChange={v => onChange(tempPanel => { tempPanel.title = v })}   />
                </PanelEditItem>
                <PanelEditItem title="Description" desc="give a short description to your panel">
                    <EditorInputItem type="textarea" value={panel.desc} onChange={v => onChange(tempPanel => { tempPanel.desc = v })}   />
                </PanelEditItem>
            </PanelAccordion>

            {/* panel visulization choosing */}
            <PanelAccordion title="Visualization" defaultOpen>
                <SimpleGrid columns={2} spacing="2">
                    {
                        Object.keys(PanelType).map((key) => {
                            if (PanelType[key] == PanelType.Row) {
                                return <></>
                            }
                            return <VisulizationItem
                                selected={panel.type == PanelType[key]}
                                title={upperFirst(PanelType[key])}
                                imageUrl={`/plugins/panel/${PanelType[key].toLowerCase()}.svg`}
                                onClick={() => onChangeVisualization(PanelType[key])}
                            />
                        })
                    }
                </SimpleGrid>
            </PanelAccordion>
        </>
    )
}

export default PanelSettings


const VisulizationItem = ({ title, imageUrl, onClick = null, selected = false }) => {
    return (
        <Box className={`tag-bg ${selected ? "highlight-bordered" : ""}`} onClick={onClick} pb="2" cursor="pointer">
            <Center >
                <Text>{title}</Text>
            </Center>
            <Image src={imageUrl} height="100px" width="100%" />
        </Box>

    )
}


