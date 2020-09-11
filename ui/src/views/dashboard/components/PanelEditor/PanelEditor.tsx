import React, { PureComponent } from 'react';
import _ from 'lodash'
import { FieldConfigSource, PanelPlugin } from 'src/packages/datav-core';
import { Row, Button, message} from 'antd'
import { cx } from 'emotion';
import AutoSizer from 'react-virtualized-auto-sizer';

import { PanelModel, DashboardModel } from '../../model';

import  PanelWrapper from '../../PanelWrapper';

import SplitPane from 'react-split-pane';

import { Unsubscribable } from 'rxjs';
import { DisplayMode, PanelEditorTab, PanelEditorUIState } from './types';
// import { PanelEditorTabs } from './PanelEditorTabs';


import { calculatePanelSize } from './utils';

import { OptionsPaneContent } from './OptionsPane/OptionsPaneContent';
import { VariableModel } from 'src/types/templating';
// import { SubMenuItems } from 'app/features/dashboard/components/SubMenu/SubMenuItems';
import { BackButton } from 'src/views/components/BackButton/BackButton';

// import { SaveDashboardModalProxy } from '../SaveDashboard/SaveDashboardModalProxy';
import { CoreEvents, PanelState } from 'src/types';
import appEvents from 'src/core/library/utils/app_events';
import './PanelEditor.less'
import localStore from 'src/core/library/utils/localStore';
import { connect } from 'react-redux';
import { StoreState } from 'src/types'
import { getPanelEditorTabs } from './get_editor_tabs'
import { SettingOutlined } from '@ant-design/icons';
import { PanelEditorTabs } from './PanelEditorTabs';
import './PanelEditor.less'
import { updateEditorInitState, closeCompleted, setDiscardChanges } from 'src/store/reducers/panelEditor';
import { store } from 'src/store/store';
import { updateLocation ,LocationState} from 'src/store/reducers/location';
import SaveDahboard from '../SaveDashboard/SaveDashboard'
import { cleanUpEditPanel } from 'src/store/reducers/dashboard';
import { getUrlParams } from 'src/core/library/utils/url';
import { FormattedMessage } from 'react-intl';

export const PANEL_EDITOR_UI_STATE_STORAGE_KEY = 'grafana.dashboard.editor.ui';

export const DEFAULT_PANEL_EDITOR_UI_STATE: PanelEditorUIState = {
    isPanelOptionsVisible: true,
    rightPaneSize: 400,
    topPaneSize: '45%',
    mode: DisplayMode.Fill,
};

enum Pane {
    Right,
    Top,
}

interface Props {
    plugin?: PanelPlugin;
    dashboard: DashboardModel;
    sourcePanel: PanelModel;
    tabs?: PanelEditorTab[];
    panel?: PanelModel;
    initDone?: boolean;
    location?: LocationState;
}

interface State {
    uiState: PanelEditorUIState;
    saveMoalVisible: boolean
}


export class PanelEditorUnconnected extends PureComponent<Props, State> {
    querySubscription: Unsubscribable;

    constructor(props) {
        super(props)
        this.state = {
            uiState: {
                ...DEFAULT_PANEL_EDITOR_UI_STATE,
                ...localStore.getObject(PANEL_EDITOR_UI_STATE_STORAGE_KEY, DEFAULT_PANEL_EDITOR_UI_STATE),
            },
            saveMoalVisible: false
        }
        this.setModalVisible = this.setModalVisible.bind(this)
    }

    componentDidMount() {
        this.initPanelEditor();
    }

    componentWillUnmount() {
       
    }

    exitPanelEditor = () => {
        this.panelEditorCleanUp();
        store.dispatch(updateLocation({
            query: { editPanel: null, tab: null },
            partial: true,
        }));
    }

