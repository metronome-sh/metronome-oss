import { type FunctionComponent } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { invariant } from 'ts-invariant';

import { Badge, Button, cn, Command, Dialog, Icon, Popover, Separator } from '#app/components';
import { toActiveFilterOption, valueToActiveFilterOption } from '#app/filters/helpers';
import { useFiltersContext } from '#app/filters/hooks';

import {
  type CustomFilterOption,
  type FilterDefinitionFunction,
  type FilterOption,
} from '../../filters.types';
import { Updates } from './components/Updates';

type FilterProps = {
  // TODO fix typings
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: FilterDefinitionFunction<any, unknown>;
  highlight?: boolean;
};

export const Filter: FunctionComponent<FilterProps> = ({ filter, highlight }) => {
  const { activeFilterOptions, onSelect, analyzeDependencies, toFilterOption, onHover, onBlur } =
    useFiltersContext();

  const activeOption = useMemo(() => {
    const found = activeFilterOptions.find((o) => o.filterId === filter.filterId);
    invariant(found, `Could not find active filter option for filter with id ${filter.filterId}`);
    return found;
  }, [activeFilterOptions, filter.filterId]);

  const activeFilterOption = useMemo(() => {
    return toFilterOption(activeOption);
  }, [activeOption, toFilterOption]);

  const [open, setOpen] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);

  const label = useMemo(() => {
    if (!activeOption.isCustom) {
      return (activeFilterOption as FilterOption<unknown>).label(true);
    }

    const Component = (activeFilterOption as CustomFilterOption).label;

    return <Component value={activeOption.value} />;
  }, [activeOption, activeFilterOption]);

  const [customValue, setCustomValue] = useState<string[]>([]);

  const filterCustomLabelComponent = useMemo(() => {
    if (!filter.custom) return null;

    const CustomLabelComponent = filter.custom.label;
    return <CustomLabelComponent value={customValue} />;
  }, [customValue, filter.custom]);

  const filterCustomComponent = useMemo(() => {
    if (!filter.custom) return null;

    const Component = filter.custom.component;

    return <Component updates={[]} setValue={setCustomValue} value={customValue} />;
  }, [filter.custom, customValue]);

  const resetCustomDialog = useCallback(() => {
    setDialogOpen(false);
    setCustomValue([]);
    onBlur();
  }, [onBlur]);

  const IconComponent = filter?.icon ?? Icon.Filter;

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) return resetCustomDialog();
        return setDialogOpen(nextOpen);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn('h-8 border-dashed px-1 group', {
              'text-yellow-500 border-yellow-500': highlight,
            })}
          >
            <span className="pl-1">
              <IconComponent className="h-4 w-4" />
            </span>
            <Separator
              orientation="vertical"
              className="mx-2 h-4 group-hover:bg-muted-foreground/50"
            />
            <div className="space-x-1 lg:flex">
              <Badge
                variant="secondary"
                className={cn(
                  'rounded-sm px-1 font-normal group-hover:bg-muted-foreground/50 truncate',
                  {
                    'text-yellow-500': highlight,
                  },
                )}
              >
                {label}
              </Badge>
            </div>
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-[150px] p-1" align="start">
          <Command>
            <Command.List className="">
              {filter.options
                .filter((option) => !option.hidden)
                .map((option) => {
                  const { updates } = analyzeDependencies(
                    toActiveFilterOption(filter.filterId, option),
                  );
                  return (
                    <Command.Item
                      key={option.optionId}
                      className="space-x-2"
                      onMouseEnter={() => {
                        onHover(toActiveFilterOption(filter.filterId, option));
                      }}
                      onMouseLeave={() => {
                        onBlur();
                      }}
                      onSelect={() => {
                        onSelect(toActiveFilterOption(filter.filterId, option));
                        setOpen(false);
                        onBlur();
                      }}
                    >
                      <span
                        className={cn('text-[8px]', {
                          invisible: option.optionId !== activeOption.optionId,
                        })}
                      >
                        <div className="w-1 h-1 rounded-full bg-white" />
                      </span>
                      <span className="whitespace-nowrap text-xs">{option.label()}</span>
                      <Updates updates={updates} />
                    </Command.Item>
                  );
                })}

              {filter.custom ? (
                <>
                  <Command.Separator className="my-1" />
                  <Dialog.Trigger
                    onClick={() => {
                      if (activeOption.isCustom) {
                        setCustomValue(activeOption.value);
                      }
                    }}
                    asChild
                  >
                    <Command.Item className="flex gap-2 w-full">
                      <span
                        className={cn('text-[8px]', {
                          invisible: !activeOption.isCustom,
                        })}
                      >
                        <div className="w-2 h-2 rounded-full" />
                      </span>
                      <span>Custom</span>
                    </Command.Item>
                  </Dialog.Trigger>
                </>
              ) : null}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover>
      <Dialog.Content className="max-w-xl">
        <Dialog.Header>
          <Dialog.Title>Custom</Dialog.Title>
          {filter.custom?.description ? (
            <Dialog.Description>{filter.custom.description}</Dialog.Description>
          ) : null}
        </Dialog.Header>
        {filterCustomComponent}
        <Dialog.Footer className="gap-2">
          <Button variant="outline" type="button" onClick={resetCustomDialog}>
            Cancel
          </Button>
          <Button
            className="w-full sm:w-20"
            disabled={customValue.length === 0}
            onClick={() => {
              resetCustomDialog();
              onSelect(
                valueToActiveFilterOption(filter.filterId, customValue, filterCustomLabelComponent),
              );
            }}
          >
            Apply
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
