import { deprecationWarning } from '../../../data';
import { ColorPickerProps } from './ColorPickerPopover';

export const warnAboutColorPickerPropsDeprecation = (componentName: string, props: ColorPickerProps) => {
  const { onChange } = props;
  if (onChange) {
    deprecationWarning(componentName, 'onColorChange', 'onChange');
  }
};
