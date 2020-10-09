import React, { FC } from 'react';
import PluginListItem from './PluginListItem';
import { PluginMeta } from 'src/packages/datav-core';
import { FormattedMessage } from 'react-intl';

interface Props {
  plugins: PluginMeta[];
}

const PluginList: FC<Props> = props => {
  const { plugins } = props;

  return (
    <section className="card-section card-list-layout-list plugin-card-list">
      <ol className="card-list">
        <div className="add-data-source-category__header"><FormattedMessage id="common.builtin"/></div>
        {plugins.map((plugin, index) => {
          if (plugin.isExternal) {
            return null
          }
          return <PluginListItem plugin={plugin} key={`${plugin.name}-${index}`} />;
        })}
      </ol>

      <ol className="card-list ub-mt3">
        <div className="add-data-source-category__header"><FormattedMessage id="common.external"/></div>
        {plugins.map((plugin, index) => {
          if (!plugin.isExternal) {
            return null
          }
          return <PluginListItem plugin={plugin} key={`${plugin.name}-${index}`} />;
        })}
      </ol>

    </section>
  );
};

export default PluginList;
