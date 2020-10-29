import React, { useState } from 'react'

import { connect } from 'react-redux';
import { Prompt } from "react-router-dom";


import { Layout, Tooltip, Button, Modal, Divider} from 'antd'

import BreadcrumbWrapper from './Breadcrumb/Breadcrumb'

import { StoreState, VariableModel, CoreEvents } from 'src/types'
import { TimePickerWrapper } from 'src/views/components/TimePicker/TimePickerWrapper'
import SaveDashboard from 'src/views/dashboard/components/SaveDashboard/SaveDashboard';
import appEvents from 'src/core/library/utils/app_events';
import tracker from 'src/core/services/changeTracker';

import './Header.less'
import { DashboardModel } from 'src/views/dashboard/model';
import localeData from 'src/core/library/locale'
import { FormattedMessage as Message } from 'react-intl';
import { Icon } from 'src/packages/datav-core/src';
import { SaveOutlined, SettingOutlined,PlusOutlined, CalculatorOutlined, LoadingOutlined} from '@ant-design/icons';
import { store } from 'src/store/store';
import { updateLocation } from 'src/store/reducers/location';
import { getVariables } from 'src/views/variables/state/selectors';
import { SubMenuItems } from '../SubMenu/SubMenuItems';


interface Props {
    locale: string
    onAddPanel: any
    onSaveDashboard: any
    onUpdateUrl: any
    variables: VariableModel[]
    isFullscreen?: boolean;
    dashboard: DashboardModel
}

const { Header } = Layout

function HeaderWrapper(props: Props) {
    const [dashboard, setDashboard] = useState(null)
    const [showGlobalVar, setShowGlobalVar] = useState(false)
    appEvents.on('open-dashboard-save-modal', (dash) => {
        console.log(dash[0].auto)
        setDashboard(dash)
    })

    const [backButtonComponent, setBackButtonComponent] = useState(null)
    appEvents.on('set-panel-viewing-back-button', (component) => {
        if (!backButtonComponent) {
            setBackButtonComponent(component)
        }
    })

    const [inSave,SetInSave] = useState(false)
    appEvents.on(CoreEvents.dashboardSaving, () => {
        SetInSave(true)
    });
    appEvents.on(CoreEvents.dashboardSaved, () => {
        SetInSave(false)
    });
    
    const globalVars = []
    const localVars = []
    props.variables.forEach(v => {
        v.global ?  globalVars.push(v) : localVars.push(v) 
    })

    const onSaveDashboard = () => {
        appEvents.emit('dashboard-auto-save',dashboard[0].autoSave)
        setDashboard(null)
    }

    const onCancelSaveDash = () => {
        setDashboard(null)
    }

 

    return (
        <Header className="datav-header">
            <div className='datav-header-inner'>
                <div>
                    <div className="ub-mr1">{backButtonComponent}</div>
                    <BreadcrumbWrapper  dashboard={props.dashboard} isFullscreen={false}/>
                </div>
                <div>
                    <div className="ub-mr1">
                        <Tooltip title={<Message id={'dashboard.addPanel'} />}><Button icon={<Icon name="panel-add" />} onClick={() => props.onAddPanel()} /></Tooltip>
                        <Tooltip title={<Message id={'common.save'} />}>{<Button icon={!inSave ? <SaveOutlined onClick={() => props.onSaveDashboard()} /> : <LoadingOutlined className="color-success" />} />}</Tooltip>
                        <Tooltip title={<Message id={'common.setting'} />}>
                            <Button icon={<SettingOutlined />} onClick={
                                () => store.dispatch(updateLocation({ query: { settingView: 'general' }, partial: true }))
                            } />
                        </Tooltip>
                        {globalVars.length > 0 && <Tooltip title={<Message id={'common.globalVariable'} />}>
                            <Button icon={<CalculatorOutlined />} onClick={() => setShowGlobalVar(true)} />
                        </Tooltip>}
                        <Tooltip title={<Message id='dashboard.addUrl'/>} placement="bottom">
                            <Button icon={  <PlusOutlined />} onClick={() => props.onUpdateUrl()} />
                        </Tooltip>
                    </div>
                    <TimePickerWrapper />
                </div>
            </div>

            {dashboard && <SaveDashboard dashboard={dashboard[0]} originDashbord={dashboard[1]} onSave={onSaveDashboard} onCancel={onCancelSaveDash}/>}
            
            <Modal
                title={null}
                visible={showGlobalVar}
                footer={null}
                onCancel={() => setShowGlobalVar(false)}
                >
                <h3><Message id={'dashboard.globalVariables'}/></h3>
                <SubMenuItems variables={globalVars} />

                <Divider />

                <h3><Message id={'dashboard.dashVariables'}/></h3>
                <SubMenuItems variables={localVars} />
            </Modal>
            <Prompt message={
                () =>
                    tracker.canLeave()
                        ? true
                        : localeData[props.locale]['dashboard.changeNotSave']
            }
            />
        </Header>
    )
}

export const mapStateToProps = (state: StoreState) => ({
    locale: state.application.locale,
    breadcrumbText: state.application.breadcrumbText,
    variables: getVariables(state, false),
});

export default connect(mapStateToProps)(HeaderWrapper);