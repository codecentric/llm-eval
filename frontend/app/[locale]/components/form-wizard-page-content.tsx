import { Button, Card, CardBody, CardFooter } from "@heroui/react";
import { cx } from "classix";
import { useTranslations } from "next-intl";
import { PropsWithChildren } from "react";

export type FormWizardPageContentProps = PropsWithChildren<{
  onBack?: () => void;
  onCancel?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  modified?: boolean;
  loading?: boolean;
}>;

export const FormWizardPageContent = ({
  onBack,
  onCancel,
  onNext,
  onSubmit,
  submitLabel,
  children,
  loading,
}: FormWizardPageContentProps) => {
  const t = useTranslations();
  return (
    <Card>
      <CardBody className="grid grid-cols-2 gap-4">{children}</CardBody>
      <CardFooter className="flex gap-4">
        {onCancel && (
          <Button
            onPress={onCancel}
            isDisabled={loading}
            variant="flat"
            color="danger"
          >
            {t("FormWizardPage.button.cancel")}
          </Button>
        )}
        <div className="flex-1" />
        <div className="flex gap-4">
          {onBack && (
            <Button onPress={onBack} isDisabled={loading}>
              {t("FormWizardPage.button.back")}
            </Button>
          )}

          {onNext && (
            <Button
              onPress={onNext}
              isDisabled={loading}
              color={onSubmit ? "default" : "primary"}
            >
              {t("FormWizardPage.button.next")}
            </Button>
          )}

          {onSubmit && (
            <Button
              onPress={onSubmit}
              isLoading={loading}
              color="primary"
              className={cx(!!(onSubmit || onNext) && "ml-4")}
            >
              {submitLabel || t("FormWizardPage.button.submit")}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
