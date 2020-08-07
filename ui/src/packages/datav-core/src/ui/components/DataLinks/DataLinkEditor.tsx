import React, { ChangeEvent } from 'react';
import { DataLink, VariableSuggestion, DatavTheme, localeData, currentLang } from '../../../data';
import { Switch } from '../Switch/Switch';
import { css } from 'emotion';
import { stylesFactory, useTheme } from '../../themes/index';
import { DataLinkInput } from './DataLinkInput';
import { Field } from '../Form/Field';
import { Input } from '../Input/Input';

interface DataLinkEditorProps {
  index: number;
  isLast: boolean;
  value: DataLink;
  suggestions: VariableSuggestion[];
  onChange: (index: number, link: DataLink, callback?: () => void) => void;
}

const getStyles = stylesFactory((theme: DatavTheme) => ({
  listItem: css`
    margin-bottom: ${theme.spacing.sm};
  `,
  infoText: css`
    padding-bottom: ${theme.spacing.md};
    margin-left: 66px;
    color: ${theme.colors.textWeak};
  `,
}));

export const DataLinkEditor: React.FC<DataLinkEditorProps> = React.memo(
  ({ index, value, onChange, suggestions, isLast }) => {
    const theme = useTheme();
    const styles = getStyles(theme);

    const onUrlChange = (url: string, callback?: () => void) => {
      onChange(index, { ...value, url }, callback);
    };
    const onTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange(index, { ...value, title: event.target.value });
    };

    const onOpenInNewTabChanged = () => {
      onChange(index, { ...value, targetBlank: !value.targetBlank });
    };

    return (
      <div className={styles.listItem}>
        <Field label={localeData[currentLang]['common.title']}>
          <Input value={value.title} onChange={onTitleChange} placeholder={localeData[currentLang]['panel.showDetails']} />
        </Field>

        <Field label="URL">
          <DataLinkInput value={value.url} onChange={onUrlChange} suggestions={suggestions} />
        </Field>

        <Field label={localeData[currentLang]['common.openInNewTab']}>
          <Switch checked={value.targetBlank || false} onChange={onOpenInNewTabChanged} />
        </Field>

        {isLast && (
          <div className={styles.infoText}>
            With data links you can reference data variables like series name, labels and values. Type CMD+Space,
            CTRL+Space, or $ to open variable suggestions.
          </div>
        )}
      </div>
    );
  }
);

DataLinkEditor.displayName = 'DataLinkEditor';
