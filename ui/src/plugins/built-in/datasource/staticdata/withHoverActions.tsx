import React, { useState } from 'react';

import { FormIndent, FormGroup, FormButton } from './Forms';

interface HoverActionsProps {
  onAdd: () => void;
  onRemove: () => void;
}

// withHoverActions is a higher-order component that adds Add and Remove buttons
// to a component when hovering over it.
export function withHoverActions<P>(Component: React.ComponentType<P>): React.FC<P & HoverActionsProps> {
  return props => {
    const [hover, setHover] = useState(false);

    return (
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <FormGroup>
          <FormIndent level={2} />

          <Component {...props} />

          {hover ? (
            <>
              <FormButton icon="plus" onClick={props.onAdd} />
              <FormButton icon="trash-alt" onClick={props.onRemove} />
            </>
          ) : null}
        </FormGroup>
      </div>
    );
  };
}
