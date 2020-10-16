/* Datasource Plugins*/
import * as singlestatPanel2 from 'src/plugins/built-in/panel/stat/module';
import * as GraphPanel from 'src/plugins/built-in/panel/graph/module';
import * as Gauge from 'src/plugins/built-in/panel/gauge/module';
import * as BarGauge from 'src/plugins/built-in/panel/bargauge/module';
import * as Table from 'src/plugins/built-in/panel/table/module';
import * as Text from 'src/plugins/built-in/panel/text/module';
import * as Echarts from 'src/plugins/built-in/panel/echarts/module';
import * as Jaeger from 'src/plugins/built-in/panel/jaeger-panel/module';
import * as DependencyGraph from 'src/plugins/built-in/panel/dependency-graph/module';

const prometheusPlugin = async () =>
    await import(/* webpackChunkName: "prometheusPlugin" */ 'src/plugins/built-in/datasource/prometheus/module');
const testdataPlugin = async () =>
    await import(/* webpackChunkName: "testDataPlugin" */ 'src/plugins/built-in/datasource/testdata/module');
const httpPlugin = async () =>
    await import(/* webpackChunkName: "httpPlugin" */ 'src/plugins/built-in/datasource/http/module');
const staticDataPlugin = async () =>
    await import(/* webpackChunkName: "httpPlugin" */ 'src/plugins/built-in/datasource/staticdata/module');
const jaegerPlugin = async () =>
    await import(/* webpackChunkName: "httpPlugin" */ 'src/plugins/built-in/datasource/jaeger/module');
    

export const builtInPlugins = {
    'src/plugins/built-in/datasource/prometheus/module': prometheusPlugin,
    'src/plugins/built-in/datasource/testdata/module': testdataPlugin,
    'src/plugins/built-in/datasource/http/module': httpPlugin,
    'src/plugins/built-in/datasource/staticdata/module': staticDataPlugin,
    'src/plugins/built-in/datasource/jaeger/module': jaegerPlugin,

    'src/plugins/built-in/panel/stat/module': singlestatPanel2,
    'src/plugins/built-in/panel/graph/module': GraphPanel,
    'src/plugins/built-in/panel/gauge/module': Gauge,
    'src/plugins/built-in/panel/bargauge/module': BarGauge,
    'src/plugins/built-in/panel/table/module': Table,
    'src/plugins/built-in/panel/text/module': Text,
    'src/plugins/built-in/panel/echarts/module': Echarts,
    'src/plugins/built-in/panel/jaeger-panel/module': Jaeger,
    'src/plugins/built-in/panel/dependency-graph/module': DependencyGraph,
}
 