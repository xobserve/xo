import React from 'react';
import { CustomPicker, ColorResult } from 'react-color';

import { Saturation, Hue, Alpha } from 'react-color/lib/components/common';
import tinycolor from 'tinycolor2';
import ColorInput from './ColorInput';
import SpectrumPalettePointer, { SpectrumPalettePointerProps } from './SpectrumPalettePointer';
import { getColorFromHexRgbOrName} from '../../../data';
import { Themeable } from '../../types';

export interface SpectrumPaletteProps extends Themeable {
  color: string;
  onChange: (color: string) => void;
}

const renderPointer = () => (props: SpectrumPalettePointerProps) => (
  <SpectrumPalettePointer {...props} />
);

// @ts-ignore
const SpectrumPicker = CustomPicker(({ rgb, hsl, onChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              position: 'relative',
              height: '100px',
              width: '100%',
            }}
          >
            {/*
      // @ts-ignore */}
            <Saturation onChange={onChange} hsl={hsl} hsv={tinycolor(hsl).toHsv()} />
          </div>
          <div
            style={{
              width: '100%',
              height: '16px',
              marginTop: '16px',
              position: 'relative',
              background: 'white',
            }}
          >
            {/*
      // @ts-ignore */}
            <Alpha rgb={rgb} hsl={hsl} a={rgb.a} onChange={onChange} pointer={renderPointer()} />
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            width: '16px',
            height: '100px',
            marginLeft: '16px',
          }}
        >
          {/*
        // @ts-ignore */}
          <Hue onChange={onChange} hsl={hsl} direction="vertical" pointer={renderPointer()} />
        </div>
      </div>
    </div>
  );
});

const SpectrumPalette: React.FunctionComponent<SpectrumPaletteProps> = ({ color, onChange,theme }) => {
  console.log(color)
  return (
    <div>
      <SpectrumPicker
        color={tinycolor(getColorFromHexRgbOrName(color)).toRgb()}
        onChange={(a: ColorResult) => {
          onChange(tinycolor(a.rgb).toString());
        }}
      />
      <ColorInput theme={theme} color={color} onChange={onChange} style={{ marginTop: '16px' }} />
    </div>
  );
};

export default SpectrumPalette;
