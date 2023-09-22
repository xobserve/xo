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

export const calculateTooltipPosition = (
    xPos = 0,
    yPos = 0,
    tooltipWidth = 0,
    tooltipHeight = 0,
    xOffset = 0,
    yOffset = 0,
    windowWidth = 0,
    windowHeight = 0
  ) => {
    let x = xPos;
    let y = yPos;
  
    const overflowRight = Math.max(xPos + xOffset + tooltipWidth - (windowWidth - xOffset), 0);
    const overflowLeft = Math.abs(Math.min(xPos - xOffset - tooltipWidth - xOffset, 0));
    const wouldOverflowRight = overflowRight > 0;
    const wouldOverflowLeft = overflowLeft > 0;
  
    const overflowBelow = Math.max(yPos + yOffset + tooltipHeight - (windowHeight - yOffset), 0);
    const overflowAbove = Math.abs(Math.min(yPos - yOffset - tooltipHeight - yOffset, 0));
    const wouldOverflowBelow = overflowBelow > 0;
    const wouldOverflowAbove = overflowAbove > 0;
  
    if (wouldOverflowRight && wouldOverflowLeft) {
      x = overflowRight > overflowLeft ? xOffset : windowWidth - xOffset - tooltipWidth;
    } else if (wouldOverflowRight) {
      x = xPos - xOffset - tooltipWidth;
    } else {
      x = xPos + xOffset;
    }
  
    if (wouldOverflowBelow && wouldOverflowAbove) {
      y = overflowBelow > overflowAbove ? yOffset : windowHeight - yOffset - tooltipHeight;
    } else if (wouldOverflowBelow) {
      y = yPos - yOffset - tooltipHeight;
    } else {
      y = yPos + yOffset;
    }
    return { x, y };
  };
  