import React, { useState, InputHTMLAttributes } from 'react';
import { Icon, IconName, useTheme } from 'src/packages/datav-core/src';
import { NullableString } from './types';
import { css, cx } from 'emotion';

interface InlineFormProps {
  children: React.ReactNode;
}

export const InlineForm: React.FC<InlineFormProps> = ({ children }) => {
  return <div className="gf-form">{children}</div>;
};

export interface FormGroupProps extends InputHTMLAttributes<HTMLInputElement> {
  children?: React.ReactNode;
}

export const FormGroup: React.FC<Partial<FormGroupProps>> = ({ children }) => (
  <div className="gf-form-inline">{children}</div>
);

export interface FormProps {
  children?: React.ReactNode;
}

export const Form: React.FC<Partial<FormProps>> = ({ children }) => <div>{children}</div>;

export interface FormSpacerProps {}

export const FormSpacer: React.FC<Partial<FormSpacerProps>> = () => (
  <div className="gf-form gf-form--grow">
    <div className="gf-form-label gf-form-label--grow" />
  </div>
);

export interface FormLabelProps {
  text: string;
  width: number;
  keyword: boolean;
}

export const FormLabel: React.FC<Partial<FormLabelProps>> = ({ text, width = 8, keyword = false }) => {
  const widthClass = `width-${width}`;
  return <span className={cx('gf-form-label', widthClass, { 'query-keyword': keyword })}>{text}</span>;
};

export interface FormButtonProps {
  icon?: IconName;
  text?: string;
  onClick: () => void;
  expand: boolean;
}

export const FormButton: React.FC<Partial<FormButtonProps>> = ({ icon, text, onClick, expand = false }) => (
  <div className={cx({ 'gf-form': true, 'gf-form--grow': expand })}>
    <a
      className={cx({ 'gf-form-label': true, 'gf-form-label--grow': expand })}
      onClick={onClick}
      style={{ justifyContent: 'flex-start' }}
    >
      {icon ? <Icon name={icon} /> : null}
      {icon && text ? <span>&nbsp;</span> : null}
      {text}
    </a>
  </div>
);

export interface FormIndentProps {
  level: number;
}

export const FormIndent: React.FC<Partial<FormIndentProps>> = ({ level }) => (
  <InlineForm>
    <span className={`width-${level}`}></span>
  </InlineForm>
);

export interface FormInputProps {
  value: any;
  onChange: (e: any) => void;
}

export const FormInput: React.FC<Partial<FormInputProps>> = ({ onChange, value }) => {
  const theme = useTheme();

  return (
    <input
      className={cx(
        'gf-form-input',
        css`
          padding: 0 ${theme.spacing.sm};
          border-color: ${theme.colors.formInputBorder};
          &:focus {
            border-color: ${theme.colors.formInputBorder};
            outline: 2px dotted transparent;
            outline-offset: 2px;
            box-shadow: 0 0 0 2px ${theme.colors.bodyBg}, 0 0 0 4px ${theme.colors.formFocusOutline};
            transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
          }
        `
      )}
      onChange={onChange}
      value={value}
    />
  );
};

export interface FormNullableInputProps {
  value: NullableString;
  onChange: (value: NullableString) => void;
  onValidate: (value: NullableString) => boolean;
}

export const FormNullableInput: React.FC<Partial<FormNullableInputProps>> = ({ onChange, value, onValidate }) => {
  const theme = useTheme();
  const [disabled, setDisabled] = useState(value === null);
  const [lastValue, setLastValue] = useState(value);
  const [valid, setValid] = useState(onValidate ? onValidate(value ?? null) : true);

  if (onValidate) {
    const ok = onValidate(value ?? null);
    if (ok !== valid) {
      setValid(ok);
    }
  }

  const styles = {
    root: css`
      width: 128px;
      display: flex;

      background-color: ${disabled ? theme.colors.formInputBgDisabled : theme.colors.formInputBg};
      border: 1px solid ${valid ? theme.colors.formInputBorder : theme.colors.formInputBorderInvalid};
      padding: 0 ${theme.spacing.sm};

      border-radius: 4px;
      height: 100%;
      min-height: 32px;
      align-items: center;
      margin-right: 4px;

      &:focus-within {
        outline: 2px dotted transparent;
        outline-offset: 2px;
        box-shadow: 0 0 0 2px ${theme.colors.bodyBg}, 0 0 0px 4px ${theme.colors.formFocusOutline};
        transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
      }

      & > svg {
        color: transparent;
      }

      &:hover svg {
        color: ${theme.colors.textWeak};
      }
    `,
    input: css`
      font-size: ${theme.typography.size.md};
      background-color: transparent;
      min-width: 0;
      &:focus {
        outline: none;
      }
      &:disabled {
        color: ${theme.colors.textFaint};
        background-color: transparent;
      }
    `,
    button: css`
      display: inline-block;
      position: relative;
      right: 0px;
      border: 0;
      color: transparent;

      &:hover {
        cursor: pointer;
      }
    `,
  };

  return (
    <div className={styles.root}>
      <input
        disabled={disabled}
        className={styles.input}
        onChange={e => {
          if (onValidate) {
            setValid(onValidate(e.target.value));
          }
          if (onChange) {
            setLastValue(e.target.value);
            onChange(e.target.value);
          }
        }}
        value={disabled ? 'null' : value ?? ''}
      />
      <div
        className={styles.button}
        onClick={() => {
          setDisabled(!disabled);
          if (onChange) {
            if (!disabled) {
              onChange(null);
              setValid(true);
            } else {
              onChange(lastValue ?? null);
              if (onValidate) {
                setValid(onValidate(lastValue ?? null));
              }
            }
          }
        }}
      >
        <Icon name={disabled ? 'eye-slash' : 'eye'} />
      </div>
    </div>
  );
};

export interface FormSectionProps {
  label: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<Partial<FormSectionProps>> = ({ label, children }) => {
  const [show, setShow] = useState(true);
  return (
    <>
      <FormGroup>
        <FormButton
          onClick={() => {
            const newval = !show;
            setShow(newval);
          }}
          icon={show ? 'angle-down' : 'angle-right'}
          text={label}
          expand
        />
      </FormGroup>

      {show ? children : null}
    </>
  );
};
