// Copyright (c) 2018 Uber Technologies, Inc.
//

// Per the resolution of https://github.com/jaegertracing/jaeger-ui/issues/42,
// package.json#homepage is set to "." and the document MUST have a <base>
// element to define a usable base URL.

let sitePrefix
if (typeof window !== 'undefined') {
  sitePrefix = `${window.location.origin}/`
}

export default sitePrefix
