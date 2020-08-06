import React from 'react';
import { Label } from './Label';
import { cx } from 'emotion';
import { FieldValidationMessage } from './FieldValidationMessage';
import './_Field.less'

export interface FieldProps {
  /** Form input element, i.e Input or Switch */
  children: React.ReactElement;
  /** Label for the field */
  label?: React.ReactNode;
  /** Description of the field */
  description?: string;
  /** Indicates if field is in invalid state */
  invalid?: boolean;
  /** Indicates if field is in loading state */
  loading?: boolean;
  /** Indicates if field is disabled */
  disabled?: boolean;
  /** Indicates if field is required */
  required?: boolean;
  /** Error message to display */
  error?: string;
  /** Indicates horizontal layout of the field */
  horizontal?: boolean;
  className?: string;
}



export const Field: React.FC<FieldProps> = ({
  label,
  description,
  horizontal,
  invalid,
  loading,
  disabled,
  required,
  error,
  children,
  className,
}) => {
  let inputId;
  // Get the first, and only, child to retrieve form input's id
  const child = React.Children.map(children, c => c)[0];

  if (child) {
    // Retrieve input's id to apply on the label for correct click interaction
    inputId = (child as React.ReactElement<{ id?: string }>).props.id;
  }
  const labelElement =
    typeof label === 'string' ? (
      <Label htmlFor={inputId} description={description}>
        {`${label}${required ? ' *' : ''}`}
      </Label>
    ) : (
      label
    );

  return (
    <div className={cx('datav-form-field', horizontal && 'datav-form-field-horizontal', className)}>
      {labelElement}
      <div>
        {React.cloneElement(children, { invalid, disabled, loading })}
        {invalid && error && !horizontal && (
          <div className={'datav-form-field-validation'}>
            <FieldValidationMessage>{error}</FieldValidationMessage>
          </div>
        )}
      </div>

      {invalid && error && horizontal && (
        <div className={cx('datav-form-field-validation', 'datav-form-field-validation-horizontal')}>
          <FieldValidationMessage>{error}</FieldValidationMessage>
        </div>
      )}
    </div>
  );
};
