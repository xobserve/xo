import React, { useMemo } from 'react';
import {
  PanelOptionsEditorItem,
  PanelPlugin,
  DataFrame,
  StandardEditorContext,
  InterpolateFunction,
} from 'src/packages/datav-core';
import { get as lodashGet, set as lodashSet } from 'lodash';
import { FormField as Field, FormLabel as Label} from 'src/packages/datav-core';
import groupBy from 'lodash/groupBy';
import { OptionsGroup } from './OptionsGroup';
import localeData from 'src/core/library/locale'
import { getState } from 'src/store/store';

interface PanelOptionsEditorProps<TOptions> {
  plugin: PanelPlugin;
  data?: DataFrame[];
  replaceVariables: InterpolateFunction;
  options: TOptions;
  onChange: (options: TOptions) => void;
}

export const PanelOptionsEditor: React.FC<PanelOptionsEditorProps<any>> = ({
  plugin,
  options,
  onChange,
  data,
  replaceVariables,
}) => {
  const optionEditors = useMemo<Record<string, PanelOptionsEditorItem[]>>(() => {
    return groupBy(plugin.optionEditors.list(), i => {
      return i.category ? i.category[0] : localeData[getState().application.locale]['common.display'];
    });
  }, [plugin]);

  const onOptionChange = (key: string, value: any) => {
    const newOptions = lodashSet({ ...options }, key, value);
    onChange(newOptions);
  };

  const context: StandardEditorContext = {
    data: data ?? [],
    replaceVariables,
  };

  return (
    <>
      {Object.keys(optionEditors).map((c, i) => {
        const optionsToShow = optionEditors[c]
          .map((e, j) => {
            if (e.showIf && !e.showIf(options)) {
              return null;
            }

            const subTitle = e.category?.slice(1)
            const label = (<>
              {subTitle && <h5>{subTitle}</h5>}
              <Label description={e.description}>
                {e.name}
              </Label>
              </>
            );

            return (
              <Field label={label} key={`${e.id}/${j}`}>
                <e.editor
                  value={lodashGet(options, e.path)}
                  onChange={value => onOptionChange(e.path, value)}
                  item={e}
                  context={context}
                />
              </Field>
            );
          })
          .filter(e => e !== null);

        return optionsToShow.length > 0 ? (
          <OptionsGroup title={c} defaultToClosed id={`${c}/${i}`} key={`${c}/${i}`}>
            <div>{optionsToShow}</div>
          </OptionsGroup>
        ) : null;
      })}
    </>
  );
};
