import { Code, Divider } from "@heroui/react";
import React from "react";

import { NavigationLink } from "./app/components/navigation-link";

import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ children, href }: React.JSX.IntrinsicElements["a"]) =>
      href ? <NavigationLink href={href}>{children}</NavigationLink> : null,
    code: ({ children }: React.JSX.IntrinsicElements["code"]) => (
      <Code color="default">{children}</Code>
    ),
    pre: ({ children }: React.JSX.IntrinsicElements["pre"]) => (
      <pre className="bg-default/40 rounded-small">{children}</pre>
    ),
    hr: () => <Divider className="my-4" />,
    ...components,
  };
}
