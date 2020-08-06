const datasource = {
    add: 'Add data source',
    edit: 'Edit data source',
    choose: 'Choose a data source type',
    timeSeriesCategory: 'Time series databases',
    loggingCategory: 'Logging & document databases',
    tracingCategory: 'Distributed tracing',
    isWorking: 'Data source is working',
    testFailed: 'Test failed',
    delete: 'Delete data source',
    deleteTitle: 'Are you sure you want to delete this data source?',
    // datasources
    nameTooltip: 'The name is used when you select the data source in panels. The Default data source is ' +
    'preselected in new panels.',
    whitelistCookies : 'Whitelisted Cookies',
    whitelistCookiesTooltip: "Backend proxy deletes forwarded cookies by default. Specify cookies by name that should be forwarded to the data source.",
    customHttpHeader: 'Custom HTTP Headers',
    addHeader: 'Add header',
    scrapeInterval: "Scrape interval",
    queryTimeout: "Query timeout",
    httpMethod: "HTTP Method",
    scrapeIntervalTooltip: "Set this to the typical scrape and evaluation interval configured in Prometheus. Defaults to 15s.",
    queryTimeoutTooltip: "Set the Prometheus query timeout.",
    httpMethodTooltip: "Specify the HTTP Method to query Prometheus. (POST is only available in Prometheus >= v2.1.0)",

    // prometheus
    
}

export default datasource