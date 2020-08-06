import React from 'react';
import {  css,cx } from 'emotion';
import { RightOutlined } from '@ant-design/icons';
import './_Label.less'
import tinycolor from 'tinycolor2';
import { DatavTheme } from '../../../data';
import { stylesFactory } from '../../themes';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  description?: React.ReactNode;
  category?: string[];
}


export const Label: React.FC<LabelProps> = ({ children, description, className, category, ...labelProps }) => {
  const categories = category?.map((c, i) => {
    return (
      <span className={'datav-form-label-categories'} key={`${c}/${i}`}>
        <span>{c}</span>
        <RightOutlined className={'datav-form-label-chevron'} />
      </span>
    );
  });

  return (
    <div className={cx('datav-form-label', className)}>
      <label {...labelProps}>
        <div className={'datav-form-label-content'}>
          {categories}
          {children}
        </div>
        {description && <span className={'datav-form-label-desc'}>{description}</span>}
      </label>
    </div>
  );
};

export const getLabelStyles = stylesFactory((theme: DatavTheme) => {
  return {
    label: css`
      label: Label;
      font-size: ${theme.typography.size.sm};
      font-weight: ${theme.typography.weight.semibold};
      line-height: 1.25;
      margin: ${theme.spacing.formLabelMargin};
      padding: ${theme.spacing.formLabelPadding};
      color: ${theme.colors.formLabel};
      max-width: 480px;
    `,
    labelContent: css`
      display: flex;
      align-items: center;
    `,
    description: css`
      label: Label-description;
      color: ${theme.colors.formDescription};
      font-size: ${theme.typography.size.sm};
      font-weight: ${theme.typography.weight.regular};
      margin-top: ${theme.spacing.xxs};
      display: block;
    `,
    categories: css`
      label: Label-categories;
      color: ${theme.isLight
        ? tinycolor(theme.colors.formLabel)
            .lighten(10)
            .toHexString()
        : tinycolor(theme.colors.formLabel)
            .darken(10)
            .toHexString()};
      display: inline-flex;
      align-items: center;
    `,
    chevron: css`
      margin: 0 ${theme.spacing.xxs};
    `,
  };
});