    initPanelEditor = () => {
        const panel = this.props.dashboard.initEditPanel(this.props.sourcePanel);
        store.dispatch(updateEditorInitState({
            panel: panel,
            sourcePanel:this.props.sourcePanel
        }))
    }
    panelEditorCleanUp = () => {
        const {panel} = this.props
        const shouldDiscardChanges  = store.getState().panelEditor.shouldDiscardChanges
        const { sourcePanel, dashboard } = this.props
        if (!shouldDiscardChanges) {

            const modifiedSaveModel = panel.getSaveModel();
            const panelTypeChanged = this.props.sourcePanel.type !== panel.type;
            // restore the source panel id before we update source panel
            modifiedSaveModel.id = sourcePanel.id;
            sourcePanel.restoreModel(modifiedSaveModel);

            // Loaded plugin is not included in the persisted properties
            // So is not handled by restoreModel
            sourcePanel.plugin = panel.plugin;
            if (panelTypeChanged) {
                // dispatch(panelModelAndPluginReady({ panelId: sourcePanel.id, plugin: panel.plugin! }));
            }

            // Resend last query result on source panel query runner
            // But do this after the panel edit editor exit process has completed
            setTimeout(() => {
                sourcePanel.getQueryRunner().useLastResultFrom(panel.getQueryRunner());
            }, 20);
        }

        if (dashboard) {
            dashboard.exitPanelEditor();
        }

        store.dispatch(cleanUpEditPanel())
        // store.dispatch(closeCompleted());
    }

    onPanelExit = () => {
        this.exitPanelEditor()
    };

    onDiscard = () => {
        store.dispatch(setDiscardChanges(true))
        this.exitPanelEditor()
    };


    onOpenDashboardSettings = () => {
        store.dispatch(updateLocation({ query: { editview: 'settings' }, partial: true }));
    };

    onSaveDashboard = () => {
        appEvents.emit(CoreEvents.keybindingSaveDashboard,this.props.dashboard)
    };

    setModalVisible(status) {
        setTimeout(() =>  this.setState({...this.state, saveMoalVisible: status}),100)
    }
    
    onChangeTab = (tab: PanelEditorTab) => {
        store.dispatch(updateLocation({ query: { tab: tab.id }, partial: true }));
    };

    onFieldConfigChange = (config: FieldConfigSource) => {
        const { panel } = this.props;

        panel.updateFieldConfig({
            ...config,
        });
        this.forceUpdate();
    };

    onPanelOptionsChanged = (options: any) => {
        this.props.panel.updateOptions(options);
        this.forceUpdate();
    };

    onPanelConfigChanged = (configKey: string, value: any) => {
        this.props.panel[configKey] = value;
        this.props.panel.render();
        this.forceUpdate();
    };

    onDragFinished = (pane: Pane, size?: number) => {
        document.body.style.cursor = 'auto';

        // When the drag handle is just clicked size is undefined
        if (!size) {
            return;
        }

        const targetPane = pane === Pane.Top ? 'topPaneSize' : 'rightPaneSize';
        this.updatePanelEditorUIState({
            [targetPane]: size,
        });
    };

    onDragStarted = () => {
        document.body.style.cursor = 'row-resize';
    };

    onDiplayModeChange = (mode: DisplayMode) => {
        this.updatePanelEditorUIState({
            mode: mode,
        });
    };

    updatePanelEditorUIState(ui: Partial<PanelEditorUIState>) {
        const uiState = { ...this.state.uiState, ...ui }
        this.setState({
            ...this.state,
            uiState
        })

        try {
            localStore.setObject(PANEL_EDITOR_UI_STATE_STORAGE_KEY, uiState);
        } catch (error) {
            message.error(error)
        }
    }

    onTogglePanelOptions = () => {
        const { uiState } = this.state;
        this.updatePanelEditorUIState({ isPanelOptionsVisible: !uiState.isPanelOptionsVisible });
    };

    renderPanel = () => {
        const { dashboard, tabs,panel } = this.props;
        const {  uiState } = this.state
        return (
            <div className={cx('mainPaneWrapper', tabs.length === 0 && 'mainPaneWrapperNoTabs')} style={{ paddingRight: uiState.isPanelOptionsVisible ? 0 : '16px' }}>
                <div className={'panelWrapper'}>
                    <AutoSizer>
                        {({ width, height }) => {
                            if (width < 3 || height < 3) {
                                return null;
                            }
                            return (
                                <div className={'centeringContainer'} style={{ width, height }}>
                                    <div style={calculatePanelSize(uiState.mode, width, height, panel)}>
                                        <PanelWrapper
                                            dashboard={dashboard}
                                            panel={panel}
                                            isEditing={true}
                                            isViewing={false}
                                            isInView={true}
                                        />
                                    </div>
                                </div>
                            );
                        }}
                    </AutoSizer>
                </div>
            </div>
        );
    };
    renderHorizontalSplit() {
        const { dashboard, tabs ,panel} = this.props;
        const { uiState } = this.state
        return tabs.length > 0 ? (
            <SplitPane
                split="horizontal"
                minSize={200}
                primary="first"
                /* Use persisted state for default size */
                defaultSize={uiState.topPaneSize}
                pane2Style={{ minHeight: 0 }}
                resizerClassName={'resizerH'}
                onDragStarted={this.onDragStarted}
                onDragFinished={size => this.onDragFinished(Pane.Top, size)}
            >
                {this.renderPanel()}
                <div className={'tabsWrapper'}>
                    <PanelEditorTabs panel={panel} dashboard={dashboard} tabs={tabs} onChangeTab={this.onChangeTab} />
                </div>
            </SplitPane>
        ) : (
                this.renderPanel()
            );
    }

