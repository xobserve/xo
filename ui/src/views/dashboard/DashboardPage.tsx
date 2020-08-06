import React, { useEffect, useState } from 'react';
import _ from 'lodash'
import classNames from 'classnames'

import { DashboardModel } from './model/DashboardModel'
import { Button,Result, notification, Tooltip} from 'antd'
import { DashboardGrid } from './DashGrid'
import { getTimeSrv } from 'src/core/services/time'
import { TimeRange, CustomScrollbar, Icon, config } from 'src/packages/datav-core'

import './DashboardPage.less'
import { initDashboard } from './model/initDashboard';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { PanelModel } from './model';
import { PanelEditor } from './components/PanelEditor/PanelEditor'
import { store } from 'src/store/store';
import { isInDashboardPage, cleanUpDashboard } from 'src/store/reducers/dashboard';
import { StoreState, CoreEvents } from 'src/types'
import { connect } from 'react-redux';
import appEvents from 'src/core/library/utils/app_events';
import { updateBreadcrumbText } from 'src/store/reducers/application';
import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import tracker from 'src/core/services/changeTracker'
import { DashboardSettings } from './components/Setting/Setting'
import { updateLocation } from 'src/store/reducers/location';
import { SubMenu } from './components/SubMenu/SubMenu';
import { BackButton } from '../components/BackButton/BackButton';
import { PanelInspector, InspectTab } from '../components/Inspector/PanelInspector';
import impressionSrv from 'src/core/services/impression'

import { FormattedMessage as Message} from 'react-intl';

interface DashboardPageProps {
    routeID?: string
    dashboard: DashboardModel | null;
    editPanelId?: string | null 
    viewPanelId?: string | null
    settingView?: string | null
    inspectPanelId?: string | null 
    inspectTab? : InspectTab
    initDashboard: typeof initDashboard
    initErrorStatus: number
}

interface State {
    uid: string;
    scrollTop: number;
    updateScrollTop?: number;
    rememberScrollTop: number;

    editPanel: PanelModel | null
    viewPanel: PanelModel | null
}

class DashboardPage extends React.PureComponent<DashboardPageProps & RouteComponentProps, State> {
    // first init dashboard or just saved dashboard
    originDash: DashboardModel;

    constructor(props) {
        super(props)
        this.state = {
            uid: this.getUID(),
            scrollTop: 0,
            rememberScrollTop: 0,

            editPanel: null,
            viewPanel: null
        };


    }

    // uid有两种方式传入：路径名的一部分或者通过路径名去查询uid
    getUID() {
        return this.props.match.params['uid'] || this.props.routeID && !_.startsWith(this.props.routeID, 'datav-fix-menu') && this.props.routeID || null
    }

    componentDidMount() {
        // register to changeTracker
        //@todo : 为了方便测试，暂时屏蔽
        // tracker.register(this.hasChanges.bind(this))

        this.init = this.init.bind(this)
        this.setOriginDash = this.setOriginDash.bind(this)
        this.props.initDashboard(this.state.uid, (ds) => this.init(ds))

        // register time service notifier
        getTimeSrv().notifyTimeUpdate = this.timeRangeUpdated


        this.saveDashboard = this.saveDashboard.bind(this)
        appEvents.on(CoreEvents.keybindingSaveDashboard, this.saveDashboard)


        appEvents.on(CoreEvents.dashboardSaved, this.setOriginDash);


        // because appEvents.off has no effect , so we introduce a state
        store.dispatch(isInDashboardPage(true))
    }

