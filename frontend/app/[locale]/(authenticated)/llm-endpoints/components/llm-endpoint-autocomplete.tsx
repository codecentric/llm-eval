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

import {
  llmEndpointQueryDefinition,
  llmEndpointsQueryDefinition,
} from "@/app/[locale]/(authenticated)/llm-endpoints/queries";
import { LlmEndpoint, PluginFeature } from "@/app/client";
import {
  clientInfiniteQueryOptions,
  clientQueryOptions,
} from "@/app/utils/react-query/client";

export type LlmEndpointAutocompleteProps = {
  supportedFeatures?: PluginFeature[];
} & Omit<
  AutocompleteProps<LlmEndpoint>,
  "children" | "inputValue" | "isLoading" | "items" | "onInputChange"
>;

export const LlmEndpointAutocomplete = ({
  selectedKey,
  onSelectionChange,
  supportedFeatures,
  ...autocompleteProps
}: LlmEndpointAutocompleteProps) => {
  const [filterText, setFilterText] = useState("");
  const query = useDebounce(filterText, 200);

  const {
    data: items,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    clientInfiniteQueryOptions(
      llmEndpointsQueryDefinition({
        query: query || undefined,
        supportedFeatures,
      }),
    ),
  );

  const { data: endpointData } = useQuery({
    ...clientQueryOptions(llmEndpointQueryDefinition(selectedKey as string)),
    enabled: !!selectedKey,
  });

  useEffect(() => {
    if (endpointData) {
      setFilterText(endpointData.name);
    }
  }, [endpointData]);

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
      items={items ?? []}
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
