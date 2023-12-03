// Copyright (c) 2020 The Jaeger Authors.
//

import { ITableSpan } from './types'

export default function generateColor(
  tableValue: ITableSpan[],
  attribute: string,
  colorToPercent: boolean,
) {
  let color
  let colorString
  const tableValue2 = tableValue

  for (let i = 0; i < tableValue2.length; i++) {
    if (colorToPercent) {
      if (attribute === 'percent') {
        color = 236 - 166 * (tableValue2[i].percent / 100)
        colorString = `rgb(248,${color},${color})`

        tableValue2[i].colorToPercent = colorString
      } else {
        let max = 0
        // find hights value
        for (let j = 0; j < tableValue2.length; j++) {
          if (max < (tableValue2[j] as any)[attribute]) {
            max = (tableValue2[j] as any)[attribute]
          }
        }
        const onePercent = 100 / max / 100
        color = 236 - 166 * ((tableValue2[i] as any)[attribute] * onePercent)
        colorString = `rgb(248,${color},${color})`

        tableValue2[i].colorToPercent = colorString
      }
    } else if (tableValue2[i].isDetail) {
      tableValue2[i].colorToPercent = `rgb(248,248,248)`
    } else {
      tableValue2[i].colorToPercent = 'transparent'
    }
  }
  return tableValue2
}
