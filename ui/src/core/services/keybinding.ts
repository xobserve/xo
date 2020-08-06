import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import { getHistory, getLocationSrv } from 'src/packages/datav-core/src';
import appEvents from '../library/utils/app_events';
import { CoreEvents } from 'src/types';
import { store } from 'src/store/store'
import { getUrlParams } from '../library/utils/url';
export class KeybindingSrv {
  constructor() {
    this.setupGlobal()
  }

  setupGlobal() {
    this.bind('h', this.goToHome);
    this.bind('p', this.goToPlugins);
    this.bind('t', this.gotoTeams);
    this.bind('u', this.gotoUsers);
    this.bind('n', this.gotoNewDashboard);
    this.bind('mod+s', this.saveDashboard);
    this.bind('s', this.openSerach);
    this.bind('b', this.goBack);
    this.bind('f', this.goForward);
    this.bind('esc', this.exit);
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
    appEvents.emit(CoreEvents.keybindingSaveDashboard)
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
      getLocationSrv().update({ query: { search: null }, partial: true })
    }
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