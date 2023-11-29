// Copyright 2023 xObserve.io Team

import { builtinPanelPlugins } from 'src/views/dashboard/plugins/built-in/plugins'
import { GridPos, OverrideItem, Panel } from 'types/dashboard'
import { PanelPluginComponents } from 'types/plugin'
import { isEmpty } from 'utils/validate'

export const updateGridPos = (panel: Panel, newPos: GridPos) => {
  panel.gridPos.x = newPos.x
  panel.gridPos.y = newPos.y
  panel.gridPos.w = newPos.w
  panel.gridPos.h = newPos.h
}

export const findOverrideRule = (panel: Panel, overideTarget, ruleType) => {
  const override: OverrideItem = findOverride(panel, overideTarget)
  return findRuleInOverride(override, ruleType)
}

export const findOverride = (panel: Panel, overideTarget) => {
  return panel.overrides.find((o) => o.target == overideTarget)
}

export const findRuleInOverride = (override: OverrideItem, ruleType) => {
  return override?.overrides.find((o) => o.type == ruleType)?.value
}

export const getPanelOverridesRules = (
  panelType,
  externalPanels: Record<string, PanelPluginComponents>,
): string[] => {
  const p = builtinPanelPlugins[panelType] ?? externalPanels[panelType]
  if (!p) {
    return []
  }
  const rules = p.overrideRules
  if (!isEmpty(rules)) {
    return Object.keys(rules).map((k) => rules[k])
  } else {
    return []
  }
}
