import React from 'react';
import { css, cx } from '@emotion/css';
import { Icon } from '../Icon/Icon';
import { Tooltip } from '../Tooltip/Tooltip';
import { useStyles } from '../../themes';

/**
 * @internal
 */
export type LoadingIndicatorProps = {
  loading: boolean;
  onCancel: () => void;
};

/**
 * @internal
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ onCancel, loading }) => {
  const styles = useStyles(getStyles);

  if (!loading) {
    return null;
  }

  return (
    <Tooltip content="Cancel query">
      <Icon
        className={cx('spin-clockwise', { [styles.clickable]: !!onCancel })}
        name="sync"
        size="sm"
        onClick={onCancel}
      />
    </Tooltip>
  );
};

const getStyles = () => {
  return {
    clickable: css`
      cursor: pointer;
    `,
  };
};
