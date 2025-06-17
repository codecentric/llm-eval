import { SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Control } from "react-hook-form";
import { z } from "zod";

import { LlmEndpointFeatures } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-endpoint-features";
import {
  filterSupportedEndpointTypes,
  supportedEndpointTypes,
} from "@/app/[locale]/(authenticated)/llm-endpoints/plugins";
import { FormSelect } from "@/app/[locale]/components/form-select";
import { LlmEndpointType } from "@/app/client";
import { formErrors } from "@/app/utils/form-errors";

export const endpointTypeSelectionSchema = z.object({
  endpointType: z.enum(supportedEndpointTypes, {
    required_error: formErrors.required,
    invalid_type_error: formErrors.required,
  }),
});

export type EndpointTypeSelectionFormProps = {
  endpointTypes: LlmEndpointType[];
  control: Control<z.infer<typeof endpointTypeSelectionSchema>>;
  isDisabled?: boolean;
};

export const EndpointTypeSelectionForm = ({
  control,
  endpointTypes,
  isDisabled,
}: EndpointTypeSelectionFormProps) => {
  const t = useTranslations();

  return (
    <FormSelect
      isRequired
      control={control}
      name="endpointType"
      label={t("EndpointTypeSelectionForm.select.label")}
      placeholder={t("EndpointTypeSelectionForm.select.placeholder")}
      variant="bordered"
      isDisabled={isDisabled}
      items={filterSupportedEndpointTypes(endpointTypes)}
    >
      {(type) => (
        <SelectItem
          key={type.name}
          textValue={t(`llmEndpointType.${type.name}`)}
        >
          <div className="flex flex-col gap-1">
            <div>{t(`llmEndpointType.${type.name}`)}</div>
            <div>
              <LlmEndpointFeatures supportedFeatures={type.supportedFeatures} />
            </div>
          </div>
        </SelectItem>
      )}
    </FormSelect>
  );
};
