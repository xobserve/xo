import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getNavModel } from 'src/views/Layouts/Page/navModel'
import { FolderDTO } from 'src/types';
import { getBackendSrv } from 'src/core/services/backend/backend';
import {  getHistory, NavModel} from 'src/packages/datav-core/src'
import { InlineFormLabel, ConfirmModal,Button} from 'src/packages/datav-core/src/ui'
import {  Input,notification } from 'antd';
import globalEvents from 'src/views/App/globalEvents';
import { injectIntl, FormattedMessage, IntlShape } from 'react-intl';
import localeData from 'src/core/library/locale'
import { getState } from 'src/store/store';

export interface Props {
    intl?: IntlShape
    routeID: string;
    parentRouteID: string;
}

interface State {
    folder: FolderDTO
    hasFetched: boolean
    confirmVisible: boolean
}

export class FolderSettingPage extends PureComponent<Props, State> {
    transferTo;

    constructor(props) {
        super(props)
        this.state = {
            folder: null,
            hasFetched: true,
            confirmVisible: false
        }
        this.onDelete = this.onDelete.bind(this)
    }

    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        //@ts-ignore
        const res = await getBackendSrv().get(`/api/folder/uid/${this.props.match.params['uid']}`)
        const folder = res.data
        if (folder.uid === "undefined") {
            notification['error']({
                message: "Error",
                description: this.props.intl.formatMessage({id: "error.folderNotExist"}),
                duration: 5
              });
              return 
            // getHistory().push('/cfg/folders')
        }

        if (folder) {
            this.setState({
                folder: folder,
                hasFetched: true
            })
        }
    }

    updateSetting(e) {
        e.preventDefault();
        getBackendSrv().put(`/api/folder/id/${this.state.folder.id}`,this.state.folder).then(() => {
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
            folder: {
                ...this.state.folder,
                title: event.target.value
            }
        });
    };


    onDelete() {
        const {folder} = this.state
        getBackendSrv().delete(`/api/folder/id/${folder.id}`).then(() => {
            globalEvents.showMessage(() => notification['success']({
                message: "Success",
                description: this.props.intl.formatMessage({id: "info.targetDeleted"}),
                duration: 5
            }))

            getHistory().push(`/cfg/folders`)
        })
    }
    

    render() {
        const { routeID, parentRouteID } = this.props

        const { folder,hasFetched,confirmVisible} = this.state
        let navModel: NavModel;
        if (folder) {
            navModel = _.cloneDeep(getNavModel(routeID, parentRouteID))
            const { node, main } = navModel
            node.url = node.url.replace(":uid", folder.uid)
            main.children.forEach((n) => {
                n.url = n.url.replace(":uid", folder.uid)
            })

            navModel.main.text = navModel.main.text + ' / ' + folder.title
        } else {
            navModel = _.cloneDeep(getNavModel(routeID, parentRouteID))
        }


        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                    {
                        folder && 
                        <div>
                            <h3 className="page-sub-heading"><FormattedMessage id="common.setting"/></h3>
                            <form name="teamDetailsForm" className="gf-form-group" onSubmit={(e) => this.updateSetting(e)}>
                                <div className="gf-form max-width-30">
                                    <InlineFormLabel><FormattedMessage id="common.name"/></InlineFormLabel>
                                    <Input
                                        type="text"
                                        required
                                        value={folder.title}
                                        className="gf-form-input max-width-14"
                                        onChange={this.onChangeName}
                                    />
                                </div>
                                <div className="gf-form-button-row">
                                    <Button variant="secondary"  type="submit"> <FormattedMessage id="common.update"/></Button>
                                    <Button variant="destructive" type="button" onClick={() => this.setState({...this.state, confirmVisible:true})}><FormattedMessage id="common.delete"/></Button>
                                </div>
                            </form>
                        </div>
                    }
                      <ConfirmModal
                            isOpen={confirmVisible}
                            title={localeData[getState().application.locale]["folder.delete"]}
                            body= {<FormattedMessage id="folder.deleteConfirmBody"/>}
                            confirmText="Delete"
                            onConfirm={() => this.onDelete()}
                            onDismiss={() => this.setState({...this.state,confirmVisible :false})}
                        />
                </Page.Contents>
            </Page>
        );
    }
}




export default injectIntl(withRouter(FolderSettingPage));
