import React from 'react';
import _ from 'lodash'
import classNames from 'classnames'
import queryString from 'query-string'

import { DashboardModel } from './model/DashboardModel'
import { Button, Result } from 'antd'
import { DashboardGrid } from './DashGrid'
import { getTimeSrv } from 'src/core/services/time'
import { TimeRange, config, getBackendSrv, currentLang } from 'src/packages/datav-core/src'


import './DashboardPage.less'
import { initDashboard, setVariablesFromUrl} from './model/initDashboard';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { PanelModel } from './model';
import { PanelEditor } from './components/PanelEditor/PanelEditor'
import { store, dispatch } from 'src/store/store';
import { isInDashboardPage, cleanUpDashboard} from 'src/store/reducers/dashboard';
import { StoreState, CoreEvents, GlobalVariableUid, ViewState } from 'src/types'
import { connect } from 'react-redux';
import appEvents from 'src/core/library/utils/app_events';
import { updateBreadcrumbText } from 'src/store/reducers/application';
import tracker from 'src/core/services/changeTracker'
import { DashboardSettings } from './components/Setting/Setting'
import { updateLocation } from 'src/store/reducers/location';
import { SubMenu } from './components/SubMenu/SubMenu';
import { BackButton } from '../components/BackButton/BackButton';

import { PanelInspector } from './components/Inspector/PanelInspector';
import impressionSrv from 'src/core/services/impression'

import { onTimeRangeUpdated } from '../variables/state/actions';
import HeaderWrapper from './components/Header/Header'
import { addParamsToUrl, addParamToUrl, updateUrl } from 'src/core/library/utils/url';
import { getVariables } from 'src/views/variables/state/selectors'
import { saveDashboard } from './components/SaveDashboard/SaveDashboard';
import { formatDocumentTitle } from 'src/core/library/utils/date';
import { InspectTab } from '../components/Inspector/types';
import { CustomScrollbar, ScrollbarPosition } from 'src/packages/datav-core/src/ui';


interface DashboardPageProps {
    routeID?: string
    dashboard: DashboardModel | null;
    editPanelId?: string | null
    viewPanelId?: string | null
    settingView?: string | null
    inspectPanelId?: string | null
    inspectTab?: InspectTab
    initDashboard: typeof initDashboard
    setVariablesFromUrl: typeof setVariablesFromUrl
    initErrorStatus: number
    viewState: ViewState
}

interface State {
    uid: string;
    scrollTop: number;
    updateScrollTop?: number;
    rememberScrollTop: number;

    editPanel: PanelModel | null
    viewPanel: PanelModel | null
    panelAlertStates: any
}

class DashboardPage extends React.PureComponent<DashboardPageProps & RouteComponentProps, State> {
    // first init dashboard or just saved dashboard
    originDash: DashboardModel;
    getAlertStateHandler: any;
    autoSaveHandler = null

    constructor(props) {
        super(props)
        this.state = {
            uid: this.getUID(),
            scrollTop: 0,
            rememberScrollTop: 0,

            editPanel: null,
            viewPanel: null,
            panelAlertStates: {}
        };


    }

    // uid有两种方式传入：路径名的一部分或者通过路径名去查询uid
    getUID() {
        return this.props.match.params['uid'] || this.props.routeID && !_.startsWith(this.props.routeID, 'datav-fix-menu') && this.props.routeID || null
    }

    componentDidMount() {
        // register to changeTracker
        tracker.register(this.hasChanges.bind(this))

        this.init = this.init.bind(this)
        this.setOriginDash = this.setOriginDash.bind(this)
        this.props.initDashboard(this.state.uid, (ds) => this.init(ds))

        // register time service notifier
        getTimeSrv().notifyTimeUpdate = this.timeRangeUpdated

        this.saveDashboard = this.saveDashboard.bind(this)
        this.onUpdateUrl = this.onUpdateUrl.bind(this)
        this.handleAutoSave = this.handleAutoSave.bind(this)
        this.updateVariablesFromUrl = this.updateVariablesFromUrl.bind(this)

        appEvents.on(CoreEvents.KeybindingSaveDashboard, this.saveDashboard)

        appEvents.on(CoreEvents.DashboardSaved, this.setOriginDash);

        appEvents.on('dashboard-auto-save', this.handleAutoSave)

        appEvents.on('update-variables-from-url',this.updateVariablesFromUrl)
        // because appEvents.off has no effect , so we introduce a state
        store.dispatch(isInDashboardPage(true))
    }

    updateVariablesFromUrl() {
        if (this.originDash) {
            // const d = this.props.dashboard.getSaveModelClone()
            const ds = _.cloneDeep(this.props.dashboard)
            setTimeout(() => {this.props.setVariablesFromUrl(ds)}, 500)
        }
    }

    // when dashboard init or saved, we need to handle auto save for this dashboard
    handleAutoSave(autoSave) {
        clearInterval(this.autoSaveHandler)
        if (autoSave){
            const _this = this
            this.autoSaveHandler = setInterval(() => {
                saveDashboard(this.props.dashboard.title,this.props.dashboard.meta.folderId,this.props.dashboard,this.originDash)
            },10000)
        }
    }

