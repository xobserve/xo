import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import { Modal, Form, Input, Button, message, Select, notification } from 'antd'
import { DashboardModel, PanelModel } from 'src/views/dashboard/model'
import { getBackendSrv } from 'src/core/services/backend';

import { locationUtil, localeData, currentLang } from 'src/packages/datav-core/src';
import { useHistory } from 'react-router-dom';
import appEvents from 'src/core/library/utils/app_events';
import { CoreEvents, FolderDTO } from 'src/types';
import globalEvents from 'src/views/App/globalEvents';
import { getUrlParams } from 'src/core/library/utils/url';
import { useIntl, FormattedMessage } from 'react-intl';
import tracker from 'src/core/services/changeTracker';

const { Option } = Select

interface Props {
    onSave: any
    onCancel: any
    dashboard: DashboardModel
    originDashbord: DashboardModel
}

export async function saveDashboard(title, folderId, dashboard, originDashboard) {
    if (!dashboard.meta.canSave) {
        notification['error']({
            message: "Error",
            description: localeData[currentLang]["error.noPermission"],
            duration: 5
        });
        return null
    }

    appEvents.emit(CoreEvents.DashboardSaving)
    dashboard.title = title
    dashboard.meta.folderId = folderId
    const clone = getSaveAsDashboardClone(dashboard);

    const fromTeam = _.toNumber(getUrlParams()['fromTeam'])

    let alertChanged = false
    // check which panel's alerts has changed
    for (const panel of clone.panels) {
        let exist = false
        for (const panel1 of originDashboard.panels) {
            if (panel.id === panel1.id) {
                exist = true
                const alert = JSON.stringify(panel.alert)
                const alert1 = JSON.stringify(panel1.alert)

                if (alert !== alert1) {
                    alertChanged = true
                }
            }
        }

        // panel newly created
        if (exist === false) {
            if (panel.alert) {
                alertChanged = true
            }
        }
    }

    const res = await getBackendSrv().saveDashboard(clone, { folderId: folderId, fromTeam: fromTeam, alertChanged: alertChanged })

    setTimeout(() => {
        appEvents.emit(CoreEvents.DashboardSaved, dashboard)
    }, 500)


    return res
}

const SaveDashboard = (props: Props) => {
    const intl = useIntl()
    const [folders, setFolders] = useState([])


    const dashboard = props.dashboard
    const history = useHistory()
    const isNew = dashboard.id === null


    const getFolders = async () => {
        const res = await getBackendSrv().get('/api/folder/all')
        const folders: FolderDTO[] = res.data
        setFolders(folders)
    }

    useEffect(() => {
        getFolders()
    }, [])


    const submitDashboard = async (val) => {
        const res = await saveDashboard(val.title, val.folderId, props.dashboard, props.originDashbord)

        if (res) {
            globalEvents.showMessage(() => notification['success']({
                message: "Success",
                description: intl.formatMessage({ id: "dashboard.saved" }),
                duration: 5
            }))

            props.onSave()
        }


        if (!dashboard.id) {
            tracker.unregister()
            history.push(res.data.url)
        }
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
                title={<FormattedMessage id="dashboard.save" />}
                visible={true}
                footer={null}
                onCancel={() => props.onCancel()}
            >
                <Form
                    layout="vertical"
                    name="basic"
                    initialValues={initialValues}
                    onFinish={submitDashboard}
                >
                    <Form.Item
                        label={<FormattedMessage id="dashboard.title" />}
                        name="title"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label={<FormattedMessage id="common.folder" />}
                        name="folderId"
                    >
                        <Select>
                            {
                                folders.map((f: FolderDTO) => {
                                    return <Option value={f.id} key={f.id}>{f.title}</Option>
                                })
                            }
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="ub-mt2">
                            <FormattedMessage id="common.submit" />
                        </Button>
                        <Button htmlType="button" onClick={() => props.onCancel()} className="ub-ml1">
                            <FormattedMessage id="common.cancel" />
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