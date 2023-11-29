// Copyright 2023 xObserve.io Team

import { NodeGraphSettings } from './types'
import { paletteColorNameToHex } from 'utils/colors'

export const getDefaultNodeLabel = (colorMode) => {
  return {
    position: 'bottom',
    style: {
      fill: colorMode == 'light' ? '#000' : '#fff',
    },
  }
}

export const getDefaultEdgeLabel = (colorMode, settings: NodeGraphSettings) => {
  return {
    autoRotate: true,
    refY: -10,
    style: {
      fill: colorMode == 'light' ? '#000' : '#fff',
      lineWidth: 5,
      opacity: settings.edge.display ? 1 : 0,
      fontSize: 9,
    },
  }
}

export const getActiveEdgeLabelCfg = (
  colorMode,
  settings: NodeGraphSettings,
) => {
  const cfg = getDefaultEdgeLabel(colorMode, settings)
  cfg.style.opacity = 1
  return cfg
}

export const getDefaultNodeStyle = (
  settings: NodeGraphSettings,
  colorMode?,
) => {
  const light = paletteColorNameToHex(
    settings.edge.highlightColor.light,
    colorMode,
  )
  const dark = paletteColorNameToHex(
    settings.edge.highlightColor.dark,
    colorMode,
  )
  return {
    selected: {
      stroke: colorMode == 'light' ? light : dark,
      shadowColor: colorMode == 'light' ? light : dark,
      lineWidth: colorMode == 'light' ? 7 : 3,
      fill: 'transparent',
    },
    active: {
      stroke: colorMode == 'light' ? light : dark,
      shadowColor: colorMode == 'light' ? light : dark,
      lineWidth: colorMode == 'light' ? 7 : 3,
      fill: 'transparent',
    },
    inactive: {
      fill: 'transparent',
    },
  }
}

export const getDefaultEdgeStyle = (
  settings: NodeGraphSettings,
  colorMode?,
) => {
  const light = paletteColorNameToHex(
    settings.edge.highlightColor.light,
    colorMode,
  )
  const dark = paletteColorNameToHex(
    settings.edge.highlightColor.dark,
    colorMode,
  )
  return {
    selected: {
      stroke: colorMode == 'light' ? light : dark,
      shadowColor: colorMode == 'light' ? light : dark,
      lineWidth: 1,
    },
    active: {
      stroke: colorMode == 'light' ? light : dark,
      shadowColor: colorMode == 'light' ? light : dark,
      lineWidth: 1,
    },
    inactive: {
      stroke: '#222',
      shadowColor: '#ccc',
      lineWidth: 1,
      opacity: 0,
    },
  }
}
