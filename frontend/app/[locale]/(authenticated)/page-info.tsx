import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JSX } from "react";
import { MdHome } from "react-icons/md";

export type PageInfo = {
  key: string;
  name: string;
  shortName?: string;
  nameArgs?: Record<string, string>;
  href: string;
  parent?: PageInfo;
  icon?: JSX.Element;
  rawName?: boolean;
};

type PageInfoBuilder<Args extends unknown[]> = (...args: Args) => PageInfo;

type ArgumentBuilder<Args extends unknown[], Props> = (
  props: Props,
) => Promise<Args>;

export function pageMetadata(pageInfo: PageInfo): () => Promise<Metadata>;

export function pageMetadata<Args extends unknown[], Props>(
  pageInfoBuilder: PageInfoBuilder<Args>,
  argumentBuilder: ArgumentBuilder<Args, Props>,
): (props: Props) => Promise<Metadata>;

export function pageMetadata<Args extends unknown[], Props>(
  pageInfoOrBuilder: PageInfo | PageInfoBuilder<Args>,
  argumentBuilder?: ArgumentBuilder<Args, Props>,
): (() => Promise<Metadata>) | ((props: Props) => Promise<Metadata>) {
  if (typeof pageInfoOrBuilder === "function") {
    return async (props: Props): Promise<Metadata> => {
      const pageInfo = pageInfoOrBuilder(...(await argumentBuilder!(props)));

      const t = await getTranslations();

      return {
        title: t(pageInfo.name, pageInfo.nameArgs),
      };
    };
  } else {
    return async (): Promise<Metadata> => {
      const t = await getTranslations();

      return {
        title: t(pageInfoOrBuilder.name, pageInfoOrBuilder.nameArgs),
      };
    };
  }
}

export const flattenPageInfo = (pageInfo: PageInfo): PageInfo[] => [
  ...(pageInfo.parent ? flattenPageInfo(pageInfo.parent) : []),
  pageInfo,
];

export const homePage: PageInfo = {
  key: "home",
  name: "HomePage.name",
  href: "/",
  icon: <MdHome />,
};
