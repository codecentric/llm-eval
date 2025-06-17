import { useTranslations } from "next-intl";
import { ReactElement, useCallback } from "react";
import { MdDelete, MdEdit } from "react-icons/md";

import { PageAction } from "@/app/[locale]/(authenticated)/components/page-action";
import { PageContent } from "@/app/[locale]/(authenticated)/components/page-content";
import { PageInfo } from "@/app/[locale]/(authenticated)/page-info";
import { ErrorDisplay } from "@/app/[locale]/components/error-display";
import { PageData, PageDataType } from "@/app/types/page-data";

export type PageActionHandlerFunction<Data> = (
  data: Data,
) => Promise<void> | void;

export type PageActionHandler<Data> = PageActionHandlerFunction<Data> | string;

function isHandlerFunction<Data>(
  handler?: PageActionHandler<Data>,
): handler is PageActionHandlerFunction<Data> {
  return typeof handler === "function";
}

const actionHandler = <Data,>(
  handler: PageActionHandler<Data> | undefined,
  actionTrigger: (
    handlerFunction: PageActionHandlerFunction<Data>,
  ) => () => Promise<void> | void,
) => (isHandlerFunction(handler) ? actionTrigger(handler) : undefined);

const actionLink = <Data,>(handler: PageActionHandler<Data> | undefined) =>
  typeof handler === "string" ? handler : undefined;

export type DetailsPageProps<Data> = {
  pageData: PageData<Data>;
  pageInfo: PageInfo;
  children: (data: Data) => ReactElement;
  onDelete?: PageActionHandler<Data>;
  onEdit?: PageActionHandler<Data>;
};

export const DetailsPage = <Data,>({
  pageData,
  pageInfo,
  onDelete,
  onEdit,
  children,
}: DetailsPageProps<Data>) => {
  const t = useTranslations();
  const actionTrigger = useCallback(
    (handlerFunction: PageActionHandlerFunction<Data>) => async () => {
      if (pageData.type === PageDataType.DATA) {
        await handlerFunction(pageData.data);
      }
    },
    [pageData],
  );

  return (
    <PageContent
      pageInfo={pageInfo}
      actions={[
        onEdit ? (
          <PageAction
            key="edit"
            icon={MdEdit}
            isDisabled={pageData.type !== PageDataType.DATA}
            onPress={actionHandler(onEdit, actionTrigger)}
            href={actionLink(onEdit)}
            asLink={!!actionLink(onEdit)}
            text={t("DetailsPage.edit")}
          />
        ) : null,
        onDelete ? (
          <PageAction
            key="delete"
            color="danger"
            icon={MdDelete}
            isDisabled={pageData.type !== PageDataType.DATA}
            onPress={actionHandler(onDelete, actionTrigger)}
            href={actionLink(onDelete)}
            asLink={!!actionLink(onEdit)}
            text={t("DetailsPage.delete")}
          />
        ) : null,
      ]}
    >
      {pageData.type === PageDataType.ERROR ? (
        <ErrorDisplay
          message={t("page.genericDataLoadError")}
          error={pageData.error}
        />
      ) : (
        children(pageData.data)
      )}
    </PageContent>
  );
};
