import React, { FunctionComponent } from 'react';
import { ColorDefinition, getColorForTheme} from '../../../data';
import { Color } from 'csstype';
import upperFirst from 'lodash/upperFirst';
import find from 'lodash/find';
import { currentTheme } from '../../../data';

type ColorChangeHandler = (color: ColorDefinition) => void;

export enum ColorSwatchVariant {
  Small = 'small',
  Large = 'large',
}

interface ColorSwatchProps extends React.DOMAttributes<HTMLDivElement> {
  color: string;
  label?: string;
  variant?: ColorSwatchVariant;
  isSelected?: boolean;
}

export const ColorSwatch: FunctionComponent<ColorSwatchProps> = ({
  color,
  label,
  variant = ColorSwatchVariant.Small,
  isSelected,
  ...otherProps
}) => {
  const isSmall = variant === ColorSwatchVariant.Small;
  const swatchSize = isSmall ? '16px' : '32px';

  const swatchStyles = {
    width: swatchSize,
    height: swatchSize,
    borderRadius: '50%',
    background: `${color}`,
    marginRight: isSmall ? '0px' : '8px',
    boxShadow: isSelected ? `inset 0 0 0 2px ${color}, inset 0 0 0 4px rgba(0, 0, 0, 0.15)` : 'none',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      {...otherProps}
    >
      <div style={swatchStyles} />
      {variant === ColorSwatchVariant.Large && <span>{label}</span>}
    </div>
  );
};

interface NamedColorsGroupProps  {
  colors: ColorDefinition[];
  selectedColor?: Color;
  onColorSelect: ColorChangeHandler;
  key?: string;
}

const NamedColorsGroup: FunctionComponent<NamedColorsGroupProps> = ({
  colors,
  selectedColor,
  onColorSelect,
  ...otherProps
}) => {
  const primaryColor = find(colors, color => !!color.isPrimary);

  return (
    <div {...otherProps} style={{ display: 'flex', flexDirection: 'column' }}>
      {primaryColor && (
        <ColorSwatch
          key={primaryColor.name}
          isSelected={primaryColor.name === selectedColor}
          variant={ColorSwatchVariant.Large}
          color={getColorForTheme(primaryColor, currentTheme)}
          label={upperFirst(primaryColor.hue)}
          onClick={() => onColorSelect(primaryColor)}
        />
      )}
      <div
        style={{
          display: 'flex',
          marginTop: '8px',
        }}
      >
        {colors.map(
          color =>
            !color.isPrimary && (
              <div key={color.name} style={{ marginRight: '4px' }}>
                <ColorSwatch
                  key={color.name}
                  isSelected={color.name === selectedColor}
                  color={getColorForTheme(color, currentTheme)}
                  onClick={() => onColorSelect(color)}
                />
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default NamedColorsGroup;
