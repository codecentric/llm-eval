import { azureOpenAiPlugin } from "@/app/[locale]/(authenticated)/llm-endpoints/plugins/implementations/azure-openai";
import { c4Plugin } from "@/app/[locale]/(authenticated)/llm-endpoints/plugins/implementations/c4";
import { openAiPlugin } from "@/app/[locale]/(authenticated)/llm-endpoints/plugins/implementations/openai";
import { asTuple } from "@/app/types/tuple";

export const endpointPlugins = asTuple([
  c4Plugin,
  openAiPlugin,
  azureOpenAiPlugin,
]);
