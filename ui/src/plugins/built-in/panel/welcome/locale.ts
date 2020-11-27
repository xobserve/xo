import en from 'src/core/library/locale/en'
import zh from 'src/core/library/locale/zh'
import _ from 'lodash'

/*--------define locale data here--------*/
const enData = {
    sloganFirst: 'Visualization for',
    sloganSecond: 'metrics, traces and logs',
    viewDocs: 'View Docs',
    subTitle: `  has powerful enterprise features while keeping its lightweight`,
    feature1Title: `Powerful yet easy to use`,
    feature1Desc: `Quickly and easily explore your data, using built in charts plugins or third party plugins.Multiple languages supported : Engalish, Chinese etc.`,
    feature2Title: `Integrates with modern datasources`,
    feature2Desc: `Several built-in datasources are supported: Prometheus, Http, Jaeger etc, you can also use third party ones`,
    feature3Title: `Modern tech stack`,
    feature3Desc: ` is performant, lightweight and highly reliable because we choose modern technologies, such as React, Go, Typescript`,
    feature4Title: `Rich visualizations and dashboards`,
    feature4Desc: ` ships with a wide array of beautiful visualizations. Our visualization plug-in architecture makes it easy to build custom visualizations that drop directly into `,
}

const zhData = {
    sloganFirst: '可视化你的数据',
    sloganSecond: 'metrics, traces and logs.',
    viewDocs: '查看文档',
    subTitle: `在保持轻量的同时又具备强大的企业级特性，为用户带来的强大的功能特性和极致的产品体验`,
    feature1Title: `强大且简单`,
    feature1Desc: `使用数据将变得前所未有的简单，你可以使用内置的插件，也可以使用三方插件来浏览数据，同时我们支持多种语言，例如英文、中文等`,
    feature2Title: `无缝集成现代化数据源`,
    feature2Desc: `内置了多个数据源，包括Prometheus、Jaeger、HTTP等，同时你还可以使用第三方的数据源插件`,
    feature3Title: `现代化的技术栈`,
    feature3Desc: `即简单又可靠，这个得益于我们的技术栈选择：React、Go、Typescript，无需安装任何环境依赖，即可运行`,
    feature4Title: `丰富的可视化特性`,
    feature4Desc: `搭载了丰富的可视化插件，同时拥有丰富的特性，可以实现数据大屏等个性化酷炫图表，你也可以使用第三方图表插件，下载到`,
}
/*--------end--------*/

_.forEach(zhData, (v,k) => {
    zh['welcomePanel.' + k] = v
})

_.forEach(enData, (v,k) => {
    en['welcomePanel.' + k] = v
})

