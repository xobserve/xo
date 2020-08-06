import React, { useState } from 'react'
import { DashboardModel } from '../../model';
import { Tooltip,Switch} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { DynamicTagList } from 'src/packages/datav-core/src';
import { FormattedMessage } from 'react-intl';

interface Props {
    dashboard: DashboardModel
}

const GeneralSetting = (props: Props) => {
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
                    <Switch defaultChecked={props.dashboard.editable} onChange={(checked) => props.dashboard.editable = checked}/>
                </div>
            </div>
        </>
    )
}

export default GeneralSetting;