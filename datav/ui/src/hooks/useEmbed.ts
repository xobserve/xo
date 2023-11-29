// Copyright 2023 xObserve.io Team

import { useSearchParam } from 'react-use'

// listening for the event of entering fullscreen
const useEmbed = () => {
  const param = useSearchParam('embed')

  return param == 'true'
}

export default useEmbed
