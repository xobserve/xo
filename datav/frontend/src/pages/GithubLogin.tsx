import React, { useEffect, useState } from 'react'
import { saveToken } from 'utils/axios/getToken'
import { requestApi } from 'utils/axios/request'
import storage from 'utils/localStorage'
import useSession from 'hooks/use-session'
import { useNavigate } from 'react-router-dom'
import { useSearchParam } from 'react-use'
import { $config } from 'src/data/configs/config'

const GithubLogin = () => {
  const { session, useLogin } = useSession()
  const navigate = useNavigate()
  const code = useSearchParam('code')

  useEffect(() => {
    if (code) {
      loginByGithub(code).catch((err) => {
        console.log('login github error：', err)
        navigate('/login')
      })
    }
  }, [code])

  const loginByGithub = async (code) => {
    const res = await requestApi.post(`/login/github`, { code })
    saveToken(res.data.token)
    useLogin()
    setTimeout(() => {
      const oldPage = storage.get('current-page')
      if (oldPage) {
        storage.remove('current-page')
        location.href = oldPage
      } else {
        const sidemenu = $config.get().sidemenu
        if (sidemenu && sidemenu.length > 0) {
          window.location.href =
            `/${res.data.user.currentTeam}` + sidemenu[0].url
        } else {
          window.location.href = `/${res.data.user.currentTeam}/home`
        }
      }
    }, 200)
  }
  return (
    <div id='first-page-loading'>
      <div>
        <img className='svgLoader' src='/logo.png' width='60px' height='60px' />
      </div>
      <div>Wait for github to response...</div>
    </div>
  )
}

export default GithubLogin
