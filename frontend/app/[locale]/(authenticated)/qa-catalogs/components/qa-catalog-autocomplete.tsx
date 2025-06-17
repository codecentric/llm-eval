"use client";

import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteProps,
} from "@heroui/react";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import { useCallback, useEffect, useState } from "react";

import { qaCatalogQueryDefinition } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/queries";
import { qaCatalogsQueryDefinition } from "@/app/[locale]/(authenticated)/qa-catalogs/queries";
import { QaCatalog } from "@/app/client";
import {
  clientInfiniteQueryOptions,
  clientQueryOptions,
} from "@/app/utils/react-query/client";

type Item = {
  id: string;
  name: string;
};

export type QaCatalogAutocompleteProps = {} & Omit<
  AutocompleteProps<QaCatalog>,
  "children" | "inputValue" | "isLoading" | "items" | "onInputChange"
>;

export const QaCatalogAutocomplete = ({
  selectedKey,
  onSelectionChange,
  ...autocompleteProps
}: QaCatalogAutocompleteProps) => {
  const [filterText, setFilterText] = useState("");
  const name = useDebounce(filterText, 200);

  const {
    data: items,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    clientInfiniteQueryOptions(
      qaCatalogsQueryDefinition({
        name: name || undefined,
      }),
    ),
  );

  const { data: qaCatalogData } = useQuery({
    ...clientQueryOptions(qaCatalogQueryDefinition(selectedKey as string)),
    enabled: !!selectedKey,
  });

  useEffect(() => {
    if (qaCatalogData) {
      setFilterText(qaCatalogData.name);
    }
  }, [qaCatalogData]);

  // noinspection DuplicatedCode
  const handleSelectionChange = useCallback(
    (key: string | number | null) => {
      const selectedItem = items?.find((item) => item.id === key);

      setFilterText(selectedItem?.name ?? "");

      onSelectionChange?.(key);
    },
    [items, onSelectionChange],
  );

  const [isOpen, setIsOpen] = useState(false);
  const [, scrollerRef] = useInfiniteScroll({
    hasMore: hasNextPage,
    onLoadMore: fetchNextPage,
    shouldUseLoader: false,
    isEnabled: isOpen,
  });

  return (
    <Autocomplete
      {...autocompleteProps}
      selectedKey={selectedKey}
      inputValue={filterText}
      isLoading={isLoading}
      items={(items as Item[] | undefined) ?? []}
      onInputChange={setFilterText}
      onSelectionChange={handleSelectionChange}
      scrollRef={scrollerRef}
      onOpenChange={setIsOpen}
      data-1p-ignore=""
    >
      {(item) => (
        <AutocompleteItem key={item.id} className="capitalize">
          {item.name}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
};
