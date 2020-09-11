import React from 'react';
import { cx } from 'emotion';
import {toPascalCase} from '../../../data';
import {IconType, IconSize } from '../../types/icon';
//@ts-ignore
import * as DefaultIcon from '@iconscout/react-unicons';
import * as MonoIcon from './assets';
import './_Icon.less'

const alwaysMonoIcons = ['grafana', 'favorite', 'heart-break', 'heart'];

export interface IconProps extends React.HTMLAttributes<HTMLDivElement> {
  name: any;
  size?: IconSize;
  type?: IconType;
}


export const Icon = React.forwardRef<HTMLDivElement, IconProps>(
  ({ size = 'md', type = 'default', name, className, style, ...divElementProps }, ref) => {
    const svgSize = getSvgSize(size);

    /* Temporary solution to display also font awesome icons */
    const isFontAwesome = name?.includes('fa-');
    if (isFontAwesome) {
      return <i className={cx(name, className)} {...divElementProps} style={style} />;
    }

    if (alwaysMonoIcons.includes(name)) {
      type = 'mono';
    }

    const iconName = type === 'default' ? `Uil${toPascalCase(name)}` : toPascalCase(name);

    /* Unicons don't have type definitions */
    //@ts-ignore
    const Component = type === 'default' ? DefaultIcon[iconName] : MonoIcon[iconName];

    if (!Component) {
      return <div className="no-icon-founded"/>;
    }

    return (
      <div className="datav-icon-container" {...divElementProps} ref={ref}>
        {type === 'default' && <Component size={svgSize} className={cx("datav-icon", className)} style={style} />}
        {type === 'mono' && (
          <Component
            size={svgSize}
            className={cx("datav-icon", { 'datav-orange': name === 'favorite' }, className)}
            style={style}
          />
        )}
      </div>
    );
  }
);

Icon.displayName = 'Icon';

/* Transform string with px to number and add 2 pxs as path in svg is 2px smaller */
export const getSvgSize = (size: IconSize) => {
  switch (size) {
    case 'xs':
      return 12;
    case 'sm':
      return 14;
    case 'md':
      return 16;
    case 'lg':
      return 18;
    case 'xl':
      return 24;
    case 'xxl':
      return 36;
    case 'xxxl':
      return 48;
  }
};
