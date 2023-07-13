import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const useRouteChanged = (fn: () => void) => {
  const location = useLocation()  
  useEffect(() => {
      fn()
      console.log('App is changing to: ', location)
  }, [location, fn])
}

export default useRouteChanged
