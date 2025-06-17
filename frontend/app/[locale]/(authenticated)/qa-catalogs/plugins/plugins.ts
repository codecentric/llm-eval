import { asTuple } from "@/app/types/tuple";

import { ragasGeneratorPlugin } from "./implementations/ragas";

export const generatorPlugins = asTuple([ragasGeneratorPlugin]);
