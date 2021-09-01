import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getNavModel } from 'src/views/Layouts/Page/navModel'
import { Team, SideMenu ,StoreState} from 'src/types';
import { getBackendSrv } from 'src/core/services/backend';
import { InlineFormLabel,IconName,LegacyForms} from 'src/packages/datav-core/src/ui'
import { Button, Input,notification, Tooltip, Tag } from 'antd';
import EmptyListCTA from 'src/views/components/EmptyListCTA/EmptyListCTA';
import MenuManage from './MenuManage/MenuManage'
import { Langs } from 'src/core/library/locale/types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, IntlShape } from 'react-intl';
import {InfoCircleOutlined} from '@ant-design/icons'
import { NavModel } from 'src/packages/datav-core/src';

const {Switch} = LegacyForms
export interface Props { 
    routeID: string;
    parentRouteID: string;
    locale: string
}

interface IntlProps {
    intl: IntlShape
}
interface State {
    team: Team
    sidemenu: SideMenu
    hasFetched: boolean
}


const emptyEnListModel = {
    title: 'There are no team scope menu for this team yet',
    buttonIcon: 'database' as IconName,
    buttonTitle: 'Add Team Menu',
    proTip: `By default, you are using global team's menu`,
    proTipLink: ''
  };

const emptyCnListModel = {
    title: '当前团队还没有自定义的侧边菜单',
    buttonIcon: 'database' as IconName,
    buttonTitle: '新建团队菜单',
    proTip: `默认情况下，用户会使用Global团队的菜单`,
    proTipLink: ''
  };


export class TeamSettingPage extends PureComponent<Props & IntlProps, State> {
    teamId;
    constructor(props) {
        super(props)
        this.state = {
            team: null,
            sidemenu:null,
            hasFetched: true
        }
        //@ts-ignore
        this.teamId = this.props.match.params['id'] 
    }

    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        const res = await getBackendSrv().get('/api/teams/team', { id: this.teamId})
        const res1 = await getBackendSrv().get(`/api/sidemenu/${this.teamId}`)
        if (res.data) {
            this.setState({
                team: res.data,
                sidemenu: res1.data,
                hasFetched: true
            })
        }
    }

    onChangeSideMenuDesc = (e) => {
        this.setState({
            ...this.state,
            sidemenu: {
                ...this.state.sidemenu,
                desc: e.currentTarget.value
            }
        })
    }

    async updateSideMenu()  {
        await getBackendSrv().put(`/api/sidemenu/${this.teamId}`,this.state.sidemenu)
        notification['success']({
            message: "Success",
            description: this.props.intl.formatMessage({id: "info.targetUpdated"}),
            duration: 5
        });
        // window.location.reload()
    }
    
    onChangeMenu(v) {
        this.setState({
            ...this.state,
            sidemenu : {
                ...this.state.sidemenu,
                data : v
            }
        })
    }
    
    async createSideMenu() {
        const sidemenu:SideMenu = {
            id: 0,
            teamId : _.toNumber(this.teamId),
            desc: 'A menu customized for team',
            data: [{
                id: 'home',
                text: 'home',
                url: '/home',
                icon: 'home-alt'
            }]
        }

        const res = await getBackendSrv().post(`/api/sidemenu/${this.teamId}`,sidemenu)
        notification['success']({
            message: "Success",
            description: this.props.intl.formatMessage({id: "info.targetUpdated"}),
            duration: 5
        });

        sidemenu.id = res.data
        this.setState({
            ...this.state,
            sidemenu: sidemenu
        })
    }

    onChangePublic(e) {
        this.setState({
            ...this.state,
            sidemenu: {
                ...this.state.sidemenu,
                isPublic: e.currentTarget.checked
            }
        })      
    }

    render() {
        const { routeID, parentRouteID } = this.props

        const { sidemenu,team,hasFetched} = this.state
        let navModel:NavModel;
        if (team) {
            navModel = _.cloneDeep(getNavModel(routeID, parentRouteID))
            const { node, main } = navModel
            node.url = node.url.replace(":id", team.id)
            main.children.forEach((n) => {
                n.url = n.url.replace(":id", team.id)
            })

            navModel.main.text = navModel.main.text + ' / ' + team.name
        } else {
            navModel = _.cloneDeep(getNavModel(routeID, parentRouteID))
        }

        let emptyList = emptyEnListModel
        if (this.props.locale === Langs.Chinese) {
            emptyList = emptyCnListModel
        }
        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                    {
                        sidemenu ?
                        <div>
                            <h3 className="page-sub-heading"><FormattedMessage id="common.basicSetting"/></h3>
                            <form name="teamDetailsForm" className="gf-form-group">
                                <div className="gf-form max-width-30">
                                    <InlineFormLabel>ID</InlineFormLabel>
                                    <Tag>{team.id}</Tag>
                                </div>
                                <div className="gf-form max-width-30">
                                    <InlineFormLabel><FormattedMessage id="common.desc"/></InlineFormLabel>
                                    <Input
                                        type="text"
                                        required
                                        value={sidemenu.desc}
                                        className="gf-form-input max-width-14"
                                        onChange={this.onChangeSideMenuDesc}
                                    />
                                </div>
                                <div className="gf-form max-width-30">
                                <InlineFormLabel className="gf-form-label"><FormattedMessage id="common.public"/><Tooltip title={<FormattedMessage id="team.isPublicTips"/>}><InfoCircleOutlined translate/></Tooltip></InlineFormLabel>
                                    <Switch label="" checked={sidemenu.isPublic} onChange={(e) => this.onChangePublic(e)}/>
                                </div>
                            </form>
                            <h3 className="page-sub-heading"><FormattedMessage id="team.menuManage"/></h3>
                            <MenuManage value={sidemenu.data} onChange={(v) => this.onChangeMenu(v)}/>
                            <div className="gf-form-button-row">
                                <Button  type="primary" onClick={() => this.updateSideMenu()}>
                                    <FormattedMessage id="common.update"/>
                                </Button>
                            </div>
                        </div> :
                        <EmptyListCTA {...emptyList}  onClick={() => this.createSideMenu()} />
                    }
                </Page.Contents>
            </Page>
        );
    }
}


export const mapStateToProps = (state: StoreState) => {
    return {
        locale: state.application.locale
    }
}


export default injectIntl(connect(mapStateToProps)(withRouter(TeamSettingPage)))
