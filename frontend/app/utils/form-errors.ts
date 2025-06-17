export const formErrors = {
  required: "formError.required",
  int: "formError.int",
  nan: "formError.nan",
  min: (min: number) => `formError.min|{"min":${min}}`,
  arrayMin: (min: number) => `formError.arrayMin|{"min":${min}}`,
  selectMin: (min: number) => `formError.selectMin|{"min":${min}}`,
};
