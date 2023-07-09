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


import './TimelineCollapser.css';
import { HStack, Tooltip } from '@chakra-ui/react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { AiOutlineDoubleRight, } from "react-icons/ai";

type CollapserProps = {
  onCollapseAll: () => void;
  onCollapseOne: () => void;
  onExpandOne: () => void;
  onExpandAll: () => void;
};

const TimelineCollapser = ({onExpandAll, onExpandOne, onCollapseAll, onCollapseOne}:CollapserProps) => {
    return (
      <HStack>
        <Tooltip label='Expand +1' >
          <FaChevronDown  onClick={onExpandOne}  />
        </Tooltip>
        <Tooltip label='Collapse +1' >
          <FaChevronRight  onClick={onCollapseOne}  />
        </Tooltip>
        <Tooltip label='Expand All' >
          <AiOutlineDoubleRight style={{
            transform: 'rotate(90deg)'
          }} onClick={onExpandAll}  />
        </Tooltip>
        <Tooltip label='Collapse All' >
          <AiOutlineDoubleRight   onClick={onCollapseAll} className="TimelineCollapser--btn" />
        </Tooltip>
      </HStack>
    );
}

export default TimelineCollapser;