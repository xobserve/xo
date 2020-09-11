import React, { PureComponent } from 'react';
import classNames from 'classnames';
import AutoSizer from 'react-virtualized-auto-sizer';
import './PanelWrapper.less'
import {PanelModel} from './model/PanelModel'
import {DashboardModel} from './model/DashboardModel'
import { PanelPlugin } from 'src/packages/datav-core/src';
import {importPanelPlugin} from 'src/plugins/loader'
import { store } from 'src/store/store';
import { setPanelPlugin } from 'src/store/reducers/plugins';
import {Panel} from './Panel'
import { updatePanel } from 'src/store/reducers/dashboard';
import {StoreState} from 'src/types'
import { connect } from 'react-redux';

interface Props {
    panel: PanelModel
    plugin?: PanelPlugin | null
    dashboard: DashboardModel
    isEditing: boolean;
    isViewing: boolean;
    isInView: boolean;
    alertState: string;
}

interface State {
    isLazy: boolean
}

class PanelWrapper extends PureComponent<Props, State>{
    element: HTMLElement;
    specialPanels: { [key: string]: Function } = {};
  
    constructor(props: Props) {
      super(props);
      this.state = {
        isLazy: !props.isInView
      };
    }
  
    componentDidMount() {
      // load plugin to panel
      this.initPlugin(this.props.panel)
    }
  
    componentDidUpdate() {
      if (!this.props.plugin) {
        this.initPlugin(this.props.panel)
      }

      if (this.state.isLazy && this.props.isInView) {
        this.setState({ isLazy: false });
      }
    }
    
    async initPlugin(panel: PanelModel) {
        let plugin = store.getState().plugins.panels[panel.type]
        if (!plugin) {
          plugin = await this.loadPlugin(panel.type)
          // store plugin 
          store.dispatch(setPanelPlugin(plugin))
        }

        if (!panel.plugin) {
          panel.pluginLoaded(plugin)
        }

        store.dispatch(updatePanel({panelId:panel.id,plugin}))
    }
    
    async loadPlugin(type:string) : Promise<PanelPlugin> {
      const plugin = importPanelPlugin(type)
      return plugin
    }

    onMouseEnter = () => {
      this.props.dashboard.setPanelFocus(this.props.panel.id);
    };
  
    onMouseLeave = () => {
      this.props.dashboard.setPanelFocus(0);
    };
  
    renderPanel(plugin: PanelPlugin) {
      const { dashboard, panel, isViewing, isInView, isEditing,alertState} = this.props;
      return (
        <AutoSizer>
          {({ width, height }) => {
            if (width === 0) {
              return null;
            }
            
            return (
              <Panel
                plugin={plugin}
                panel={panel}
                dashboard={dashboard}
                isViewing={isViewing}
                isEditing={isEditing}
                isInView={isInView}
                width={width}
                height={height}
                alertState={alertState}
              />
            );
          }}
        </AutoSizer>
      );
    }
  
    render() {
      const { isViewing ,plugin} = this.props;
      const { isLazy } = this.state;
  
      // if we have not loaded plugin exports yet, wait
      if (!plugin) {
        return null;
      }
  
      // If we are lazy state don't render anything
      if (isLazy) {
        return null;
      }
  
      const panelWrapperClass = classNames({
        'panel-wrapper': true,
        'panel-wrapper--view': isViewing,
      });
  
      return (
        <div className={panelWrapperClass} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
          {this.renderPanel(plugin)}
        </div>
      );
    }
}


export const mapStateToProps = (state: StoreState,props) => {
  const panelState = state.dashboard.panels[props.panel.id];
  if (!panelState) {
    return { plugin: null };
  }

  return {
    plugin: panelState.plugin,
  };
}


export default connect(mapStateToProps)(PanelWrapper)




