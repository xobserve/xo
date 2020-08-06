import React, { ButtonHTMLAttributes } from 'react';
import { IconButton } from 'src/packages/datav-core';

export interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  surface: 'dashboard' | 'panel' | 'header';
}

export const BackButton: React.FC<Props> = ({ surface, onClick }) => {
  return (
    <IconButton
      name="arrow-left"
      tooltip="Go back (Esc)"
      tooltipPlacement="bottom"
      size="xxl"
      surface={surface}
      onClick={onClick}
    />
  );
};

BackButton.displayName = 'BackButton';
