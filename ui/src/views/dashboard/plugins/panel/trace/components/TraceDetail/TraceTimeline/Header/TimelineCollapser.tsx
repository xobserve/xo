// Copyright (c) 2017 Uber Technologies, Inc.
//
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

import React from 'react';

import { Box, HStack, Tooltip } from '@chakra-ui/react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { AiOutlineDoubleRight, AiOutlineDown, AiOutlineRight, } from "react-icons/ai";

type CollapserProps = {
  onCollapseAll: () => void;
  onCollapseOne: () => void;
  onExpandOne: () => void;
  onExpandAll: () => void;
};

const TimelineCollapser = ({ onExpandAll, onExpandOne, onCollapseAll, onCollapseOne }: CollapserProps) => {
  return (
    <HStack spacing='6px'>
      <Tooltip label='Expand +1' >
        <Box >
          <AiOutlineDown  cursor="pointer" onClick={onExpandOne} />
        </Box>
      </Tooltip>
      <Tooltip label='Collapse +1' >
        <Box>
          <AiOutlineRight cursor="pointer" onClick={onCollapseOne} />
        </Box>
      </Tooltip>
      <Tooltip label='Expand All' >
        <Box>
          <AiOutlineDoubleRight  cursor="pointer" style={{
            transform: 'rotate(90deg)'
          }} onClick={onExpandAll} />
        </Box>
      </Tooltip>
      <Tooltip label='Collapse All' >
        <Box>
          <AiOutlineDoubleRight cursor="pointer" onClick={onCollapseAll} className="TimelineCollapser--btn" />
        </Box>
      </Tooltip>
    </HStack>
  );
}

export default TimelineCollapser;