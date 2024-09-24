import * as R from "rambda";

export function pick<T, K extends keyof T>(obj: T, fields: readonly K[]) {
  return R.pick(fields as unknown as string[], obj) as unknown as Pick<
    T,
    (typeof fields)[number]
  >;
}

export function omit<T, K extends keyof T>(obj: T, fields: readonly K[]) {
  return R.omit(fields as unknown as string[], obj) as unknown as Omit<
    T,
    (typeof fields)[number]
  >;
}
