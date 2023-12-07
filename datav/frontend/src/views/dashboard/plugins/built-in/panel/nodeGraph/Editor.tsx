// Copyright 2023 xobserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  Alert,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Switch,
  Text,
  Textarea,
  Tooltip,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { ColorPicker } from 'src/components/ColorPicker'
import RadionButtons from 'src/components/RadioButtons'
import { cloneDeep, isEmpty } from 'lodash'
import { memo, useMemo, useState } from 'react'
import * as Icons from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { onClickCommonEvent } from 'src/data/panel/initPlugins'
import PanelAccordion from 'src/views/dashboard/edit-panel/Accordion'
import {
  EditorInputItem,
  EditorNumberItem,
  EditorSliderItem,
} from 'src/components/editor/EditorItem'
import PanelEditItem from 'src/views/dashboard/edit-panel/PanelEditItem'
import {
  NodeGraphIcon,
  NodeGraphMenuItem,
  NodeGraphEditorProps,
  NodeGraphPanel as Panel,
} from './types'
import { useImmer } from 'use-immer'
import CodeEditor from 'src/components/CodeEditor/CodeEditor'
import React from 'react'
import { useStore } from '@nanostores/react'
import { commonMsg, nodeGraphPanelMsg } from 'src/i18n/locales/en'
import { dispatch } from 'use-bus'
import { PanelForceRebuildEvent } from 'src/data/bus-events'
import { Node } from './types'
import { palettes } from 'utils/colors'
import { CodeEditorModal } from 'src/components/CodeEditor/CodeEditorModal'

