// Copyright 2023 xobserve.io Team
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

import {
  Box,
  Button,
  Heading,
  Input,
  Select,
  useMediaQuery,
  useTheme,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { useStore } from '@nanostores/react'
import FormItem from 'src/components/form/Item'
import useSession from 'hooks/use-session'
import Page from 'layouts/page/Page'
import React, { useEffect, useState } from 'react'
import { FaUserAlt } from 'react-icons/fa'
import { useParams } from 'react-router-dom'
import { MobileVerticalBreakpoint } from 'src/data/constants'
import { accountSettingMsg, commonMsg } from 'src/i18n/locales/en'
import { requestApi } from 'utils/axios/request'
import { isEmpty } from 'utils/validate'
import isEmail from 'validator/lib/isEmail'
import customColors from 'theme/colors'
import { getColorThemeValues } from 'utils/theme'
import { EditorNumberItem } from 'components/editor/EditorItem'
import storage from 'utils/localStorage'
import { UserDataStorageKey } from 'src/data/storage-keys'
import { getAccountLinks } from './links'
import { navigateTo } from 'utils/url'

const AccountSetting = () => {
  const t = useStore(commonMsg)
  const t1 = useStore(accountSettingMsg)

  const theme = useTheme()
  const themeColors = getColorThemeValues(theme, ['transparent'])
  const toast = useToast()
  const { session, logout } = useSession()
  const [oldpw, setOldpw] = useState('')
  const [newpw, setNewpw] = useState('')
  const [confirmpw, setConfirmpw] = useState('')

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [themeColor, setThemeColor] = useState('')
  const [themeFontsize, setThemeFontsize] = useState(null)

  const teamId = useParams().teamId
  const accountLinks = getAccountLinks(teamId)

  useEffect(() => {
    if (session) {
      setEmail(session.user.email)
      setName(session.user.name)
      setThemeColor(session.user.data?.themeColor ?? customColors.defaultTheme)
      setThemeFontsize(
        session.user.data?.themeFontsize ?? customColors.baseFontSize,
      )
    }
  }, [session])

  const updateAccount = async () => {
    if (!isEmpty(email) && !isEmail(email)) {
      toast({
        description: 'email format is incorrect',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      })
      return
    }

    // if (!name) {
    //     toast({
    //         description: "name cannot be empty",
    //         status: "warning",
    //         duration: 2000,
    //         isClosable: true,
    //     });
    //     return
    // }

    await requestApi.post('/account/info', { id: session.user.id, email, name })
    toast({
      description: 'account updated!',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  const updatePassword = async () => {
    // if (!oldpw) {
    //     toast({
    //         description: "old password cannot be empty",
    //         status: "warning",
    //         duration: 2000,
    //         isClosable: true,
    //     });
    //     return
    // }

    if (newpw.length < 5 || confirmpw.length < 5) {
      toast({
        description: 'new password must be at least 6 characters long',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      })
      return
    }

    if (newpw !== confirmpw) {
      toast({
        description: 'new passwords do not match',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      })
      return
    }

    await requestApi.post('/account/password', { newpw, oldpw, confirmpw })
    toast({
      description: 'password updated!',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })

    logout()
    navigateTo('/login')
  }

  const onThemeColorChange = async (v) => {
    if (session?.user) {
      setThemeColor(v)
      const userData = {
        ...session.user.data,
        themeColor: v,
      }
      onUserDataChange(userData)
    }
  }

  const onThemeFontsizeChange = async (v) => {
    if (session?.user) {
      setThemeFontsize(v)
      const userData = {
        ...session.user.data,
        themeFontsize: v,
      }
      onUserDataChange(userData)
    }
  }

  const onUserDataChange = async (userData) => {
    await requestApi.post(`/account/updateData`, userData)
    toast({
      description: 'Updated! Reloading...',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
    storage.set(UserDataStorageKey, userData)
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }
  const [isMobileScreen] = useMediaQuery(MobileVerticalBreakpoint)
  return (
    <Page
      title={
        isMobileScreen
          ? t1.navTitle
          : `${t1.navTitle} - ${session?.user.username}`
      }
      subTitle={t1.subTitle}
      icon={<FaUserAlt />}
      tabs={accountLinks}
    >
      <Box alignItems='left' maxW='600px'>
        <VStack alignItems='left' spacing={4}>
          <Box mb='2' textStyle='subTitle'>
            {t.basicSetting}
          </Box>
          <FormItem title={t.userName} labelWidth='200px'>
            <Input value={session?.user.username} disabled />
          </FormItem>
          <FormItem title={t.nickname} labelWidth='200px'>
            <Input
              placeholder='give yourself a nick name'
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
          </FormItem>
          <FormItem title={t.email} labelWidth='200px'>
            <Input
              placeholder='enter a valid email'
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value.trim())}
            />
          </FormItem>
          <Button width='fit-content' onClick={updateAccount}>
            {t.submit}
          </Button>
        </VStack>

        <VStack alignItems='left' mt='8' spacing={3}>
          <Box mb='2' textStyle='subTitle'>
            {t1.changePassword}
          </Box>
          <FormItem title={t1.oldPassword} labelWidth='200px'>
            <Input
              placeholder='******'
              value={oldpw}
              onChange={(e) => setOldpw(e.currentTarget.value.trim())}
            />
          </FormItem>
          <FormItem title={t1.newPassword} labelWidth='200px'>
            <Input
              placeholder='******'
              value={newpw}
              onChange={(e) => setNewpw(e.currentTarget.value.trim())}
            />
          </FormItem>
          <FormItem title={t1.confirmPassword} labelWidth='200px'>
            <Input
              placeholder='******'
              value={confirmpw}
              onChange={(e) => setConfirmpw(e.currentTarget.value.trim())}
            />
          </FormItem>
          <Button width='fit-content' onClick={updatePassword}>
            {t.submit}
          </Button>
        </VStack>

        <VStack alignItems='left' mt='8' spacing={3}>
          <Box mb='2' textStyle='subTitle'>
            Theme
          </Box>
          <FormItem title='Theme color' labelWidth='200px'>
            <Select
              value={themeColor}
              onChange={(e) => onThemeColorChange(e.currentTarget.value)}
            >
              {themeColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </Select>
          </FormItem>
          <FormItem title='Font size' labelWidth='200px'>
            <EditorNumberItem
              key={themeFontsize}
              min={8}
              max={25}
              step={1}
              value={themeFontsize}
              onChange={(v) => onThemeFontsizeChange(v)}
            />
          </FormItem>
        </VStack>
      </Box>
    </Page>
  )
}

export default AccountSetting
