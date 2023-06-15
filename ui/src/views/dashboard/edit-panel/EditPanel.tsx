import { Box, Button, Center, Flex, HStack, Image, Input, Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, SimpleGrid, Switch, Tab, TabIndicator, TabList, TabPanel, TabPanels, Tabs, Text, Textarea, useDisclosure } from "@chakra-ui/react"
import { ColorModeSwitcher } from "components/ColorModeSwitcher"
import AutoSizer from 'react-virtualized-auto-sizer';
import { upperFirst } from "lodash"
import { useEffect, useState } from "react"
import { Dashboard, Panel, PanelType } from "types/dashboard"
import PanelGrid, { PanelEventWrapper } from "../grid/PanelGrid"
import GraphPanelEditor from "../plugins/panel/graph/Editor"
import TextPanelEditor from "../plugins/panel/text/Editor"
import PanelAccordion from "./Accordion"
import PanelEditItem from "./PanelEditItem"
import EditPanelQuery from "./Query"
import TablePanelEditor from "../plugins/panel/table/Editor";
import { useImmer } from "use-immer";
import { removeParamFromUrl } from "utils/url";
import { useSearchParam } from "react-use";
import NodeGraphPanelEditor from "../plugins/panel/nodeGraph/Editor";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import PanelStyles from "./PanelStyles";
import PanelSettings from "./PanelSettings";

interface EditPanelProps {
    dashboard: Dashboard
    onChange: any
}

const EditPanel = ({ dashboard, onChange }: EditPanelProps) => {
    const edit = useSearchParam('edit')

    const [tempPanel, setTempPanel] = useImmer<Panel>(null)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [hideDatasource, setHideDatasource] = useState(false)

    useEffect(() => {
        if (edit) {
            const p = dashboard.data.panels.find(p => p.id.toString() === edit)
            if (p) {
                setTempPanel(p)
                onOpen()
            }
        }
    }, [edit])




    const onApplyChanges = () => {
        onChange(dashboard => {
            for (var i = 0; i < dashboard.data.panels.length; i++) {
                if (dashboard.data.panels[i].id === tempPanel.id) {
                    dashboard.data.panels[i] = tempPanel
                    break
                }
            }
        })

        onEditClose()
    }


    const onDiscard = () => {
        setTempPanel(null)
        onEditClose()
    }


    const onEditClose = () => {
        removeParamFromUrl(['edit'])
        onClose()
    }

    const maxPanelHeight = () => {
        if (tempPanel.useDatasource) {
            if (hideDatasource) {
                return '100%'
            }
            return '50%'
        }
        return '100%'
    }

    const maxDatasourceHeight = () => {
        if (tempPanel.useDatasource) {
            if (hideDatasource) {
                return '0%'
            }
            return '50%'
        }
        return '0%'
    }

    return (<>
        <Modal isOpen={isOpen} onClose={onEditClose} size="full">
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
                            <Box key={tempPanel.id.toString() + hideDatasource as string} height={maxPanelHeight()} id="edit-panel-render">
                                <PanelGrid key={tempPanel.id + tempPanel.type} dashboard={dashboard} panel={tempPanel} sync={null} />
                                <Box position="absolute" right="0" bottom={hideDatasource ? "0" : "-35px"} opacity="0.3" cursor="pointer" fontSize=".8rem" onClick={() => { setHideDatasource(!hideDatasource) }}>{hideDatasource ? <FaArrowUp /> : <FaArrowDown />}</Box>
                            </Box>
                            {/* panel datasource section */}
                            {tempPanel.useDatasource && <Box maxHeight={maxDatasourceHeight()} mt="2" overflowY="scroll">
                                <EditPanelQuery key={tempPanel.id + tempPanel.type} panel={tempPanel} onChange={setTempPanel} />
                            </Box>}
                        </Box>
                        {/* panel settings section */}
                        <Box width="35%" maxHeight="100%" overflowY={"scroll"}>
                            <Box className="top-gradient-border bordered-left bordered-right" >
                                <Tabs position="relative" variant="unstyled">
                                    <TabList pb="0">
                                        <Tab>Panel</Tab>
                                        <Tab>Styles</Tab>
                                    </TabList>
                                    <TabIndicator
                                        mt="3px"
                                        height="2px"
                                        bg="brand.500"
                                        borderRadius="1px"
                                    />
                                    <TabPanels>
                                        <TabPanel px="0" pt="1">
                                            {/* panel basic setting */}
                                            <PanelSettings panel={tempPanel} onChange={setTempPanel}/>

                                            {/* panel rendering plugin setting */}
                                            <CustomPanelEditor tempPanel={tempPanel} setTempPanel={setTempPanel} />
                                        </TabPanel>
                                        <TabPanel px="0" pt="1" pb="0">
                                            <PanelStyles panel={tempPanel} onChange={setTempPanel}/>
                                        </TabPanel>
                                    </TabPanels>
                                </Tabs>

                            </Box>

                        </Box>
                    </HStack>
                </ModalBody>
            </ModalContent>}
        </Modal>
    </>)
}

export default EditPanel


const CustomPanelEditor = ({ tempPanel, setTempPanel }) => {
    //@needs-update-when-add-new-panel
    switch (tempPanel?.type) {
        case PanelType.Text:
            return <TextPanelEditor panel={tempPanel} onChange={setTempPanel} />
        case PanelType.Graph:
            return <GraphPanelEditor panel={tempPanel} onChange={setTempPanel} />
        case PanelType.Table:
            return <TablePanelEditor panel={tempPanel} onChange={setTempPanel} />
        case PanelType.NodeGraph:
            return <NodeGraphPanelEditor panel={tempPanel} onChange={setTempPanel} />
        default:
            return <></>
    }
}