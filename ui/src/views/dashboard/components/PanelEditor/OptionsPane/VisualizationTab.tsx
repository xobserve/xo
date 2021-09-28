/*eslint-disable*/
import React, { useCallback, useState } from 'react';
import { css } from 'emotion';
import { GrafanaTheme, PanelPlugin, PanelPluginMeta, getBootConfig, currentLang } from 'src/packages/datav-core/src';
import { useTheme, stylesFactory, Icon, Input,  Field} from 'src/packages/datav-core/src/ui';
import { StoreState } from 'src/types';
import { PanelModel } from '../../../model';
import { connect, MapStateToProps } from 'react-redux';
import { VizTypePicker, getAllPanelPluginMeta, filterPluginList } from '../VizTypePicker';
import { loadPanelPlugin } from 'src/plugins/loader';
import {message, notification} from 'antd'
import {store, getState} from 'src/store/store'
import { updatePanel } from 'src/store/reducers/dashboard';
import localeData from 'src/core/library/locale'

interface OwnProps {
  panel: PanelModel;
}

interface ConnectedProps {
  plugin?: PanelPlugin;
}


type Props = OwnProps & ConnectedProps ;

export const VisualizationTabUnconnected = React.forwardRef<HTMLInputElement, Props>(
  ({ panel, plugin }, ref) => {
    if (!ref) {
      ref = {
        current:null
      }
    }
    const [searchQuery, setSearchQuery] = useState('');
    const theme = useTheme();
    const styles = getStyles(theme);

    if (!plugin) {
      return null;
    }
    
    const onPluginTypeChange = async (meta: PanelPluginMeta) => {
      if (meta.id === 'jaeger-panel') {
        // jaeger panel must be used with jaeger datasource
        if (panel.datasource !== 'jaeger') {
          notification['error']({
            message: "Error",
            description: localeData[currentLang]['panel.needJaegerDatasource'],
            duration: 8
          });
          return 
        }
      }
      if (panel.type === meta.id) {
        return;
      }
      
      const plugin = await loadPanelPlugin(meta.id)
      if (!plugin) {
        message.error(`no plugin find for ${meta.id}`)
        return 
      }
      panel.changePlugin(plugin)
      store.dispatch(updatePanel({panelId:panel.id,plugin}))
      //@todo : 更新store中的当前的dashboard的panels.触发dashboard的更新
    };

    const onKeyPress = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          const query = e.currentTarget.value;
          const plugins = getAllPanelPluginMeta();
          const match = filterPluginList(plugins, query, plugin.meta);
          if (match && match.length) {
            onPluginTypeChange(match[0]);
          }
        }
      },
      [onPluginTypeChange]
    );

    const suffix =
      searchQuery !== '' ? (
        <span className={styles.searchClear} onClick={() => setSearchQuery('')}>
          <Icon name="times" />
          Clear filter
        </span>
      ) : null;

    return (
      <div className={styles.wrapper}>
        <Field>
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.currentTarget.value)}
            onKeyPress={onKeyPress}
            prefix={<Icon name="filter" className={styles.icon} />}
            suffix={suffix}
            placeholder={localeData[getState().application.locale]['panel.filterVis']}
            ref={ref}
          />
        </Field>

        <VizTypePicker
          current={plugin.meta}
          onTypeChange={onPluginTypeChange}
          searchQuery={searchQuery}
          onClose={() => {}}
        />
      </div>
    );
  }
);
const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    icon: css`
      color: ${theme.palette.gray33};
    `,
    wrapper: css`
      label: visual-tab;
      display: flex;
      flex-direction: column;
    `,
    searchClear: css`
      color: ${theme.palette.gray60};
      cursor: pointer;
    `,
  };
});

const mapStateToProps: MapStateToProps<ConnectedProps, OwnProps, StoreState> = (state, props) => {
  return {
    plugin: state.plugins.panels[props.panel.type],
  };
};


export const VisualizationTab = connect(mapStateToProps, undefined, undefined, { forwardRef: true })(
  VisualizationTabUnconnected
);
