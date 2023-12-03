// Copyright 2023 xObserve.io Team

import {
  Box,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  Tooltip,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react'
import TimePicker, {
  getNewestTimeRange,
} from 'src/components/DatePicker/TimePicker'
import { TimeRange } from 'types/time'
import { FaRegClock } from 'react-icons/fa'
import React, { useState } from 'react'
import useBus from 'use-bus'
import { SetTimeEvent, TimeRefreshEvent } from 'src/data/bus-events'
import { subMinutes } from 'date-fns'
import { dateTimeFormat } from 'utils/datetime/formatter'
import { MobileBreakpoint, MobileVerticalBreakpoint } from 'src/data/constants'
import IconButton from 'components/button/IconButton'
import { cloneDeep } from 'lodash'

interface Props {
  id: string
  timeRange: TimeRange
  showTime?: boolean
  showRealTime?: boolean
  onChange: any
  showIcon?: boolean
}

const PanelDatePicker = ({
  id,
  timeRange,
  showTime = true,
  showRealTime = false,
  onChange,
  showIcon = false,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [value, setValue] = useState<TimeRange>(timeRange)

  const [isLargeScreen] = useMediaQuery(MobileBreakpoint)
  const [isMobileScreen] = useMediaQuery(MobileVerticalBreakpoint)

  const onTimeChange = (t: TimeRange) => {
    setValue(t)
    onChange(t)
    onClose()
  }

  useBus(
    TimeRefreshEvent,
    () => {
      refresh()
    },
    [],
  )

  useBus(
    (e) => {
      return e.type == SetTimeEvent + id
    },
    (e) => {
      const start = new Date(e.data.from * 1000)
      const end = new Date(e.data.to * 1000)
      const tr = {
        start: start,
        end: end,
        startRaw: start.toLocaleString(),
        endRaw: end.toLocaleString(),
        sub: 0,
      }

      onChange(tr)
      onTimeChange(tr)
    },
  )

  const refresh = () => {
    if (value.sub > 0) {
      const now = new Date()
      value.start = subMinutes(now, value.sub)
      value.end = now
      const v = cloneDeep(value)
      setValue(v)
      onChange(v)
    }
  }

  return (
    <>
      <Box>
        {/* <Tooltip label={`${value && dateTimeFormat(value.start)} - ${value && dateTimeFormat(value.end)}`}> */}
        <HStack
          spacing={0}
          onClick={onOpen}
          cursor='pointer'
          className='hover-text'
        >
          {showIcon && (
            <IconButton variant='ghost' _hover={{ bg: null }}>
              <FaRegClock />
            </IconButton>
          )}
          {showTime && (
            <>
              <Box>
                {!isMobileScreen && (
                  <Text
                    layerStyle='textSecondary'
                    fontSize='0.9rem'
                    fontWeight='500'
                  >
                    {value.startRaw.toString().startsWith('now')
                      ? value.startRaw
                      : dateTimeFormat(value.start)}{' '}
                    to{' '}
                    {value.endRaw.toString().startsWith('now')
                      ? value.endRaw
                      : dateTimeFormat(value.end)}
                  </Text>
                )}
                {isLargeScreen &&
                  showRealTime &&
                  value.startRaw.toString().startsWith('now') && (
                    <Text
                      layerStyle='textSecondary'
                      fontSize='0.9rem'
                      fontWeight='500'
                    >
                      {dateTimeFormat(value.start)} -{' '}
                      {dateTimeFormat(value.end)}
                    </Text>
                  )}
              </Box>
            </>
          )}
        </HStack>
        {/* </Tooltip> */}
      </Box>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        initialFocusRef={null}
        autoFocus={false}
      >
        <ModalOverlay />
        <ModalContent minW='fit-content'>
          <ModalBody>
            <TimePicker
              onClose={onClose}
              onTimeChange={onTimeChange}
              initTimeRange={timeRange}
              showCanlendar={false}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default PanelDatePicker
