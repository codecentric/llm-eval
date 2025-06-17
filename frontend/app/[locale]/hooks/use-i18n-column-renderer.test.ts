import "@/app/test-utils/mock-intl";
import { renderHook } from "@testing-library/react";

import { useI18nColumnRenderer } from "@/app/[locale]/hooks/use-i18n-column-renderer";
import { TableColumn } from "@/app/hooks/use-table";

describe("useI18nColumnRenderer", () => {
  const testColumn: TableColumn<number, string> = {
    key: "key",
  };

  it("should render translated text without prefix", () => {
    const { result } = renderHook(() => useI18nColumnRenderer());

    expect(result.current(testColumn)).toEqual("key");
  });

  it("should render translated text with prefix", () => {
    const { result } = renderHook(() => useI18nColumnRenderer("prefix"));

    expect(result.current(testColumn)).toEqual("prefix.key");
  });
});
