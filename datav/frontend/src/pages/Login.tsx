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

import React from 'react'
import { useCallback } from 'react'
import type { Engine } from 'tsparticles-engine'
import Particles from 'react-particles'
import { loadFull } from 'tsparticles'
import useSession from 'hooks/use-session'

import { requestApi } from 'utils/axios/request'
import storage from 'utils/localStorage'
import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useColorModeValue,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react'
import { saveToken } from 'utils/axios/getToken'
import { useStore } from '@nanostores/react'
import { commonMsg } from 'src/i18n/locales/en'
import { FaGithub } from 'react-icons/fa'
import { $config } from 'src/data/configs/config'
import { MobileBreakpoint } from 'src/data/constants'
import { Session } from 'types/user'
import { isAdmin } from 'types/role'

// login page
function Login() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const config = useStore($config)
  const t = useStore(commonMsg)
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine)
  }, [])

  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const { useLogin } = useSession()

  const onFinish = async () => {
    const res = await requestApi.post('/login', {
      username: username,
      password: password,
    })
    const sess: Session = res.data
    saveToken(sess.token)
    useLogin()
    if (isAdmin(sess.user.role)) {
      onOpen()
    } else {
      visitWebsite()
    }
  }

  const visitWebsite = () => {
    setTimeout(() => {
      const oldPage = storage.get('current-page')
      if (oldPage) {
        storage.remove('current-page')
        window.location.href = oldPage
      } else {
        window.location.href = `/`
      }
    }, 200)
  }

  const visitAdmin = () => {
    setTimeout(() => {
      window.location.href = '/admin/tenants'
    }, 200)
  }

  const loginGithub = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${config.githubOAuthToken}`
  }

  const [isLargeScreen] = useMediaQuery(MobileBreakpoint)

  return (
    <>
      {/* @ts-ignore */}
      <Particles
        id='tsparticles'
        init={particlesInit}
        style={{ position: 'absolute' }}
        options={{
          fpsLimit: 120,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: 'push',
              },
              onHover: {
                enable: true,
                mode: 'repulse',
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: '#ffffff',
            },
            links: {
              color: '#ffffff',
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: 'none',
              enable: true,
              outModes: {
                default: 'bounce',
              },
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 1800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: 'circle',
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
      />

      <Box
        className='xobserve-login'
        width='100vw'
        height='100vh'
        display='flex'
        justifyContent='center'
        alignItems='center'
        background="url('/login-bg.png')"
        backgroundSize='cover'
        backgroundPosition='center'
        backgroundRepeat='no-repeat'
        backgroundColor='#33a2e5'
      >
        <HStack
          width='900px'
          borderRadius='6px'
          boxShadow='-1px 1px 10px rgba(0, 0, 0, .4)'
          marginTop='-30px'
        >
          <Box
            className='login-left'
            width={isLargeScreen ? '50%' : '30%'}
            display='flex'
            justifyContent='center'
            alignItems='center'
            flexDir='column'
          >
            <Image
              src='/logo.svg'
              className='rotate-image'
              alt=''
              height={isLargeScreen ? '160px' : '80px'}
              width={isLargeScreen ? '160px' : '80px'}
              marginLeft='-10px'
            />
            <Box
              fontSize='26px'
              color='white'
              fontWeight='bold'
              marginTop='-25px'
            >
              xObserve
            </Box>
          </Box>
          <Box
            textAlign='center'
            width={isLargeScreen ? '50%' : '70%'}
            backgroundColor={useColorModeValue(
              'hsla(0, 0%, 100%, 0.2)',
              'hsla(0, 0%, 100%, 0.2)',
            )}
            p='12'
          >
            <Heading size='lg' color={'white'}>
              Welcome
            </Heading>
            <Input
              borderWidth={0}
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              placeholder={
                window.location.href.indexOf('play.xObserve.io') >= 0
                  ? 'guest'
                  : 'username'
              }
              mt='10'
            />
            <Input
              borderWidth={0}
              value={password}
              type='password'
              onChange={(e) => setPassword(e.currentTarget.value)}
              placeholder={
                window.location.href.indexOf('play.xObserve.io') >= 0
                  ? 'guest'
                  : 'password'
              }
              mt='6'
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onFinish()
                }
              }}
            />
            <Button
              colorScheme='twitter'
              mt='10'
              width='100%'
              _hover={{ background: null }}
              onClick={onFinish}
            >
              {t.login}
            </Button>
            {config.enableGithubLogin && (
              <Button
                colorScheme='gray'
                width='100%'
                mt='2'
                leftIcon={<FaGithub />}
                onClick={loginGithub}
              >
                Sign in with Github
              </Button>
            )}
          </Box>
        </HStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent top='20%'>
          <ModalBody py='8'>
            <Button
              colorScheme='twitter'
              width='100%'
              _hover={{ background: null }}
              onClick={visitWebsite}
            >
              Website page
            </Button>
            <Button colorScheme='gray' width='100%' mt='3' onClick={visitAdmin}>
              Admin page
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default Login
