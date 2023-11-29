// Copyright 2023 xObserve.io Team

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import CollapseIcon from 'components/icons/Collapse'
import React, { useRef, useState } from 'react'
import { FaCog, FaRegEdit, FaTrash } from 'react-icons/fa'
import { MdDragIndicator } from 'react-icons/md'
import { Dashboard, Panel, PanelTypeRow } from 'types/dashboard'
import { $rowInDrag } from '../../store/dashboard'

interface Props {
  panel: Panel
  onChange: any
}

const RowPanel = (props: Props) => {
  const { panel, onChange } = props
  const [onHover, setOnHover] = useState(false)
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose,
  } = useDisclosure()
  const cancelRef = useRef()
  const [inEdit, setInEdit] = useState(false)
  const [title, setTitle] = useState(panel.title)

  const onRowClick = () => {
    if (panel.collapsed) {
      // expand
      onChange((dash: Dashboard) => {
        let row
        let rowIndex
        for (var i = 0; i < dash.data.panels.length; i++) {
          const p = dash.data.panels[i]
          if (p.id == panel.id) {
            p.collapsed = !p.collapsed
            row = p
            rowIndex = i
            break
          }
        }

        const rowPanels = row.panels ?? []
        if (rowPanels.length > 0) {
          // Use first panel to figure out if it was moved or pushed
          // If the panel doesn't have gridPos.y, use the row gridPos.y instead.
          // This can happen for some generated dashboards.
          const firstPanelYPos = rowPanels[0].gridPos.y ?? row.gridPos.y
          const yDiff = firstPanelYPos - (row.gridPos.y + row.gridPos.h)

          // start inserting after row
          let insertPos = rowIndex + 1
          // y max will represent the bottom y pos after all panels have been added
          // needed to know home much panels below should be pushed down
          let yMax = row.gridPos.y

          for (const panel of rowPanels) {
            // set the y gridPos if it wasn't already set
            panel.gridPos.y ?? (panel.gridPos.y = row.gridPos.y) // (Safari 13.1 lacks ??= support)
            // make sure y is adjusted (in case row moved while collapsed)
            panel.gridPos.y -= yDiff
            // insert after row
            dash.data.panels.splice(insertPos, 0, panel)
            // update insert post and y max
            insertPos += 1
            yMax = Math.max(yMax, panel.gridPos.y + panel.gridPos.h)
          }

          const pushDownAmount = yMax - row.gridPos.y - 1

          // push panels below down
          for (const panel of dash.data.panels.slice(insertPos)) {
            panel.gridPos.y += pushDownAmount
          }

          row.panels = []
        }
      })
    } else {
      // collapse
      onChange((dash: Dashboard) => {
        let isChild = false
        const collapsedPanels = []
        const visiblePanels = []
        let row
        for (const p of dash.data.panels) {
          if (p.id == panel.id) {
            p.collapsed = !p.collapsed
            isChild = true
            row = p
            visiblePanels.push(p)
            continue
          }

          if (isChild) {
            if (p.type == PanelTypeRow) {
              visiblePanels.push(p)
              isChild = false
            } else {
              collapsedPanels.push(p)
            }
          } else {
            visiblePanels.push(p)
          }
        }

        row.panels = collapsedPanels
        dash.data.panels = visiblePanels
      })
    }
  }

  const onOpenSetting = (e) => {
    e.stopPropagation()
    setInEdit(true)
  }

  const onOpenDelete = (e) => {
    e.stopPropagation()
    onAlertOpen()
  }

  const onDeleteAll = () => {
    onChange((dash: Dashboard) => {
      dash.data.panels = dash.data.panels.filter((p) => p.id != panel.id)
    })
  }

  const onDeleteRow = () => {
    if (panel.collapsed) {
      // expand the row first
      onRowClick()
    }

    onChange((dash: Dashboard) => {
      dash.data.panels = dash.data.panels.filter((p) => p.id != panel.id)
    })
  }

  const onEdit = (e) => {
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
  return (
    <>
      <Flex
        className={'hover-bg ' + (panel.collapsed ? 'label-bg' : '')}
        py='2px'
        px='1'
        alignItems='center'
        justifyContent='space-between'
        width='100%'
        onMouseEnter={() => setOnHover(true)}
        onMouseLeave={() => setOnHover(false)}
      >
        <HStack
          cursor={'pointer'}
          onClick={onRowClick}
          width='100%'
          spacing={3}
        >
          <HStack>
            <CollapseIcon collapsed={panel.collapsed} fontSize='0.6rem' />
            {inEdit ? (
              <>
                <Input
                  size='xs'
                  value={title}
                  onChange={(e) => setTitle(e.currentTarget.value)}
                  width='200px'
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onEdit(e)
                      return
                    }
                  }}
                />
                <Button
                  size='xs'
                  variant='outline'
                  onClick={(e) => {
                    e.stopPropagation()
                    setInEdit(false)
                    setTitle(panel.title)
                  }}
                >
                  Cancel
                </Button>
                <Button size='xs' onClick={onEdit}>
                  Submit
                </Button>
              </>
            ) : (
              <Text fontSize='0.9rem'> {panel.title}</Text>
            )}
          </HStack>
          {panel.collapsed && (
            <Text fontSize='0.8rem' opacity='0.6' className='hover-text'>
              ({panel.panels.length})
            </Text>
          )}
          {onHover && (
            <FaRegEdit
              fontSize='0.7rem'
              opacity='0.6'
              className='hover-text'
              onClick={onOpenSetting}
            />
          )}
          {onHover && (
            <FaTrash
              fontSize='0.7rem'
              opacity='0.6'
              className='hover-text'
              onClick={onOpenDelete}
            />
          )}
        </HStack>

        <MdDragIndicator
          cursor='move'
          className='grid-drag-handle'
          onMouseDown={(e) => $rowInDrag.set(panel.id)}
        />
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
