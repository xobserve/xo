import React, { FC } from 'react';
import { LoadingPlaceholder } from 'src/packages/datav-core/src';

interface Props {
  pageName?: string;
}

const PageLoader: FC<Props> = ({ pageName = '' }) => {
  const loadingText = `Loading ${pageName}...`;
  return (
    <div className="page-loader-wrapper">
      <LoadingPlaceholder text={loadingText} />
    </div>
  );
};

export default PageLoader;