    renderTemplateVariables() {
        // const { variables } = this.props;

        // if (!variables.length) {
        //     return null;
        // }

        return (
            <div className={'variablesWrapper'}>
                {/* <SubMenuItems variables={variables} /> */}
            </div>
        );
    }


    editorToolbar() {
        const { dashboard } = this.props;

        return (
            <div className={'editorToolbar'}>
                <Row justify="space-between" align="middle" style={{width:'100%'}}>
                    <div className={'toolbarLeft'}>
                            <BackButton onClick={this.onPanelExit} surface="panel" />
                            <span className={'editorTitle'}>{dashboard.title} / <FormattedMessage id="panel.edit"/></span>
                    </div>

                    <div>
                        <Row align="middle">
                            {/* <Button
                                icon={<SettingOutlined />}
                                onClick={this.onOpenDashboardSettings}
                                title="Open dashboad settings"
                            /> */}
                            <Button onClick={this.onDiscard} title="Undo all changes">
                                <FormattedMessage id="common.discard"/>
                             </Button>
                            <Button onClick={this.onSaveDashboard} title="Apply changes and save dashboard">
                            <FormattedMessage id="common.save"/>
                            </Button>
                            <Button onClick={this.onPanelExit} title="Apply changes and go back to dashboard">
                            <FormattedMessage id="common.apply"/>
                            </Button>
                        </Row>
                    </div>
                </Row>
            </div>
        );
    }

    renderOptionsPane() {
      const { plugin, dashboard,panel} = this.props;
      const { uiState} = this.state

      if (!plugin) {
        return <div />;
      }

      return (
        <OptionsPaneContent
          plugin={plugin}
          dashboard={dashboard}
          panel={panel}
          width={uiState.rightPaneSize as number}
          onClose={this.onTogglePanelOptions}
          onFieldConfigsChange={this.onFieldConfigChange}
          onPanelOptionsChanged={this.onPanelOptionsChanged}
          onPanelConfigChange={this.onPanelConfigChanged}
        />
      );
    }

    renderWithOptionsPane() {
        const { uiState } = this.state;

        return (
            <SplitPane
                split="vertical"
                minSize={300}
                primary="second"
                /* Use persisted state for default size */
                defaultSize={uiState.rightPaneSize}
                resizerClassName={'resizerV'}
                onDragStarted={() => (document.body.style.cursor = 'col-resize')}
                onDragFinished={size => this.onDragFinished(Pane.Right, size)}
            >
                {this.renderHorizontalSplit()}
                {this.renderOptionsPane()}
            </SplitPane>
        );
    }

    render() {
        const {initDone} = this.props
        const { uiState } = this.state;
        if (!initDone) {
            return null;
        }

        return (
            <div className="panel-editor">
                <div className={'wrapper'}>
                    {this.editorToolbar()}
                    <div className={'verticalSplitPanesWrapper'}>
                        {uiState.isPanelOptionsVisible ? this.renderWithOptionsPane() : this.renderHorizontalSplit()}
                    </div>
                </div>
            </div>
        );
    }
}





export const mapStateToProps = (state: StoreState, props: Props) => {
    let panel = state.panelEditor.panel;
    if (!panel) {
        panel = new PanelModel({})
    }

    const {plugin} = getPanelStateById(state.dashboard, panel.id);
    return {
        location: state.location,
        initDone: state.panelEditor.initDone,
        panel: panel,
        plugin: plugin,
        tabs: getPanelEditorTabs(plugin,getUrlParams().tab)
    }
}

export const PanelEditor = connect(mapStateToProps)(PanelEditorUnconnected);


export function getPanelStateById(state: any, panelId: number): PanelState {
    if (!panelId) {
      return {} as PanelState;
    }
  
    return state.panels[panelId] ?? ({} as PanelState);
  }