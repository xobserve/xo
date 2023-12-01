// Copyright 2023 xObserve.io Team

import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  Text,
  ModalHeader,
  ModalOverlay,
  StyleProps,
  useClipboard,
  useDisclosure,
  Switch,
  HStack,
  VStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  ModalCloseButton,
  Textarea,
  Tooltip,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { BsShare } from 'react-icons/bs'
import { Dashboard } from 'types/dashboard'
import { parseVariableFormat } from 'utils/format'
import { getCurrentTimeRange } from 'src/components/DatePicker/TimePicker'
import queryString from 'query-string'
import { FaFileDownload, FaRegCopy, FaShare, FaRegEye } from 'react-icons/fa'
import { useStore } from '@nanostores/react'
import { commonMsg, dashboardMsg } from 'src/i18n/locales/en'
import { dispatch } from 'use-bus'
import { ShareUrlEvent } from 'src/data/bus-events'
import { $variables } from '../variables/store'
import { Form } from 'components/form/Form'
import FormItem from 'components/form/Item'
import CodeEditor from 'src/components/CodeEditor/CodeEditor'
import saveFile from 'save-as-file'
import { isEmpty } from 'utils/validate'
import { REFRESH_OFF } from './DashboardRefresh'
import { Select } from 'antd'
import { concat } from 'lodash'
import RadionButtons from 'components/RadioButtons'
import { locale } from 'src/i18n/i18n'
import { Lang } from 'types/misc'

interface Props extends StyleProps {
  dashboard: Dashboard
  className: string
}

