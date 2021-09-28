import React, { FC } from 'react';
import _ from 'lodash'
import { config, getBootConfig, currentLang} from 'src/packages/datav-core/src';
import {Icon, IconName} from 'src/packages/datav-core/src/ui';
import './Footer.less'
import { FormattedMessage } from 'react-intl';
import { Langs } from 'src/core/library/locale/types';

export interface FooterLink {
  id: number;
  text: any;
  icon?: string;
  url?: string;
  target?: string;
}

export let getFooterLinks = (): FooterLink[] => {
  let links = []
  if (getBootConfig().common.enableDocs) {
    links.push(   {
      id:1,
      text: <FormattedMessage id="common.documentation"/>,
      icon: 'document-info',
      url: currentLang === Langs.Chinese ? `${getBootConfig().common.docsAddr}/docs-cn`:`${getBootConfig().common.docsAddr}/docs`,
      target: '_blank',
    })
  }

  if (getBootConfig().common.enableCommunity) {
    links = _.concat(links,[
      {
        id:2,
        text: <FormattedMessage id="common.support"/>,
        icon: 'question-circle',
        url: 'https://datav.dev/support',
        target: '_blank',
      },
      {
        id:3,
        text: <FormattedMessage id="common.community"/>,
        icon: 'comments-alt',
        url: 'https://datav.dev/community',
        target: '_blank',
      },
      {
        id:4,
        text: 'Github',
        icon: 'github',
        url: 'https://github.com/datadefeat/datav',
        target: '_blank',
      },
    ])
  }

  return links
};

export let getVersionLinks = (): FooterLink[] => {
  const { buildInfo, licenseInfo } = config;
  const links: FooterLink[] = [];
  const stateInfo = licenseInfo.stateInfo ? ` (${licenseInfo.stateInfo})` : '';

  // links.push({ text: `${buildInfo.edition}${stateInfo}`, url: licenseInfo.licenseUrl });
  links.push({ text: `V${getBootConfig().common.version}` , id : 0});

  if (buildInfo.hasUpdate) {
    links.push({
      id:5,
      text: `New version available!`,
      icon: 'download-alt',
      url: `${config.officialWebsite}/docs/download`,
      target: '_blank',
    });
  }

  return links;
};

export function setFooterLinksFn(fn: typeof getFooterLinks) {
  getFooterLinks = fn;
}

export function setVersionLinkFn(fn: typeof getFooterLinks) {
  getVersionLinks = fn;
}

export const Footer: FC = React.memo(() => {
  const links = getFooterLinks().concat(getVersionLinks());

  return (
    <footer className="footer">
      <div className="text-center">
        <ul>
          {links.map(link => (
            <li key={link.id}>
              <a href={link.url} target={link.target} rel="noopener">
                <Icon name={link.icon as IconName} /> {link.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
});