    setOriginDash() {
        this.originDash = _.cloneDeep(this.props.dashboard.getSaveModelClone());
    }
    init(ds) {
        this.originDash = _.cloneDeep(ds)

        store.dispatch(updateBreadcrumbText(ds.title))

        // when dashboard page loaded, we need show setting and save buttons in header nav
        appEvents.emit('set-dashboard-page-header',
            <>
                <Tooltip title={<Message id={'dashboard.addPanel'}/>}><Button icon={<Icon name="panel-add" />} onClick={() => this.onAddPanel()} /></Tooltip>
                <Tooltip title={<Message id={'common.save'}/>}><Button icon={<SaveOutlined onClick={() => this.saveDashboard()} />} /></Tooltip>
                <Tooltip title={<Message id={'common.setting'}/>}>
                    <Button icon={<SettingOutlined />} onClick={
                        () => store.dispatch(updateLocation({ query: { settingView: 'general' }, partial: true }))
                    } />
                </Tooltip>
            </>)
        impressionSrv.addDashboardImpression(ds.id);
    }
    componentWillUnmount() {
        // unregister from changeTracker
        tracker.unregister()

        appEvents.off(CoreEvents.keybindingSaveDashboard, this.saveDashboard)
        appEvents.off(CoreEvents.dashboardSaved, this.setOriginDash);

        appEvents.emit('set-dashboard-page-header', null)


        // unregister time service notifier
        getTimeSrv().notifyTimeUpdate = null

        store.dispatch(isInDashboardPage(false))

        store.dispatch(cleanUpDashboard())
    }

    componentDidUpdate() {
        if (this.props.initErrorStatus === 403) {
            return 
        }
        
        const { dashboard, editPanelId, viewPanelId } = this.props
        const { editPanel, viewPanel } = this.state

        if (!dashboard) {
            return
        }

        if (!editPanel && editPanelId) {
            const panel = this.getPanelByIdFromUrlParam(editPanelId)
            this.setState({
                ...this.state,
                editPanel: panel
            });
        }

        // leaving edit mode
        if (editPanel && !editPanelId) {
            this.setState({
                ...this.state,
                editPanel: null
            });
        }

        // entering view mode
        if (!viewPanel && viewPanelId) {
            const panel = this.getPanelByIdFromUrlParam(viewPanelId)
            this.setPanelFullscreenClass(true);
            dashboard.initViewPanel(panel);
            this.setState({
                viewPanel: panel,
                rememberScrollTop: this.state.scrollTop,
            });
            appEvents.emit('set-panel-viewing-back-button',
                <>
                    <BackButton onClick={() => store.dispatch(updateLocation({ query: { viewPanel: null }, partial: true }))} surface="panel" />
                </>)
        }

        // leaving view mode
        if (viewPanel && !viewPanelId) {
            this.setPanelFullscreenClass(false);
            dashboard.exitViewPanel(viewPanel);
            this.setState(
                { viewPanel: null, updateScrollTop: this.state.rememberScrollTop },
                this.triggerPanelsRendering.bind(this)
            );
            appEvents.emit('set-panel-viewing-back-button',null)
        }
    }


    hasChanges() {
        const current = cleanDashboardFromIgnoredChanges(this.props.dashboard.getSaveModelClone());
        const original = cleanDashboardFromIgnoredChanges(this.originDash);

        const currentJson = JSON.stringify(current)
        const originalJson = JSON.stringify(original)


        return currentJson !== originalJson;
    }

    triggerForceUpdate = () => {
        this.forceUpdate();
    };

    triggerPanelsRendering() {
        try {
            this.props.dashboard!.render();
        } catch (err) {
            console.error(err);
            //   this.props.notifyApp(createErrorNotification(`Panel rendering error`, err));
        }
    }

    setPanelFullscreenClass(isFullscreen: boolean) {
        $('body').toggleClass('panel-in-fullscreen', isFullscreen);
    }

    onAddPanel = () => {
        const { dashboard } = this.props;

        // Return if the "Add panel" exists already
        if (dashboard.panels.length > 0 && dashboard.panels[0].type === 'add-panel') {
            return;
        }

        dashboard.addPanel({
            type: 'add-panel',
            gridPos: { x: 0, y: 0, w: 12, h: 8 },
            title: 'Panel Title',
        });

        // scroll to top after adding panel
        this.setState({ updateScrollTop: 0 });
    };

    saveDashboard() {
        appEvents.emit('open-dashboard-save-modal', this.props.dashboard)
    }

    getPanelByIdFromUrlParam(rawPanelId: string): PanelModel {
        const { dashboard } = this.props;

        const panelId = parseInt(rawPanelId!, 10);
        dashboard!.expandParentRowFor(panelId);
        const panel = dashboard!.getPanelById(panelId);

        if (!panel) {
            return
        }

        return panel
    }

