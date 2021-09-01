import React, { FC } from 'react';
import { css } from 'emotion';
import { PanelMenuItem} from 'src/packages/datav-core/src';
import { useTheme,IconName,Icon} from 'src/packages/datav-core/src/ui';

interface Props {
  children: any;
}

export const PanelHeaderMenuItem: FC<Props & PanelMenuItem> = props => {
  const theme = useTheme()
  const isSubMenu = props.type === 'submenu';
  const isDivider = props.type === 'divider';
  const menuIconClassName = css`
    margin-right: ${theme.spacing.sm};
    a::after {
      display: none;
    }
  `;
  const shortcutIconClassName = css`
    position: absolute;
    top: 7px;
    right: ${theme.spacing.xs};
    color: ${theme.colors.textWeak};
  `;
  return isDivider ? (
    <li className="divider" />
  ) : (
    <li className={isSubMenu ? 'dropdown-submenu' : undefined}>
      <a onClick={props.onClick} href={props.href}>
        {props.iconClassName && <Icon name={props.iconClassName as IconName} className={menuIconClassName} />}
        <span className="dropdown-item-text ub-ml1">
          {props.text}
          {isSubMenu && <Icon name="angle-right" className={shortcutIconClassName} />}
        </span>
        {props.shortcut && (
          <span className="dropdown-menu-item-shortcut">
            <Icon name="keyboard" className={menuIconClassName} /> {props.shortcut}
          </span>
        )}
      </a>
      {props.children}
    </li>
  );
};
