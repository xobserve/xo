import { useDialog } from '@react-aria/dialog';
import { useOverlay } from '@react-aria/overlays';
import React, { createRef } from 'react';


import { ComplexDataHoverView } from './ComplexDataHoverView';
import { GeomapHoverPayload } from './types';
import { TooltipContainer } from '../../graph/Tooltip/Tooltip';
import { Portal } from '@chakra-ui/portal';

interface Props {
  ttip?: GeomapHoverPayload;
  isOpen: boolean;
  onClose: () => void;
}

export const GeomapTooltip = ({ ttip, onClose, isOpen }: Props) => {
  const ref = createRef<HTMLElement>();
  const { overlayProps } = useOverlay({ onClose, isDismissable: true, isOpen }, ref);
  const { dialogProps } = useDialog({}, ref);

  return (
    <>
      {ttip && ttip.layers && (
        <Portal>
          <TooltipContainer position={{ x: ttip.pageX, y: ttip.pageY }} offset={{ x: 10, y: 10 }} allowPointerEvents>
            <section ref={ref} {...overlayProps} {...dialogProps}>
              <ComplexDataHoverView layers={ttip.layers} isOpen={isOpen} onClose={onClose} />
            </section>
          </TooltipContainer>
        </Portal>
      )}
    </>
  );
};
