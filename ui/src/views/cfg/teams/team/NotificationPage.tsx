import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getBackendSrv, LinkButton, Button, HorizontalGroup,currentLang, localeData,config } from 'src/packages/datav-core/src';
import { getNavModel } from 'src/views/Layouts/Page/navModel'
import { AlertNotification, CoreEvents, Team } from 'src/types';
import EmptyListCTA from '../../../components/EmptyListCTA/EmptyListCTA';
import appEvents from 'src/core/library/utils/app_events';
import { Langs } from 'src/core/library/locale/types';
import {Modal, notification} from 'antd'
import {NotificationEdit} from './NotificationEdit'
import { FormattedMessage } from 'react-intl';

export interface Props {
    routeID: string;
    parentRouteID: string;
}

interface State {
    hasFetched: boolean
    notifications: AlertNotification[]
    addChannelVisible: boolean
    tempNotification: AlertNotification
    team: Team
    testLoading: boolean
}


const defaultNotification = {
    name: '',
    type: 'email',
    isDefault: false,
    sendReminder: false,
    disableResolveMessage: false,
    uploadImage: false,
    settings: {},
}

export class NotificationPage extends PureComponent<Props, State> {
     emptyTips =  currentLang=== Langs.English ?
        <EmptyListCTA
            title="There are no notification channels defined yet"
            buttonIcon="channel-add"
            onClick={() => this.onAddChannel()}
            buttonTitle={localeData[currentLang]['alerting.addChannel']}
            proTipLink={`${config.officialWebsite}/docs/alerting/notifications/`}
            proTipLinkTitle={localeData[currentLang]['common.learnMore']}
            proTipTarget="_blank"
        /> :
        <EmptyListCTA
            title="当前尚没创建任何通知通道"
            buttonIcon="channel-add"
            onClick={() => this.onAddChannel()}
            buttonTitle={localeData[currentLang]['alerting.addChannel']}
            proTip="你还能在通知消息中添加图表."
            proTipLink={`${config.officialWebsite}/docs/alerting/notifications`}
            proTipLinkTitle={localeData[currentLang]['common.learnMore']}
            proTipTarget="_blank"
        /> 
    constructor(props) {
        super(props)
        this.state = {
            hasFetched: false,
            notifications: [],
            addChannelVisible: false,
            tempNotification: null,
            team: null,
            testLoading: false
        }

        this.fetchData = this.fetchData.bind(this)
    }
    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        //@ts-ignore
        const res = await getBackendSrv().get('/api/teams/team', { id: this.props.match.params['id'] })
        const notifications = await this.loadNotifications(res.data.id)
        this.setState({
            ...this.state,
            team: res.data,
            notifications: notifications,
            hasFetched: true
        })
    }

    async loadNotifications(teamId) {
        const res = await getBackendSrv().get(`/api/alerting/notification/${teamId}`)
        return res.data
    }

    deleteNotification = (id: number) => {
        appEvents.emit(CoreEvents.showConfirmModal, {
            title: localeData[currentLang]['alerting.deleteChannel'],
            text: localeData[currentLang]['alerting.deleteChannelTips'],
            text2: `Deleting this notification channel will not delete from alerts any references to it`,
            icon: 'trash-alt',
            confirmText: localeData[currentLang]['common.delete'],
            yesText: localeData[currentLang]['common.delete'],
            onConfirm: async () => {
                this.deleteNotificationConfirmed(id);
            },
        });
    };

    deleteNotificationConfirmed = async (id: number) => {
        const {team} = this.state
        await getBackendSrv().delete(`/api/alerting/notification/${id}`)

        const notifications = await this.loadNotifications(team.id)

        this.setState({
            ...this.state,
            addChannelVisible: false,
            tempNotification: null,
            notifications: notifications,
        })
        
        notification['success']({
            message: "Success",
            description: localeData[currentLang]['info.targetDeleted'],
            duration: 5
        })  

    };

    onAddChannel = () => {
        this.setState({
            ...this.state,
            addChannelVisible: true,
            tempNotification: defaultNotification
        })
    }
    
    onEditChannel = (n) => {
        this.setState({
            ...this.state,
            addChannelVisible: true,
            tempNotification: n
        })
    }

    onCancelEdit = () => {
        this.setState({
            ...this.state,
            addChannelVisible: false,
            tempNotification: null,
        })
    }

    onEditSubmit = async () => {
        const {tempNotification,team} = this.state
        if (tempNotification.name.trim() === '') {
            notification['error']({
                message: "Error",
                description: "name cannot be empty",
                duration: 5
            })
            return 
        }

        if (tempNotification.id) {
            await getBackendSrv().put(`/api/alerting/notification/${team.id}`,tempNotification)
        } else {
            await getBackendSrv().post(`/api/alerting/notification/${team.id}`,tempNotification)
        }
        
        const notifications = await this.loadNotifications(team.id)

        this.setState({
            ...this.state,
            addChannelVisible: false,
            tempNotification: null,
            notifications: notifications,
        })
        
        notification['success']({
            message: "Success",
            description: localeData[currentLang]['info.targetUpdated'],
            duration: 5
        })  
    }

    onEditChange = () => {
        this.setState({
            ...this.state,
            tempNotification: _.cloneDeep(this.state.tempNotification)
        })
    }

    onTest = async () => {
        this.setState({
            ...this.state,
            testLoading: true
        })
        const {tempNotification,team} = this.state
        getBackendSrv().post(`/api/alerting/test/notification`,{
            name: tempNotification.name,
            type: tempNotification.type,
            settings: tempNotification.settings,
            teamId: team.id,
        }).then(() => {
            notification['success']({
                message: "Success",
                description: localeData[currentLang]['info.testOK'],
                duration: 5
            })  
    
            this.setState({
                ...this.state,
                testLoading: false
            })
        }).catch(() => {
            this.setState({
                ...this.state,
                testLoading: false
            })
        })
    }

    render() {
        const { routeID, parentRouteID } = this.props
        const { hasFetched, notifications,addChannelVisible,tempNotification,team,testLoading} = this.state

        let navModel;
        if (team) {
            navModel = _.cloneDeep(getNavModel(routeID,parentRouteID))
            const {node,main} = navModel
              node.url = node.url.replace(":id",team.id)
              main.children.forEach((n) => {
                  n.url = n.url.replace(":id",team.id)
              })
    
            navModel.main.title = navModel.main.title + ' / ' + team.name
        } else {
            navModel = _.cloneDeep(getNavModel(routeID,parentRouteID))
        }
        
        return (
            <>
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                    {!!notifications.length && (
                        <>
                            <div className="page-action-bar">
                                <div className="page-action-bar__spacer" />
                                <LinkButton icon="channel-add" onClick={() => this.onAddChannel()}>
                                    <FormattedMessage id="alerting.addChannel"/>
                                </LinkButton>
                            </div>
                            <table className="filter-table filter-table--hover">
                                <thead>
                                    <tr>
                                        <th style={{ minWidth: '200px' }}>
                                            <strong>{<FormattedMessage id="common.name"/>}</strong>
                                        </th>
                                        <th style={{ minWidth: '100px' }}>{<FormattedMessage id="common.type"/>}</th>
                                        <th style={{ width: '1%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map(notification => (
                                        <tr key={notification.id}>
                                            <td className="link-td">
                                                <a onClick={() => this.onEditChannel(notification)}>{notification.name}</a>
                                            </td>
                                            <td className="link-td">
                                                <a onClick={() => this.onEditChannel(notification)}>{notification.type}</a>
                                            </td>
                                            <td className="text-right">
                                                <HorizontalGroup justify="flex-end">
                                                    {notification.isDefault && (
                                                        <Button disabled variant="secondary" size="sm">
                                                            {<FormattedMessage id="common.default"/>}
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="destructive"
                                                        icon="times"
                                                        size="sm"
                                                        onClick={() => {
                                                            this.deleteNotification(notification.id);
                                                        }}
                                                    />
                                                </HorizontalGroup>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {!(notifications.length || !hasFetched) && (
                        this.emptyTips
                    )}
                </Page.Contents>
            </Page>
            <NotificationEdit visible={addChannelVisible} notification={tempNotification} onTest={this.onTest} onCancel={this.onCancelEdit} onEditSubmit={this.onEditSubmit} onEditChange={this.onEditChange} testLoading={testLoading}/>
            </>
        );
    }
}




export default withRouter(NotificationPage);
