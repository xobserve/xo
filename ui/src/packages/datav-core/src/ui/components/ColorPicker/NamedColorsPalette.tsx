import React from 'react';
import { Color, getNamedColorPalette } from '../../../data';
import NamedColorsGroup from './NamedColorsGroup';

export interface NamedColorsPaletteProps  {
  color?: Color;
  onChange: (colorName: string) => void;
}

export const NamedColorsPalette = ({ color, onChange}: NamedColorsPaletteProps) => {
  const swatches: JSX.Element[] = [];
  getNamedColorPalette().forEach((colors, hue) => {
    swatches.push(
      <NamedColorsGroup
        key={hue}
        selectedColor={color}
        colors={colors}
        onColorSelect={color => {
          onChange(color.name);
        }}
      />
    );
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridRowGap: '24px',
        gridColumnGap: '24px',
      }}
    >
      {swatches}
    </div>
  );
};
