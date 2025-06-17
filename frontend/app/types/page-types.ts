export type PropsWithParams<Params, Props = unknown> = Props & {
  params: Promise<Params>;
};

export type PropsWithSearchParams<Params, Props = unknown> = Props & {
  searchParams: Promise<Params>;
};

export type PropsWithLocale<Props = unknown> = Props &
  (Props extends {
    params: Promise<infer T>;
  }
    ? { params: Promise<T & { locale: string }> }
    : { params: Promise<{ locale: string }> });
