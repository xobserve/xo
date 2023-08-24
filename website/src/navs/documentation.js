import { createPageList } from '@/utils/createPageList'

const pages = createPageList(
  require.context(`../pages/docs?meta=title,shortTitle,published`, false, /\.mdx$/),
  'docs'
)

export const documentationNav = {
  'Getting Started': [
    {
      title: 'First steps',
      href: '/docs/installation',
      match: /^\/docs\/(installation|guides)/,
    },

    pages['compare-to-alter'],
  ],
  Tutorials: [
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
  Aministration: [
    pages['admin-mysql-sqlite'],
    pages['team'],
    pages['role'],
    pages['sidebar-nav'],
    pages['audit-log'],
    pages['configuration']
  ],
  Dashboard: [
    pages['dashboard-setting'],
    pages['dashboard-share'],
  ],
  Panel: [
    pages["panel-data-transform"],
    pages["panel-conditional-rendering"],
    pages["panel-styles"],
    pages["panel-overrides"],
    pages["panel-debug"],
    pages["panel-thresholds"],
    pages["panel-interactivity"]
  ],
  Variable: [
    pages["variable-using"],
    pages["variable-scope"],
    pages["variable-query"],
    
  ],
  Alerting: [
    pages["alert-about"],
    pages["alert-setting"],
    pages["alert-prometheus"],
    pages["alert-correlation"]
  ],
  Search:[
    pages["search-about"],
    pages["search-priority"]
  ],
  'Panel Plugins': [
    pages["plugin-overview"],
    pages["plugin-graph"],
    pages["plugin-table"],
    pages["plugin-nodegraph"],
    pages["plugin-trace"],
    pages["plugin-geomap"],
    pages["plugin-log"],
    pages["plugin-echarts"],
  ],
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
