import React, { HTMLProps } from 'react';
import { DatavTheme } from '../../../data';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme } from '../../themes';
import { getFocusStyle, sharedInputStyle } from '../Form/commonStyles';

export interface TexAreaProps extends Omit<HTMLProps<HTMLTextAreaElement>, 'size'> {
  /** Show an invalid state around the input */
  invalid?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TexAreaProps>(({ invalid, className, ...props }, ref) => {
  const theme = useTheme();
  const styles = getTextAreaStyle(theme, invalid);

  return <textarea {...props} className={cx(styles.textarea, className)} ref={ref} />;
});

const getTextAreaStyle = stylesFactory((theme: DatavTheme, invalid = false) => {
  return {
    textarea: cx(
      sharedInputStyle(theme),
      getFocusStyle(theme),
      css`
        border-radius: ${theme.border.radius.sm};
        padding: ${theme.spacing.formSpacingBase / 4}px ${theme.spacing.formSpacingBase}px;
        width: 100%;
        border-color: ${invalid ? theme.palette.redBase : theme.colors.formInputBorder};
      `
    ),
  };
});
