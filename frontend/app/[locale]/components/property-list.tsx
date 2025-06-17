import { Divider } from "@heroui/react";
import { cx } from "classix";
import { useFormatter } from "next-intl";
import { Key, ReactNode } from "react";

import { YesNo } from "@/app/[locale]/components/yes-no";
import { FULL_NUMERIC_DATE_FORMAT_OPTIONS } from "@/app/[locale]/hooks/use-i18n-date-cell-renderer";

export const Separator = Symbol("Separator");

export type BasicValueType =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined;
export type ValueRenderFn<T> = (value: T) => ReactNode;
export type PropertyListSeparatorItem = typeof Separator;
export type PropertyListValueItem<T = unknown> = {
  key?: Key;
  label: string;
  value: T;
  renderValue: T extends unknown[]
    ? ValueRenderFn<T> | undefined
    : ValueRenderFn<T>;
  renderArrayValue: T extends unknown[] ? ValueRenderFn<T[number]> : never;
  emptyValueFallback?: string;
  fullWidth?: boolean;
};

const EMPTY_VALUE_FALLBACK = "-";

type CreateBasicValueItem<T extends BasicValueType> = Omit<
  PropertyListValueItem<T>,
  "renderValue" | "renderArrayValue"
> & {
  renderValue?: ValueRenderFn<T>;
};
type CreateBasicValueArrayItem<T extends BasicValueType> = Omit<
  PropertyListValueItem<T[]>,
  "renderValue" | "renderArrayValue"
> & {
  renderValue?: ValueRenderFn<T[]>;
  renderArrayValue?: ValueRenderFn<T>;
};
type CreateNonBasicValueItem<T> = Omit<
  PropertyListValueItem<T>,
  "renderValue" | "renderArrayValue"
> & {
  renderValue: ValueRenderFn<T>;
};
type CreateNonBasicValueArrayItem<T> = Omit<
  PropertyListValueItem<T[]>,
  "renderValue" | "renderArrayValue"
> &
  (
    | {
        renderArrayValue: ValueRenderFn<T>;
      }
    | {
        renderValue: ValueRenderFn<T[]>;
      }
  );

export type CreateValueItem<T> = T extends unknown[]
  ? T[number] extends BasicValueType
    ? CreateBasicValueArrayItem<T[number]>
    : CreateNonBasicValueArrayItem<T[number]>
  : T extends BasicValueType
    ? CreateBasicValueItem<T>
    : CreateNonBasicValueItem<T>;

const BasicValue = ({
  value,
  emptyValueFallback = EMPTY_VALUE_FALLBACK,
}: {
  value: BasicValueType;
  emptyValueFallback?: string;
}) => {
  const formatter = useFormatter();

  return value == null ? (
    emptyValueFallback
  ) : typeof value === "boolean" ? (
    <YesNo value={value} />
  ) : value instanceof Date ? (
    formatter.dateTime(value, FULL_NUMERIC_DATE_FORMAT_OPTIONS)
  ) : (
    value
  );
};

const renderBasicValue =
  (emptyValueFallback?: string): ValueRenderFn<BasicValueType> =>
  // eslint-disable-next-line react/display-name
  (value) => {
    return <BasicValue value={value} emptyValueFallback={emptyValueFallback} />;
  };

export const createListValueItem = <T,>(
  item: CreateValueItem<T>,
): PropertyListValueItem => {
  let valueItem;

  if (Array.isArray(item.value)) {
    valueItem = {
      ...item,
      renderValue: (
        item as {
          renderValue?: ValueRenderFn<unknown>;
        }
      ).renderValue,
      renderArrayValue:
        (
          item as {
            renderArrayValue?: ValueRenderFn<unknown>;
          }
        ).renderArrayValue ?? renderBasicValue(item.emptyValueFallback),
    };
  } else {
    valueItem = {
      ...item,
      renderValue:
        (
          item as
            | CreateBasicValueItem<BasicValueType>
            | CreateNonBasicValueItem<T>
        ).renderValue ?? renderBasicValue(item.emptyValueFallback),
    };
  }

  return valueItem as PropertyListValueItem;
};

export type PropertyListItem =
  | PropertyListSeparatorItem
  | PropertyListValueItem;

export type PropertyListProps = {
  items: (PropertyListItem | undefined | null)[];
};

export const PropertyList = ({ items }: PropertyListProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {items
        .filter((item) => !!item)
        .map((item, index) =>
          item === Separator ? (
            <Divider key={index} className="col-span-2" />
          ) : (
            <div
              key={item.key ?? index}
              className={cx(item.fullWidth && "col-span-2")}
              data-testid={`property-list-item-${item.key ?? index}`}
            >
              <div className="text-secondary font-bold text-sm mb-1">
                {item.label}
              </div>
              <div>
                {item.renderValue ? (
                  item.renderValue(item.value)
                ) : Array.isArray(item.value) && item.value.length > 0 ? (
                  <ul className="list-disc">
                    {item.value.map((value, i) => (
                      <li key={i} className="ml-5">
                        {(
                          item as PropertyListValueItem<unknown[]>
                        ).renderArrayValue(value)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  (item.emptyValueFallback ?? EMPTY_VALUE_FALLBACK)
                )}
              </div>
            </div>
          ),
        )}
    </div>
  );
};
