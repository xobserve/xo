import React, { memo, PropsWithChildren } from 'react';

export const TimePickerTitle = memo<PropsWithChildren<{}>>(({ children }) => {
  return <span className="ub-ml2">{children}</span>;
});
