// Copyright (c) 2023 The Jaeger Authors
//

import { getConfigValue } from '../config/get-config'

export function getTargetEmptyOrBlank() {
  return getConfigValue('forbidNewPage') ? '' : '_blank'
}

export function getTargetBlankOrTop() {
  return getConfigValue('forbidNewPage') ? '_top' : '_blank'
}
