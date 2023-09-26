import { createPageList } from '@/utils/createPageList'


const pages = createPageList(
  require.context(`../pages/docs?meta=title,shortTitle,published`, false, /\.mdx$/),
  'docs'
)

export const documentationNav = {
  '开始使用': [
    {
      title: '安装启动',
      href: '/docs/installation',
      match: /^\/docs\/(installation|guides)/,
    },
    pages['about-datav'],
    pages['compare-to-alter'],
  ],
  '入门教程': [
    pages['tutorial-intro'],
    pages['tutorial-login'],
    pages['tutorial-home'],
    pages['tutorial-dashboard'],
    pages['tutorial-datasource'],
    pages['tutorial-time-refresh'],
    pages['tutorial-search'],
    pages['tutorial-sidebar'],
    pages['tutorial-variables'],
    pages['tutorial-global-var'],
    pages['tutorial-admin'],
    pages['tutorial-team'],
    pages['tutorial-alert'],
    pages['tutorial-share'],
  ],
  '管理配置': [
    pages['admin-mysql-sqlite'],
    pages['admin-role'],
    pages['admin-sidebar-nav'],
    pages['admin-audit-log'],
    // pages['admin-configuration']
  ],
  
  '仪表盘 Dashboard': [
    pages['dashboard-setting'],
    pages['dashboard-styles'],
    pages['dashboard-import'],
    pages["dashboard-sort"]
  ],
  '图表 Panel': [
    pages["panel-annotation"],
    pages["panel-conditional-rendering"],
    pages["panel-data-transform"],
    pages["panel-styles"],
    pages["panel-overrides"],
    pages["panel-thresholds"],
    pages["panel-interactivity"]
  ],
  '变量 Variable': [
    pages["variable-query"],
    pages["variable-jaeger"],
    pages["variable-loki"],
    pages["variable-http"],
  ],  
  '告警': [
    pages["alert"],
    pages["alert-correlate"],
  ],
  '图表插件': [
    pages["plugin-overview"],
    pages["plugin-graph"],
    pages["plugin-table"],
    pages["plugin-nodegraph"],
    pages["plugin-trace"],
    pages["plugin-geomap"],
    pages["plugin-log"],
    pages["plugin-echarts"],
    pages["plugin-stat"],
    pages["plugin-gauge"],
    pages["plugin-bar"],
    // pages["plugin-bargauge"],
    pages["plugin-pie"],
  ],
  '外部插件': [
     pages["external-panel-install"],
     pages["external-datasource-install"],
     pages["external-plugin-remove"],
  ]
  // Accessibility: [pages['screen-readers']],
  // 'Official Plugins': [
  //   pages['typography-plugin'],
  //   {
  //     title: 'Forms',
  //     href: 'https://github.com/tailwindlabs/tailwindcss-forms',
  //   },
  //   {
  //     title: 'Aspect Ratio',
  //     href: 'https://github.com/tailwindlabs/tailwindcss-aspect-ratio',
  //   },
  //   {
  //     title: 'Container Queries',
  //     href: 'https://github.com/tailwindlabs/tailwindcss-container-queries',
  //   },
  // ],
}
