import { ZonedDateTime } from "@internationalized/date";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";

import type { UserEvent } from "@testing-library/user-event";

export const selectFromDropDown = async (
  user: UserEvent,
  label: string,
  value: string,
) => {
  // Dropdown has a select and button with the label. We find the button here to click it.
  const button = await screen
    .findAllByLabelText(label)
    .then((element) => element.find((el) => el.tagName === "BUTTON"));

  await user.click(button!);

  const selectDialog = await screen.findByRole("dialog");

  // The items are rendered in a dialog, so we need to find the dialog and click the item.
  await user.click(await within(selectDialog).findByText(value));

  await waitFor(() => {
    expect(selectDialog).not.toBeInTheDocument();
  });
};

export const selectFromMultiSelectDropDown = async (
  user: UserEvent,
  label: string,
  ...values: string[]
) => {
  // Dropdown has a select and button with the label. We find the button here to click it.
  const button = await screen
    .findAllByLabelText(label)
    .then((element) => element.find((el) => el.tagName === "BUTTON"));

  // open the select dialog
  await user.click(button!);

  // The items are rendered in a dialog, so we need to find the dialog.
  const selectDialog = await screen.findByRole("dialog");

  for (const value of values) {
    await user.click(await within(selectDialog).findByText(value));
  }

  // close the dialog
  await user.click(button!);

  await waitFor(() => {
    expect(selectDialog).not.toBeInTheDocument();
  });
};

export const getDropDownBase = async (label: string) => {
  // Dropdown has a select and button with the label. We find the button here to click it.
  const button = await screen
    .findAllByLabelText(label)
    .then((element) => element.find((el) => el.tagName === "BUTTON"));

  return button!.parentElement!.parentElement!;
};

export const selectFromComboBox = async (
  user: UserEvent,
  label: string,
  value: string,
) => {
  await waitFor(async () => {
    const input = await screen.findByLabelText(label);

    await user.click(input);

    const selectDialog = await screen.findByRole("dialog");

    // The items are rendered in a dialog, so we need to find the dialog and click the item.
    const dialogItem = await within(selectDialog).findByText(value);

    await user.click(dialogItem);

    expect(input).toHaveValue(value);

    await waitFor(() => {
      expect(selectDialog).not.toBeInTheDocument();
    });
  });
};

export const clearComboBox = async (user: UserEvent, label: string) => {
  const wrapper = (await screen.findByText(label)).parentElement!;

  // Clear button is the first button.
  const clearButton = (
    await within(wrapper).findAllByRole("button", {
      hidden: true,
    })
  )[0];

  expect(clearButton).toBeInTheDocument();

  await user.click(clearButton);
  await user.keyboard("{Escape}"); // Dialog opens after clear -> close it
};

export const getComboBoxBase = async (label: string) => {
  const input = await screen.findByText(label);

  return input.parentElement!.parentElement!.parentElement!;
};

export const selectFromCheckboxGroup = async (
  user: UserEvent,
  label: string,
  ...checkboxes: string[]
) => {
  const labelElement = await screen.findByText(label);

  const wrapper = labelElement.parentElement!;

  for (const checkbox of checkboxes) {
    const checkboxElement = await within(wrapper).findByRole("checkbox", {
      name: checkbox,
      hidden: true,
    });

    await user.click(checkboxElement);
  }
};

export const setInputValue = async (
  user: UserEvent,
  label: string,
  value: string,
) => {
  const input = await screen.findByLabelText(label);

  await user.clear(input);

  if (value) {
    await user.type(input, value);
  }

  expect(input).toHaveValue(value);
};

export const getInputBase = async (label: string) => {
  const input = await screen.findByLabelText(label);

  return input.parentElement!.parentElement!.parentElement!;
};

export const toggleSwitch = async (user: UserEvent, label: string) => {
  const input = await screen.findByLabelText(label);

  await user.click(input);
};

export const formWizardClickNext = async (user: UserEvent) => {
  await user.click(
    await screen.findByRole("button", { name: "FormWizardPage.button.next" }),
  );
};

export const formWizardClickBack = async (user: UserEvent) => {
  await user.click(
    await screen.findByRole("button", { name: "FormWizardPage.button.back" }),
  );
};

export const formWizardClickCancel = async (user: UserEvent) => {
  await user.click(
    await screen.findByRole("button", { name: "FormWizardPage.button.cancel" }),
  );
};