    setOriginDash() {
        this.originDash = _.cloneDeep(this.props.dashboard.getSaveModelClone());
    }
    init(ds:DashboardModel) {
        this.originDash = _.cloneDeep(ds)

        store.dispatch(updateBreadcrumbText(ds.title))

        impressionSrv.addDashboardImpression(ds.id);

        if (ds.id) {
            getBackendSrv().get(`/api/alerting/state/${ds.id}`).then((res) => {
                this.setState({
                    ...this.state,
                    panelAlertStates: res.data
                })
            })

            // looply get alert states
            this.getAlertStateHandler = setInterval(async () => {
                const res = await getBackendSrv().get(`/api/alerting/state/${ds.id}`)
                this.setState({
                    ...this.state,
                    panelAlertStates: res.data
                })
            }, 30000)

            // init auto save option
            this.handleAutoSave(ds.autoSave)
        }
 
        document.title = formatDocumentTitle(ds.title)

        this.onUpdateUrl()
    }

    componentWillUnmount() {
        this.originDash = null
        // unregister from changeTracker
        tracker.unregister()

        appEvents.off(CoreEvents.KeybindingSaveDashboard, this.saveDashboard)
        appEvents.off(CoreEvents.DashboardSaved, this.setOriginDash);
        appEvents.off('dashboard-auto-save', this.handleAutoSave)
        // unregister time service notifier
        getTimeSrv().notifyTimeUpdate = null

        store.dispatch(isInDashboardPage(false))

        store.dispatch(cleanUpDashboard())

        clearInterval(this.getAlertStateHandler)
        clearInterval(this.autoSaveHandler)
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
            appEvents.emit('set-panel-viewing-back-button', null)
        }
    }


    hasChanges() {
        if (!this.props.dashboard.meta.canSave) {
            return false
        }
        
        const current = cleanDashboardFromIgnoredChanges(this.props.dashboard.getSaveModelClone());
        const original = cleanDashboardFromIgnoredChanges(this.originDash);

        const currentJson = JSON.stringify(current)
        const originalJson = JSON.stringify(original)


        return currentJson !== originalJson;
    }

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

    saveDashboard(data?: DashboardModel) {
        const dash = data??this.props.dashboard

        appEvents.emit('open-dashboard-save-modal', [dash,this.originDash])
    }

    onUpdateUrl() {
        const timeSrv = getTimeSrv()
        const urlRange = timeSrv.timeRangeForUrl();

        const variables = getVariables()

        variables.forEach((variable: any) => {
            const display =this.originDash.variablesDiplay.indexOf(variable.name) === -1 
            if (display) {
                urlRange['var-'+variable.name] = variable.current.value
            }
        })

        store.dispatch(updateLocation({query: urlRange,partial: true}))
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

    timeRangeUpdated = (range: TimeRange) => {
        dispatch(onTimeRangeUpdated(range));
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

    setScrollTop = ({ scrollTop }: ScrollbarPosition): void => {
        this.setState({ scrollTop, updateScrollTop: undefined });
      };
    

    render() {
        const { dashboard, settingView, inspectTab, initErrorStatus,viewState} = this.props
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
        const { updateScrollTop, scrollTop, editPanel, viewPanel, panelAlertStates} = this.state
        if (!dashboard) {
            return null
        }
        const approximateScrollTop = Math.round(scrollTop / 25) * 25;
        const inspectPanel = this.getInspectPanel();
        const gridWrapperClasses = classNames({
            'dashboard-container': true,
            'dashboard-container--has-submenu': dashboard.meta.submenuEnabled,
        });

        const variables = getVariables()
        return (
            <div>
                <HeaderWrapper viewState={viewState} dashboard={dashboard} onAddPanel={this.onAddPanel} onSaveDashboard={this.saveDashboard} onUpdateUrl={this.onUpdateUrl} />
                <div className="scroll-canvas scroll-canvas--dashboard" style={{height: dashboard.showHeader === true ?  'calc(100% - 48px)' : '100%'}}>
                    <CustomScrollbar
                        autoHeightMin="100%"
                        setScrollTop={this.setScrollTop}
                        scrollTop={updateScrollTop}
                        updateAfterMountMs={500}
                        className="custom-scrollbar--page"
                    >
                        <div className={gridWrapperClasses}>
                            {dashboard.showHeader && !editPanel && config.featureToggles.newVariables && variables.length > 0 &&  <SubMenu dashboard={dashboard} />}
                            <DashboardGrid
                                dashboard={dashboard}
                                viewPanel={viewPanel}
                                editPanel={editPanel}
                                scrollTop={approximateScrollTop}
                            />
                        </div>
                    </CustomScrollbar>
                </div>

                {inspectPanel && <PanelInspector dashboard={dashboard} panel={inspectPanel}  />}
                {editPanel && <PanelEditor dashboard={dashboard} sourcePanel={editPanel} />}
                {settingView && <DashboardSettings dashboard={dashboard} viewId={this.props.dashboard.uid !== GlobalVariableUid ? this.props.settingView : 'variables'} />}
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
        if (panel.options?.legend) {
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

    delete(dash.objectId)
    
    return dash;
}


export const mapStateToProps = (state: StoreState) => {
    const viewState = state.location.query.view ?? ViewState.Normal
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
        viewState: viewState,
    }
}

const mapDispatchToProps = {
    initDashboard,
    setVariablesFromUrl
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DashboardPage))



