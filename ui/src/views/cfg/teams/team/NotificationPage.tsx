import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getBackendSrv, LinkButton, Button, HorizontalGroup,currentLang, localeData } from 'src/packages/datav-core';
import { getNavModel } from 'src/views/Layouts/Page/navModel'
import { AlertNotification, CoreEvents, Team } from 'src/types';
import EmptyListCTA from '../../../components/EmptyListCTA/EmptyListCTA';
import appEvents from 'src/core/library/utils/app_events';
import { Langs } from 'src/core/library/locale/types';
import {Modal, notification} from 'antd'
import {NotificationEdit} from './NotificationEdit'

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
            proTip="You can include images in your alert notifications."
            proTipLink="http://docs.grafana.org/alerting/notifications/"
            proTipLinkTitle={localeData[currentLang]['common.learnMore']}
            proTipTarget="_blank"
        /> :
        <EmptyListCTA
            title="当前尚没创建任何通知通道"
            buttonIcon="channel-add"
            onClick={() => this.onAddChannel()}
            buttonTitle={localeData[currentLang]['alerting.addChannel']}
            proTip="你还能在通知消息中添加图表."
            proTipLink="http://docs.grafana.org/alerting/notifications/"
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
            team: null
        }

        this.fetchData = this.fetchData.bind(this)
    }
    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        //@ts-ignore
        const res = await getBackendSrv().get('/api/teams/team', { id: this.props.match.params['id'] })
        this.setState({
            ...this.state,
            team: res.data,
            hasFetched: true
        })
    }

    deleteNotification = (id: number) => {
        appEvents.emit(CoreEvents.showConfirmModal, {
            title: 'Delete',
            text: 'Do you want to delete this notification channel?',
            text2: `Deleting this notification channel will not delete from alerts any references to it`,
            icon: 'trash-alt',
            confirmText: 'Delete',
            yesText: 'Delete',
            onConfirm: async () => {
                this.deleteNotificationConfirmed(id);
            },
        });
    };

    deleteNotificationConfirmed = async (id: number) => {

    };

    onAddChannel = () => {
        this.setState({
            ...this.state,
            addChannelVisible: true,
            tempNotification: defaultNotification
        })
    }
    
    onCancelEdit = () => {
        this.setState({
            ...this.state,
            addChannelVisible: false
        })
    }

    onEditSubmit = async () => {
        const {tempNotification} = this.state
        if (tempNotification.name.trim() === '') {
            notification['error']({
                message: "Error",
                description: "name cannot be empty",
                duration: 5
            })
            return 
        }

        if (tempNotification.id) {
            await getBackendSrv().put(`/api/alerting/notification/${tempNotification.id}`,tempNotification)
        } else {
            await getBackendSrv().post(`/api/alerting/notification`,tempNotification)
        }
        
        alert(1)
    }

    onEditChange = () => {
        this.setState({
            ...this.state,
            tempNotification: _.cloneDeep(this.state.tempNotification)
        })
    }
    render() {
        const { routeID, parentRouteID } = this.props
        const { hasFetched, notifications,addChannelVisible,tempNotification,team} = this.state

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
                                <LinkButton icon="channel-add" href="alerting/notification/new">
                                    New channel
                                </LinkButton>
                            </div>
                            <table className="filter-table filter-table--hover">
                                <thead>
                                    <tr>
                                        <th style={{ minWidth: '200px' }}>
                                            <strong>Name</strong>
                                        </th>
                                        <th style={{ minWidth: '100px' }}>Type</th>
                                        <th style={{ width: '1%' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map(notification => (
                                        <tr key={notification.id}>
                                            <td className="link-td">
                                                <a href={`alerting/notification/${notification.id}/edit`}>{notification.name}</a>
                                            </td>
                                            <td className="link-td">
                                                <a href={`alerting/notification/${notification.id}/edit`}>{notification.type}</a>
                                            </td>
                                            <td className="text-right">
                                                <HorizontalGroup justify="flex-end">
                                                    {notification.isDefault && (
                                                        <Button disabled variant="secondary" size="sm">
                                                            default
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
            <NotificationEdit visible={addChannelVisible} notification={tempNotification} onCancel={() => this.onCancelEdit()} onEditSubmit={this.onEditSubmit} onEditChange={this.onEditChange}/>
            </>
        );
    }
}




export default withRouter(NotificationPage);
