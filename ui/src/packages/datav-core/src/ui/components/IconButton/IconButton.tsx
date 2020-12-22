import React from 'react';
import { Icon, getSvgSize } from '../Icon/Icon';
import { IconName, IconSize, IconType } from '../..';
import { cx } from 'emotion';
import { Tooltip } from '../Tooltip/Tooltip';
import { TooltipPlacement } from '../Tooltip/PopoverController';
import './IconButton.less'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  name: IconName;
  size?: IconSize;
  /** Need this to change hover effect based on what surface it is on */
  surface?: SurfaceType;
  iconType?: IconType;
  tooltip?: string;
  tooltipPlacement?: TooltipPlacement;
}

type SurfaceType = 'dashboard' | 'panel' | 'header';

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ name, size = 'md', surface = 'panel', iconType, tooltip, tooltipPlacement, className, ...restProps }, ref) => {
    const pixelSize = getSvgSize(size);
    const button = (
      <button ref={ref} {...restProps} className={cx('datav-icon-button', className)} style={{width:`${pixelSize}px`,height:`${pixelSize}px`}}>
        <Icon name={name} size={size} className={'datav-icon-button-icon'} type={iconType} />
      </button>
    );

    if (tooltip) {
      return (
        <Tooltip content={tooltip} placement={tooltipPlacement}>
          {button}
        </Tooltip>
      );
    }

    return button;
  }
);

IconButton.displayName = 'IconButton';

