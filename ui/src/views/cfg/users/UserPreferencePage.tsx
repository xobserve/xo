import React, { PureComponent } from 'react';
import { getBootConfig, InlineFormLabel, Button} from 'src/packages/datav-core';

import Page from 'src/views/Layouts/Page/Page';
import { getNavModel } from 'src/views/Layouts/Page/navModel';
import { Input, notification,Select, Tooltip} from 'antd';

import { getBackendSrv } from 'src/core/services/backend';
import { getState } from 'src/store/store';
import { UserState } from 'src/store/reducers/user';
import isEmail from 'validator/lib/isEmail';
import {EyeTwoTone,EyeInvisibleOutlined} from '@ant-design/icons'
import { SideMenu } from 'src/types';
import { injectIntl,FormattedMessage, IntlShape } from 'react-intl';

const {Option} = Select

interface Props {
    routeID: string;
    parentRouteID: string;
}

interface IntlProps {
    intl: IntlShape
}

interface Password {
    old: string 
    new: string 
    confirm: string
}

interface State {
    isLoaded: boolean
    user: UserState
    password: Password
    sidemenus: SideMenu[]
}

class UserPreferencePage extends PureComponent<Props & IntlProps, State> {
    constructor(props) {
        super(props)
        this.state = {
            isLoaded: false,
            user: null,
            password: null,
            sidemenus: null
        }
    }

    async componentWillMount() {
        const res = await getBackendSrv().get("/api/users/user", { id: getState().user.id })
        const res0 = await getBackendSrv().get("/api/users/user/sidemenus")
        let exist = false 
        res0.data.forEach((sm:SideMenu) => {
            if (sm.id === res.data.sidemenu) {
                exist = true
            }
        }) 
        if(!exist) {
            notification['error']({
                message: "Error",
                description:  this.props.intl.formatMessage({id: "error.sideMenuNotExist"}) ,
                duration: 10
            });
        }

        this.setState({
            ...this.state,
            isLoaded: true,
            user: res.data,
            sidemenus: res0.data
        })
    }

    onChangeUser(k, v) {
        this.setState({
            ...this.state,
            user: {
                ...this.state.user,
                [k]: v.currentTarget.value
            }
        })
    }

    async onUpdateUser() {
        if (this.state.user.email && !isEmail(this.state.user.email)) {
            notification['error']({
                message: "Error",
                description: this.props.intl.formatMessage({id: "error.emailFormat"}),
                duration: 5
            });
            return
        }

        await getBackendSrv().put("/api/users/user/info",this.state.user)
        notification['success']({
            message: "Success",
            description: this.props.intl.formatMessage({id: "info.targetUpdated"}),
            duration: 5
        });
    }

    onChangePassword(k,v) {
        this.setState({
            ...this.state,
            password: {
                ...this.state.password,
                [k] : v.currentTarget.value.trim()
            }
        })
    }
    
    async onUpdatePassword() {
        const {old,confirm} = this.state.password
        const newPW = this.state.password.new
        
        if (!old || !newPW || !confirm) {
            notification['error']({
                message: "Error",
                description: this.props.intl.formatMessage({id: "error.passwordEmpty"}),
                duration: 5
            });
            return
        }

        if (newPW != confirm) {
            notification['error']({
                message: "Error",
                description: this.props.intl.formatMessage({id: "error.passwordNotMatch"}) ,
                duration: 5
            });
            return
        }
        
        await getBackendSrv().put('/api/users/user/password',this.state.password)
        notification['success']({
            message: "Success",
            description:  this.props.intl.formatMessage({id: "info.targetUpdated"}) ,
            duration: 5
        });
        
        // this.setState({
        //     ...this.state,
        //     password: null
        // })
    }

    onChangeSideMenu(v) {
        this.setState({
            ...this.state,
            user: {
                ...this.state.user,
                sidemenu: v
            }
        })
    }

    async onUpdateUserSidemenu() {
        await getBackendSrv().put("/api/users/user/sidemenu", {menuId: this.state.user.sidemenu})
        notification['success']({
            message: "Success",
            description:  this.props.intl.formatMessage({id: "info.sideMenuUpdated"}),
            duration: 5
        });
    }

    render() {
        const { routeID, parentRouteID } = this.props
        const navModel = getNavModel(routeID, parentRouteID)
        const { isLoaded, user,sidemenus } = this.state
        return (
            <Page navModel={navModel}>
                <Page.Contents>
                    {isLoaded && <div>
                        <h3 className="page-sub-heading"><FormattedMessage id="user.information"/></h3>
                        <div className="gf-form max-width-30">
                            <InlineFormLabel><FormattedMessage id="user.name"/></InlineFormLabel>
                            <Input defaultValue={user.name} onChange={(v) => this.onChangeUser('name', v)} placeholder="enter your name or nickname" />
                        </div>

                        <div className="gf-form max-width-30">
                            <InlineFormLabel><FormattedMessage id="user.email"/></InlineFormLabel>
                            <Input defaultValue={user.email} onChange={(v) => this.onChangeUser('email', v)} placeholder="enter your email" />
                        </div>


                        <div className="gf-form-button-row">
                            <Button variant="secondary" onClick={() => this.onUpdateUser()}>
                                <FormattedMessage id="common.submit"/>
                            </Button>
                        </div>


                        <h3 className="page-sub-heading ub-mt4" ><FormattedMessage id="user.changePassword"/></h3>
                        <div className="gf-form max-width-30">
                            <InlineFormLabel><FormattedMessage id="user.oldPassword"/></InlineFormLabel>
                            <Input.Password
                                placeholder="******"
                                onBlur={(v) => this.onChangePassword('old',v)}
                                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </div>

                        <div className="gf-form max-width-30">
                            <InlineFormLabel><FormattedMessage id="user.newPassword"/></InlineFormLabel>
                            <Input.Password
                                placeholder="******"
                                onChange={(v) => this.onChangePassword('new',v)}
                                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </div>

                        <div className="gf-form max-width-30">
                            <InlineFormLabel><FormattedMessage id="user.confirmPassword"/></InlineFormLabel>
                            <Input.Password
                                placeholder="******"
                                onChange={(v) => this.onChangePassword('confirm',v)}
                                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </div>

                        <div className="gf-form-button-row">
                            <Button variant="secondary" onClick={() => this.onUpdatePassword()}>
                                <FormattedMessage id="common.submit"/>
                            </Button>
                        </div>

                        <h3 className="page-sub-heading ub-mt4"> <FormattedMessage id="common.advanceSetting"/></h3>
                        <div className="gf-form max-width-30">
                            <InlineFormLabel tooltip={<FormattedMessage id="team.sidemenuTooltip"/>}><FormattedMessage id="team.sidemenu"/></InlineFormLabel>
                            <Select
                                style={{ width: '100%' }}
                                placeholder="select a sidemenu from teams"
                                optionLabelProp="label"
                                value={user.sidemenu??1}
                                onChange={(v) => this.onChangeSideMenu(v)}
                            >
                                {
                                    sidemenus.map((sm) => {
                                        return <Option value={sm.id} label={sm.teamName} key={sm.id}>
                                            <Tooltip title={sm.desc} placement="left">
                                               <div>{sm.teamName}</div>
                                            </Tooltip>
                                        </Option>
                                    })
                                }
                            </Select>
                            <Button variant="secondary" onClick={() => this.onUpdateUserSidemenu()}>
                                <FormattedMessage id="common.update"/>
                            </Button>
                        </div>
                    </div>
                    }
                </Page.Contents>
            </Page>
        );
    }
}

export default injectIntl(UserPreferencePage)
