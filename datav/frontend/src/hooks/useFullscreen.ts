// Copyright 2023 xObserve.io Team

import { useSearchParam } from 'react-use'

// listening for the event of entering fullscreen
const useFullscreen = () => {
  const fullscreenParam = useSearchParam('fullscreen')

  return fullscreenParam == 'on'
}

export default useFullscreen
