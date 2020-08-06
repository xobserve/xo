import React, { useRef, useState, useLayoutEffect } from 'react';
import useClickAway from 'react-use/lib/useClickAway';
import {LinkTarget} from '../../../data';

import { List } from '../index';
import { Icon } from '../Icon/Icon';
import { IconName } from '../../types';
import './_ContextMenu.less'

export interface ContextMenuItem {
  label: string;
  target?: LinkTarget;
  icon?: string;
  url?: string;
  onClick?: (event?: React.SyntheticEvent<HTMLElement>) => void;
  group?: string;
}

export interface ContextMenuGroup {
  label?: string;
  items: ContextMenuItem[];
}
export interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  items?: ContextMenuGroup[];
  renderHeader?: () => React.ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = React.memo(({ x, y, onClose, items, renderHeader }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [positionStyles, setPositionStyles] = useState({});
  
  useLayoutEffect(() => {
    const menuElement = menuRef.current;
    if (menuElement) {
      const rect = menuElement.getBoundingClientRect();
      const OFFSET = 5;
      const collisions = {
        right: window.innerWidth < x + rect.width,
        bottom: window.innerHeight < rect.bottom + rect.height + OFFSET,
      };

      setPositionStyles({
        position: 'fixed',
        left: collisions.right ? x - rect.width - OFFSET : x - OFFSET,
        top: collisions.bottom ? y - rect.height - OFFSET : y + OFFSET,
      });
    }
    // eslint-disable-next-line 
  }, [menuRef.current]);

  useClickAway(menuRef, () => {
    if (onClose) {
      onClose();
    }
  });

  const header = renderHeader && renderHeader();
  return (
      <div ref={menuRef} style={positionStyles} className={"context-menu-wrapper"}>
        {header && <div className={"context-menu-header"}>{header}</div>}
        <List
          className="context-menu-body"
          items={items || []}
          renderItem={(item, index) => {
            return (
              <>
                <ContextMenuGroup group={item} onClick={onClose} />
              </>
            );
          }}
        />
      </div>
  );
});

interface ContextMenuItemProps {
  label: string;
  icon?: string;
  url?: string;
  target?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

const ContextMenuItem: React.FC<ContextMenuItemProps> = React.memo(
  ({ url, icon, label, target, onClick, className }) => {
    return (
      <div className={"context-menu-item"}>
        <a
          href={url ? url : undefined}
          target={target}
          className={"context-menu-link"}
          onClick={e => {
            if (onClick) {
              onClick(e);
            }
          }}
        >
          {icon && <Icon name={icon as IconName} className={"context-menu-icon"} />} {label}
        </a>
      </div>
    );
  }
);

interface ContextMenuGroupProps {
  group: ContextMenuGroup;
  onClick?: () => void; // Used with 'onClose'
}

const ContextMenuGroup: React.FC<ContextMenuGroupProps> = ({ group, onClick }) => {
  if (group.items.length === 0) {
    return null;
  }

  return (
    <div>
      {group.label && <div className={"context-menu-grouplabel"}>{group.label}</div>}
      <List
        items={group.items || []}
        renderItem={item => {
          return (
            <ContextMenuItem
              url={item.url}
              label={item.label}
              target={item.target}
              icon={item.icon}
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                if (item.onClick) {
                  item.onClick(e);
                }

                // Typically closes the context menu
                if (onClick) {
                  onClick();
                }
              }}
            />
          );
        }}
      />
    </div>
  );
};
ContextMenu.displayName = 'ContextMenu';
