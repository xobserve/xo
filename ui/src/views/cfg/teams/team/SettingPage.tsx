import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getNavModel } from 'src/views/Layouts/Page/navModel'
import { Team } from 'src/types';
import { getBackendSrv } from 'src/core/services/backend';
import { InlineFormLabel, ConfirmModal, getHistory } from 'src/packages/datav-core'
import { Button, Input,notification, message } from 'antd';
import TeamMemberPicker from 'src/views/components/Pickers/TeamMemberPicker'
import globalEvents from 'src/views/App/globalEvents';
import TeamPermission from './Setting/TeamPermission'
import { injectIntl, FormattedMessage, IntlShape } from 'react-intl';

export interface Props {
    intl?: IntlShape
    routeID: string;
    parentRouteID: string;
}

interface State {
    team: Team
    hasFetched: boolean
    confirmVisible: boolean
    confirmContent: any
}

export class TeamSettingPage extends PureComponent<Props, State> {
    transferTo;

    constructor(props) {
        super(props)
        this.state = {
            team: null,
            hasFetched: true,
            confirmVisible: false,
            confirmContent: {}
        }
        this.onTransfer = this.onTransfer.bind(this)
        this.onDelete = this.onDelete.bind(this)
        this.onLeave = this.onLeave.bind(this)
    }

    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        //@ts-ignore
        const res = await getBackendSrv().get('/api/teams/team', { id: this.props.match.params['id'] })
        if (res.data) {
            this.setState({
                team: res.data,
                hasFetched: true
            })
        }
    }

    updateSetting(e) {
        e.preventDefault();
        getBackendSrv().put(`/api/teams/team/${this.state.team.id}`,this.state.team).then(() => {
            notification['success']({
                message: "Success",
                description: this.props.intl.formatMessage({id: "info.targetUpdated"}),
                duration: 5
              });
        })
    }

    onChangeTransferTo(v) {
        this.transferTo = v
    }

    onChangeName = (event: any) => {
        this.setState({
            ...this.state,
            team: {
                ...this.state.team,
                name: event.target.value
            }
        });
    };

    onTransfer() {
        const {team} = this.state
        if (!this.transferTo) {
            notification['error']({
                message: "Error",
                description: this.props.intl.formatMessage({id: "error.needSelectTeamMember"}),
                duration: 5
              });
            this.setState({
                ...this.state,
                confirmVisible: false
            })
            return
        }
        getBackendSrv().post(`/api/teams/transfer/${team.id}`,{memberId : this.transferTo}).then(() => {
            globalEvents.showMessage(() => notification['success']({
                message: "Success",
                description: this.props.intl.formatMessage({id: "info.teamTransfered"}),
                duration: 5
            }))

            getHistory().push(`/team/members/${team.id}`)
        })
    }

    onDelete() {
        const {team} = this.state
        getBackendSrv().delete(`/api/teams/${team.id}`).then(() => {
            globalEvents.showMessage(() => notification['success']({
                message: "Success",
                description: this.props.intl.formatMessage({id: "info.targetDeleted"}),
                duration: 5
            }))

            getHistory().push(`/cfg/teams`)
        })
    }
    
    onLeave() {
        const {team} = this.state
        getBackendSrv().post(`/api/teams/leave/${team.id}`).then(() => {
            globalEvents.showMessage(() => notification['success']({
                message: "Success",
                description: this.props.intl.formatMessage({id: "info.teamLeaved"}),
                duration: 5
            }))

            getHistory().push(`/cfg/teams`)
        })
    }

    render() {
        const { routeID, parentRouteID } = this.props

        const { team,hasFetched,confirmVisible,confirmContent} = this.state
        let navModel;
        if (team) {
            navModel = _.cloneDeep(getNavModel(routeID, parentRouteID))
            const { node, main } = navModel
            node.url = node.url.replace(":id", team.id)
            main.children.forEach((n) => {
                n.url = n.url.replace(":id", team.id)
            })

            navModel.main.title = navModel.main.title + ' / ' + team.name
        } else {
            navModel = _.cloneDeep(getNavModel(routeID, parentRouteID))
        }


        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                    {
                        team && 
                        <div>
                            <h3 className="page-sub-heading"><FormattedMessage id="team.setting"/></h3>
                            <form name="teamDetailsForm" className="gf-form-group" onSubmit={(e) => this.updateSetting(e)}>
                                <div className="gf-form max-width-30">
                                    <InlineFormLabel><FormattedMessage id="team.name"/></InlineFormLabel>
                                    <Input
                                        type="text"
                                        required
                                        value={team.name}
                                        className="gf-form-input max-width-14"
                                        onChange={this.onChangeName}
                                    />
                                </div>
                                <div className="gf-form-button-row">
                                    <Button htmlType="submit" type="primary" ghost>
                                        <FormattedMessage id="common.update"/>
                                    </Button>
                                </div>
                            </form>
                            
                            <h3 className="page-sub-heading"><FormattedMessage id="team.dashboardPermission"/></h3>
                            <TeamPermission teamId={team.id}/>

                            
                            <h3 className="page-sub-heading"><FormattedMessage id="team.transfer"/></h3>
                            <form name="teamDetailsForm" className="gf-form-group" onSubmit={(e) => this.updateSetting(e)}>
                                <div className="gf-form max-width-30">
                                    <InlineFormLabel><FormattedMessage id="team.toMember"/></InlineFormLabel>
                                    <TeamMemberPicker teamId={team.id} onChange={(v) => this.onChangeTransferTo(v)} />
                              
                                </div>
                                <div className="gf-form-button-row">
                                <Button  type="primary" onClick={() => this.setState({...this.state, confirmVisible:true,confirmContent: {title:'Transfer Team Confirm',onConfirm: this.onTransfer,action: 'Transfer'}})} ghost>
                                    <FormattedMessage id="common.submit"/>
                                </Button>
                                </div>
                            </form>

                            <h3 className="page-sub-heading"><FormattedMessage id="common.dangerousSection"/></h3>
                            <form name="teamDetailsForm" className="gf-form-group" onSubmit={(e) => this.updateSetting(e)}>
                                <Button onClick={() => this.setState({...this.state, confirmVisible:true,confirmContent: {title:'Leave Team Confirm',onConfirm: this.onLeave,action: 'Leave'}})} danger>
                                    <FormattedMessage id="team.leave"/>
                                </Button>
                                <Button className="ub-ml2"  type="primary" onClick={() => this.setState({...this.state, confirmVisible:true,confirmContent: {title:'Delete Team Confirm',onConfirm: this.onDelete,action: 'Delete'}})} danger>
                                    <FormattedMessage id="team.delete"/>
                                </Button>
                            </form>
                        </div>
                    }
                      <ConfirmModal
                            isOpen={confirmVisible}
                            title={confirmContent.title}
                            body= {`Are you sure you want to ${confirmContent.action} this team?`}
                            confirmText= {confirmContent.action}
                            onConfirm={() => confirmContent.onConfirm()}
                            onDismiss={() => this.setState({...this.state,confirmVisible :false})}
                        />
                </Page.Contents>
            </Page>
        );
    }
}




export default injectIntl(withRouter(TeamSettingPage));
