import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Tooltip,
} from "@heroui/react";
import { cx } from "classix";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";
import React from "react";
import { MdClose, MdHelpOutline } from "react-icons/md";

import { showContextHelpAtom } from "@/app/state/context-help";

export type ContextHelpProps = {
  className?: string;
};

export const ContextHelp: React.FC<
  React.PropsWithChildren<ContextHelpProps>
> = ({ className, children }) => {
  const t = useTranslations();

  const [, setShowContextHelp] = useAtom(showContextHelpAtom);

  return (
    <Card className={cx("bg-content3", className)}>
      <CardHeader>
        <div className="grow">
          <div className="flex items-center gap-1">
            <MdHelpOutline size={32} />
            <p className="text-2xl">{t("ContextHelp.title")}</p>
          </div>
          <Tooltip content={t("ContextHelp.closeButton.tooltip")}>
            <Button
              className="absolute top-1 right-1"
              isIconOnly
              variant="light"
              radius="full"
              size="sm"
              onPress={() => setShowContextHelp(false)}
            >
              <MdClose size={20} />
            </Button>
          </Tooltip>
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className="prose">{children}</div>
      </CardBody>
    </Card>
  );
};
