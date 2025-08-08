import "@/app/test-utils/mock-intl";
import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import { evaluationsPage } from "@/app/[locale]/(authenticated)/eval/page-info";
import {
  evaluationsGet,
  evaluationsPatch,
  EvaluationStatus,
  LlmEvalEvalEvaluationsModelsEvaluationResult,
} from "@/app/client";
import {
  expectInputError,
  formWizardClickCancel,
  setInputValue,
} from "@/app/test-utils/forms";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";
import { EditOrigin } from "@/app/types/edit-origin";

import Page from "./page";

vi.mock("@/app/client");

describe("Edit Evaluation Page", () => {
  const evaluationId = "123";
  const testEvaluation: LlmEvalEvalEvaluationsModelsEvaluationResult = {
    id: evaluationId,
    name: "Evaluation Name",
    createdAt: "2022-01-01T00:00:00Z",
    version: 1,
    status: EvaluationStatus.SUCCESS,
  };

  beforeEach(() => {
    vi.mocked(evaluationsPatch).mockReset();
    vi.mocked(evaluationsGet).mockReset();
  });

  it("should update the evaluation", async () => {
    const user = userEvent.setup();

    const newName = "New Name";

    mockGet();

    vi.mocked(evaluationsPatch).mockResolvedValue(
      successfulServiceResponse({
        ...testEvaluation,
        name: newName,
        version: 2,
      }),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await setInputValue(
      user,
      "EvaluationEditFormWizard.field.name.label",
      newName,
    );

    await clickSubmitButton(user);

    await waitFor(() =>
      expect(evaluationsPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { name: newName, version: 1 },
          path: { evaluation_id: evaluationId },
        }),
      ),
    );

    expect(addToast).toHaveBeenCalledWith({
      title: `EvaluationEditFormWizard.update.success - {"name":"${newName}"}`,
      color: "success",
    });
    expect(mockRouter.push).toHaveBeenCalledWith(
      evaluationPage({ evaluationId }).href,
    );
  });

  it("should show valiation errors", async () => {
    const user = userEvent.setup();

    mockGet();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await setInputValue(user, "EvaluationEditFormWizard.field.name.label", "");

    await clickSubmitButton(user);

    await expectInputError(
      "EvaluationEditFormWizard.field.name.label",
      "formError.required",
    );
  });

  it.each([
    { origin: EditOrigin.LIST, pageInfo: evaluationsPage },
    { origin: EditOrigin.DETAILS, pageInfo: evaluationPage({ evaluationId }) },
  ])(
    "should return to $pageInfo.key on cancel click if origin is $origin",
    async ({ origin, pageInfo }) => {
      const user = userEvent.setup();

      mockGet();

      const page = await createPage(origin);

      render(page, { wrapper: createPageWrapper() });

      await formWizardClickCancel(user);

      expect(mockRouter.push).toHaveBeenCalledWith(pageInfo.href);
    },
  );

  const createPage = async (origin?: EditOrigin) =>
    Page({
      params: Promise.resolve({ evaluationId }),
      searchParams: Promise.resolve({ origin }),
    });

  const clickSubmitButton = async (user: UserEvent) => {
    await user.click(
      await screen.findByRole("button", {
        name: "EvaluationEditFormWizard.submitLabel",
      }),
    );
  };

  const mockGet = () => {
    vi.mocked(evaluationsGet).mockResolvedValue(
      successfulServiceResponse(testEvaluation),
    );
  };
});