export const shareUrlParams = {}
const DashboardShare = ({ dashboard, ...rest }: Props) => {
  const variables = useStore($variables)
  const t = commonMsg.get()
  const t1 = dashboardMsg.get()
  const lang = locale.get()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [shareUrl, setShareUrl] = useState(null)
  const [embededUrl, setEmbededUrl] = useState(null)

  const { onCopy, setValue, hasCopied } = useClipboard('', 5000)
  const {
    onCopy: onEmbedCopy,
    setValue: setEmbedValue,
    hasCopied: hasEmbedCopied,
  } = useClipboard('', 5000)
  const [enableCurrentTimeRange, setEnableCurrentTimeRange] = useState(true)
  const [useRawTime, setUseRawTime] = useState(false)
  const [useToolbar, setUserToolbar] = useState(true)
  const [refresh, setRefresh] = useState(REFRESH_OFF)
  const [embeddingPanel, setEmbeddingPanel] = useState<number>(0)
  const [colorMode, setColorMode] = useState('light')

  useEffect(() => {
    let url = window.origin + location.pathname + '?'
    const dashData = JSON.stringify(dashboard.data)
    const usingVariables = parseVariableFormat(dashData)
    for (const k of Object.keys(shareUrlParams)) {
      delete shareUrlParams[k]
    }

    const timeRange = getCurrentTimeRange()
    if (enableCurrentTimeRange) {
      shareUrlParams['from'] = useRawTime
        ? timeRange.startRaw
        : timeRange.start.getTime()
      shareUrlParams['to'] = useRawTime
        ? timeRange.endRaw
        : timeRange.end.getTime()
    }

    for (const v of variables) {
      if (usingVariables.includes(v.name)) {
        shareUrlParams['var-' + v.name] = v.selected
        for (const v1 of variables) {
          // to avoid circle refer evets:
          // A refer B : A send event to B, then B refer to A, B send event to A
          if (v1.id == v.id) {
            continue
          }
          if (
            v.datasource?.toString()?.indexOf('${' + v1.name + '}') >= 0 ||
            v.value?.indexOf('${' + v1.name + '}') >= 0
          ) {
            shareUrlParams['var-' + v1.name] = v1.selected
          }
        }
      }
    }
    dispatch(ShareUrlEvent)
    setTimeout(() => {
      let embedding = url + '&embed=true&fullscreen=on'
      if (!isEmpty(shareUrlParams)) {
        const params = queryString.stringify(shareUrlParams, { sort: false })
        url = url + params
        embedding = embedding + '&' + params
      }

      if (useToolbar) {
        embedding = embedding + '&toolbar=on'
      }

      if (refresh != REFRESH_OFF) {
        embedding = embedding + '&refresh=' + refresh
      }

      if (embeddingPanel > 0) {
        embedding = embedding + '&viewPanel=' + embeddingPanel
      }

      embedding = embedding + '&colorMode=' + colorMode

      setShareUrl(url)
      setEmbededUrl(embedding)
      setValue(url)
      setEmbedValue(embedding)
    }, 150)
  }, [
    enableCurrentTimeRange,
    useRawTime,
    variables,
    useToolbar,
    refresh,
    embeddingPanel,
    colorMode,
    dashboard,
  ])

  const filterPanels = (
    input: string,
    option?: { label: string; value: number },
  ) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())

  return (
    <>
      <Tooltip label={t1.shareDashboard}>
        <Box onClick={onOpen} {...rest}>
          <BsShare />
        </Box>
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose} autoFocus={false}>
        <ModalOverlay />
        <ModalContent minWidth='600px'>
          <Tabs>
            <ModalHeader maxHeight='20' paddingBottom={'1'}>
              <HStack spacing={8}>
                <HStack>
                  <FaShare fontSize='0.85rem' />
                  <Text fontSize='md'>{t.share}</Text>
                </HStack>
                <TabList>
                  <Tab>{t.link}</Tab>
                  <Tab>{t.export}</Tab>
                  <Tab>{t.embedding}</Tab>
                </TabList>
              </HStack>
            </ModalHeader>
            <ModalBody>
              <TabPanels>
                <TabPanel>
                  <VStack spacing={3} alignItems='inherit' justify='flex-start'>
                    <Text fontSize='0.9em'>{t1.shareHelp}</Text>
                    <Form>
                      <FormItem
                        title={t.currentTimeRange}
                        size='sm'
                        alignItems={'center'}
                      >
                        <Switch
                          isChecked={enableCurrentTimeRange}
                          onChange={(e) => {
                            setEnableCurrentTimeRange(e.currentTarget.checked)
                          }}
                        />
                      </FormItem>
                      {enableCurrentTimeRange && (
                        <FormItem
                          title={
                            lang == Lang.EN ? 'Use raw time' : '使用原始时间'
                          }
                          size='sm'
                          alignItems={'center'}
                        >
                          <Switch
                            isChecked={useRawTime}
                            onChange={(e) => {
                              setUseRawTime(e.currentTarget.checked)
                            }}
                          />
                        </FormItem>
                      )}
                    </Form>
                    <HStack spacing={1} alignItems='end'>
                      <Textarea
                        fontSize='0.95em'
                        mr='1.5'
                        wordBreak='break-all'
                        p='1'
                        className='code-bg'
                        bgColor='#09090b'
                        overflow='hidden'
                        textOverflow='ellipsis'
                        value={shareUrl}
                        readOnly
                      />
                      <Button
                        size='sm'
                        leftIcon={<FaRegCopy />}
                        onClick={onCopy}
                        variant={hasCopied ? 'solid' : 'outline'}
                      >
                        {hasCopied ? t.copied : t.copy}
                      </Button>
                    </HStack>
                  </VStack>
                </TabPanel>
                <TabPanel>
                  <ExportComponent dashboard={dashboard} />
                </TabPanel>
                <TabPanel>
                  <VStack spacing={3} alignItems='inherit' justify='flex-start'>
                    <Text fontSize='0.9em'>{t1.embedHelp}</Text>
                    <Form
                      sx={{
                        '.form-item-label': {
                          width: '170px',
                        },
                      }}
                      spacing={1}
                    >
                      <FormItem
                        title={t.currentTimeRange}
                        size='sm'
                        alignItems={'center'}
                      >
                        <Switch
                          isChecked={enableCurrentTimeRange}
                          onChange={(e) => {
                            setEnableCurrentTimeRange(e.currentTarget.checked)
                          }}
                        />
                      </FormItem>
                      {enableCurrentTimeRange && (
                        <FormItem
                          title={
                            lang == Lang.EN ? 'Use raw time' : '使用原始时间'
                          }
                          size='sm'
                          alignItems={'center'}
                        >
                          <Switch
                            isChecked={useRawTime}
                            onChange={(e) => {
                              setUseRawTime(e.currentTarget.checked)
                            }}
                          />
                        </FormItem>
                      )}
                      {embeddingPanel === 0 && (
                        <FormItem
                          title={
                            lang == Lang.EN
                              ? 'Show dashboard header'
                              : '显示仪表盘顶部'
                          }
                          size='sm'
                          alignItems={'center'}
                        >
                          <Switch
                            isChecked={useToolbar}
                            onChange={(e) => {
                              setUserToolbar(e.currentTarget.checked)
                            }}
                          />
                        </FormItem>
                      )}
                      <FormItem
                        title={lang == Lang.EN ? 'Use refresh' : '启用自动刷新'}
                        size='sm'
                        alignItems={'center'}
                      >
                        <Select
                          popupMatchSelectWidth={false}
                          bordered={false}
                          value={refresh}
                          size='small'
                          onChange={(v) => setRefresh(v)}
                          options={[
                            REFRESH_OFF,
                            '5s',
                            '10s',
                            '30s',
                            '1m',
                            '5m',
                            '10m',
                          ].map((v) => ({ value: v, label: v }))}
                        />
                      </FormItem>
                      <FormItem
                        title={lang == Lang.EN ? 'Color mode' : '颜色主题'}
                        size='sm'
                        alignItems={'center'}
                      >
                        <RadionButtons
                          size='sm'
                          value={colorMode}
                          options={[
                            { label: 'Light', value: 'light' },
                            { label: 'Dark', value: 'dark' },
                          ]}
                          onChange={(v) => setColorMode(v)}
                        />
                      </FormItem>
                      <FormItem
                        title={lang == Lang.EN ? 'Embedding panel' : '嵌入图表'}
                        size='sm'
                        alignItems={'center'}
                        desc={
                          lang == Lang.EN
                            ? 'When selected, you will embed a panel instead of the dashboard'
                            : '选择后，将嵌入一个图表而不是整个仪表盘'
                        }
                      >
                        <Select
                          popupMatchSelectWidth={false}
                          bordered={false}
                          value={embeddingPanel}
                          onChange={(v) => {
                            if (v !== 0) {
                              // toolbar must not display when embedding a panel
                              setUserToolbar(false)
                            }
                            setEmbeddingPanel(v)
                          }}
                          options={concat(
                            [{ value: 0, label: 'OFF' }],
                            dashboard.data.panels.map((p) => ({
                              label: p.title,
                              value: p.id,
                            })),
                          )}
                          showSearch
                          size='small'
                          filterOption={filterPanels}
                          style={{ width: '200px' }}
                        />
                      </FormItem>
                    </Form>
                    <HStack spacing={1}>
                      <Textarea
                        fontSize='0.95em'
                        mr='1.5'
                        wordBreak='break-all'
                        p='1'
                        className='code-bg'
                        bgColor='#09090b'
                        overflow='hidden'
                        textOverflow='ellipsis'
                        value={embededUrl}
                        readOnly
                      />
                      <Button
                        size='sm'
                        leftIcon={<FaRegCopy />}
                        onClick={onEmbedCopy}
                        variant={hasEmbedCopied ? 'solid' : 'outline'}
                      >
                        {hasEmbedCopied ? t.copied : t.copy}
                      </Button>
                    </HStack>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </ModalBody>
          </Tabs>
        </ModalContent>
      </Modal>
    </>
  )
}

