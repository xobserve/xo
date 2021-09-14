import React, { useState } from 'react'

import { connect } from 'react-redux';
import { Prompt } from "react-router-dom";


import { Layout, Tooltip, Button, Modal, Divider, notification} from 'antd'

import BreadcrumbWrapper from './Breadcrumb/Breadcrumb'

import { StoreState, VariableModel, CoreEvents, ViewState } from 'src/types'
import { TimePickerWrapper } from 'src/views/components/TimePicker/TimePickerWrapper'
import SaveDashboard from 'src/views/dashboard/components/SaveDashboard/SaveDashboard';
import appEvents from 'src/core/library/utils/app_events';
import tracker from 'src/core/services/changeTracker';

import './Header.less'
import { DashboardModel } from 'src/views/dashboard/model';
import localeData from 'src/core/library/locale'
import { FormattedMessage as Message } from 'react-intl';
import {  currentLang } from 'src/packages/datav-core/src';
import { Icon } from 'src/packages/datav-core/src/ui';
import { SaveOutlined, SettingOutlined,PlusOutlined, CalculatorOutlined, LoadingOutlined, DesktopOutlined} from '@ant-design/icons';
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
    viewState: any
}

const { Header } = Layout

function HeaderWrapper(props: Props) {
    const [dashboard, setDashboard] = useState(null)
    const [showGlobalVar, setShowGlobalVar] = useState(false)
    appEvents.on('open-dashboard-save-modal', (dash) => {
        setDashboard(dash)
    })

    const [backButtonComponent, setBackButtonComponent] = useState(null)
    appEvents.on('set-panel-viewing-back-button', (component) => {
        if (!backButtonComponent) {
            setBackButtonComponent(component)
        }
    })

    const [inSave,SetInSave] = useState(false)
    appEvents.on(CoreEvents.DashboardSaving, () => {
        SetInSave(true)
    });
    appEvents.on(CoreEvents.DashboardSaved, () => {
        SetInSave(false)
    });
    

    const onSaveDashboard = () => {
        appEvents.emit('dashboard-auto-save',dashboard[0].autoSave)
        setDashboard(null)
    }

    const onCancelSaveDash = () => {
        setDashboard(null)
    }

    const body = $('body');
    switch (props.viewState) {
        case ViewState.TV:
            body.addClass('view-mode--tv');
            break;
        case ViewState.Fullscreen:
            body.addClass('view-mode--kiosk');
        default:
            break;
    }

    const toggleViewMode = () => {
       if (props.viewState === ViewState.TV) {
           body.removeClass('view-mode--tv')
           store.dispatch(updateLocation({
               query: {view : ViewState.Fullscreen},
               partial: true,
           }))
           notification['success']({
            message: "Tips",
            description: localeData[currentLang]["dashboard.fullscreenTips"],
            duration: 3
          });
           return 
       }

       store.dispatch(updateLocation({
            query: {view : ViewState.TV},
            partial: true,
        }))
    }

    return (
        <>
        {props.dashboard.showHeader && <Header className="datav-header">
            <div className='datav-header-inner'>
                <div>
                    <div className="ub-mr1">{backButtonComponent}</div>
                    <BreadcrumbWrapper  dashboard={props.dashboard} isFullscreen={false}/>
                </div>
                <div>
                    <div className="ub-mr1">
                        <Tooltip title={<Message id={'dashboard.addPanel'} />}><Button icon={<Icon name="panel-add" />} onClick={() => props.onAddPanel()} /></Tooltip>
                        <Tooltip title={<Message id={'common.save'} />}>{<Button icon={!inSave ? <SaveOutlined translate onClick={() => props.onSaveDashboard()} /> : <LoadingOutlined  translate className="color-success" />} />}</Tooltip>
                        <Tooltip title={<Message id={'common.setting'} />}>
                            <Button icon={<SettingOutlined translate/>} onClick={
                                () => store.dispatch(updateLocation({ query: { settingView: 'general' }, partial: true }))
                            } />
                        </Tooltip>
                        {/* {props.variables.length > 0 && <Tooltip title={<Message id={'common.globalVariable'} />}>
                            <Button icon={<CalculatorOutlined />} onClick={() => setShowGlobalVar(true)} />
                        </Tooltip>} */}
                        <Tooltip title={<Message id={'dashboard.viewMode'} />}>{<Button icon={<DesktopOutlined translate onClick={toggleViewMode} />} />}</Tooltip>
                        <Tooltip title={<Message id='dashboard.addUrl'/>} placement="bottom">
                            <Button icon={  <PlusOutlined translate />} onClick={() => props.onUpdateUrl()} />
                        </Tooltip>
                    </div>
                    <TimePickerWrapper />
                </div>
            </div>
        </Header>}
        {dashboard && <SaveDashboard dashboard={dashboard[0]} originDashbord={dashboard[1]} onSave={onSaveDashboard} onCancel={onCancelSaveDash}/>}
            
            {/* <Modal
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
            </Modal> */}
            <Prompt message={
                (location,action) =>
                    {  
                        if (action === 'POP') {
                            //when go back/forward in the same page, directly return true
                            if (location.pathname === window.location.pathname) {
                                return true
                            }
                        }

                        return tracker.canLeave()
                        ? true
                        : localeData[props.locale]['dashboard.changeNotSave']
                    }
            }
            />
        </>
    )
}

export const mapStateToProps = (state: StoreState) => ({
    locale: state.application.locale,
    breadcrumbText: state.application.breadcrumbText,
    variables: getVariables(state, false),
});

export default connect(mapStateToProps)(HeaderWrapper);