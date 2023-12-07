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
