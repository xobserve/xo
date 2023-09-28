import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Flex, HStack, Input, Text, useDisclosure } from "@chakra-ui/react"
import { EditorInputItem } from "components/editor/EditorItem"
import CollapseIcon from "components/icons/Collapse"
import { set } from "lodash"
import React, { useRef, useState } from "react"
import { FaCog, FaRegEdit, FaTrash } from "react-icons/fa"
import { MdDragIndicator } from "react-icons/md"
import { Dashboard, Panel, PanelType } from "types/dashboard"

interface Props {
    dashboard: Dashboard
    panel: Panel
    onChange: any
}

const RowPanel = (props: Props) => {
    const { panel, dashboard, onChange } = props
    const [onHover, setOnHover] = useState(false)
    const { isOpen: isAlertOpen, onOpen: onAlertOpen, onClose: onAlertClose } = useDisclosure()
    const cancelRef = useRef()
    const [inEdit, setInEdit] = useState(false)
    const [title, setTitle] = useState(panel.title)

    const onRowClick = () => {
        onChange((dash: Dashboard) => {
            let rowFinded = false
            let oldCollapsed
            for (const p of dash.data.panels) {

                if (p.id == panel.id) {
                    oldCollapsed = p.collapsed
                    p.collapsed = !oldCollapsed
                    rowFinded = true
                    continue
                }

                if (rowFinded) {
                    if (p.type == PanelType.Row) {
                        break
                    } else {
                        p.collapsed = !oldCollapsed
                    }
                }
            }
        })
    }

    const onOpenSetting = e => {
        e.stopPropagation()
        setInEdit(true)
    }

    const onOpenDelete = e => {
        e.stopPropagation()
        onAlertOpen()
    }

    const onDeleteAll = () => {
        onChange((dash: Dashboard) => {
            const panels = dash.data.panels
            const newPanels = []
            let rowFinded = false
            for (const p of panels) {
                if (p.id == panel.id) {
                    rowFinded = true
                    continue
                }

                if (rowFinded) {
                    if (p.type == PanelType.Row) {
                        newPanels.push(p)
                        rowFinded = false
                    } else {
                        continue
                    }
                } else {
                    newPanels.push(p)
                }
            }
            dash.data.panels = newPanels
        })
    }

    const onDeleteRow = () => {
        onChange((dash: Dashboard) => {
            let rowFinded = false
            for (const p of dash.data.panels) {
                if (p.id == panel.id) {
                    rowFinded = true
                    continue
                }

                if (rowFinded) {
                    if (p.type == PanelType.Row) {
                        break
                    } else {
                        p.collapsed = false
                    }
                }
            }

            dash.data.panels = dash.data.panels.filter(p => p.id != panel.id)
        })
    }

    const onEdit = e => {
        e.stopPropagation()
        setInEdit(false)
        onChange((dash: Dashboard) => {
            for (const p of dash.data.panels) {
                if (p.id == panel.id) {
                    p.title = title
                    break
                }
            }
        })
    }
    return (<>
        <Flex className={"hover-bg"} alignItems="center" justifyContent="space-between" width="100%" onMouseEnter={() => setOnHover(true)} onMouseLeave={() => setOnHover(false)}>
            <HStack cursor={"pointer"} onClick={onRowClick} width="100%">
                <CollapseIcon collapsed={panel.collapsed} fontSize="0.6rem" />
                {inEdit ?
                    <>
                        <Input size="xs" value={title} onChange={e => setTitle(e.currentTarget.value)} width="200px" onClick={e => e.stopPropagation()} onKeyDown={e => {
                            if (e.key === 'Enter') {
                                onEdit(e)
                                return 
                            }
                        }}/>
                        <Button size="xs" variant="outline" onClick={e => {
                            e.stopPropagation()
                            setInEdit(false)
                            setTitle(panel.title)
                        }}>Cancel</Button>
                        <Button size="xs" onClick={onEdit}>Submit</Button>
                    </>
                    : <Text fontSize="0.9rem"> {panel.title}</Text>}
                {onHover && <FaRegEdit fontSize="0.7rem" opacity="0.6" className="hover-text" onClick={onOpenSetting} />}
                {onHover && <FaTrash fontSize="0.7rem" opacity="0.6" className="hover-text" onClick={onOpenDelete} />}
            </HStack>

            <MdDragIndicator cursor="move" className="grid-drag-handle" />
        </Flex>
        <AlertDialog
            isOpen={isAlertOpen}
            leastDestructiveRef={cancelRef}
            onClose={onAlertClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                        Delete row {panel.title}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        Are you sure you want to remove this row and all its panels?
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onAlertClose}>
                            Cancel
                        </Button>
                        <Button colorScheme='red' onClick={onDeleteAll} ml={3}>
                            Delete ALL
                        </Button>
                        <Button colorScheme='orange' onClick={onDeleteRow} ml={3}>
                            Delete row only
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    </>
    )
}

export default RowPanel