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
import React from 'react'
import { useCallback } from "react";
import type { Container, Engine } from "tsparticles-engine";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import useSession from "hooks/use-session"


import { requestApi } from 'utils/axios/request';
import storage from 'utils/localStorage';
import { Box, Button, Heading, HStack, Image, Input } from '@chakra-ui/react';
import { saveToken } from 'utils/axios/getToken';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@nanostores/react';
import { commonMsg } from 'src/i18n/locales/en';

// login page
function Login() {
    const t = useStore(commonMsg)
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);

    const navigate = useNavigate()
    const [username, setUsername] = React.useState('')
    const [password, setPassword] = React.useState('')
    const { useLogin } = useSession()
    const onFinish = async () => {
        const res = await requestApi.post(
            '/login',
            {
                username: username,
                password: password
            })
        saveToken(res.data.token)
        useLogin()
        setTimeout(() => {
            const oldPage = storage.get('current-page')
            if (oldPage) {
                storage.remove('current-page')
                navigate(oldPage + "?test=a")
            } else {
                navigate('/')
            }
        }, 200)
    };

    return (
        <>
            {/* @ts-ignore */}
            <Particles
                id="tsparticles"
                init={particlesInit}
                style={{ position: 'absolute' }}
                options={{
                    fpsLimit: 120,
                    interactivity: {
                        events: {
                            onClick: {
                                enable: true,
                                mode: "push",
                            },
                            onHover: {
                                enable: true,
                                mode: "repulse",
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
                            value: "#ffffff",
                        },
                        links: {
                            color: "#ffffff",
                            distance: 150,
                            enable: true,
                            opacity: 0.5,
                            width: 1,
                        },
                        collisions: {
                            enable: true,
                        },
                        move: {
                            direction: "none",
                            enable: true,
                            outModes: {
                                default: "bounce",
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
                            type: "circle",
                        },
                        size: {
                            value: { min: 1, max: 5 },
                        },
                    },
                    detectRetina: true,
                }}
                />

            <Box className="datav-login" width="100vw" height="100vh" display="flex" justifyContent="center" alignItems="center" background="url('/login-bg.png')" backgroundSize="cover" backgroundPosition="center" backgroundRepeat="no-repeat" backgroundColor="#33a2e5">
                <HStack width="900px" borderRadius="6px" boxShadow="-4px 5px 10px rgba(0, 0, 0, .4)" marginTop="-30px">
                    <Box className="login-left" width="50%" display="flex" justifyContent="center" alignItems="center" flexDir="column">
                        <Image src="/logo.png" alt="" height="160px" width="160px" marginLeft="-10px" />
                        <Box fontSize="26px" color="white" fontWeight="bold">Datav</Box>
                    </Box>
                    <Box textAlign="center" width="50%" backgroundColor={"hsla(0, 0%, 100%, .3)"} p="12">
                        <Heading size="lg" color={"white"}>Welcome</Heading>
                        <Input value={username} onChange={e => setUsername(e.currentTarget.value)} placeholder='username' mt="10" />
                        <Input value={password} type="password" onChange={e => setPassword(e.currentTarget.value)} placeholder='password' mt="6" onKeyPress={e=> {
        if (e.key === 'Enter') {
           onFinish()
        }
     }} />
                        <Button colorScheme="twitter" mt="10" width="100%" _hover={{ background: null }} onClick={onFinish}>{t.login}</Button>
                    </Box>
                </HStack>
            </Box>
        </>
    );
}




export default Login; 