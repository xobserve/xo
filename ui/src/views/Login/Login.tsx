import React from 'react'
import { Form, Input, Button } from 'antd';
import { useHistory } from 'react-router-dom';



import localStore from 'src/core/library/utils/localStore'

import { isEmpty } from 'src/core/library/utils/validate'
import { setToken } from 'src/core/library/utils/auth';

import { store } from 'src/store/store';
import { updateUser } from 'src/store/reducers/user';
import { getBackendSrv, config,localeData,currentLang} from 'src/packages/datav-core'

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
        <div className="datav-login">
            <div className="datav-rectangle">
                <h3>{localeData[currentLang]['user.loginTitle'] + config.productName}</h3>
                <Form
                    name="basic"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        label={localeData[currentLang]['user.username']}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={localeData[currentLang]['user.password']}
                    >
                        <Input  type="password" />
                    </Form.Item>


                    <Form.Item >
                        <Button type="primary" htmlType="submit" className="ub-mt2" block>
                            {localeData[currentLang]['common.login']}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
}




export default Login;