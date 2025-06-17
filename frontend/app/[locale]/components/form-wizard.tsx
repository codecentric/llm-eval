import { Card, Tab, Tabs } from "@heroui/react";
import { useTranslations } from "next-intl";
import { Key, ReactNode, useCallback, useState } from "react";
import { Control, DefaultValues } from "react-hook-form";
import { z } from "zod";

import {
  FormWizardPage,
  PageStateGetter,
} from "@/app/[locale]/components/form-wizard-page";
import { useConfirmDialog } from "@/app/[locale]/hooks/use-confirm-dialog";

export type SubmitData<Schemas extends Record<string, z.Schema>> = {
  [P in keyof Schemas]: z.output<Schemas[P]>;
};

export type State<Schemas extends Record<string, z.Schema>> = Partial<
  SubmitData<Schemas>
>;

type PageKey<Schemas extends Record<string, z.Schema>> = keyof Schemas;

type RenderProps<
  Schemas extends Record<string, z.Schema>,
  Key extends PageKey<Schemas>,
> = {
  control: Control<z.input<Schemas[Key]>>;
  state: State<Schemas>;
  loading?: boolean;
};

type StateChangeProps<Schemas extends Record<string, z.Schema>> = {
  state: State<Schemas>;
  clearPageState: (key: PageKey<Schemas>) => void;
};

type Page<
  Schemas extends Record<string, z.Schema>,
  Key extends PageKey<Schemas>,
> = {
  key: Key;
  name: string;
  render: (props: RenderProps<Schemas, Key>) => ReactNode;
  defaultValues: (
    state: State<Schemas>,
  ) => DefaultValues<z.input<Schemas[Key]>>;
  onStateChange?: (props: StateChangeProps<Schemas>) => void;
};

type Pages<Schemas extends Record<string, z.Schema>> = {
  [Key in PageKey<Schemas>]: Page<Schemas, Key>;
}[PageKey<Schemas>][];

export type FormWizardProps<Schemas extends Record<string, z.Schema>> = {
  schemas: Schemas;
  pages: Pages<Schemas>;
  submitLabel?: string;
  onSubmit?: (data: SubmitData<Schemas>) => void;
  loading?: boolean;
  initialState?: State<Schemas>;
  onCancel?: () => void;
  className?: string;
  globalSubmit?: boolean;
};

export const FormWizard = <Schemas extends Record<string, z.Schema>>({
  schemas,
  pages,
  submitLabel,
  onSubmit,
  loading,
  initialState,
  onCancel,
  className,
  globalSubmit,
}: FormWizardProps<Schemas>) => {
  const t = useTranslations();

  const [currentPage, setCurrentPage] = useState<string>("0");
  const [state, setState] = useState<State<Schemas>>(initialState ?? {});
  const [pageStateGetters] = useState<
    Record<number, PageStateGetter | undefined>
  >({});
  const { showConfirmDialog } = useConfirmDialog();

  const updateState = useCallback(
    (state: State<Schemas>, page: number): State<Schemas> => {
      const newState = { state };

      const clearPageState = (key: PageKey<Schemas>) => {
        newState.state = {
          ...newState.state,
          [key]: undefined,
        };
      };

      pages[page].onStateChange?.({ state, clearPageState });

      setState(newState.state);

      return newState.state;
    },
    [setState, pages],
  );

  const setPageStateGetter = useCallback(
    (page: number) => (getter?: PageStateGetter) => {
      pageStateGetters[page] = getter;
    },
    [pageStateGetters],
  );

  const gotoPage = useCallback(
    (page: number) => {
      setCurrentPage(page.toString());
    },
    [setCurrentPage],
  );

  const submit = useCallback(
    (submitState: State<Schemas>) => {
      onSubmit?.(submitState as SubmitData<Schemas>);
    },
    [onSubmit],
  );

  const navigate = useCallback(
    (from: number, to: number, dirty: boolean, data?: unknown) => {
      if (data) {
        updateState({ ...state, [pages[from].key]: data }, from);

        gotoPage(to);
      } else if (dirty) {
        showConfirmDialog({
          header: t("FormWizard.discardDialog.header"),
          description: t("FormWizard.discardDialog.description"),
          okButtonLabel: t("FormWizard.discardDialog.discardButton"),
          okButtonColor: "danger",
          onCancel: () => {
            gotoPage(from);
          },
          onOk: () => {
            gotoPage(to);
          },
        });
      } else {
        gotoPage(to);
      }
    },
    [t, showConfirmDialog, updateState, state, gotoPage, pages],
  );

  const maybePrevious = useCallback(
    (page: number) =>
      (dirty: boolean, data?: State<Schemas>[PageKey<Schemas>]) => {
        navigate(page, page - 1, dirty, data);
      },
    [navigate],
  );

  const next = useCallback(
    (page: number, key: keyof Schemas) =>
      (data: State<Schemas>[typeof key], forceSubmit?: boolean) => {
        const newState = updateState({ ...state, [key]: data }, page);

        if (!forceSubmit && page < pages.length - 1) {
          gotoPage(page + 1);
        } else {
          // noinspection JSIgnoredPromiseFromCall
          submit(newState);
        }
      },
    [updateState, state, gotoPage, submit, pages],
  );

  const tabEnabled = useCallback(
    (index: number) => {
      for (let i = 0; i < index; i++) {
        if (!state[pages[i].key]) {
          return false;
        }
      }

      return true;
    },
    [state, pages],
  );

  const tabSelectionChanged = useCallback(
    (key: Key) => {
      if (key !== currentPage) {
        const from = parseInt(currentPage, 10);
        const to = parseInt(key as string, 10);

        const { dirty, data } = pageStateGetters[from]?.() ?? {};

        navigate(from, to, dirty ?? false, data);
      }
    },
    [currentPage, navigate, pageStateGetters],
  );

  const renderPage = useCallback(
    ({ key, render, defaultValues }: Pages<Schemas>[number], index: number) => (
      <FormWizardPage
        schemas={schemas}
        schemaKey={key}
        state={state[key]}
        defaultValues={defaultValues(state)}
        firstPage={index === 0}
        lastPage={index === pages.length - 1}
        submitLabel={submitLabel}
        previous={maybePrevious(index)}
        next={next(index, key)}
        registerPageStateGetter={setPageStateGetter(index)}
        loading={loading}
        onCancel={onCancel}
        globalSubmit={globalSubmit}
      >
        {(control) => render({ control, state, loading })}
      </FormWizardPage>
    ),
    [
      globalSubmit,
      loading,
      maybePrevious,
      next,
      onCancel,
      pages.length,
      schemas,
      setPageStateGetter,
      state,
      submitLabel,
    ],
  );

  return pages.length === 1 ? (
    <Card className="w-full max-w-3xl">{renderPage(pages[0], 0)}</Card>
  ) : (
    <Tabs
      placement="start"
      variant="bordered"
      color="secondary"
      classNames={{
        panel: "pr-0",
        tab: "justify-start",
        tabWrapper: className,
        base: ["sticky", "top-0", "self-start"],
      }}
      selectedKey={currentPage}
      onSelectionChange={tabSelectionChanged}
      isDisabled={loading}
    >
      {pages.map((page, index) => (
        <Tab
          key={index.toString()}
          title={`${index + 1}. ${page.name}`}
          className="w-full max-w-3xl"
          isDisabled={!tabEnabled(index)}
        >
          {renderPage(page, index)}
        </Tab>
      ))}
    </Tabs>
  );
};
