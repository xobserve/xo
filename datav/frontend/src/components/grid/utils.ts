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

/**
 * This function will calculate how many squares we can fit inside a rectangle.
 * Please have a look at this post for more details about the implementation:
 * https://math.stackexchange.com/questions/466198/algorithm-to-get-the-maximum-size-of-n-squares-that-fit-into-a-rectangle-with-a
 *
 * @param parentWidth width of the parent container
 * @param parentHeight height of the parent container
 * @param numberOfChildren number of children that should fit in the parent container
 */
export const calculateGridDimensions = (
  parentWidth: number,
  parentHeight: number,
  itemSpacing: number,
  numberOfChildren: number,
) => {
  const vertical = calculateSizeOfChild(
    parentWidth,
    parentHeight,
    numberOfChildren,
  )
  const horizontal = calculateSizeOfChild(
    parentHeight,
    parentWidth,
    numberOfChildren,
  )
  const square = Math.max(vertical, horizontal)
  let xCount = Math.floor(parentWidth / square)
  let yCount = Math.ceil(numberOfChildren / xCount)

  // after yCount update xCount to make split between rows more even
  xCount = Math.ceil(numberOfChildren / yCount)

  const itemsOnLastRow = xCount - (xCount * yCount - numberOfChildren)
  const widthOnLastRow =
    parentWidth / itemsOnLastRow - itemSpacing + itemSpacing / itemsOnLastRow

  return {
    width: parentWidth / xCount - itemSpacing + itemSpacing / xCount,
    height: parentHeight / yCount - itemSpacing + itemSpacing / yCount,
    widthOnLastRow,
    xCount,
    yCount,
  }
}

function calculateSizeOfChild(
  parentWidth: number,
  parentHeight: number,
  numberOfChildren: number,
): number {
  const parts = Math.ceil(
    Math.sqrt((numberOfChildren * parentWidth) / parentHeight),
  )

  if (
    Math.floor((parts * parentHeight) / parentWidth) * parts <
    numberOfChildren
  ) {
    return parentHeight / Math.ceil((parts * parentHeight) / parentWidth)
  }

  return parentWidth / parts
}
