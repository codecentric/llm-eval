import { screen, within } from "@testing-library/react";

export const expectValue = async (label: string, value: string) => {
  const labelElement = await screen.findByText(label);

  expect(
    // eslint-disable-next-line testing-library/no-node-access
    within(labelElement.parentElement!).getByText(value),
  ).toBeInTheDocument();
};
