// Libraries
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
// Types
import {
  GrafanaPlugin,
  NavModel,
  NavModelItem,
  PluginDependencies,
  PluginInclude,
  PluginIncludeType,
  PluginMeta,
  PluginMetaInfo,
  PluginType,
  UrlQueryMap,
} from 'src/packages/datav-core/src';
import { CoreEvents, Role } from 'src/types';
import { Alert, Tooltip } from 'src/packages/datav-core/src/ui';

import Page from '../../Layouts/Page/Page';
import { getPluginSettings } from 'src/plugins/plugin_settings_cache';
import { importDataSourcePlugin, importPanelPlugin } from 'src/plugins/loader';
import { getNotFoundNav } from '../../Layouts/Page/navModel';
import { PluginHelp } from './PluginHelp';

import appEvents from 'src/core/library/utils/app_events';
import { store } from 'src/store/store';


export function getLoadingNav(): NavModel {
  const node = {
    text: 'Loading...',
    icon: 'icon-gf icon-gf-panel',
  };
  return {
    node: node,
    main: node,
  };
}

function loadPlugin(pluginId: string): Promise<GrafanaPlugin> {
  return getPluginSettings(pluginId).then(info => {
    if (info.type === PluginType.datasource) {
      return importDataSourcePlugin(info);
    }
    if (info.type === PluginType.panel) {
      return importPanelPlugin(pluginId).then(plugin => {
        // Panel Meta does not have the *full* settings meta
        return getPluginSettings(pluginId).then(meta => {
          plugin.meta = {
            ...meta, // Set any fields that do not exist
            ...plugin.meta,
          };
          return plugin;
        });
      });
    }
    if (info.type === PluginType.renderer) {
      return Promise.resolve({ meta: info } as GrafanaPlugin);
    }
    return Promise.reject('Unknown Plugin type: ' + info.type);
  });
}

interface Props {
  
}

interface State {
  query?: UrlQueryMap;
  userRole: Role;
  loading: boolean;
  plugin?: GrafanaPlugin;
  nav: NavModel;
  defaultPage: string; // The first configured one or readme
}

const PAGE_ID_README = 'readme';

