// Copyright 2023 Datav.io Team
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
import { Box } from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';

export interface Props {
  /**
   *  Callback to trigger when clicking outside of current element occurs.
   */
  onClick: () => void;
  /**
   *  Runs the 'onClick' function when pressing a key outside of the current element. Defaults to true.
   */
  includeButtonPress?: boolean;
  /** Object to attach the click event listener to. */
//   parent?: Window | Document;
  /**
   * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener. Defaults to false.
   */
  useCapture?: boolean;
  children?:any
}


const ClickOutsideWrapper = ({onClick,includeButtonPress=true,useCapture=false,children} : Props) => {
    const myRef = useRef();
    const onOutsideClick = (event: any) => {
        const domNode = myRef.current;
        //@ts-ignore
        if (!domNode || !domNode.contains(event.target)) {
          onClick();
        }
      };

    useEffect(() => {
        const parent = window
        parent.addEventListener('click', onOutsideClick, useCapture);
        if (includeButtonPress) {
          // Use keyup since keydown already has an event listener on window
          parent.addEventListener('keyup', onOutsideClick, useCapture);
        }

        return () => {
            parent.removeEventListener('click', onOutsideClick, useCapture);
            if (includeButtonPress) {
              parent.removeEventListener('keyup', onOutsideClick, useCapture);
            }
        }
    },[])

    return (<Box ref={myRef}>{children}</Box>)
}

export default ClickOutsideWrapper