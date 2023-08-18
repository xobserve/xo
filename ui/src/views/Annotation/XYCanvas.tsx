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

import { css } from '@emotion/css';
import React, { useMemo } from 'react';

interface XYCanvasProps {
  top: number; // css pxls
  left: number; // css pxls
}

/**
 * Renders absolutely positioned element on top of the uPlot's plotting area (axes are not included!).
 * Useful when you want to render some overlay with canvas-independent elements on top of the plot.
 */
export const XYCanvas = ({ children, left, top }: React.PropsWithChildren<XYCanvasProps>) => {
  const className = useMemo(() => {
    return css`
      position: absolute;
      overflow: visible;
      left: ${left}px;
      top: ${top}px;
      z-index: 1;
    `;
  }, [left, top]);

  return <div className={className}>{children}</div>;
};
