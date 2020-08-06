// Libraries
import React, { memo } from 'react';



export interface PromExploreExtraFieldProps {
  label: string;
  onChangeFunc: (e: React.SyntheticEvent<HTMLInputElement>) => void;
  onKeyDownFunc: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  value: string;
  hasTooltip?: boolean;
  tooltipContent?: string;
}

export function PromExploreExtraField(props: PromExploreExtraFieldProps) {
  const {  onChangeFunc, onKeyDownFunc, value} = props;

  return (
    <div className="gf-form-inline explore-input--ml" aria-label="Prometheus extra field">
      <div className="gf-form">
        <input
          type={'text'}
          className="gf-form-input width-4"
          placeholder={'auto'}
          onChange={onChangeFunc}
          onKeyDown={onKeyDownFunc}
          value={value}
        />
      </div>
    </div>
  );
}

export default memo(PromExploreExtraField);
