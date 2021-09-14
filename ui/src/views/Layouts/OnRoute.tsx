import React,{useEffect} from 'react'
import { useHistory } from 'react-router-dom'
import {store} from 'src/store/store'
import { updateLocation } from 'src/store/reducers/location'
import { getUrlParams } from 'src/core/library/utils/url'
import { setHistory, getBootConfig} from 'src/packages/datav-core/src'
import { getTimeSrv } from 'src/core/services/time'
import appEvents from 'src/core/library/utils/app_events'
import { CoreEvents } from 'src/types'
import { getBackendSrv } from 'src/core/services/backend'
import { updateUser } from 'src/store/reducers/user'


const OnRoute = () =>{
    const history = useHistory()

    // set global history
    setHistory(history)
    
    // redirect root path to home url
    if (history.location.pathname === '/') {
      if (getBootConfig().common.rootUrlRedirect) {
        history.push(getBootConfig().common.rootUrlRedirect)
      } else {
        history.push('/home')
      }
    }
    
    // on page refresh
    useEffect(() => {
      if (store.getState().user.id) {
        getBackendSrv().get('/api/users/user',{id: store.getState().user.id}).then((res) => {
          store.dispatch(updateUser(res.data))
        })
      }
    },[])


    useEffect(() => {
      // is login in
      if (!store.getState().user.id) {
        history.push('/login')
      }
      
      // when browser page goes back, we need adjust time range
      if (history.action === 'POP') {
        setTimeout(() => {
          getTimeSrv().init()
          getTimeSrv().setTime(getTimeSrv().time,false)
          appEvents.emit(CoreEvents.TimeRangeUpdatedEvent)
          appEvents.emit("update-variables-from-url")
        },100)
      }
  
      store.dispatch(
        updateLocation({
          path: history.location.pathname,
          query: getUrlParams(),
          keepUrl: true,
        })
      )
  
      return () => { }
    })

    return (
        <></>
    )
}

export default OnRoute