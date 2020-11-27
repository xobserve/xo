import React, { FC } from 'react';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme, DatavTheme, getBootConfig, Icon ,currentLang, currentTheme, ThemeType} from 'src/packages/datav-core/src';
import { Row, Col } from 'antd';
import { FormattedMessage } from 'react-intl';
import { Langs } from 'src/core/library/locale/types';

export const WelcomeBanner: FC = () => {
  const titleColor = currentTheme === ThemeType.Light ? '#4c5773' : '#fff'
  const textColor = currentTheme === ThemeType.Light ? '#6b7389' : '#fff'

  const getStyles = stylesFactory((theme: DatavTheme) => {
    const bgColor = theme.isDark ? 'transparent' : 'white';
    const navBorder = theme.isDark ? `1px solid #666;` : `2px solid rgb(237, 242, 247);`
    const imageDivider = theme.isDark ?
     
      `url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 190' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1440' height='190' /%3E%3Cpath d='M1440 95.4893C790 245.489 650 -54.5107 0 95.4893V0H1440V95.4893Z' /%3E%3Cg stroke-width='1'%3E%3Cg stroke='%23EDF2F7'%3E%3Cpath d='M0 95.4893C650 -54.5107 790 245.489 1440 95.4893'/%3E%3Cpath d='M0 95.4893C650 15.4893 790 175.489 1440 95.4893'/%3E%3Cpath d='M0 95.4893C650 -214.511 790 405.489 1440 95.4893'/%3E%3C/g%3E%3Cpath d='M0 95.4893C650 -134.511 790 325.489 1440 95.4893' stroke='%234FD1C5'/%3E%3C/g%3E%3C/svg%3E") `
      :
      `url(https://www.metabase.com//images/homepage-bridge@2x.png)`
      // `url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 190' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1440' height='190' fill='white'/%3E%3Cpath d='M1440 95.4893C790 245.489 650 -54.5107 0 95.4893V0H1440V95.4893Z' fill='%23F7FAFC'/%3E%3Cg stroke-width='2'%3E%3Cg stroke='%23EDF2F7'%3E%3Cpath d='M0 95.4893C650 -54.5107 790 245.489 1440 95.4893'/%3E%3Cpath d='M0 95.4893C650 15.4893 790 175.489 1440 95.4893'/%3E%3Cpath d='M0 95.4893C650 -214.511 790 405.489 1440 95.4893'/%3E%3C/g%3E%3Cpath d='M0 95.4893C650 -134.511 790 325.489 1440 95.4893' stroke='%234FD1C5'/%3E%3C/g%3E%3C/svg%3E")`
    
      return {
      header: css`
      `,
      imageDivider: css`
        height: ${theme.isLight ? '500px' : '190px'};
        margin-top: 0px;
        background-size: ${theme.isLight? 'cover' : '1440px 190px'};
        background-image:  ${imageDivider}
      `,
      getStarted: css`
        color: white;
        font-size: 14px;
        font-weight:500;
        padding: 16px 20px;
        border-radius: 8px;
      `,
      subTitle: css`
        font-size: 17px;
        margin-top: 15px;
      `,
      navLogo: css`
        font-size: 26px
      `,
      nav: css`
        padding: 20px 0 0px 0;
      `,
      features: css`
        margin-top: 80px;
      `,
      featureCard: css`
        text-align:center;
      `,
      featureTitle: css`
        color: ${titleColor}
      `,
      featureDesc: css`
        font-size:17px;
        color: ${textColor}
      `,
    };
  });

  const styles = getStyles(useTheme());


  const docsUrl =  currentLang === Langs.Chinese ? `${getBootConfig().common.docsAddr}/docs-cn/tutorial`:`${getBootConfig().common.docsAddr}/docs/tutorial`
  return (
    <>
      <div className={styles.header}>
        <Row justify="center">
          <Col span="22">
            <Row justify="space-between" align="middle" className={styles.nav}>
              <div className={styles.navLogo} style={{color: titleColor,fontWeight: 500}}>
                {/* <img src="/img/logo.png" height="20" width="20" className="ub-mr1 inline" /> */}
                {getBootConfig().common.appName.toUpperCase()}</div>
              <div>
              <a href="https://github.com/apm-ai/datav" target="_blank" className={cx(styles.getStarted, 'bg-primary')}>GITHUB <Icon name="github" size="xl"  /></a>
                
              </div>
            </Row>
          </Col>
        </Row>
        <Row justify="center" align="middle" className="ub-mt4">
          <Col span="6" style={{ paddingTop: '5px' }}>
            <h1 style={{ fontSize: '40px',color:titleColor,lineHeight: 1.2}}>
              <FormattedMessage id="welcomePanel.sloganFirst"/>
               <span className="display-block color-primary">metrics, traces and logs</span>
            </h1>
            <div className={styles.subTitle} style={{color: textColor, fontWeight: 450}}>{getBootConfig().common.appName}<FormattedMessage id="welcomePanel.subTitle"/></div>
            <div style={{marginTop: '2.5rem'}}>
              <a href={docsUrl} target="_blank" className={cx(styles.getStarted, 'bg-primary')}><FormattedMessage id="welcomePanel.viewDocs"/></a>
            </div>
          </Col>
          <Col span="15">
            <div className="display-block ub-ml4" style={{ backgroundImage: 'url(https://www.metabase.com/images/homepage-hero.png)', height: '562px', backgroundSize: 'cover' }}></div>
          </Col>
        </Row>
      </div>

      <div className={styles.imageDivider}></div>

      <Row justify="center" className={styles.features}>
        <Col span="8" className={styles.featureCard}>
          <div>
            <svg viewBox="64 64 896 896" focusable="false" data-icon="fire" width="60" height="60" fill="#FF7F44" aria-hidden="true"><path d="M834.1 469.2A347.49 347.49 0 00751.2 354l-29.1-26.7a8.09 8.09 0 00-13 3.3l-13 37.3c-8.1 23.4-23 47.3-44.1 70.8-1.4 1.5-3 1.9-4.1 2-1.1.1-2.8-.1-4.3-1.5-1.4-1.2-2.1-3-2-4.8 3.7-60.2-14.3-128.1-53.7-202C555.3 171 510 123.1 453.4 89.7l-41.3-24.3c-5.4-3.2-12.3 1-12 7.3l2.2 48c1.5 32.8-2.3 61.8-11.3 85.9-11 29.5-26.8 56.9-47 81.5a295.64 295.64 0 01-47.5 46.1 352.6 352.6 0 00-100.3 121.5A347.75 347.75 0 00160 610c0 47.2 9.3 92.9 27.7 136a349.4 349.4 0 0075.5 110.9c32.4 32 70 57.2 111.9 74.7C418.5 949.8 464.5 959 512 959s93.5-9.2 136.9-27.3A348.6 348.6 0 00760.8 857c32.4-32 57.8-69.4 75.5-110.9a344.2 344.2 0 0027.7-136c0-48.8-10-96.2-29.9-140.9zM713 808.5c-53.7 53.2-125 82.4-201 82.4s-147.3-29.2-201-82.4c-53.5-53.1-83-123.5-83-198.4 0-43.5 9.8-85.2 29.1-124 18.8-37.9 46.8-71.8 80.8-97.9a349.6 349.6 0 0058.6-56.8c25-30.5 44.6-64.5 58.2-101a240 240 0 0012.1-46.5c24.1 22.2 44.3 49 61.2 80.4 33.4 62.6 48.8 118.3 45.8 165.7a74.01 74.01 0 0024.4 59.8 73.36 73.36 0 0053.4 18.8c19.7-1 37.8-9.7 51-24.4 13.3-14.9 24.8-30.1 34.4-45.6 14 17.9 25.7 37.4 35 58.4 15.9 35.8 24 73.9 24 113.1 0 74.9-29.5 145.4-83 198.4z"></path></svg>
            <h2 className={styles.featureTitle}> <FormattedMessage id="welcomePanel.feature1Title"/></h2>
            <p className={styles.featureDesc}><FormattedMessage id="welcomePanel.feature1Desc"/></p>
          </div>
        </Col>
        <Col span="8" offset="2" className={styles.featureCard}>
          <div>
            <svg viewBox="64 64 896 896" focusable="false" data-icon="database" width="60" height="60" fill="#66BCFE" aria-hidden="true"><path d="M832 64H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-600 72h560v208H232V136zm560 480H232V408h560v208zm0 272H232V680h560v208zM304 240a40 40 0 1080 0 40 40 0 10-80 0zm0 272a40 40 0 1080 0 40 40 0 10-80 0zm0 272a40 40 0 1080 0 40 40 0 10-80 0z"></path></svg>
            <h2 className={styles.featureTitle}> <FormattedMessage id="welcomePanel.feature2Title"/></h2>
            <p className={styles.featureDesc}><FormattedMessage id="welcomePanel.feature2Desc"/></p>
          </div>
        </Col>
      </Row>

      <Row justify="center" className={styles.features}>
        <Col span="8" className={styles.featureCard}>
          <div>
            <svg viewBox="64 64 896 896" focusable="false" data-icon="deployment-unit" width="60" height="60" fill="#5AC189" aria-hidden="true"><path d="M888.3 693.2c-42.5-24.6-94.3-18-129.2 12.8l-53-30.7V523.6c0-15.7-8.4-30.3-22-38.1l-136-78.3v-67.1c44.2-15 76-56.8 76-106.1 0-61.9-50.1-112-112-112s-112 50.1-112 112c0 49.3 31.8 91.1 76 106.1v67.1l-136 78.3c-13.6 7.8-22 22.4-22 38.1v151.6l-53 30.7c-34.9-30.8-86.8-37.4-129.2-12.8-53.5 31-71.7 99.4-41 152.9 30.8 53.5 98.9 71.9 152.2 41 42.5-24.6 62.7-73 53.6-118.8l48.7-28.3 140.6 81c6.8 3.9 14.4 5.9 22 5.9s15.2-2 22-5.9L674.5 740l48.7 28.3c-9.1 45.7 11.2 94.2 53.6 118.8 53.3 30.9 121.5 12.6 152.2-41 30.8-53.6 12.6-122-40.7-152.9zm-673 138.4a47.6 47.6 0 01-65.2-17.6c-13.2-22.9-5.4-52.3 17.5-65.5a47.6 47.6 0 0165.2 17.6c13.2 22.9 5.4 52.3-17.5 65.5zM522 463.8zM464 234a48.01 48.01 0 0196 0 48.01 48.01 0 01-96 0zm170 446.2l-122 70.3-122-70.3V539.8l122-70.3 122 70.3v140.4zm239.9 133.9c-13.2 22.9-42.4 30.8-65.2 17.6-22.8-13.2-30.7-42.6-17.5-65.5s42.4-30.8 65.2-17.6c22.9 13.2 30.7 42.5 17.5 65.5z"></path></svg>
            <h2 className={styles.featureTitle}> <FormattedMessage id="welcomePanel.feature3Title"/></h2>
            <p className={styles.featureDesc}>{getBootConfig().common.appName}<FormattedMessage id="welcomePanel.feature3Desc" /></p>
          </div>
        </Col>
        <Col span="8" offset="2" className={styles.featureCard}>
          <div>
            <svg viewBox="64 64 896 896" focusable="false" data-icon="dot-chart" width="60" height="60" fill="#FCC700" aria-hidden="true"><path d="M888 792H200V168c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v688c0 4.4 3.6 8 8 8h752c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM288 604a64 64 0 10128 0 64 64 0 10-128 0zm118-224a48 48 0 1096 0 48 48 0 10-96 0zm158 228a96 96 0 10192 0 96 96 0 10-192 0zm148-314a56 56 0 10112 0 56 56 0 10-112 0z"></path></svg>
            <h2 className={styles.featureTitle}> <FormattedMessage id="welcomePanel.feature4Title"/></h2>
            <p className={styles.featureDesc}>{getBootConfig().common.appName}<FormattedMessage id="welcomePanel.feature4Desc"/>{getBootConfig().common.appName}.</p>
          </div>
        </Col>
      </Row>
    </>
  );
};


