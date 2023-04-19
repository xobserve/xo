import { Box, Button, Center, Flex, HStack, Image, Input, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, Select, SimpleGrid, Switch, Text, Textarea, useDisclosure, VStack } from "@chakra-ui/react"
import { ColorModeSwitcher } from "components/ColorModeSwitcher"
import AutoSizer from 'react-virtualized-auto-sizer';
import { cloneDeep, upperFirst } from "lodash"
import { useEffect, useState } from "react"
import { Dashboard,  Panel, PanelType } from "types/dashboard"
import { PanelComponent } from "../grid/PanelGrid"
import GraphPanelEditor from "../plugins/panel/graph/Editor"
import TextPanelEditor from "../plugins/panel/text/Editor"
import PanelAccordion from "./Accordion"
import PanelEditItem from "./PanelEditItem"
import EditPanelQuery from "./Query"
import { TimeRange } from "types/time";
import { Variable } from "types/variable";

interface EditPanelProps {
    dashboard: Dashboard
    panel: Panel
    onApply: any
    onDiscard: any
    timeRange: TimeRange
    variables: Variable[]
}

const EditPanel = ({ dashboard, panel, onApply, onDiscard,timeRange,variables }: EditPanelProps) => {
    const [tempPanel, setTempPanel] = useState<Panel>(null)
    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
        if (panel) {
            onOpen()
            setTempPanel(panel)
        } else {
            onClose()
            setTempPanel(null)
        }
    }, [panel])


    const onApplyChanges = () => {
        for (var i = 0; i < dashboard.data.panels.length; i++) {
            if (dashboard.data.panels[i].id === tempPanel.id) {
                dashboard.data.panels[i] = tempPanel
                break
            }
        }

        onApply()
    }

    const onSettingsChange = (panel:Panel) => {
        // Rather than update the whole panel, we only update panel settings here,
        // because the former one will cause the server making a new query to datasource
        setTempPanel(cloneDeep(panel))
    }


    const CustomPanelEditor = () => {

        //@needs-update-when-add-new-panel
        switch (tempPanel?.type) {
            case PanelType.Text:
                return <TextPanelEditor panel={tempPanel} onChange={onSettingsChange} />
            case PanelType.Graph:
                return <GraphPanelEditor panel={tempPanel} onChange={onSettingsChange} />
            default:
                return <></>
        }
    }

    const onChangeVisualization = type => {
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

        setTempPanel(cloneDeep(tempPanel))
    }

    return (<>
        <Modal isOpen={isOpen} onClose={() => { onDiscard(), onClose() }} size="full">
            <ModalOverlay />
            {dashboard && tempPanel && <ModalContent>
                {/* editor header section */}
                <ModalHeader>
                    <Flex justifyContent="space-between">
                        <Text>{dashboard.title} / Edit Panel</Text>
                        <HStack spacing={1}>
                            <Button variant="outline" onClick={() => { onDiscard(), onClose() }} >Discard</Button>
                            <Button onClick={onApplyChanges}>Apply</Button>
                            <ColorModeSwitcher />
                        </HStack>
                    </Flex>
                </ModalHeader>
                <ModalBody>
                    <HStack height="calc(100vh - 100px)" alignItems="top">
                        <Box width="65%" height="100%">
                            {/* panel rendering section */}
                            <Box height={tempPanel.useDatasource ? "50%" : "100%"} id="edit-panel-render">
                            <AutoSizer>
                                {({ width, height }) => {
                                    if (width === 0) {
                                        return null;
                                    }

                                    return (
                                        <Box width={width}
                                            height={height}>
                                            <PanelComponent dashboard={dashboard} panel={tempPanel} width={width} height={height} timeRange={timeRange} variables={variables} />
                                        </Box>
                                    );
                                }}
                            </AutoSizer>
                            </Box>
                            {/* panel datasource section */}
                            {tempPanel.useDatasource && <Box maxHeight="50%" mt="2" overflowY="scroll">
                                <EditPanelQuery panel={tempPanel} onChange={(panel?) => {
                                    const p = panel??tempPanel
                                    setTempPanel({...p, datasource: cloneDeep(p.datasource)})
                                }}/>
                            </Box>}
                        </Box>
                        {/* panel settings section */}
                        <Box width="35%" maxHeight="100%" overflowY={"scroll"}>
                            <Box className="top-gradient-border bordered-left bordered-right" >
                                <Text px="2" py="2">Panel</Text>
                                {/* panel basic setting */}
                                <PanelAccordion title="Basic setting">
                                    <PanelEditItem title="Panel title">
                                        <Input size="sm" value={tempPanel.title} onChange={e => setTempPanel({ ...tempPanel, title: e.currentTarget.value })} />
                                    </PanelEditItem>
                                    <PanelEditItem title="Description" desc="give a short description to your panel">
                                        <Textarea size="sm" value={tempPanel.desc} onChange={e => setTempPanel({ ...tempPanel, desc: e.currentTarget.value })} />
                                    </PanelEditItem>
                                    <PanelEditItem title="Transparent" desc="Display panel without a background.">
                                        <Switch id='panel-transparent' defaultChecked={tempPanel.transparent} onChange={e => setTempPanel({ ...tempPanel, transparent: e.currentTarget.checked })} />
                                    </PanelEditItem>
                                </PanelAccordion>

                                {/* panel visulization choosing */}
                                <PanelAccordion title="Visualization">
                                    <SimpleGrid columns={2} spacing="2">
                                        {
                                            Object.keys(PanelType).map((key) => {
                                                if (PanelType[key] == PanelType.Row) {
                                                    return <></>
                                                }
                                                return <VisulizationItem
                                                    selected={tempPanel.type == PanelType[key]}
                                                    title={upperFirst(PanelType[key])}
                                                    imageUrl={`/plugins/panel/${PanelType[key].toLowerCase()}.svg`}
                                                    onClick={() => onChangeVisualization(PanelType[key])}
                                                />
                                            })
                                        }
                                    </SimpleGrid>
                                </PanelAccordion>

                                {/* panel rendering plugin setting */}
                                <CustomPanelEditor />
                            </Box>

                        </Box>
                    </HStack>
                </ModalBody>
            </ModalContent>}
        </Modal>
    </>)
}

export default EditPanel

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