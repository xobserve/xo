// Copyright 2023 xObserve.io Team

import { uniqueId } from 'lodash'
import React, { useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'

export interface Props {
  children: React.ReactNode
  width?: number
  height?: number
  onLoad?: () => void
  onChange?: (isInView: boolean) => void
}

export function LazyLoader({
  children,
  width,
  height,
  onLoad,
  onChange,
}: Props) {
  const idRef = useRef<string>()
  if (idRef.current == null) {
    idRef.current = uniqueId()
  }
  const id = idRef.current

  const [loaded, setLoaded] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffectOnce(() => {
    LazyLoader.addCallback(id, (entry) => {
      if (!loaded && entry.isIntersecting) {
        setLoaded(true)
        onLoad?.()
      }

      onChange?.(entry.isIntersecting)
    })

    const wrapperEl = wrapperRef.current

    if (wrapperEl) {
      LazyLoader.observer.observe(wrapperEl)
    }

    return () => {
      delete LazyLoader.callbacks[id]
      wrapperEl && LazyLoader.observer.unobserve(wrapperEl)
      if (Object.keys(LazyLoader.callbacks).length === 0) {
        LazyLoader.observer.disconnect()
      }
    }
  })

  return (
    <div id={id} ref={wrapperRef} style={{ width, height }}>
      {loaded && children}
    </div>
  )
}

LazyLoader.callbacks = {} as Record<
  string,
  (e: IntersectionObserverEntry) => void
>
LazyLoader.addCallback = (
  id: string,
  c: (e: IntersectionObserverEntry) => void,
) => (LazyLoader.callbacks[id] = c)
LazyLoader.observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      LazyLoader.callbacks[entry.target.id](entry)
    }
  },
  { rootMargin: '100px' },
)
