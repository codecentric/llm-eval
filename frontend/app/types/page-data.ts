export enum PageDataType {
  DATA = "data",
  ERROR = "error",
}

export type PageData<T> =
  | { type: PageDataType.DATA; data: T }
  | { type: PageDataType.ERROR; error?: unknown };
