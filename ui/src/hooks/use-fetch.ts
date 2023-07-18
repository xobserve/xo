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

import { AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import { createStandaloneToast } from "@chakra-ui/react"
const {toast} = createStandaloneToast()

/**
 * 同构渲染的数据请求方法
 * 用法参考：https://saber2pr.top/#/blog/Nextjs服务端渲染/ssr项目架构注意与优化
 * @param request axios请求方法
 * @param initData 初始占位数据, 默认null
 * @param autoLoad 是否自动请求一次, 默认true
 */
export const useFetch = <T>(
  request: () => Promise<AxiosResponse<T>>,
  initData: T = null,
  autoLoad = true
): [T, boolean, () => Promise<void>] => {
  const [result, setResult] = useState<T>(initData)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const apiRes = await request()
      setResult(apiRes.data)
    } catch (error) {
      console.log(error)
      toast({
        title: "An error occurred.",
        description: "获取数据失败",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    autoLoad && fetchData()
  }, [autoLoad])

  return [result, loading, fetchData]
}
