// Copyright (c) 2017 Uber Technologies, Inc.
//

import sitePrefix from './site-prefix'

let origin
if (typeof window !== 'undefined') {
  origin = window.location.origin
}

/**
 * Generate the URL prefix from `sitePrefix` and use it for all subsequent calls
 * to `prefixUrl()`. `sitePrefix` should be an absolute URL, e.g. with an origin.
 * `pathPrefix` is just the path portion and should not have a trailing slash:
 *
 * - `"http://localhost:3000/"` to `""`
 * - `"http://localhost:3000/abc/"` to `"/abc"`
 * - `"http://localhost:3000/abc/def/"` to `"/abc/def"`
 */
// exported for tests
export function getPathPrefix(orig?: string, sitePref?: string) {
  const o = orig == null ? '' : orig.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
  const s = sitePref == null ? '' : sitePref
  const rx = new RegExp(`^${o}|/$`, 'ig')
  return s.replace(rx, '')
}

const pathPrefix = getPathPrefix(origin, sitePrefix)

/**
 * Add the path prefix to the  URL. See [site-prefix.js](../site-prefix.js) and
 * the `<base>` tag in [index.html](../../public/index.html) for details.
 *
 * @param {string} value The URL to have the prefix added to.
 * @return {string} The resultant URL.
 */
export default function prefixUrl(value?: string) {
  const s = value == null ? '' : String(value)
  return `${pathPrefix}${s}`
}
