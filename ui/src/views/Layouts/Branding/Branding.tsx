import React, { FC } from 'react';
import { css, cx } from 'emotion';
import { currentTheme, ThemeType } from 'src/packages/datav-core/src';
import './Branding.less'

export interface BrandComponentProps {
  className?: string;
  children?: JSX.Element | JSX.Element[];
}

const LoginLogo: FC<BrandComponentProps> = ({ className }) => {
  return <img className={className} src="logo.svg" alt="DataV" />;
};

const LoginBackground: FC<BrandComponentProps> = ({ className, children }) => {
  const background = css`
    background: url(public/img/login_background_${currentTheme === ThemeType.Dark ? 'dark' : 'light'}.svg);
    background-size: cover;
  `;

  return <div className={cx(background, className)}>{children}</div>;
};

const MenuLogo: FC<BrandComponentProps> = ({ className }) => {
  return <img className={className} alt="Grafana" src="img/logo.svg"/>;
};

const LoginBoxBackground = () => {
  return css`
    background: ${currentTheme === ThemeType.Light ? 'rgba(6, 30, 200, 0.1 )' : 'rgba(18, 28, 41, 0.65)'};
    background-size: cover;
  `;
};

export class Branding {
  static LoginLogo = LoginLogo;
  static LoginBackground = LoginBackground;
  static MenuLogo = MenuLogo;
  static LoginBoxBackground = LoginBoxBackground;
  static AppTitle = 'Grafana';
  static LoginTitle = 'Welcome to Grafana';
  static GetLoginSubTitle = () => {
    const slogans = [
      "Don't get in the way of the data",
      'Your single pane of glass',
      'Built better together',
      'Democratising data',
    ];
    const count = slogans.length;
    return slogans[Math.floor(Math.random() * count)];
  };
}
