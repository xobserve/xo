// Copyright 2023 xObserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useState, useCallback, useEffect, useRef, useImperativeHandle } from 'react'
import { debounce, observerDomResize } from './utils'

export default function useAutoResize(ref) {
  const [state, setState] = useState({ width: 0, height: 0 })

  const domRef = useRef(null)

  const setWH = useCallback(() => {
    const { clientWidth, clientHeight } = domRef.current || { clientWidth: 0, clientHeight: 0 }

    setState({ width: clientWidth, height: clientHeight })

    if (!domRef.current) {
      console.warn('xobserve: Failed to get dom node, component rendering may be abnormal!')
    } else if (!clientWidth || !clientHeight) {
      console.warn('xobserve: Component width or height is 0px, rendering abnormality may occur!')
    }
  }, [])

  useImperativeHandle(ref, () => ({ setWH }), [])

  useEffect(() => {
    const debounceSetWHFun = debounce(setWH, 100)

    debounceSetWHFun()

    const domObserver = observerDomResize(domRef.current, debounceSetWHFun)

    window.addEventListener('resize', debounceSetWHFun)

    return () => {
      window.removeEventListener('resize', debounceSetWHFun)

      if (!domObserver) {
        return
      }

      domObserver.disconnect()
      domObserver.takeRecords()
    }
  }, [])

  return { ...state, domRef, setWH }
}