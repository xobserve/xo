import React, { useState } from 'react';
import { QueryEditorProps, FieldType, DataFrameDTO, toDataFrameDTO, MutableDataFrame } from 'src/packages/datav-core/src';
import { Select, Input, useTheme } from 'src/packages/datav-core/src';
import { DataSource } from './DataSource';
import { withHoverActions } from './withHoverActions';
import { NullableString, DataFrameViewModel } from './types';
import { css, cx } from 'emotion';
import {} from '@emotion/core';
import { Form, InlineForm, FormLabel, FormSection, FormButton, FormIndent, FormNullableInput } from './Forms';
import { StaticDataSourceOptions, StaticQuery } from './types';

const allFieldTypes = [
  FieldType.boolean,
  FieldType.number,
  FieldType.other,
  FieldType.string,
  FieldType.time,
  FieldType.trace,
];

type Props = QueryEditorProps<DataSource, StaticQuery, StaticDataSourceOptions>;

export const QueryEditor: React.FC<Props> = ({ onChange, onRunQuery, query }) => {
  // Load existing data frame, or create a new one.
  const frame: DataFrameDTO = query.frame ?? { fields: [] };

  // Create a view model for the data frame.
  const [frameModel, setFrameModel] = useState<DataFrameViewModel>(toViewModel(frame));

  const [schema, setSchema] = useState<FieldType[]>([]);

  // Call this whenever you modify the view model object.
  const onFrameChange = (frameModel: DataFrameViewModel) => {
    setFrameModel(frameModel);
    setSchema(frameModel.fields.map(f => f.type));
    onSaveFrame(frameModel);
  };

  // Call this whenever you want to save the changes to the view model.
  const onSaveFrame = (frameModel: DataFrameViewModel) => {
    const frame = toDataFrame(frameModel);
    onChange({ ...query, frame });
    onRunQuery();
  };

  /*
   * Frame manipulations
   */
  const renameFrame = (name: string) => {
    frameModel.name = name;
    onFrameChange(frameModel);
  };

  /*
   * Field manipulations
   */
  const addField = (pos: number) => {
    // Insert a field after the current position.
    frameModel.fields.splice(pos + 1, 0, {
      name: '',
      type: FieldType.string,
    });

    // Rebuild rows with the added field.
    frameModel.rows.forEach(row => {
      row.splice(pos + 1, 0, '');
    });

    onFrameChange(frameModel);
  };

  const removeField = (pos: number) => {
    // Remove the field at given position.
    frameModel.fields.splice(pos, 1);

    // Rebuild rows without the removed field.
    frameModel.rows.forEach(row => {
      row.splice(pos, 1);
    });

    // Remove all rows if there are no fields.
    if (frameModel.fields.length === 0) {
      frameModel.rows = [];
    }

    onFrameChange(frameModel);
  };

  const renameField = (text: string, i: number) => {
    frameModel.fields[i].name = text;
    onFrameChange(frameModel);
  };

  const changeFieldType = (t: FieldType, i: number) => {
    frameModel.fields[i].type = t;
    onFrameChange(frameModel);
  };

  /*
   * Row manipulations
   */
  const addRow = (pos: number) => {
    const emptyRow: NullableString[] = Array.from({ length: frameModel.fields.length }).map((_, i) => {
      switch (frameModel.fields[i].type) {
        case 'number':
          return '0';
        case 'time':
          return Date.now()
            .valueOf()
            .toString();
        case 'boolean':
          return 'false';
      }
      return '';
    });
    frameModel.rows.splice(pos + 1, 0, emptyRow);
    onFrameChange(frameModel);
  };

  const removeRow = (pos: number) => {
    frameModel.rows.splice(pos, 1);
    onFrameChange(frameModel);
  };

  /*
   * Cell manipulations
   */
  const editCell = (value: NullableString, rowIndex: number, fieldIndex: number) => {
    frameModel.rows[rowIndex][fieldIndex] = value;
    onFrameChange(frameModel);
  };

  return (
    <>
      <Form>
        {/* Data frame configuration */}
        <InlineForm>
          <FormLabel width={4} text="Name" keyword />
          <Input className="width-12" onChange={e => renameFrame(e.currentTarget.value)} value={frameModel.name} />
        </InlineForm>

        {/* Schema configuration */}
        <FormSection label="Schema">
          {frameModel.fields.map((field, i) => {
            return (
              <FieldSchemaInput
                key={i}
                name={field.name}
                type={field.type}
                onNameChange={name => renameField(name, i)}
                onTypeChange={type => changeFieldType(type, i)}
                onAdd={() => addField(i)}
                onRemove={() => removeField(i)}
              />
            );
          })}

          {/* Display a helper button if no fields have been added. */}
          {frameModel.fields.length === 0 ? (
            <InlineForm>
              <FormIndent level={2} />
              <FormButton text="Add a field" icon="plus" onClick={() => addField(0)} />
            </InlineForm>
          ) : null}
        </FormSection>

        {/* Value configuration */}
        <FormSection label="Values">
          {frameModel.fields.length > 0 ? (
            <>
              {/* Display the name of each field as a column header. */}
              <InlineForm>
                <FormIndent level={2} />
                {frameModel.fields.map((field, i) => (
                  <FormLabel key={i} text={field.name || '<no name>'} keyword />
                ))}
              </InlineForm>

              {/* Add all the rows. */}
              {frameModel.rows.map((row, i) => {
                return (
                  <RowValuesInput
                    key={i}
                    schema={schema}
                    values={row}
                    onValueChange={(value, fieldIndex) => {
                      editCell(value, i, fieldIndex);
                    }}
                    onAdd={() => addRow(i)}
                    onRemove={() => removeRow(i)}
                  />
                );
              })}

              {/* Display a helper button if no rows have been added. */}
              {frameModel.rows.length === 0 ? (
                <InlineForm>
                  <FormIndent level={2} />
                  <FormButton text="Add a row" icon="plus" onClick={() => addRow(0)} />
                </InlineForm>
              ) : null}
            </>
          ) : null}
        </FormSection>
      </Form>
    </>
  );
};

