import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import { getHistory, getLocationSrv } from 'src/packages/datav-core/src';
import appEvents from '../library/utils/app_events';
import { CoreEvents } from 'src/types';
import { store } from 'src/store/store'
import { getUrlParams } from '../library/utils/url';
import { DashboardModel } from 'src/views/dashboard/model';
export class KeybindingSrv {
  constructor() {
    this.setupGlobal()
  }

  setupGlobal() {
    this.bind('g h', this.goToHome);
    this.bind('g p', this.goToPlugins);
    this.bind('g t', this.gotoTeams);
    this.bind('g u', this.gotoUsers);
    this.bind('mod+s', this.saveDashboard);
    this.bind('o s', this.openSerach);
    this.bind('esc', this.exit);
    this.bind('d s',this.gotoDashboardSetting)
  }

  bind(keyArg: string | string[], fn: () => void) {
    Mousetrap.bind(
      keyArg,
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        fn()
      },
      'keydown'
    );
  }

  goToHome() {
    getHistory().push('/')
  }

  goToPlugins() {
    getHistory().push('/cfg/plugins')
  }

  saveDashboard() {
    appEvents.emit(CoreEvents.KeybindingSaveDashboard)
  }

  openSerach() {
    getLocationSrv().update({query: {search: 'open'},partial:true})
  }

  gotoTeams() {
    getHistory().push('/cfg/teams')
  }

  gotoUsers() {
    getHistory().push('/cfg/users')
  }

  gotoNewDashboard() {
    getHistory().push('/new/dashboard')
  }

  goBack() {
    getHistory().goBack()
  }

  goForward() {
    getHistory().goForward()
  }

  gotoDashboardSetting() {
    getLocationSrv().update({ query: { settingView: 'general' }, partial: true })
  }

  exit() {
    const search = getUrlParams()
    if (search.settingView) {
      getLocationSrv().update({ query: { settingView: null }, partial: true })
    }

    if (search.viewPanel) {
      getLocationSrv().update({ query: { viewPanel: null }, partial: true })
    }

    if (search.editPanel) {
      getLocationSrv().update({ query: { editPanel: null }, partial: true })
    }

    if (search.inspect) {
      getLocationSrv().update({ query: {inspect:null, inspectTab: null }, partial: true })
    }

    if (search.search) {
      getLocationSrv().update({ query: { search: null, folder:null}, partial: true })
    }

    if (search.view) {
      const body = $('body');
      body.removeClass('view-mode--kiosk')
      body.removeClass('view-mode--tv')
      getLocationSrv().update({ query: { view: null }, partial: true })
    }
  }

  setupDashboardBindings(dashboard: DashboardModel) {
    // edit panel
    this.bind('e', () => {
      if (dashboard.canEditPanelById(dashboard.meta.focusPanelId)) {
        getLocationSrv().update({ query: { editPanel: dashboard.meta.focusPanelId }, partial: true })
      }
    });

    // view panel
    this.bind('v', () => {
      if (dashboard.meta.focusPanelId) {
        getLocationSrv().update({ query: { viewPanel: dashboard.meta.focusPanelId  }, partial: true })
      }
    });

    // inspect panel
    this.bind('i', () => {
      if (dashboard.meta.focusPanelId) {
        getLocationSrv().update({ query: { inspect: dashboard.meta.focusPanelId }, partial: true })
      }
    });
  }
}

/**
 * Code below exports the service to react components
 */

let singletonInstance: KeybindingSrv;

export function setKeybindingSrv(instance: KeybindingSrv) {
  singletonInstance = instance;
}

export function getKeybindingSrv(): KeybindingSrv {
  return singletonInstance;
}