import React, { FormEvent } from 'react';
import { css } from 'emotion';

import { Tab, TabsBar, Icon, IconName } from 'src/packages/datav-core/src';
 
import { NavModel, NavModelBreadcrumb } from 'src/packages/datav-core/src';
import { CoreEvents ,MenuItem} from 'src/types';
import appEvents from 'src/core/library/utils/app_events';
import './PageHeader.less'
import { useHistory } from 'react-router-dom';

export interface Props {
  model: NavModel;
}

const SelectNav = ({ children, customCss }: { children: MenuItem[]; customCss: string }) => {
  if (!children || children.length === 0) {
    return null;
  }

  const defaultSelectedItem = children.find(navItem => {
    return navItem.active === true;
  });

  const gotoUrl = (evt: FormEvent) => {
    const element = evt.target as HTMLSelectElement;
    const url = element.options[element.selectedIndex].value;
    appEvents.emit(CoreEvents.locationChange, { href: url });
  };

  return (
    <div className={`gf-form-select-wrapper width-20 ${customCss}`}>
      <label
        className={`gf-form-select-icon ${defaultSelectedItem ? defaultSelectedItem?.icon : ''}`}
        htmlFor="page-header-select-nav"
      />
      {/* Label to make it clickable */}
      <select
        className="gf-select-nav gf-form-input"
        value={defaultSelectedItem?.url ?? ''}
        onChange={gotoUrl}
        id="page-header-select-nav"
      >
        {children.map((navItem: MenuItem) => {
          if (navItem.hideFromTabs) {
            // TODO: Rename hideFromTabs => hideFromNav
            return null;
          }
          return (
            <option key={navItem.url} value={navItem.url}>
              {navItem.title}
            </option>
          );
        })}
      </select>
    </div>
  );
};

const Navigation = ({ children }: { children: MenuItem[] }) => {
  const history = useHistory()
  const goToUrl = (child) => {
    child.redirectTo ?history.push(child.redirectTo) :history.push(child.url)
 };


  if (!children || children.length === 0) {
    return null;
  }


  return (
    <nav>
      <SelectNav customCss="page-header__select-nav" children={children} />
      <TabsBar className="page-header__tabs">
        {children.map((child, index) => {
          return (
            !child.hideFromTabs && (
              <Tab
                label={child.title}
                active={child.active}
                key={`${child.url}-${index}`}
                icon={child.icon as IconName}
                onChangeTab={() => goToUrl(child)}
              />
            )
          );
        })}
      </TabsBar>
    </nav>
  );
};

const PageHeader = (props) => {

  const renderTitle = (title: string, breadcrumbs: NavModelBreadcrumb[])=> {
    if (!title && (!breadcrumbs || breadcrumbs.length === 0)) {
      return null;
    }

    if (!breadcrumbs || breadcrumbs.length === 0) {
      return <h1 className="page-header__title">{title}</h1>;
    }

    const breadcrumbsResult = [];
    for (const bc of breadcrumbs) {
      if (bc.url) {
        breadcrumbsResult.push(
          <a className="text-link" key={breadcrumbsResult.length} href={bc.url}>
            {bc.title}
          </a>
        );
      } else {
        breadcrumbsResult.push(<span key={breadcrumbsResult.length}> / {bc.title}</span>);
      }
    }
    breadcrumbsResult.push(<span key={breadcrumbs.length + 1}> / {title}</span>);

    return <h1 className="page-header__title">{breadcrumbsResult}</h1>;
  }

  const renderHeaderTitle = (main: MenuItem) => {
    const iconClassName =
      main.icon === 'grafana'
        ? css`
            margin-top: 12px;
          `
        : css`
            margin-top: 14px;
          `;

    return (
      <div className="page-header__inner">
        <span className="page-header__logo">
          {main.icon && <Icon name={main.icon as IconName} size="xxxl" className={iconClassName} />}
          {main.img && <img className="page-header__img" src={main.img} />}
        </span>

        <div className="page-header__info-block">
          {renderTitle(main.title, main.breadcrumbs ?? [])}
          {main.subTitle && <div className="page-header__sub-title">{main.subTitle}</div>}
        </div>
      </div>
    );
  }

    const { model } = props;
    if (!model) {
      return null;
    }

    const main = model.main;
    const children = main.children;

    return (
      <div className="page-header-canvas">
        <div className="page-container">
          <div className="page-header">
            {renderHeaderTitle(main)}
            {children && children.length && <Navigation children={children} />}
          </div>
        </div>
      </div>
    );
}


export default PageHeader