// Copyright (c) 2017 Uber Technologies, Inc.
//

import _get from 'lodash/get'
import memoizeOne from 'memoize-one'

import defaultConfig from './default-config'

/**
 * Merge the embedded config from the query service (if present) with the
 * default config from `../../constants/default-config`.
 */
const getConfig = memoizeOne(function getConfig() {
  return { ...defaultConfig }
})

export default getConfig

export function getConfigValue(path: string) {
  return _get(getConfig(), path)
}
