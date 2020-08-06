import React, { FC } from 'react';
import PluginListItem from './PluginListItem';
import { PluginMeta } from 'src/packages/datav-core';

interface Props {
  plugins: PluginMeta[];
}

const PluginList: FC<Props> = props => {
  const { plugins } = props;

  return (
    <section className="card-section card-list-layout-list plugin-card-list">
      <ol className="card-list">
        {plugins.map((plugin, index) => {
          return <PluginListItem plugin={plugin} key={`${plugin.name}-${index}`} />;
        })}
      </ol>
    </section>
  );
};

export default PluginList;