class PluginPage extends PureComponent<Props & any, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      nav: getLoadingNav(),
      defaultPage: PAGE_ID_README,
      userRole: store.getState().user.role,
      query: {}
    };
  }

  async componentDidMount() {
    const pluginId = this.props.match.params.pluginID
    const path = this.props.match.url
    const { query } = this.state;
    const  appSubUrl  = '';
    
    const plugin = await loadPlugin(pluginId);
    if (!plugin) {
      this.setState({
        loading: false,
        nav: getNotFoundNav(),
      });
      return; // 404
    }

    const { defaultPage, nav } = getPluginTabsNav(plugin, appSubUrl, path, query);

    this.setState({
      loading: false,
      plugin,
      defaultPage,
      nav,
    });
  }

  renderBody() {
    const { plugin, nav,query } = this.state;

    if (!plugin) {
      return <Alert severity={'error'} title="Plugin Not Found" />;
    }

    const active = nav.main.children.find(tab => tab.active);
    if (active) {
      // Find the current config tab
      if (plugin.configPages) {
        for (const tab of plugin.configPages) {
          if (tab.id === active.id) {
            return <tab.body plugin={plugin} query={query} />;
          }
        }
      }
    }

    return <PluginHelp plugin={plugin.meta} type="help" />;
  }

  showUpdateInfo = () => {
    // appEvents.emit(CoreEvents.showModal, {
    //   src: 'public/app/features/plugins/partials/update_instructions.html',
    //   model: this.state.plugin.meta,
    // });
  };

  renderVersionInfo(meta: PluginMeta) {
    if (!meta.info.version) {
      return null;
    }

    return (
      <section className="page-sidebar-section">
        <h4>Version</h4>
        <span>{meta.info.version}</span>
        {meta.hasUpdate && (
          <div>
            <Tooltip content={meta.latestVersion} theme="info" placement="top">
              <a href="#" onClick={this.showUpdateInfo}>
                Update Available!
              </a>
            </Tooltip>
          </div>
        )}
      </section>
    );
  }

  renderSidebarIncludeBody(item: PluginInclude) {
    if (item.type === PluginIncludeType.page) {
      const pluginId = this.state.plugin.meta.id;
      const page = item.name.toLowerCase().replace(' ', '-');
      return (
        <a href={`plugins/${pluginId}/page/${page}`}>
          <i className={getPluginIcon(item.type)} />
          {item.name}
        </a>
      );
    }
    return (
      <>
        <i className={getPluginIcon(item.type)} />
        {item.name}
      </>
    );
  }

  renderSidebarIncludes(includes: PluginInclude[]) {
    if (!includes || !includes.length) {
      return null;
    }

    return (
      <section className="page-sidebar-section">
        <h4>Includes</h4>
        <ul className="ui-list plugin-info-list">
          {includes.map(include => {
            return (
              <li className="plugin-info-list-item" key={include.name}>
                {this.renderSidebarIncludeBody(include)}
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  renderSidebarDependencies(dependencies: PluginDependencies) {
    if (!dependencies) {
      return null;
    }

    return (
      <section className="page-sidebar-section">
        <h4>Dependencies</h4>
        <ul className="ui-list plugin-info-list">
          <li className="plugin-info-list-item">
            <img src="public/img/grafana_icon.svg" />
            Grafana {dependencies.grafanaVersion}
          </li>
          {dependencies.plugins &&
            dependencies.plugins.map(plug => {
              return (
                <li className="plugin-info-list-item" key={plug.name}>
                  <i className={getPluginIcon(plug.type)} />
                  {plug.name} {plug.version}
                </li>
              );
            })}
        </ul>
      </section>
    );
  }

  renderSidebarLinks(info: PluginMetaInfo) {
    if (!info.links || !info.links.length) {
      return null;
    }

    return (
      <section className="page-sidebar-section">
        <h4>Links</h4>
        <ul className="ui-list">
          {info.links.map(link => {
            return (
              <li key={link.url}>
                <a href={link.url} className="external-link" target="_blank" rel="noopener">
                  {link.name}
                </a>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  render() {
    const { loading, nav, plugin,userRole} = this.state;
    const isAdmin = userRole === 'Admin';
    return (
      <Page navModel={nav}>
        <Page.Contents isLoading={loading}>
          {!loading && (
            <div className="sidebar-container">
              <div className="sidebar-content">
                {plugin.loadError && (
                  <Alert
                    severity={'error'}
                    title="Error Loading Plugin"
                    children={
                      <>
                        Check the server startup logs for more information. <br />
                        If this plugin was loaded from git, make sure it was compiled.
                      </>
                    }
                  />
                )}
                {this.renderBody()}
              </div>
              <aside className="page-sidebar">
                {plugin && (
                  <section className="page-sidebar-section">
                    {this.renderVersionInfo(plugin.meta)}
                    {isAdmin && this.renderSidebarIncludes(plugin.meta.includes)}
                    {this.renderSidebarDependencies(plugin.meta.dependencies)}
                    {this.renderSidebarLinks(plugin.meta.info)}
                  </section>
                )}
              </aside>
            </div>
          )}
        </Page.Contents>
      </Page>
    );
  }
}

function getPluginTabsNav(
  plugin: GrafanaPlugin,
  appSubUrl: string,
  path: string,
  query: UrlQueryMap
): { defaultPage: string; nav: NavModel } {
  const { meta } = plugin;
  let defaultPage: string;
  const pages: NavModelItem[] = [];

  if (true) {
    pages.push({
      text: 'Readme',
      icon: 'fa fa-fw fa-file-text-o',
      url: `${appSubUrl}${path}?page=${PAGE_ID_README}`,
      id: PAGE_ID_README,
    });
  }


  if (!defaultPage) {
    defaultPage = pages[0].id; // the first tab
  }

  const node = {
    text: meta.name,
    img: meta.info.logos.large,
    title: meta.info.author.name,
    breadcrumbs: [{ title: 'Plugins', url: 'plugins' }],
    url: `${appSubUrl}${path}`,
    children: setActivePage(query.page as string, pages, defaultPage),
  };

  return {
    defaultPage,
    nav: {
      node: node,
      main: node,
    },
  };
}

function setActivePage(pageId: string, pages: NavModelItem[], defaultPageId: string): NavModelItem[] {
  let found = false;
  const selected = pageId || defaultPageId;
  const changed = pages.map(p => {
    const active = !found && selected === p.id;
    if (active) {
      found = true;
    }
    return { ...p, active };
  });
  if (!found) {
    changed[0].active = true;
  }
  return changed;
}

function getPluginIcon(type: string) {
  switch (type) {
    case 'datasource':
      return 'gicon gicon-datasources';
    case 'panel':
      return 'icon-gf icon-gf-panel';
    case 'app':
      return 'icon-gf icon-gf-apps';
    case 'page':
      return 'icon-gf icon-gf-endpoint-tiny';
    case 'dashboard':
      return 'gicon gicon-dashboard';
    default:
      return 'icon-gf icon-gf-apps';
  }
}


export default withRouter(PluginPage);

