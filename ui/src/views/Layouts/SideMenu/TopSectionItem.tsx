import React, { FC } from 'react';
import _ from 'lodash'
import { useLocation } from 'react-router-dom'
import classNames from 'classnames'

import SideMenuDropDown from './SideMenuDropDown';
import { Icon } from 'src/packages/datav-core';
import { MenuItem } from 'src/types'
import { Link } from 'react-router-dom'
export interface Props {
  link: MenuItem;
  onClick?: () => void;
}

const TopSectionItem: FC<Props> = props => {
  const location = useLocation()
  const { link, onClick } = props;

  let renderLink: any;
  if (link.url === '') {
    // eslint-disable-next-line 
    renderLink = <a className="sidemenu-link" onClick={onClick}>
      <span className="icon-circle sidemenu-icon">
        <Icon name={link.icon as any} size="xl" />
      </span>
    </a>
  } else if (link.redirectTo) {
    renderLink =  <Link to={link.redirectTo} className="sidemenu-link" onClick={onClick}>
      <span className="icon-circle sidemenu-icon pointer">
        <Icon name={link.icon as any} size="xl" />
      </span>
    </Link>
  } else {
    renderLink =  <Link to={link.url} className="sidemenu-link" onClick={onClick}>
      <span className="icon-circle sidemenu-icon">
        <Icon name={link.icon as any} size="xl" />
      </span>
    </Link>
  }

  const menuItemSelected =  link.url !== '' ? _.startsWith(location.pathname, link.url) : false
  const classes = classNames({
    'sidemenu-item': true,
    'sidemenu-item-selected': menuItemSelected,
    'dropdown': true
  })

  return (
    <div className={classes}>
      {renderLink}

      <SideMenuDropDown link={link} onHeaderClick={onClick} />
    </div>
  );
};

export default TopSectionItem;
