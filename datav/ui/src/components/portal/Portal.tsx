// Copyright 2023 xObserve.io Team
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
import { useTheme } from '@chakra-ui/react';
import React, { PropsWithChildren, useLayoutEffect, useRef } from 'react';
import ReactDOM from 'react-dom';


interface Props {
  className?: string;
  root?: HTMLElement;
  forwardedRef?: any;
}

export function Portal(props: PropsWithChildren<Props>) {
  const { children, className, root: portalRoot = document.body, forwardedRef } = props;
  const theme = useTheme()
  const node = useRef<HTMLDivElement | null>(null);
  if (!node.current) {
    node.current = document.createElement('div');
    if (className) {
      node.current.className = className;
    }
    node.current.style.position = 'absolute';
    node.current.style.zIndex = theme.zIndices.popover.toString();
  }

  useLayoutEffect(() => {
    if (node.current) {
      portalRoot.appendChild(node.current);
    }
    return () => {
      if (node.current) {
        portalRoot.removeChild(node.current);
      }
    };
  }, [portalRoot]);

  return ReactDOM.createPortal(<div ref={forwardedRef}>{children}</div>, node.current);
}

export const RefForwardingPortal = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  return <Portal {...props} forwardedRef={ref} />;
});
RefForwardingPortal.displayName = 'RefForwardingPortal';
