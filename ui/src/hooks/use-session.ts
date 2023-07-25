// Copyright 2023 Datav.io Team
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

import { useEffect, useState } from "react"
import { requestApi } from "utils/axios/request"
import useSWR from 'swr'
import { removeToken } from "utils/axios/getToken"
import { Session } from "src/types/user"

const useSession = () => {
  const [session,setSession] = useState<Session>(null)
  const { data, revalidate } = useSWR(
      '/user/session', 
      () =>
        requestApi.get(`/user/session`).then(res => {
          if (res.data == null) {
            
          }
          return res.data
        }),
      {dedupingInterval: 60000}
  )
  
  useEffect(() => {
    setSession(data)
  },[data])
  
  const useLogin = async () => {
      revalidate()
  }

  const logout = async () => {
    await requestApi.post("/logout")
    setSession(null)
    removeToken()
  }

  return { session,useLogin,logout}
}


export default useSession