import { IconButton, IconName, stylesFactory, useTheme } from 'src/packages/datav-core/src';
import React from 'react';
import { css } from 'emotion';
import { DatavTheme } from 'src/packages/datav-core/src';

interface QueryOperationActionProps {
  icon: IconName;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export const QueryOperationAction: React.FC<QueryOperationActionProps> = ({ icon, disabled, title, ...otherProps }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const onClick = (e: React.MouseEvent) => {
    if (!disabled) {
      otherProps.onClick(e);
    }
  };
  return (
    <IconButton
      name={icon}
      title={title}
      className={styles.icon}
      disabled={!!disabled}
      onClick={onClick}
      surface="header"
    />
  );
};

QueryOperationAction.displayName = 'QueryOperationAction';

const getStyles = stylesFactory((theme: DatavTheme) => {
  return {
    icon: css`
      color: ${theme.colors.textWeak};
    `,
  };
});
