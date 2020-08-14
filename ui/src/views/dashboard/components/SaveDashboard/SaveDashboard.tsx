import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import { Modal, Form, Input, Button, message,Select,notification} from 'antd'
import {  DashboardModel,PanelModel } from 'src/views/dashboard/model'
import { getBackendSrv } from 'src/core/services/backend';

import { locationUtil } from 'src/packages/datav-core/src';
import { useHistory } from 'react-router-dom';
import appEvents from 'src/core/library/utils/app_events';
import { CoreEvents, FolderDTO } from 'src/types';
import globalEvents from 'src/views/App/globalEvents';
import { getUrlParams } from 'src/core/library/utils/url';
import { useIntl,FormattedMessage } from 'react-intl';

const {Option} = Select

interface Props {
    setDashboard: any
    dashboard: DashboardModel
}


const SaveDashboard = (props: Props) => {
    const intl = useIntl()
    const [folders,setFolders] = useState([])

    
    const dashboard = props.dashboard
    const history = useHistory()
    const isNew = dashboard.id === null


    const getFolders= async () => {
        const res = await getBackendSrv().get('/api/folder/all')
        const folders:FolderDTO[]  = res.data
        setFolders(folders)
    }

    useEffect(() => {
        getFolders()
    },[])


    const saveDashboard = async (val) => {
        if (!dashboard.meta.canSave) {
            notification['error']({
                message: "Error",
                description: intl.formatMessage({id: "info.noPermission"}),
                duration: 5
              });
              return 
           }

        dashboard.title = val.title 
        dashboard.meta.folderId = val.folderId
        const clone = getSaveAsDashboardClone(dashboard);

        const fromTeam = _.toNumber(getUrlParams()['fromTeam'])
        const res = await  getBackendSrv().saveDashboard(clone,{folderId:val.folderId,fromTeam: fromTeam})

        appEvents.emit(CoreEvents.dashboardSaved, dashboard);

        if(!dashboard.id) {
            history.push(res.data.url)
        }
       
        globalEvents.showMessage(() => notification['success']({
            message: "Success",
            description: intl.formatMessage({id: "dashboard.saved"}),
            duration: 5
          }))

        props.setDashboard(null)
    }

    const defaultValues = {
        title: `${dashboard.title} Copy`,
        folderId: 0
    };
    const initialValues = !isNew ? {
        title: dashboard.title,
        folderId: dashboard.meta.folderId
    } : defaultValues
    
    return (
        <>
            <Modal
                title={<FormattedMessage id="dashboard.save"/>}
                visible={true}
                footer={null}
                onCancel={() => props.setDashboard(null)}
            >
                <Form
                    layout="vertical"
                    name="basic"
                    initialValues={initialValues}
                    onFinish={saveDashboard}
                >
                    <Form.Item
                         label={<FormattedMessage id="dashboard.title"/>}
                        name="title"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={<FormattedMessage id="common.folder"/>}
                        name="folderId"
                    >
                        <Select>
                            {
                                folders.map((f:FolderDTO) => {
                                return  <Option value={f.id} key={f.id}>{f.title}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="ub-mt2">
                            <FormattedMessage id="common.submit"/>
                        </Button>
                        <Button htmlType="button" onClick={() => props.setDashboard(null)} className="ub-ml1">
                            <FormattedMessage id="common.cancel"/>
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}


export default SaveDashboard;


const getSaveAsDashboardClone = (dashboard: DashboardModel) => {
    const clone: any = dashboard.getSaveModelClone();
    if (clone.id == null) {
        clone.uid = '';
        clone.editable = true;
        clone.hideControls = false;
        // remove alerts if source dashboard is already persisted
        // do not want to create alert dupes
        if (dashboard.id > 0) {
            clone.panels.forEach((panel: PanelModel) => {
                if (panel.type === 'graph' && panel.alert) {
                    delete panel.thresholds;
                }
                delete panel.alert;
            });
        }
        delete clone.autoUpdate;
    }

    return clone;
};