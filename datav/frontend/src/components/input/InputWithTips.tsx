// Copyright 2023 xObserve.io Team

import {
  Box,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from '@chakra-ui/react'
import React from 'react'

const InputWithTips = ({
  value,
  onChange,
  onConfirm = null,
  width,
  children,
  placeholder = 'Enter....',
  variant = 'flushed',
  size = 'md',
}) => {
  const { isOpen, onToggle, onClose } = useDisclosure()
  return (
    <>
      <Input
        value={value}
        pl='2'
        onChange={(e) => onChange(e.currentTarget.value)}
        width={width}
        size={size}
        variant={variant}
        placeholder={placeholder}
        onFocus={onToggle}
        onBlur={onToggle}
        onKeyDown={(e) => {
          if (onConfirm && e.key === 'Enter') {
            onConfirm()
          }
        }}
      />
      <Popover
        returnFocusOnClose={false}
        isOpen={isOpen}
        onClose={onClose}
        placement='bottom'
        closeOnBlur={false}
        autoFocus={false}
      >
        <PopoverTrigger>
          <Box position='absolute' top='40px'></Box>
        </PopoverTrigger>
        <PopoverContent width={width}>
          <PopoverBody>{children}</PopoverBody>
        </PopoverContent>
      </Popover>
    </>
  )
}

export default InputWithTips
