import { type FunctionComponent, type ReactNode } from 'react';
import { type Schema } from 'zod';

export interface CompatibleFilters {
  filter: string;
  // TODO - fix typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: (string | ((value: any, self: any) => boolean))[];
}

export interface FilterOption<OptionId> {
  optionId: OptionId;
  hidden?: boolean;
  label: (active?: boolean) => ReactNode;
  value: () => string[];
  dependencies?: Record<
    string,
    (selfValue: string[], dependencyValue: string[]) => boolean | Schema<unknown>
  >;
}

export interface CustomFilterOption {
  description: string;
  component: FunctionComponent<CustomComponentProps>;
  label: FunctionComponent<CustomLabelProps>;
  validate?: (value: string[]) => boolean | Schema<unknown>;
  dependencies?: Record<
    string,
    (selfValue: string[], dependencyValue: string[]) => boolean | Schema<unknown>
  >;
}

export interface FilterDefinitionFunction<OptionId extends string, ServerParse> {
  filterId: string;
  label: string;
  icon?: FunctionComponent;
  server: ServerFilterProps<ServerParse>;
  initial: OptionId;
  options: FilterOption<OptionId>[];
  custom?: CustomFilterOption;
}

export interface FilterUpdate {
  from: ActiveFilterOption;
  to: ActiveFilterOption;
}

export type CustomComponentProps = {
  updates: FilterUpdate[];
  setValue: (value: string[]) => void;
  value: string[];
};

export interface CustomLabelProps {
  value: string[];
}

export interface ServerFilterProps<Parses> {
  parse: (
    activeOption: ActiveFilterOption,
    request: Request,
    // TODO - fix typings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filter: FilterDefinitionFunction<any, unknown>,
  ) => Parses | Promise<Parses>;
}

export type ActiveFilterOption<T = string> = {
  filterId: string;
  optionId: string | 'custom';
  label: ReactNode;
  value: T[];
  isCustom?: boolean;
};
