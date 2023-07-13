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