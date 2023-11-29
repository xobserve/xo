// Copyright 2023 xObserve.io Team

import { concat } from 'lodash'
import { ColorGenerator } from 'utils/colorGenerator'
import { barPalettes, paletteColorNameToHex } from 'utils/colors'

const idSplitter = '='
export const formatLabelId = (name, value) => {
  return name + idSplitter + value
}

export const getLabelFromId = (id) => {
  return id.split(idSplitter)
}

const logColorGenerator = new ColorGenerator(
  concat(
    // COLORS_HEX,
    barPalettes,
  ),
)
export const getLabelNameColor = (id, theme, generator?) => {
  return paletteColorNameToHex(
    (generator ?? logColorGenerator).getColorByKey(id),
    theme,
  )
}

export const isLogSeriesData = (data: any): boolean => {
  return data && data.labels && data.values
}
