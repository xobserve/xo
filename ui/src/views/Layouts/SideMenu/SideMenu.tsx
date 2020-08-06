import React from 'react';

import TopSection from './TopSection';
import BottomSection from './BottomSection';
// import { Branding } from '../Branding/Branding'
import { Icon } from 'src/packages/datav-core';
import appEvents from 'src/core/library/utils/app_events';
import { CoreEvents } from 'src/types';
import './SideMenu.less'

const homeUrl = '/dashboard';


export const SideMenu = () => {
  const toggleSideMenuSmallBreakpoint = () => {
    appEvents.emit(CoreEvents.toggleSidemenuMobile);
  };

    return (
      <div className="sidemenu">
        <a href={homeUrl} className="sidemenu__logo" key="logo">
          {/* <Branding.MenuLogo /> */}
        </a>
        <div className="sidemenu__logo_small_breakpoint" onClick={toggleSideMenuSmallBreakpoint} key="hamburger">
          <Icon name="bars" size="xl" />
        <span className="sidemenu__close">
          <Icon name="times" />
          &nbsp;Close
        </span>
        </div>
        <TopSection key="topsection" />
        <BottomSection key="bottomsection" />
      </div>
    )
}
