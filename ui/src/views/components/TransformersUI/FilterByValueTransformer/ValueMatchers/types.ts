import { Field, RegistryItem } from 'src/packages/datav-core/src';
export interface ValueMatcherUIRegistryItem<TOptions> extends RegistryItem {
  component: React.ComponentType<ValueMatcherUIProps<TOptions>>;
}

export interface ValueMatcherUIProps<TOptions> {
  options: TOptions;
  onChange: (options: TOptions) => void;
  field: Field;
}
export interface ValueMatcherEditorConfig {
  validator: (value: any) => boolean;
  converter?: (value: any, field: Field) => any;
}
