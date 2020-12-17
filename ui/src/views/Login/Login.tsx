import React from 'react'
import { Form, Input, Button, Row, Col } from 'antd';
import { useHistory } from 'react-router-dom';
import Particles from 'react-particles-js';

import localStore from 'src/core/library/utils/localStore'

import { isEmpty } from 'src/core/library/utils/validate'
import { setToken } from 'src/core/library/utils/auth';

import { store } from 'src/store/store';
import { updateUser } from 'src/store/reducers/user';
import { getBackendSrv, localeData, currentLang,getBootConfig} from 'src/packages/datav-core/src'

import './Login.less'

function Login() {
    const history = useHistory()

    const onFinish = (values: any) => {
        getBackendSrv().post(
            '/api/login',
            {
                username: values.username,
                password: values.password
            }).then(res => {
                setToken(res.data.token)
                store.dispatch(updateUser(res.data.user))
                setTimeout(() => {
                    const oldPath = localStore.get('lastPath')
                    if (!isEmpty(oldPath)) {
                        localStore.delete('lastPath')
                        history.push(oldPath)
                    } else {
                        history.push('/dashboard')
                    }
                }, 200)
            })
    };

    return (
        <>
            <Particles
                className="login-particles"
                style={{ position: 'absolute' }}
                params={{
                    "particles": {
                        "number": {
                            "value": 80
                        },
                        "size": {
                            "value": 3
                        }
                    },
                    "interactivity": {
                        "events": {
                            "onhover": {
                                "enable": true,
                                "mode": "repulse"
                            }
                        }
                    }
                }} />
            <div className="datav-login">
                <Row className="datav-rectangle">
                    <Col span="12" className="login-left">
                        <div><img src="/img/logo.png" className="logo"/></div>
                        <div className="content">{getBootConfig().common.appName.toUpperCase()}</div>
                    </Col>
                    <Col span="12" className="login-right">
                        <h2 className="login-title">{localeData[currentLang]['user.loginTitle']}</h2>
                        <Form
                            name="basic"
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            layout="vertical"
                        >
                            <Form.Item
                                name="username"
                                label={null}
                            >
                                <Input placeholder={localeData[currentLang]['user.username']} size="large"/>
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label={null}
                            >
                                <Input placeholder={localeData[currentLang]['user.password']} type="password"  size="large"/>
                            </Form.Item>


                            <Form.Item >
                                <Button type="primary" htmlType="submit" className="ub-mt2 login-button" size="large" block>
                                    {localeData[currentLang]['common.login']}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </div>
        </>
    );
}




export default Login;