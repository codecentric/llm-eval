import { TRANSITION_DEFAULTS } from "@heroui/framer-utils";
import { Button } from "@heroui/react";
import { ChevronIcon } from "@heroui/shared-icons";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import React from "react";

export type ExpandTableRowButtonProps = {
  expanded?: boolean;
  onPress?: () => void;
};

export const ExpandTableRowButton: React.FC<ExpandTableRowButtonProps> = ({
  expanded,
  onPress,
}) => {
  const t = useTranslations();

  return (
    <Button
      isIconOnly
      variant="light"
      size="sm"
      onPress={onPress}
      aria-label={
        expanded
          ? t("ExpandTableRowButton.ariaLabel.collapse")
          : t("ExpandTableRowButton.ariaLabel.expand")
      }
    >
      <motion.div
        initial={{ rotate: 180 }}
        animate={{ rotate: expanded ? 270 : 180 }}
        transition={TRANSITION_DEFAULTS}
      >
        <ChevronIcon />
      </motion.div>
    </Button>
  );
};
