import { getTranslations } from "next-intl/server";

import { Translations } from "@/app/types/translations";

vi.mock("next-intl/server");

export const mockTranslations: Translations = vi.fn((key, values) =>
  values ? `${key} - ${JSON.stringify(values)}` : key,
) as unknown as Translations;

vi.mocked(getTranslations).mockResolvedValue(mockTranslations);
