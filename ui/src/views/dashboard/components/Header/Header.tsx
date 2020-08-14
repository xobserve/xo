import React, {useState} from 'react'

import { connect } from 'react-redux';
import { Prompt} from "react-router-dom";

import { Layout} from 'antd'

import BreadcrumbWrapper from './Breadcrumb/Breadcrumb'

import {StoreState} from 'src/types'  
import {TimePickerWrapper} from 'src/views/components/TimePicker/TimePickerWrapper'
import SaveDashboard from 'src/views/dashboard/components/SaveDashboard/SaveDashboard';
import appEvents from 'src/core/library/utils/app_events';
import tracker from 'src/core/services/changeTracker';

import './Header.less'
import { DashboardModel } from 'src/views/dashboard/model';
import localeData from 'src/core/library/locale'

interface Props {
    locale: string
    breadcrumbText: string
}

const { Header } = Layout

function HeaderWrapper(props: Props) { 
   const [dashboard,setDashboard] = useState(null)
   const [dashboardComponent, setDashboardComponent] = useState(null)
   appEvents.on('open-dashboard-save-modal', (dash:DashboardModel) => {
       setDashboard(dash)
   })

   appEvents.on('set-dashboard-page-header',(component) => {
       if (!dashboardComponent) {
        setDashboardComponent(component)
       }
   })

   const [backButtonComponent, setBackButtonComponent] = useState(null)
   appEvents.on('set-panel-viewing-back-button',(component) => {
        if (!backButtonComponent) {
            setBackButtonComponent(component)
        }
    })
   
    return (
        <Header className="datav-header">
            <div className='datav-header-inner'>
                <div>
                    <div className="ub-mr1">{backButtonComponent}</div>
                    <BreadcrumbWrapper text={props.breadcrumbText}/>
                </div>
                <div>
                    <div className="ub-mr1">{dashboardComponent}</div>
                    <TimePickerWrapper />
                </div>
            </div>

            { dashboard  && <SaveDashboard dashboard={dashboard}  setDashboard={setDashboard}/>}

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
});

export default connect(mapStateToProps)(HeaderWrapper);