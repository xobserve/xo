import { useDialog } from '@react-aria/dialog';
import { useOverlay } from '@react-aria/overlays';
import React, { createRef } from 'react';


import { ComplexDataHoverView } from './ComplexDataHoverView';
import { GeomapHoverPayload } from './types';
import { TooltipContainer } from '../../graph/Tooltip/Tooltip';
import { Portal } from '@chakra-ui/portal';

interface Props {
  tooltip?: GeomapHoverPayload;
  isOpen: boolean;
  onClose: () => void;
}

export const GeomapTooltip = ({ tooltip, onClose, isOpen }: Props) => {
  const ref = createRef<HTMLElement>();
  const { overlayProps } = useOverlay({ onClose, isDismissable: true, isOpen }, ref);
  const { dialogProps } = useDialog({}, ref);

  return (
    <>
      {tooltip && tooltip.layers && (
        <Portal>
          <TooltipContainer position={{ x: tooltip.pageX, y: tooltip.pageY }} offset={{ x: 10, y: 10 }} allowPointerEvents>
            <section ref={ref} {...overlayProps} {...dialogProps}>
              <ComplexDataHoverView layers={tooltip.layers} isOpen={isOpen} onClose={onClose} />
            </section>
          </TooltipContainer>
        </Portal>
      )}
    </>
  );
};
