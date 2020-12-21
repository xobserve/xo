import React, { useState } from 'react'
import _ from 'lodash'
import { DashboardModel } from '../../model';
import { Tooltip, Divider, notification, Tag } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { DynamicTagList, LegacyForms, Button, ConfirmModal, getBackendSrv, getHistory, currentLang, localeData } from 'src/packages/datav-core/src';
import { FormattedMessage } from 'react-intl';
import tracker from 'src/core/services/changeTracker';
import { getVariables } from 'src/views/variables/state/selectors';
const { LegacySwitch } = LegacyForms
const { CheckableTag } = Tag;

interface Props {
    dashboard: DashboardModel
}

const GeneralSetting = (props: Props) => {
    const variables = getVariables()
    console.log(variables)
    // if old varibles display not exist in current variables ,delete them
    const newDisplayVars = []
    for (const v1 of props.dashboard.variablesDiplay) {
        let exist = false
        for (const v of variables) {
            if (v.name == v1) {
                exist = true
            }
        }

        if (exist) {
            newDisplayVars.push(v1)
        }
    }
    props.dashboard.variablesDiplay = newDisplayVars
  
    const [editable, setEditable] = useState(props.dashboard.editable)
    const [enableGlobal, setEnableGlobal] = useState(props.dashboard.enableGlobalVariable)
    const [autoSave, setAutoSave] = useState(props.dashboard.autoSave)
    const [delConfirmVisible, setDelConfirmVisible] = useState(false)
    const [showHeader, setShowHeader] = useState(props.dashboard.showHeader)
    const [displayVariables, setDisplayVariables] = useState(props.dashboard.variablesDiplay)
    const onChangeEditable = (e) => {
        setEditable(e.currentTarget.checked)
        props.dashboard.editable = e.currentTarget.checked
    }

    const onChangeEnableGlobal = (e) => {
        setEnableGlobal(e.currentTarget.checked)
        props.dashboard.enableGlobalVariable = e.currentTarget.checked
    }

    const onChangeAutoSave = (e) => {
        setAutoSave(e.currentTarget.checked)
        props.dashboard.autoSave = e.currentTarget.checked
    }

    const onChangeShowHeader = (e) => {
        setShowHeader(e.currentTarget.checked)
        props.dashboard.showHeader = e.currentTarget.checked
    }

    const deleteDashboard = async () => {
        await getBackendSrv().delete(`/api/dashboard/id/${props.dashboard.id}`)
        notification['success']({
            message: "Success",
            description: localeData[currentLang]["info.targetDeleted"],
            duration: 3
        });

        tracker.unregister()
        getHistory().push('/')
    }



    const setVariableDiplay = (v, checked) => {
        const vs = _.cloneDeep(props.dashboard.variablesDiplay)
        if (checked) {
            vs.push(v.name)
            props.dashboard.variablesDiplay = vs
        } else {
            _.remove(vs, (v1) => v.name === v1)
            props.dashboard.variablesDiplay = vs
        }

        setDisplayVariables(props.dashboard.variablesDiplay)
    }

    return (
        <>
            <h3 className="dashboard-settings__header">
                <FormattedMessage id="dashboard.general" />
            </h3>

            <div className="gf-form-group">
                <div className="gf-form">
                    <label className="gf-form-label width-9"><FormattedMessage id="dashboard.title" /></label>
                    <input type="text" className="gf-form-input width-30" defaultValue={props.dashboard.title} onChange={(e) => { props.dashboard.title = e.currentTarget.value }} />
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-9"><FormattedMessage id="common.desc" /></label>
                    <input type="text" className="gf-form-input width-30" defaultValue={props.dashboard.description} onChange={(e) => { props.dashboard.description = e.currentTarget.value }} />
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-9"><FormattedMessage id="common.tags" /><Tooltip title={<FormattedMessage id="dashboard.tagTooltip" />}><InfoCircleOutlined /></Tooltip></label>
                    <DynamicTagList color="#9933cc" tags={props.dashboard.tags} onConfirm={(tags) => { props.dashboard.tags = tags }} />
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-9"><FormattedMessage id="dashboard.editable" /><Tooltip title={<FormattedMessage id="dashboard.editableTooltip" />}><InfoCircleOutlined /></Tooltip></label>
                    <LegacySwitch label="" checked={editable} onChange={onChangeEditable} />
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-9"><FormattedMessage id="dashboard.enableGlobalVariable" /></label>
                    <LegacySwitch label="" checked={enableGlobal} onChange={onChangeEnableGlobal} />
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-9"><FormattedMessage id="dashboard.autoSave" /><Tooltip title={<FormattedMessage id="dashboard.autoSaveTips" />}><InfoCircleOutlined /></Tooltip></label>
                    <LegacySwitch label="" checked={autoSave} onChange={onChangeAutoSave} />
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-9"><FormattedMessage id="dashboard.showHeader" /></label>
                    <LegacySwitch label="" checked={showHeader} onChange={onChangeShowHeader} />
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-9"><FormattedMessage id="dashboard.variablesDisplay" /></label>
                    {variables.map((v) => <CheckableTag key={v.name} checked={displayVariables.indexOf(v.name) > -1} onChange={(checked) => setVariableDiplay(v, checked)}>{v.label ?? v.name}</CheckableTag>)}
                </div>

                <Divider />

                <div><FormattedMessage id="common.dangerousSection" /></div>
                <div className="gf-form ub-mt2">
                    <label className="gf-form-label width-9"><FormattedMessage id="dashboard.delDashboard" /><Tooltip title={<FormattedMessage id="dashboard.delDashboardTips" />}><InfoCircleOutlined /></Tooltip></label>
                    <Button variant="destructive" onClick={() => setDelConfirmVisible(true)}><FormattedMessage id="common.delete" /></Button>
                </div>
            </div>

            <ConfirmModal
                isOpen={delConfirmVisible}
                title={localeData[currentLang]["dashboard.delDashboard"]}
                body={localeData[currentLang]["dashboard.delDashboardConfirm"]}
                confirmText={<FormattedMessage id="common.delete" />}
                onConfirm={() => deleteDashboard()}
                onDismiss={() => setDelConfirmVisible(false)}
            />
        </>
    )
}

export default GeneralSetting;