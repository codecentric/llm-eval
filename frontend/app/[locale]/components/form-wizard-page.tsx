import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useCallback, useEffect } from "react";
import { Control, DefaultValues, useForm } from "react-hook-form";
import { z } from "zod";

import { FormWizardPageContent } from "@/app/[locale]/components/form-wizard-page-content";

export type PageStateGetter = () => { dirty?: boolean; data?: unknown };

export type FormWizardPageProps<
  Schemas extends Record<string, z.Schema>,
  Key extends keyof Schemas,
> = {
  schemaKey: Key;
  schemas: Schemas;
  state: z.output<Schemas[Key]> | undefined;
  defaultValues: DefaultValues<z.input<Schemas[Key]>>;
  children: (control: Control<z.input<Schemas[Key]>>) => ReactNode;
  firstPage?: boolean;
  lastPage?: boolean;
  submitLabel?: string;
  previous: (dirty: boolean, data?: z.output<Schemas[Key]>) => void;
  next: (data: z.output<Schemas[Key]>, forceSubmit?: boolean) => void;
  registerPageStateGetter?: (getter?: PageStateGetter) => void;
  loading?: boolean;
  onCancel?: () => void;
  globalSubmit?: boolean;
};

export const FormWizardPage = <
  Schemas extends Record<string, z.Schema>,
  Key extends keyof Schemas,
>({
  schemas,
  schemaKey,
  children,
  defaultValues,
  state,
  firstPage,
  lastPage,
  submitLabel,
  previous,
  next,
  registerPageStateGetter,
  loading,
  onCancel,
  globalSubmit,
}: FormWizardPageProps<Schemas, Key>) => {
  const {
    control,
    handleSubmit,
    getValues,
    formState: { isDirty, isValid },
  } = useForm<z.input<Schemas[Key]>, unknown, z.output<Schemas[Key]>>({
    defaultValues: {
      ...defaultValues,
      ...state,
    },
    resolver: zodResolver(schemas[schemaKey]),
    disabled: loading,
  });

  useEffect(() => {
    registerPageStateGetter?.(() => ({
      dirty: isDirty,
      data: isValid ? schemas[schemaKey].parse(getValues()) : undefined,
    }));

    return () => {
      registerPageStateGetter?.();
    };
  }, [
    registerPageStateGetter,
    isDirty,
    getValues,
    isValid,
    schemas,
    schemaKey,
  ]);

  const goBack = useCallback(() => {
    previous(
      isDirty,
      isValid ? schemas[schemaKey].parse(getValues()) : undefined,
    );
  }, [isDirty, isValid, getValues, schemas, schemaKey, previous]);

  const onSubmit = useCallback(
    (data: z.output<Schemas[Key]>) => {
      next(schemas[schemaKey].parse(data), true);
    },
    [next, schemaKey, schemas],
  );

  const onNext = useCallback(
    (data: z.output<Schemas[Key]>) => {
      next(schemas[schemaKey].parse(data));
    },
    [next, schemaKey, schemas],
  );

  return (
    <form
      onSubmit={
        lastPage || globalSubmit
          ? handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])
          : handleSubmit(onNext as Parameters<typeof handleSubmit>[0])
      }
      noValidate
    >
      <FormWizardPageContent
        onSubmit={
          globalSubmit || lastPage
            ? handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])
            : undefined
        }
        onNext={
          lastPage
            ? undefined
            : handleSubmit(onNext as Parameters<typeof handleSubmit>[0])
        }
        submitLabel={submitLabel}
        onBack={firstPage ? undefined : goBack}
        onCancel={onCancel}
        loading={loading}
      >
        {children(control)}
      </FormWizardPageContent>
      <input type="submit" className="hidden" />
    </form>
  );
};
