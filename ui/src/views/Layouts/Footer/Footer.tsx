import React, { FC } from 'react';

import { Icon, IconName,config} from 'src/packages/datav-core';
import './Footer.less'
import { FormattedMessage } from 'react-intl';

export interface FooterLink {
  id: number;
  title: any;
  icon?: string;
  url?: string;
  target?: string;
}

export let getFooterLinks = (): FooterLink[] => {
  return [
    {
      id:1,
      title: <FormattedMessage id="common.documentation"/>,
      icon: 'document-info',
      url: 'https://datav.dev/docs',
      target: '_blank',
    },
    {
      id:2,
      title: <FormattedMessage id="common.support"/>,
      icon: 'question-circle',
      url: 'https://datav.dev/support',
      target: '_blank',
    },
    {
      id:3,
      title: <FormattedMessage id="common.community"/>,
      icon: 'comments-alt',
      url: 'https://datav.dev/community',
      target: '_blank',
    },
    {
      id:4,
      title: 'Github',
      icon: 'github',
      url: 'https://github.com/apm-ai/datav',
      target: '_blank',
    },
  ];
};

export let getVersionLinks = (): FooterLink[] => {
  const { buildInfo, licenseInfo } = config;
  const links: FooterLink[] = [];
  const stateInfo = licenseInfo.stateInfo ? ` (${licenseInfo.stateInfo})` : '';

  // links.push({ text: `${buildInfo.edition}${stateInfo}`, url: licenseInfo.licenseUrl });
  links.push({ title: `v${buildInfo.version} (${buildInfo.commit})` , id : 0});

  if (buildInfo.hasUpdate) {
    links.push({
      id:5,
      title: `New version available!`,
      icon: 'download-alt',
      url: 'https://grafana.com/grafana/download?utm_source=grafana_footer',
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
                <Icon name={link.icon as IconName} /> {link.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
});
