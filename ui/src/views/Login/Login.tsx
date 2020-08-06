import React from 'react'
import { Form, Input, Button } from 'antd';
import { useHistory } from 'react-router-dom';


import { UserOutlined, LockOutlined } from '@ant-design/icons';

import storage from 'src/core/library/utils/localStorage'

import { isEmpty } from 'src/core/library/utils/validate'
import { setToken } from 'src/core/library/utils/auth';

import { store } from 'src/store/store';
import { updateUser } from 'src/store/reducers/user';
import { getBackendSrv, config } from 'src/packages/datav-core'

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
                    const oldPath = storage.get('lastPath')
                    if (!isEmpty(oldPath)) {
                        storage.remove('lastPath')
                        history.push(oldPath)
                    } else {
                        history.push('/dashboard')
                    }
                }, 200)
            })
    };

    return (
        <div className="datav-login">
            <div className="datav-rectangle">
                <h3>Welcome to {config.productName}</h3>
                <Form
                    name="basic"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label="Username"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                    >
                        <Input  type="password" />
                    </Form.Item>


                    <Form.Item >
                        <Button type="primary" htmlType="submit" className="ub-mt2" block>
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}




export default Login;