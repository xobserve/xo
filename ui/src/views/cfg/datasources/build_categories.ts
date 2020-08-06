import { DataSourcePluginMeta } from 'src/packages/datav-core';
import { DataSourcePluginCategory } from 'src/types';
import localeData from 'src/core/library/locale'
import { getState } from 'src/store/store';

export function buildCategories(plugins: DataSourcePluginMeta[]): DataSourcePluginCategory[] {
  const categories: DataSourcePluginCategory[] = [
    { id: 'metrics', title: localeData[getState().application.locale]['datasource.timeSeriesCategory'], plugins: [] },
    { id: 'logging', title: localeData[getState().application.locale]['datasource.loggingCategory'], plugins: [] },
    { id: 'tracing', title: localeData[getState().application.locale]['datasource.tracingCategory'], plugins: [] },
    { id: 'sql', title: 'SQL', plugins: [] },
    { id: 'other', title: 'Others', plugins: [] },
  ].filter(item => item);

  const categoryIndex: Record<string, DataSourcePluginCategory> = {};
  const pluginIndex: Record<string, DataSourcePluginMeta> = {};

  // build indices
  for (const category of categories) {
    categoryIndex[category.id] = category;
  }

  for (const plugin of plugins) {

    // Fix link name
    if (plugin.info.links) {
      for (const link of plugin.info.links) {
        link.name = 'Learn more';
      }
    }

    const category = categories.find(item => item.id === plugin.category) || categoryIndex['other'];
    category.plugins.push(plugin);
    // add to plugin index
    pluginIndex[plugin.id] = plugin;
  }

  for (const category of categories) {
    sortPlugins(category.plugins);
  }

  return categories;
}

function sortPlugins(plugins: DataSourcePluginMeta[]) {
    const sortingRules: { [id: string]: number } = {
      prometheus: 100,
      graphite: 95,
      loki: 90,
      mysql: 80,
      jaeger: 100,
      postgres: 79,
      gcloud: -1,
    };
  
    plugins.sort((a, b) => {
      const aSort = sortingRules[a.id] || 0;
      const bSort = sortingRules[b.id] || 0;
      if (aSort > bSort) {
        return -1;
      }
      if (aSort < bSort) {
        return 1;
      }
  
      return a.name > b.name ? -1 : 1;
    });
  }
  