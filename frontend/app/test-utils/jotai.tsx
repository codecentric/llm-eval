import { Provider, WritableAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { PropsWithChildren } from "react";

type InferAtomTuples<T> = {
  [K in keyof T]: T[K] extends readonly [infer A, unknown]
    ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
      A extends WritableAtom<unknown, infer Args, infer _Result>
      ? readonly [A, Args[0]]
      : T[K]
    : never;
};

const HydrateAtoms = <
  T extends (readonly [WritableAtom<unknown, never[], unknown>, unknown])[],
>({
  initialValues,
  children,
}: PropsWithChildren<{
  initialValues: InferAtomTuples<T>;
}>) => {
  useHydrateAtoms<T>(initialValues);
  return children;
};

export const JotaiTestProvider = <
  T extends (readonly [WritableAtom<unknown, never[], unknown>, unknown])[],
>({
  initialValues,
  children,
}: PropsWithChildren<{
  initialValues: InferAtomTuples<T>;
}>) => (
  <Provider>
    <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
  </Provider>
);
