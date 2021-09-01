import React, { FC, useEffect, useState } from 'react';
import { Controller as InputControl } from 'react-hook-form';
import {
  Button,
  FormAPI,
  HorizontalGroup,
  Input,
  Field,
  FormsOnSubmit
} from 'src/packages/datav-core/src/ui';
import { FolderPicker } from 'src/views/components/Pickers/FolderPicker';
import DataSourcePicker from 'src/views/components/Pickers/DataSourcePicker';
import  {DashboardInputs,ImportDashboardDTO,DataSourceInput,DashboardInput}  from '../../model/import'
import { validateTitle, validateUid } from '../../utils/validation';

interface Props extends Pick<FormAPI<ImportDashboardDTO>, 'register' | 'errors' | 'control' | 'getValues' | 'watch'> {
  uidReset: boolean;
  inputs: DashboardInputs;
  initialFolderId: number;

  onCancel: () => void;
  onUidReset: () => void;
  onSubmit: FormsOnSubmit<ImportDashboardDTO>;
}

export const ImportDashboardForm: FC<Props> = ({
  register,
  errors,
  control,
  getValues,
  uidReset,
  inputs,
  initialFolderId,
  onUidReset,
  onCancel,
  onSubmit,
  watch
}) => {
  const [isSubmitted, setSubmitted] = useState(false);

  /*
    This useEffect is needed for overwriting a dashboard. It
    submits the form even if there's validation errors on title or uid.
  */
  useEffect(() => {
    if (isSubmitted && (errors.title || errors.uid)) {
      onSubmit(getValues(), {} as any);
    }
  }, [errors]);

  return (
    <>
      <h3>Options</h3>
      <Field label="Name" invalid={!!errors.title} error={errors.title && errors.title.message}>
        <Input
          type="text"
          {...register("title",{
            required: 'Name is required',
            validate: async (v: string) => await validateTitle(v, getValues().folder.id),
          })}
        />
      </Field>
      <Field label="Folder">
      <InputControl
          render={({ field: { ref, ...field } }) => (
            <FolderPicker {...field} enableCreateNew initialFolderId={initialFolderId} />
          )}
          name="folder"
          control={control}
        />
      </Field>
      <Field
        label="Unique identifier (uid)"
        description="The unique identifier (uid) of a dashboard can be used for uniquely identify a dashboard between multiple Grafana installs.
                The uid allows having consistent URL’s for accessing dashboards so changing the title of a dashboard will not break any
                bookmarked links to that dashboard."
        invalid={!!errors.uid}
        error={errors.uid && errors.uid.message}
      >
        <>
          {!uidReset ? (
            <Input
              disabled
              {...register("uid",{ validate: async (v: string) => await validateUid(v)})}
              addonAfter={!uidReset && <Button onClick={onUidReset}>Change uid</Button>}
            />
          ) : (
            <Input {...register('uid', { required: true, validate: async (v: string) => await validateUid(v) })} />
          )}
        </>
      </Field>
      {inputs.dataSources &&
        inputs.dataSources.map((input: DataSourceInput, index: number) => {
          const dataSourceOption = `dataSources[${index}]`;
          return (
            <Field
              label={input.label}
              key={dataSourceOption}
              invalid={errors.dataSources && !!errors.dataSources[index]}
              error={errors.dataSources && errors.dataSources[index] && 'A data source is required'}
            >
              <InputControl
                name={dataSourceOption as any}
                render={({ field: { ref, ...field } }) => (
                  <DataSourcePicker
                    {...field}
                    datasources={input.options}
                    placeholder={input.info}
                  />
                )}
                control={control}
                rules={{ required: true }}
              />
            </Field>
          );
        })}
      {inputs.constants &&
        inputs.constants.map((input: DashboardInput, index) => {
          const constantIndex = `constants[${index}]`;
          return (
            <Field
              label={input.label}
              error={errors.constants && errors.constants[index] && `${input.label} needs a value`}
              invalid={errors.constants && !!errors.constants[index]}
              key={constantIndex}
            >
              <Input {...register(constantIndex as any,{ required: true })}  defaultValue={input.value} />
            </Field>
          );
        })}
      <HorizontalGroup>
        <Button
          type="submit"
          variant={getButtonVariant(errors)}
          onClick={() => {
            setSubmitted(true);
          }}
        >
          {getButtonText(errors)}
        </Button>
        <Button type="reset" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </HorizontalGroup>
    </>
  );
};

function getButtonVariant(errors) {
  return errors && (errors.title || errors.uid) ? 'destructive' : 'primary';
}

function getButtonText(errors) {
  return errors && (errors.title || errors.uid) ? 'Error Import' : 'Import';
}