    timeRangeUpdated = (_: TimeRange) => {
        this.props.dashboard?.startRefresh()
    }


    getInspectPanel() {
        const { dashboard, inspectPanelId } = this.props;
        if (!dashboard || !inspectPanelId) {
        return null;
        }

        const inspectPanel = dashboard.getPanelById(parseInt(inspectPanelId, 10));

        // cannot inspect panels plugin is not already loaded
        if (!inspectPanel) {
        return null;
        }

        return inspectPanel;
    }

    setScrollTop = (e: React.MouseEvent<HTMLElement>): void => {
        const target = e.target as HTMLElement;
        this.setState({ scrollTop: target.scrollTop, updateScrollTop: null });
    };
    
    render() {
        const { dashboard, settingView,inspectTab,initErrorStatus} = this.props
        if (initErrorStatus == 403) {
            return (
                <div>
                    <Result
                        status="403"
                        title="403"
                        subTitle="Sorry, you are not authorized to access this page."
                        extra={<Button type="primary">Apply for acess rights</Button>}
                    />
                </div>
            )
        }
        const { updateScrollTop, scrollTop, editPanel, viewPanel } = this.state
        if (!dashboard) {
            return null
        }
        const approximateScrollTop = Math.round(scrollTop / 25) * 25;
        const inspectPanel = this.getInspectPanel();
        const gridWrapperClasses = classNames({
            'dashboard-container': true,
            'dashboard-container--has-submenu': dashboard.meta.submenuEnabled,
        });
        
        return (
            <div>
                <div className="scroll-canvas scroll-canvas--dashboard">
                    <CustomScrollbar
                        autoHeightMin="100%"
                        setScrollTop={this.setScrollTop}
                        scrollTop={updateScrollTop}
                        updateAfterMountMs={500}
                        className="custom-scrollbar--page"
                    >
                        <div className={gridWrapperClasses}>
                            {!editPanel && config.featureToggles.newVariables && <SubMenu dashboard={dashboard} />}
                            <DashboardGrid
                                dashboard={dashboard}
                                viewPanel={viewPanel}
                                isPanelEditorOpen={!editPanel}
                                scrollTop={approximateScrollTop}
                            />
                        </div>
                    </CustomScrollbar>
                </div>
                
                {inspectPanel && <PanelInspector dashboard={dashboard} panel={inspectPanel} defaultTab={inspectTab} />}
                {editPanel && <PanelEditor dashboard={dashboard} sourcePanel={editPanel} />}
                {settingView && <DashboardSettings dashboard={dashboard} viewId={this.props.settingView} />}
            </div>
        )
    }
}

// remove stuff that should not count in diff
function cleanDashboardFromIgnoredChanges(dashData: any) {
    // need to new up the domain model class to get access to expand / collapse row logic
    const model = new DashboardModel(dashData);

    // Expand all rows before making comparison. This is required because row expand / collapse
    // change order of panel array and panel positions.
    model.expandRows();

    const dash = model.getSaveModelClone();

    dash.schemaVersion = 0;

    // ignore iteration property
    delete dash.iteration;

    dash.panels = _.filter(dash.panels, panel => {
        if (panel.repeatPanelId) {
            return false;
        }


        // ignore panel legend sort
        if (panel.options.legend) {
            delete panel.options.legend.sort;
            delete panel.options.legend.sortDesc;
        }

        return true;
    });

    // ignore template variable values
    _.each(dash.getVariables(), variable => {
        variable.current = null;
        variable.options = null;
        variable.filters = null;
    });

    return dash;
}


export const mapStateToProps = (state: StoreState) => {
    return {
        initPhase: state.dashboard.initPhase,
        isInitSlow: state.dashboard.isInitSlow,
        editPanelId: state.location.query.editPanel,
        viewPanelId: state.location.query.viewPanel,
        settingView: state.location.query.settingView,
        dashboard: state.dashboard.dashboard,
        initErrorStatus: state.dashboard.initErrorStatus,
        isPanelEditorOpen: state.panelEditor.isOpen,
        inspectPanelId: state.location.query.inspect,
        inspectTab: state.location.query.inspectTab,
    }
}

const mapDispatchToProps = {
    initDashboard,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DashboardPage))