function ExportComponent({ dashboard }: { dashboard: Dashboard }) {
  const t = useStore(commonMsg)
  const t1 = useStore(dashboardMsg)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [downFile, setDownFile] = useState(false)
  const { onCopy, setValue, hasCopied } = useClipboard('', 5000)
  const dash = JSON.stringify(dashboard, null, 4)

  return (
    <>
      <VStack alignItems='inherit' justify='flex-start' spacing={4}>
        <Text fontSize='0.9em'>{t1.exportHelp}</Text>
        <Box>
          <HStack spacing={4}>
            <Button
              size='sm'
              variant='outline'
              colorScheme='green'
              leftIcon={<FaFileDownload />}
              isLoading={downFile}
              onClick={() => {
                setDownFile(true)
                setTimeout(() => {
                  const file = new File([dash], '', {
                    type: 'application/json',
                  })
                  saveFile(file, `${dashboard.title}-${dashboard.id}.json`)
                  setDownFile(false)
                }, 500)
              }}
            >
              {t.saveToFile}
            </Button>
            <Button
              size='sm'
              variant='outline'
              leftIcon={<FaRegEye />}
              onClick={() => {
                setValue(dash)
                onOpen()
              }}
            >
              {t.viewJson}
            </Button>
          </HStack>
        </Box>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minWidth='600px'>
          <ModalHeader paddingBottom={1}>JSON</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack alignItems='flex-start' justify='flex-start' spacing={2}>
              <Box width='100%' height='500px' className='bordered' mb='3'>
                <CodeEditor value={dash} language='json' />
              </Box>
              <Button
                onClick={onCopy}
                leftIcon={<FaRegCopy />}
                variant={hasCopied ? 'solid' : 'outline'}
              >
                {hasCopied ? t.copied : t.copy}
              </Button>
            </VStack>
            <Box h='4'></Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default DashboardShare
