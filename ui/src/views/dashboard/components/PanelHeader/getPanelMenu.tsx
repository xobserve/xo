import React from 'react'
import { PanelMenuItem } from 'src/packages/datav-core/src';
import { copyPanel, duplicatePanel, removePanel } from '../../model/panel';
import { PanelModel,DashboardModel } from '../../model';
// import { contextSrv } from '../../../core/services/context_srv';
// import { navigateToExplore } from '../../explore/state/actions';
// import { getExploreUrl } from '../../../core/utils/explore';
// import { getTimeSrv } from '../services/TimeSrv';
import {store} from 'src/store/store'
import { updateLocation } from 'src/store/reducers/location';
import { FormattedMessage as Message} from 'react-intl';

export function getPanelMenu(
  dashboard: DashboardModel,
  panel: PanelModel,
): PanelMenuItem[] {
  const onViewPanel = (event: React.MouseEvent<any>) => {
    event.preventDefault();
      store.dispatch(updateLocation({
        query: {
          viewPanel: panel.id,
        },
        partial: true,
      }))
  };

  const onEditPanel = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    store.dispatch(updateLocation({
        query: {
          editPanel: panel.id,
        },
        partial: true,
      }))
  };

  const onSharePanel = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    alert('click share!')
    // sharePanel(dashboard, panel);
  };

  const onInspectPanel = (event:any,tab?: string) => {
    event.preventDefault();

    store.dispatch(updateLocation({
      partial: true,
      query: {
        inspect: panel.id,
        inspectTab: tab,
      },
    }))
  };

  const onMore = (event: React.MouseEvent<any>) => {
    event.preventDefault();
  };

  const onDuplicatePanel = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    duplicatePanel(dashboard, panel);
  };

  const onCopyPanel = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    copyPanel(panel);
  };

  const onRemovePanel = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    removePanel(dashboard, panel, true);
  };

  // const onNavigateToExplore = (event: React.MouseEvent<any>) => {
  //   event.preventDefault();
  //   const openInNewWindow = event.ctrlKey || event.metaKey ? (url: string) => window.open(url) : undefined;
  //   // store.dispatch(navigateToExplore(panel, { getDataSourceSrv, getTimeSrv, getExploreUrl, openInNewWindow }) as any);
  // };

  const menu: PanelMenuItem[] = [];

  if (!panel.isEditing) {
    menu.push({
      text: <Message id="common.view"/>,
      iconClassName: 'eye',
      onClick: onViewPanel,
      shortcut: 'v',
    });
  }

  if (dashboard.canEditPanel(panel) && !panel.isEditing) {
    menu.push({
      text: <Message id="common.edit"/>,
      iconClassName: 'edit',
      onClick: onEditPanel,
      shortcut: 'e',
    });
  }


  // if (contextSrv.hasAccessToExplore() && !(panel.plugin && panel.plugin.meta.skipDataQuery)) {
  //   menu.push({
  //     text: 'Explore',
  //     iconClassName: 'compass',
  //     shortcut: 'x',
  //     onClick: onNavigateToExplore,
  //   });
  // }

  const inspectMenu: PanelMenuItem[] = [];

  // Only show these inspect actions for data plugins
  if (panel.plugin && !panel.plugin.meta.skipDataQuery) {
    inspectMenu.push({
      text: 'Data',
      onClick: (e: React.MouseEvent<any>) => onInspectPanel(e,'data'),
    });

    if (dashboard.meta.canEdit) {
      inspectMenu.push({
        text: 'Query',
        onClick: (e: React.MouseEvent<any>) => onInspectPanel(e,'query'),
      });
    }
  }

  inspectMenu.push({
    text: 'Panel JSON',
    onClick: (e: React.MouseEvent<any>) => onInspectPanel(e,'json'),
  });

  menu.push({
    type: 'submenu',
    text: <Message id="common.inspect"/>,
    iconClassName: 'info-circle',
    onClick: (e: React.MouseEvent<any>) => onInspectPanel(e),
    shortcut: 'i',
    subMenu: inspectMenu,
  });

  // menu.push({
  //   text: <Message id="common.share"/>,
  //   iconClassName: 'share-alt',
  //   onClick: onSharePanel
  // });

  const subMenu: PanelMenuItem[] = [];

  if (dashboard.canEditPanel(panel) && !(panel.isViewing || panel.isEditing)) {
    subMenu.push({
      text: <Message id="common.duplicate"/>,
      onClick: onDuplicatePanel,
    });

    subMenu.push({
      text: <Message id="common.copy"/>,
      onClick: onCopyPanel,
    });
  }


  if (!panel.isEditing && subMenu.length) {
    menu.push({
      type: 'submenu',
      text: <Message id="common.more"/>,
      iconClassName: 'cube',
      subMenu,
      onClick: onMore,
    });
  }

  if (dashboard.canEditPanel(panel) && !panel.isEditing) {
    menu.push({ type: 'divider' });

    menu.push({
      text: <Message id="common.remove"/>,
      iconClassName: 'trash-alt',
      onClick: onRemovePanel
    });
  }

  return menu;
}
