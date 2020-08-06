const datasource = {
    add: '添加数据源',
    edit: '编辑数据源',
    choose: '选择一种数据源类型',
    timeSeriesCategory: '时序数据库',
    loggingCategory: '日志和文档',
    tracingCategory: '分布式跟踪',
    isWorking: '数据源测试成功',
    testFailed: '数据源测试失败',   
    delete: '删除数据源',
    deleteTitle: '你确认要删除该数据源吗?',

    // datasources
    nameTooltip: '后续对数据源的选择都按照名称来。一旦默认的数据源设置后，那么新创建的图表默认都将使用该数据源',
    whitelistCookies : 'Cookie白名单',
    whitelistCookiesTooltip: "后端代理时会默认删除所有的Cookie, 在这里你可以指定哪些Cookie不会被删除'",
    customHttpHeader: '自定义HTTP Header',
    addHeader: '添加Header',
    scrapeInterval: "Scrape间隔",
    queryTimeout: "查询超时",
    httpMethod: "HTTP Method",
    scrapeIntervalTooltip: "这里的设置对应的是Prometheus采集数据的时间间隔，默认为15秒",
    queryTimeoutTooltip: "设置查询Prometheus时的超时时间",
    httpMethodTooltip: "指定查询Prometheus时的HTTP方法(POST需要Prometheus的版本 >= v2.1.0)",
}

export default datasource