// Copyright 2023 xObserve.io Team

import { useEffect, useState } from 'react'
import { requestApi } from 'utils/axios/request'
import useSWR from 'swr'
import { removeToken } from 'utils/axios/getToken'
import { Session } from 'src/types/user'

const useSession = () => {
  const [session, setSession] = useState<Session>(null)
  const { data, revalidate } = useSWR(
    '/user/session',
    () =>
      requestApi.get(`/user/session`).then((res) => {
        if (res.data == null) {
        }
        return res.data
      }),
    { dedupingInterval: 60000 },
  )

  useEffect(() => {
    setSession(data)
  }, [data])

  const useLogin = async () => {
    revalidate()
  }

  const logout = async () => {
    await requestApi.post('/logout')
    setSession(null)
    removeToken()
  }

  return { session, useLogin, logout }
}

export default useSession
