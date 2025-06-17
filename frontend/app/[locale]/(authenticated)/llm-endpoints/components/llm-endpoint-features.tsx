import { Chip } from "@heroui/react";
import { cx } from "classix";
import { useTranslations } from "next-intl";

import { PluginFeature } from "@/app/client";

const colorClassMap: Record<PluginFeature, string> = {
  CHAT_MODEL: "bg-option1 text-option1-foreground",
  LLM_QUERY: "bg-option2 text-option2-foreground",
};

export type LlmEndpointFeaturesProps = {
  supportedFeatures: PluginFeature[];
};

export const LlmEndpointFeatures = ({
  supportedFeatures,
}: LlmEndpointFeaturesProps) => {
  const t = useTranslations();

  return (
    <div className="flex flex-row gap-1">
      {supportedFeatures.map((feature) => {
        const colorClass = colorClassMap[feature];
        return (
          <Chip
            key={feature}
            size="sm"
            className={cx(colorClass, "bg-opacity-70")}
            radius="sm"
          >
            {t(`llmEndpointFeature.${feature}`)}
          </Chip>
        );
      })}
    </div>
  );
};