interface RowValuesInputProps {
  schema: FieldType[];
  values: NullableString[];
  onValueChange: (value: NullableString, fieldIndex: number) => void;
}

const RowValuesInput = withHoverActions(({ values, onValueChange, schema }: RowValuesInputProps) => {
  return (
    <InlineForm>
      {values.map((value: NullableString, j: number) => {
        return (
          <FormNullableInput
            key={j}
            onValidate={value => {
              return toFieldValue(value, schema[j]).ok;
            }}
            onChange={value => {
              onValueChange(value, j);
            }}
            value={value}
          />
        );
      })}
    </InlineForm>
  );
});

const toFieldValue = (
  value: NullableString,
  type: FieldType
): { ok: boolean; value?: string | number | boolean | null; error?: string } => {
  if (value === null) {
    return { ok: true, value };
  }

  switch (type) {
    case FieldType.number:
      const num = Number(value);
      return value === '' || isNaN(num) ? { ok: false, error: 'Invalid number' } : { ok: true, value: num };
    case FieldType.time:
      const time = Number(value);
      return value === '' || isNaN(time) ? { ok: false, error: 'Invalid timestamp' } : { ok: true, value: time };
    case FieldType.boolean:
      const truthy = !!['1', 'true', 'yes'].find(_ => _ === value);
      const falsy = !!['0', 'false', 'no'].find(_ => _ === value);

      if (!truthy && !falsy) {
        return { ok: false, error: 'Invalid boolean' };
      }
      return { ok: true, value: truthy };
    default:
      return { ok: true, value: value.toString() };
  }
};

interface FieldSchemaInputProps {
  onNameChange: (name: string) => void;
  name: string;

  onTypeChange: (t: FieldType) => void;
  type: FieldType;
}

const FieldSchemaInput = withHoverActions(({ onNameChange, name, onTypeChange, type }: FieldSchemaInputProps) => {
  const theme = useTheme();

  return (
    <InlineForm>
      <Select
        className={cx(
          'width-8',
          css`
            margin-right: ${theme.spacing.xs};
          `
        )}
        onChange={e => {
          onTypeChange(e.value as FieldType);
        }}
        value={type}
        options={allFieldTypes.map(t => ({
          label: t,
          value: t,
        }))}
      ></Select>
      <Input
        className={css`
          margin-right: ${theme.spacing.xs};
        `}
        onChange={e => {
          onNameChange(e.currentTarget.value);
        }}
        value={name}
      />
    </InlineForm>
  );
});

const toDataFrame = (model: DataFrameViewModel): DataFrameDTO => {
  const frame = new MutableDataFrame({
    name: model.name,
    fields: model.fields.map(_ => ({ name: _.name, type: _.type })),
  });
  model.rows.forEach(_ =>
    frame.appendRow(
      _.map((_, i) => {
        const res = toFieldValue(_, frame.fields[i].type);
        return res.ok ? res.value : null;
      })
    )
  );
  return toDataFrameDTO(frame);
};

const toViewModel = (frame: DataFrameDTO): DataFrameViewModel => {
  if (frame.fields.length === 0) {
    return {
      name: frame.name,
      fields: [],
      rows: [],
    };
  }
  const fields = frame.fields.map(_ => ({ name: _.name, type: _.type ?? FieldType.string }));
  const rows = Array.from({ length: frame.fields[0].values?.length ?? 0 }).map((_, i) =>
    frame.fields.map(field => (field.values as any[])[i]?.toString() ?? null)
  );

  return {
    name: frame.name,
    fields,
    rows,
  };
};
