/* Datasource Plugins*/
import * as singlestatPanel2 from 'src/plugins/panel/stat/module';
import * as GraphPanel from 'src/plugins/panel/graph/module';
import * as Gauge from 'src/plugins/panel/gauge/module';
import * as BarGauge from 'src/plugins/panel/bargauge/module';

const prometheusPlugin = async () =>
    await import(/* webpackChunkName: "prometheusPlugin" */ 'src/plugins/datasource/prometheus/module');
const testdataPlugin = async () =>
    await import(/* webpackChunkName: "testDataPlugin" */ 'src/plugins/datasource/testdata/module');

export const builtInPlugins = {
    'src/plugins/datasource/prometheus/module': prometheusPlugin,
    'src/plugins/datasource/testdata/module': testdataPlugin,

    'src/plugins/panel/stat/module': singlestatPanel2,
    'src/plugins/panel/graph/module': GraphPanel,
    'src/plugins/panel/gauge/module': Gauge,
    'src/plugins/panel/bargauge/module': BarGauge
}
