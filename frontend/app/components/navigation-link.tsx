"use client";

import { Link, LinkProps } from "@heroui/react";

import { Link as NavLink } from "@/i18n/routing";

export type NavigationLinkProps = Omit<LinkProps, "as">;

export const NavigationLink = ({ children, ...props }: NavigationLinkProps) => (
  <Link as={NavLink} {...props}>
    {children}
  </Link>
);
