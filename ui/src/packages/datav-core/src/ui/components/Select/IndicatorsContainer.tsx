import React from 'react';

export const IndicatorsContainer = React.forwardRef<HTMLDivElement, React.PropsWithChildren<any>>((props, ref) => {
  const { children } = props;

  return (
    <div
      className={'indicators-container-suffix'}
      ref={ref}
    >
      {children}
    </div>
  );
});