export const formStringArrayRemoveItem = async (
  user: UserEvent,
  label: string,
  index: number,
  count: number = 1,
) => {
  const wrapper = (await screen.findByText(label)).parentElement!
    .parentElement!;

  for (let i = 0; i < count; i++) {
    const removeButtons = within(wrapper).getAllByTestId("remove-button");

    await user.click(removeButtons[index]);
  }
};

export const formStringArrayAddItem = async (
  user: UserEvent,
  label: string,
  ...values: string[]
) => {
  const wrapper = (await screen.findByText(label)).parentElement!
    .parentElement!;

  const addButton = within(wrapper).getByTestId("add-button");

  for (const value of values) {
    await user.click(addButton);

    const textBoxes = within(wrapper).getAllByRole("textbox");

    await user.clear(textBoxes[textBoxes.length - 1]);
    await user.type(textBoxes[textBoxes.length - 1], value);
  }
};

export const getStringArrayBase = async (label: string) => {
  const element = await screen.findByText(label);

  return element.parentElement!.parentElement!.parentElement!;
};

export type MockFileList = {
  length: number;
  item: (i: number) => File;
};

export const createFiles = (filenames: string[]): File[] =>
  filenames.map((name) => {
    const content = `content of ${name}`;
    return new File([content], name, { type: "application/octet-stream" });
  });

export const createMockFileList = (files: File[]): MockFileList => {
  const fileList: MockFileList = {
    length: files.length,
    item: (i: number): File => files[i],
  };

  return fileList;
};

export const uploadFiles = async (
  label: string,
  files: MockFileList | null,
) => {
  const input = await screen.findByLabelText(label);

  fireEvent.change(input, { target: { files: files } });
};

export const expectInputError = async (label: string, errorText: string) => {
  await waitFor(async () =>
    expect(
      await within(await getInputBase(label)).findByText(errorText),
    ).toBeInTheDocument(),
  );
};

export const expectComboBoxError = async (label: string, errorText: string) => {
  await waitFor(async () =>
    expect(
      await within(await getComboBoxBase(label)).findByText(errorText),
    ).toBeInTheDocument(),
  );
};

export const expectDropDownError = async (label: string, errorText: string) => {
  await waitFor(async () =>
    expect(
      await within(await getDropDownBase(label)).findByText(errorText),
    ).toBeInTheDocument(),
  );
};

export const expectStringArrayError = async (
  label: string,
  errorText: string,
) => {
  await waitFor(async () =>
    expect(
      await within(await getStringArrayBase(label)).findByText(errorText),
    ).toBeInTheDocument(),
  );
};

export const expectInputValue = async (label: string, value: string) => {
  expect(await screen.findByLabelText(label)).toHaveValue(value);
};

export const expectCheckboxValue = async (label: string, checked: boolean) => {
  if (checked) {
    expect(await screen.findByLabelText(label)).toBeChecked();
  } else {
    expect(await screen.findByLabelText(label)).not.toBeChecked();
  }
};

export const expectComboBoxValue = async (label: string, value: string) => {
  expect(
    within(await getComboBoxBase(label)).getByRole("combobox"),
  ).toHaveValue(value);
};

export const expectStringArrayValue = async (label: string, value: string) => {
  expect(await getStringArrayBase(label)).toHaveTextContent(value);
};

export const expectDropDownValue = async (label: string, value: string) => {
  expect(
    within(await getDropDownBase(label)).getByRole("button"),
  ).toHaveTextContent(value);
};

export const setDatePickerValue = async (
  user: UserEvent,
  label: string,
  value: ZonedDateTime,
) => {
  await user.click(
    await screen.findByRole("spinbutton", { name: `month, ${label}` }),
  );

  const month = value.month.toString().padStart(2, "0");
  const day = value.day.toString().padStart(2, "0");
  const year = value.year.toString().padStart(4, "0");
  const hour = (value.hour > 12 ? value.hour - 12 : value.hour)
    .toString()
    .padStart(2, "0");
  const minute = value.minute.toString().padStart(2, "0");
  const second = value.second.toString().padStart(2, "0");

  const amPm = value.hour >= 12 ? "{Up}" : "";

  await user.keyboard(`${month}${day}${year}${hour}${minute}${second}${amPm}`);
};
