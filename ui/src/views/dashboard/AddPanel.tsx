import { Button, Modal, ModalBody, ModalContent, ModalOverlay, useColorModeValue, useDisclosure, VStack } from "@chakra-ui/react";
import IconButton from "components/button/IconButton";
import { PanelAdd } from "components/icons/PanelAdd";
import { StorageCopiedPanelKey } from "src/data/constants";
import { Dashboard, DatasourceType, GraphSettings, NodeGraphSettings, Panel, PanelType } from "types/dashboard";
import storage from "utils/localStorage";
import { initPanelSettings } from "./plugins/panel/initSettings";

interface Props {
    dashboard: Dashboard
    onChange: any
}

const AddPanel = ({ dashboard, onChange }: Props) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    const addPanel = () => {
        const copiedPanel = storage.get(StorageCopiedPanelKey)
        if (copiedPanel) {
            onOpen()
            return
        }

        onAddPanel()
    };



    const getNextPanelId = () => {
        let max = 0;

        for (const panel of dashboard.data.panels) {
            if (panel.id > max) {
                max = panel.id;
            }
        }

        return max + 1;
    }


    const onAddPanel = () => {
        // Return if the "Add panel" exists already
        // if (panel) {
        //     return;
        // }

        if (!dashboard.data.panels) {
            dashboard.data.panels = []
        }
        const id = getNextPanelId()
        const newPanel: Panel = {
            id: id,
            title: `New panel ${id}`,
            type: PanelType.Text,
            gridPos: { x: 0, y: 0, w: 12, h: 8 },
            //@needs-update-when-add-new-panel
            settings: {
                text: initPanelSettings.text,
                graph: initPanelSettings.graph as GraphSettings,
                nodeGraph: initPanelSettings.nodeGraph as NodeGraphSettings
            },
            datasource: [{
                type: DatasourceType.Prometheus,
                selected: true,
                queryOptions: {
                    interval: '15s'
                },
                queries: []
            }],
            useDatasource: false,
            showBorder: true
        }



        // // panel in editing must be a clone of the original panel
        // setPanel(cloneDeep(newPanel))

        // scroll to top after adding panel
        window.scrollTo(0, 0);

        onChange(dashboard => { dashboard.data.panels.unshift(newPanel) })
    }
    const onPastePanel = () => {
        const copiedPanel = storage.get(StorageCopiedPanelKey)
        storage.remove(StorageCopiedPanelKey)
        if (copiedPanel) {
            const id = getNextPanelId()
            copiedPanel.id = id
            onChange(dashboard => { dashboard.data.panels.unshift(copiedPanel) })
            return
        }
    }

    return (<>
        <IconButton onClick={addPanel}><PanelAdd size={28} fill={useColorModeValue("var(--chakra-colors-brand-500)", "var(--chakra-colors-brand-200)")} /></IconButton>
        <Modal isOpen={isOpen} onClose={onClose} >
            <ModalOverlay />
            <ModalContent mt="20%">
                <ModalBody py="10">
                    <VStack alignItems={"left"}>
                        <Button onClick={() => { onAddPanel(); onClose() }} variant="outline">Add new panel</Button>
                        <Button onClick={() => { onPastePanel(); onClose() }}>Paste panel from clipboard</Button>
                    </VStack>

                </ModalBody>
            </ModalContent>
        </Modal>
    </>)
}

export default AddPanel