const NodeGraphPanelEditor = memo((props: NodeGraphEditorProps) => {
  const t = useStore(commonMsg)
  const t1 = useStore(nodeGraphPanelMsg)
  const { panel, onChange } = props
  return (
    <>
      <PanelAccordion title={t.basic}>
        <PanelEditItem
          title={'Zoom canvas'}
          desc='Scroll the canvas by wheeling'
        >
          <Switch
            defaultChecked={panel.plugins.nodeGraph.zoomCanvas}
            onChange={(e) => {
              const v = e.currentTarget.checked
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.zoomCanvas = v
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }}
          />
        </PanelEditItem>
        {!panel.plugins.nodeGraph.zoomCanvas && (
          <PanelEditItem
            title={'Scroll canvas'}
            desc='Scroll the canvas by wheeling'
          >
            <Switch
              defaultChecked={panel.plugins.nodeGraph.scrollCanvas}
              onChange={(e) => {
                const v = e.currentTarget.checked
                onChange((panel: Panel) => {
                  panel.plugins.nodeGraph.scrollCanvas = v
                  dispatch(PanelForceRebuildEvent + panel.id)
                })
              }}
            />
          </PanelEditItem>
        )}
        <PanelEditItem title={'Drag canvas'}>
          <Switch
            defaultChecked={panel.plugins.nodeGraph.dragCanvas}
            onChange={(e) => {
              const v = e.currentTarget.checked
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.dragCanvas = v
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }}
          />
        </PanelEditItem>
        <PanelEditItem title={'Drag node'}>
          <Switch
            defaultChecked={panel.plugins.nodeGraph.dragNode}
            onChange={(e) => {
              const v = e.currentTarget.checked
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.dragNode = v
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }}
          />
        </PanelEditItem>
      </PanelAccordion>
      <PanelAccordion title={t1.node}>
        <PanelEditItem title={t1.baseSize}>
          <EditorSliderItem
            value={panel.plugins.nodeGraph.node.baseSize}
            min={20}
            max={100}
            step={2}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.node.baseSize = v
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }
          />
        </PanelEditItem>
        {/* <PanelEditItem title={t1.maxSize}>
                <EditorNumberItem value={panel.plugins.nodeGraph.node.maxSize} min={1} max={5} onChange={v => onChange((panel: Panel) => {
                    panel.plugins.nodeGraph.node.maxSize = v
                })} />
            </PanelEditItem> */}

        <IconSetting
          panel={panel}
          onChange={(v) => {
            onChange(v)
            dispatch(PanelForceRebuildEvent + panel.id)
          }}
        />

        {/* <PanelEditItem title={t1.shape}>
                <RadionButtons options={[{ label: t1.circle, value: "circle" },{ label: t1.donut, value: "donut" }]} value={panel.plugins.nodeGraph.node.shape} onChange={v => onChange((panel:Panel) => {
                    panel.plugins.nodeGraph.node.shape = v
                })} />
            </PanelEditItem> */}
        {panel.plugins.nodeGraph.node.shape == 'donut' && (
          <DonutColorsEditor {...props} />
        )}
        <PanelEditItem title={t.borderColor}>
          <ColorPicker
            color={panel.plugins.nodeGraph.node.borderColor}
            onChange={(c) =>
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.node.borderColor = c
              })
            }
            circlePicker
          />
        </PanelEditItem>
        <PanelEditItem title={t1.enableHighlight}>
          <Switch
            defaultChecked={panel.plugins.nodeGraph.node.enableHighlight}
            onChange={(e) => {
              const v = e.currentTarget.checked
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.node.enableHighlight = v
              })
            }}
          />
        </PanelEditItem>
        {panel.plugins.nodeGraph.node.enableHighlight && (
          <PanelEditItem title={t1.highlightNodes} desc={t1.highlightNodesTips}>
            <EditorInputItem
              value={panel.plugins.nodeGraph.node.highlightNodes}
              onChange={(v) =>
                onChange((panel: Panel) => {
                  panel.plugins.nodeGraph.node.highlightNodes = v
                })
              }
              placeholder={t1.highlightNodesInputTips}
            />
          </PanelEditItem>
        )}
        {panel.plugins.nodeGraph.node.enableHighlight && (
          <PanelEditItem desc={t1.highlightNodesFuncTips}>
            <CodeEditorModal
              value={panel.plugins.nodeGraph.node.highlightNodesByFunc}
              onChange={(v) =>
                onChange((panel: Panel) => {
                  panel.plugins.nodeGraph.node.highlightNodesByFunc = v
                })
              }
            />
          </PanelEditItem>
        )}
        {panel.plugins.nodeGraph.node.enableHighlight &&
          panel.plugins.nodeGraph.node.highlightNodes && (
            <PanelEditItem title={t.highlightColor}>
              <ColorPicker
                color={panel.plugins.nodeGraph.node.highlightColor}
                onChange={(c) =>
                  onChange((panel: Panel) => {
                    panel.plugins.nodeGraph.node.highlightColor = c
                  })
                }
              />
            </PanelEditItem>
          )}
      </PanelAccordion>

      <PanelAccordion title={t1.edge}>
        <PanelEditItem title={t1.shape}>
          <Select
            value={panel.plugins.nodeGraph.edge.shape}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.edge.shape = e.currentTarget.value
              })
            }
          >
            <option value='quadratic'>{t1.quadratic}</option>
            <option value='line'>{t1.line}</option>
            <option value='polyline'>{t1.polyline}</option>
          </Select>
        </PanelEditItem>
        <PanelEditItem title={t1.displayLabel}>
          <Switch
            defaultChecked={panel.plugins.nodeGraph.edge.display}
            onChange={(e) => {
              const v = e.currentTarget.checked
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.edge.display = v
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }}
          />
        </PanelEditItem>
        <PanelEditItem title={t1.arrow}>
          <Select
            value={panel.plugins.nodeGraph.edge.arrow}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.edge.arrow = e.currentTarget.value
              })
            }
          >
            <option value='default'>default</option>
            <option value='triangle'>triangle</option>
            <option value='circle'>circle</option>
            <option value='vee'>vee</option>
            <option value='diamond'>diamond</option>
            <option value='triangleRect'>triangleRect</option>
          </Select>
        </PanelEditItem>

        <PanelEditItem title={t1.edgeColor}>
          <HStack>
            <ColorPicker
              color={panel.plugins.nodeGraph.edge.color.light}
              onChange={(c) =>
                onChange((panel: Panel) => {
                  panel.plugins.nodeGraph.edge.color.light = c
                })
              }
              buttonText={t1.pickLightColor}
            />
          </HStack>
          <HStack>
            <ColorPicker
              color={panel.plugins.nodeGraph.edge.color.dark}
              onChange={(c) =>
                onChange((panel: Panel) => {
                  panel.plugins.nodeGraph.edge.color.dark = c
                })
              }
              buttonText={t1.pickDarkColor}
            />
          </HStack>
        </PanelEditItem>
        <PanelEditItem title={t.opacity} desc={t1.opacityTips}>
          <EditorSliderItem
            value={panel.plugins.nodeGraph.edge.opacity}
            min={0}
            max={1}
            step={0.1}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.edge.opacity = v
              })
            }
          />
        </PanelEditItem>
        {/* <PanelEditItem title={t1.highlightColor} desc={t1.highlightColorTips}>
                <HStack>
                    <ColorPicker color={panel.plugins.nodeGraph.edge.highlightColor.light} onChange={c => onChange((panel: Panel) => {
                        panel.plugins.nodeGraph.edge.highlightColor.light = c
                    })} buttonText={t1.pickLightColor} />
                    <Box width="40px" height="30px" background={panel.plugins.nodeGraph.edge.highlightColor.light}></Box>
                </HStack>
                <HStack>
                    <ColorPicker  color={panel.plugins.nodeGraph.edge.highlightColor.dark} onChange={c => onChange((panel: Panel) => {
                        panel.plugins.nodeGraph.edge.highlightColor.dark = c
                    })} buttonText={t1.pickDarkColor} />
                    <Box width="40px" height="30px" background={panel.plugins.nodeGraph.edge.highlightColor.dark}></Box>
                </HStack>
            </PanelEditItem> */}
        <PanelEditItem title='Show detail'>
          <RadionButtons
            options={[
              { label: 'None', value: 'none' },
              { label: 'Hover', value: 'hover' },
              { label: 'Click', value: 'click' },
            ]}
            value={panel.plugins.nodeGraph.edge.showDetail}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.edge.showDetail = v
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }
          />
        </PanelEditItem>
        {panel.plugins.nodeGraph.edge.showDetail && (
          <PanelEditItem title='Detail position'>
            <RadionButtons
              options={[
                { label: 'Edge', value: 'edge' },
                { label: 'Top left', value: 'top-left' },
              ]}
              value={panel.plugins.nodeGraph.edge.detailPos}
              onChange={(v) =>
                onChange((panel: Panel) => {
                  panel.plugins.nodeGraph.edge.detailPos = v
                  dispatch(PanelForceRebuildEvent + panel.id)
                })
              }
            />
          </PanelEditItem>
        )}
      </PanelAccordion>

      <PanelAccordion title={t.interaction}>
        <PanelEditItem title={t1.tooltipTrigger}>
          <RadionButtons
            options={[
              { label: 'Hover', value: 'mouseenter' },
              { label: 'Click', value: 'click' },
            ]}
            value={panel.plugins.nodeGraph.node.tooltipTrigger}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.node.tooltipTrigger = v
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }
          />
        </PanelEditItem>

        <RightClickMenus {...props} />
      </PanelAccordion>

      <PanelAccordion title='legend'>
        <PanelEditItem title={t.enable}>
          <Switch
            defaultChecked={panel.plugins.nodeGraph.legend.enable}
            onChange={(e) =>
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.legend.enable = e.currentTarget.checked
                dispatch(PanelForceRebuildEvent + panel.id)
              })
            }
          />
        </PanelEditItem>
      </PanelAccordion>

      <PanelAccordion title={t1.layout}>
        <PanelEditItem title={t1.nodeStrength} desc={t1.nodeStrengthTips}>
          <EditorNumberItem
            value={panel.plugins.nodeGraph.layout.nodeStrength}
            min={100}
            max={10000}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.layout.nodeStrength = v
              })
            }
          />
        </PanelEditItem>
        <PanelEditItem title={t1.nodeGravity} desc={t1.nodeGravityTips}>
          <EditorNumberItem
            value={panel.plugins.nodeGraph.layout.gravity}
            min={0}
            max={200}
            onChange={(v) =>
              onChange((panel: Panel) => {
                panel.plugins.nodeGraph.layout.gravity = v
              })
            }
          />
        </PanelEditItem>
      </PanelAccordion>
    </>
  )
})

