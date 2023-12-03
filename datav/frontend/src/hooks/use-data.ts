// Copyright 2023 xObserve.io Team

import { useEffect, useState } from 'react'

export function useData(url) {
  const [data, setData] = useState(null)
  useEffect(() => {
    let ignore = false
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        if (!ignore) {
          setData(json)
        }
      })
    return () => {
      ignore = true
    }
  }, [url])
  return data
}
