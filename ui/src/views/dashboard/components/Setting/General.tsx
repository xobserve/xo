import React, {useState} from 'react'
import { DashboardModel } from '../../model';
import { Tooltip} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { DynamicTagList, LegacyForms} from 'src/packages/datav-core/src';
import { FormattedMessage } from 'react-intl';
const {LegacySwitch} = LegacyForms

interface Props {
    dashboard: DashboardModel
}

const GeneralSetting = (props: Props) => {
    const [editable,setEditable] = useState(props.dashboard.editable)
    const [enableGlobal,setEnableGlobal] = useState(props.dashboard.enableGlobalVariable)

    const onChangeEditable = (e) => {
        setEditable(e.currentTarget.checked)
        props.dashboard.editable = e.currentTarget.checked
    }

    const onChangeEnableGlobal = (e) => {
        setEnableGlobal(e.currentTarget.checked)
        props.dashboard.enableGlobalVariable = e.currentTarget.checked
    }

    return (
        <>
            <h3 className="dashboard-settings__header">
                <FormattedMessage id="dashboard.general"/>
            </h3>

            <div className="gf-form-group">
                <div className="gf-form">
                    <label className="gf-form-label width-7"><FormattedMessage id="dashboard.title"/></label>
                    <input type="text" className="gf-form-input width-30" defaultValue={props.dashboard.title} onChange={(e) => {props.dashboard.title = e.currentTarget.value}}/>
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-7"><FormattedMessage id="common.desc"/></label>
                    <input type="text" className="gf-form-input width-30" defaultValue={props.dashboard.description} onChange={(e) => {props.dashboard.description = e.currentTarget.value}}/>
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-7"><FormattedMessage id="common.tags"/><Tooltip title={<FormattedMessage id="dashboard.tagTooltip"/>}><InfoCircleOutlined /></Tooltip></label>
                    <DynamicTagList color="#9933cc" tags={props.dashboard.tags} onConfirm={(tags) => {props.dashboard.tags = tags}} />
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-7"><FormattedMessage id="dashboard.editable"/><Tooltip title={<FormattedMessage id="dashboard.editableTooltip"/>}><InfoCircleOutlined /></Tooltip></label>
                    <LegacySwitch label="" checked={editable} onChange={onChangeEditable}/>
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-7"><FormattedMessage id="dashboard.enableGlobalVariable"/></label>
                    <LegacySwitch label="" checked={enableGlobal} onChange={onChangeEnableGlobal}/>
                </div>
            </div>
        </>
    )
}

export default GeneralSetting;