export default NodeGraphPanelEditor

const initIcon: NodeGraphIcon = { key: '', value: '', icon: '', type: 'label' }
const IconSetting = ({ panel, onChange }: NodeGraphEditorProps) => {
  const t1 = useStore(nodeGraphPanelMsg)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [temp, setTemp] = useImmer<NodeGraphIcon>(initIcon)
  const onSubmit = () => {
    if (
      isEmpty(temp.value) ||
      isEmpty(temp.icon) ||
      (temp.type == 'data' && isEmpty(temp.key))
    ) {
      toast({
        description: 'field cannot be empty',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      })
      return
    }

    for (const icon of panel.plugins.nodeGraph.node.icon) {
      if (icon.key == temp.key && icon.value == temp.value) {
        toast({
          description: 'the same key/value already exist',
          status: 'warning',
          duration: 2000,
          isClosable: true,
        })
        return
      }
    }

    onChange((panel) => {
      panel.plugins.nodeGraph.node.icon.unshift(temp)
    })
    setTemp(initIcon)
    onClose()
  }

  const removeIcon = (i) => {
    onChange((panel) => {
      panel.plugins.nodeGraph.node.icon.splice(i, 1)
    })
  }

  return (
    <>
      <PanelEditItem title={t1.icon}>
        <Button size='xs' onClick={onOpen}>
          {t1.setIcon}
        </Button>
        <Divider mt='2' />
        <VStack alignItems='sleft' mt='1'>
          {panel.plugins.nodeGraph.node.icon.map((icon, i) => (
            <Flex key={i} justifyContent='space-between' alignItems='center'>
              <HStack fontSize='0.9rem'>
                <HStack spacing={0}>
                  <Text>{icon.type}</Text>
                  {icon.type == 'data' && <Text>.{icon.key}</Text>}
                  <Text>&nbsp;= {icon.value}</Text>
                  <Text className='color-text'>&nbsp;-&gt;</Text>
                </HStack>
                <Image src={icon.icon} width='30px' height='30px' />
              </HStack>

              <Box
                layerStyle='textFourth'
                cursor='pointer'
                onClick={() => removeIcon(i)}
              >
                <Icons.FaTimes />
              </Box>
            </Flex>
          ))}
        </VStack>
      </PanelEditItem>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minWidth='800px'>
          <ModalBody>
            <HStack>
              <Text fontWeight='600'>When </Text>
              <Button
                size='sm'
                variant='outline'
                onClick={() => {
                  setTemp((draft) => {
                    draft.type = temp.type == 'label' ? 'data' : 'label'
                  })
                }}
              >
                {temp.type}
              </Button>
              {temp.type == 'data' && (
                <Input
                  onChange={(e) => {
                    const v = e.currentTarget.value.trim()
                    setTemp((draft) => {
                      draft.key = v
                    })
                  }}
                  placeholder={'key, hover a node to see, e.g service_type'}
                  size='sm'
                  width='300px'
                />
              )}
              <Text fontWeight='600'>=</Text>
              <Input
                onChange={(e) => {
                  const v = e.currentTarget.value.trim()
                  setTemp((draft) => {
                    draft.value = v
                  })
                }}
                placeholder={
                  temp.type == 'label'
                    ? 'label name, e.g mysql'
                    : 'data attribute value, e.g database'
                }
                size='sm'
                width='260px'
              />
            </HStack>
            <HStack>
              <Text fontWeight='600'>show icon </Text>
              <Input
                onChange={(e) => {
                  const v = e.currentTarget.value.trim()
                  setTemp((draft) => {
                    draft.icon = v
                  })
                }}
                placeholder='icon url'
                size='sm'
                width='250px'
              />
              {/* {Icon && <Icon />} */}
              {temp.icon && (
                <Image src={temp.icon} width='30px' height='30px' />
              )}
            </HStack>
            <Button my='4' size='sm' onClick={onSubmit}>
              Submit
            </Button>
            <Alert status='success' flexDir='column' alignItems='left'>
              <Text>
                1. You can find data attributes by hovering on a node, e.g
                'error: 45' , 'error' is attribute name, '45' is value
              </Text>
              {/* <Text mt="2">
                            2. Find icons on https://react-icons.github.io/react-icons/icons?name=fa
                        </Text> */}
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

const RightClickMenus = ({ panel, onChange }: NodeGraphEditorProps) => {
  const t = useStore(commonMsg)
  const t1 = useStore(nodeGraphPanelMsg)

  const initMenuItem = {
    name: '',
    event: onClickCommonEvent,
    enable: true,
  }

  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [temp, setTemp] = useImmer<NodeGraphMenuItem>(initMenuItem)

  const onSubmit = () => {
    for (const item of panel.plugins.nodeGraph.node.menu) {
      if (item.name == temp.name && item.id != temp.id) {
        toast({
          description: 'same name exist',
          status: 'warning',
          duration: 2000,
          isClosable: true,
        })
        return
      }
    }

    if (!temp.id) {
      // add new menu item
      temp.id = new Date().getTime()
      onChange((panel: Panel) => {
        panel.plugins.nodeGraph.node.menu.unshift(temp)
      })
    } else {
      onChange((panel: Panel) => {
        for (let i = 0; i < panel.plugins.nodeGraph.node.menu.length; i++) {
          if (panel.plugins.nodeGraph.node.menu[i].id == temp.id) {
            panel.plugins.nodeGraph.node.menu[i] = temp
          }
        }
      })
    }

    setTemp(initMenuItem)
    dispatch(PanelForceRebuildEvent + panel.id)
    onClose()
  }

  const removeItem = (i) => {
    onChange((panel) => {
      panel.plugins.nodeGraph.node.menu.splice(i, 1)
    })
  }

  const moveUp = (i) => {
    onChange((panel) => {
      const menu = panel.plugins.nodeGraph.node.menu
      const item = menu[i - 1]
      menu[i - 1] = menu[i]
      menu[i] = item
    })
  }

  const moveDown = (i) => {
    onChange((panel) => {
      const menu = panel.plugins.nodeGraph.node.menu
      const item = menu[i + 1]
      menu[i + 1] = menu[i]
      menu[i] = item
    })
  }

  return (
    <>
      <PanelEditItem
        title={t1.rightClick}
        info={<Text>{t.applyToSeeEffect}</Text>}
      >
        <Button
          size='xs'
          onClick={() => {
            onOpen()
            setTemp(initMenuItem)
          }}
        >
          {t1.addMenuItem}
        </Button>
        {panel.plugins.nodeGraph.node.menu.length > 0 && <Divider my='2' />}
        <VStack alignItems='left' pl='2'>
          {panel.plugins.nodeGraph.node.menu.map((item, i) => (
            <Flex alignItems='center' justifyContent='space-between'>
              <Tooltip label={item.event}>
                <Text>{item.name}</Text>
              </Tooltip>

              <HStack layerStyle='textFourth'>
                {i != 0 && (
                  <Icons.FaArrowUp cursor='pointer' onClick={() => moveUp(i)} />
                )}
                {i != panel.plugins.nodeGraph.node.menu.length - 1 && (
                  <Icons.FaArrowDown
                    cursor='pointer'
                    onClick={() => moveDown(i)}
                  />
                )}
                <MdEdit
                  onClick={() => {
                    setTemp(item)
                    onOpen()
                  }}
                  cursor='pointer'
                />
                <Icons.FaEye
                  className={item.enable ? 'color-text' : null}
                  cursor='pointer'
                  onClick={() => {
                    onChange((panel) => {
                      panel.plugins.nodeGraph.node.menu[i].enable = !item.enable
                    })
                    dispatch(PanelForceRebuildEvent + panel.id)
                  }}
                />
                <Icons.FaTimes onClick={() => removeItem(i)} cursor='pointer' />
              </HStack>
            </Flex>
          ))}
        </VStack>
      </PanelEditItem>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minWidth='800px'>
          <ModalBody p='0'>
            <HStack>
              <Text fontWeight='600'>{t1.menuItemName}</Text>
              <Input
                value={temp.name}
                onChange={(e) => {
                  const v = e.currentTarget.value
                  setTemp((draft) => {
                    draft.name = v
                  })
                }}
                placeholder='e.g view service'
                size='sm'
                width='250px'
              />
            </HStack>

            <Text fontWeight='600' mt='4'>
              {t1.defineClickEvent}
            </Text>
            <Box height='300px'>
              <CodeEditor
                value={temp.event}
                onChange={(v) => {
                  setTemp((draft) => {
                    draft.event = v
                  })
                }}
              />
            </Box>
            <Button my='4' size='sm' onClick={onSubmit}>
              {t.submit}
            </Button>
            <Alert status='success' flexDir='column' alignItems='left'>
              <Text></Text>
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

const DonutColorsEditor = (props: NodeGraphEditorProps) => {
  const { panel, onChange, data } = props
  if (!data || data.length == 0 || !data[0].nodes) {
    return null
  }
  const toast = useToast()
  const t = useStore(commonMsg)
  const t1 = useStore(nodeGraphPanelMsg)
  const [value, setValue] = useState<{ attr: string; color: string }[]>(
    panel.plugins.nodeGraph.node.donutColors,
  )
  const attrNames = useMemo(() => {
    let nodes: Node[]
    if (data.length > 0) {
      nodes = data[0].nodes
    }
    let attrNames = []
    if (nodes.length > 0) {
      attrNames = Object.keys(nodes[0].data)
    }
    return attrNames
  }, [data])

  const changeValue = () => {
    const v = cloneDeep(value)
    setValue(v)
    onChange((panel) => {
      panel.plugins.nodeGraph.node.donutColors = v
    })
  }

  const addItem = () => {
    let attr
    for (const name of attrNames) {
      if (!value.find((v) => v.attr == name)) {
        attr = name
        break
      }
    }

    if (attr) {
      value.unshift({ attr, color: palettes[value.length % palettes.length] })
      changeValue()
    } else {
      toast({
        description: 'No attrs to set',
        status: 'info',
        duration: 2000,
        isClosable: true,
      })
    }
  }

  const removeItem = (i) => {
    value.splice(i, 1)
    changeValue()
  }

  const filterValue = value.filter((v) => attrNames.includes(v.attr))
  return (
    <PanelEditItem
      title={t1.donutColors}
      info={
        <VStack alignItems='left' fontWeight='600'>
          <Text>{t1.donutTips1}</Text>
          <Text>1. {t1.donutTips2}</Text>
          <Text>2. {t1.donutTips3}</Text>
          <Text>3. {t1.donutTips4}</Text>
          <Alert status='success'>{t1.donutTips5}</Alert>
        </VStack>
      }
    >
      <Box>
        {filterValue.length < attrNames.length && (
          <Button onClick={addItem} width='100%' size='sm' colorScheme='gray'>
            + {t.new}
          </Button>
        )}
        <VStack alignItems='left' mt='2'>
          {filterValue.map((item, i) => (
            <HStack key={item.attr + i + item.color} spacing={1}>
              <ColorPicker
                color={item.color}
                onChange={(v) => {
                  item.color = v
                  changeValue()
                }}
                circlePicker
              />
              <Select
                value={item.attr}
                onChange={(e) => {
                  if (
                    filterValue.find((v) => v.attr == e.currentTarget.value)
                  ) {
                    return
                  }
                  item.attr = e.currentTarget.value
                  changeValue()
                }}
              >
                {attrNames.map((name) => (
                  <option value={name}>{name}</option>
                ))}
              </Select>

              <Icons.FaTimes
                opacity={0.6}
                fontSize='0.8rem'
                onClick={() => removeItem(i)}
              />
            </HStack>
          ))}
        </VStack>
      </Box>
    </PanelEditItem>
  )
}
