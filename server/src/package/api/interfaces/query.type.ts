import {PaginationRequest} from "@Package/api";

export type QueryValue<T> = Omit<T, keyof PaginationRequest>

export type ExcludeQuery<T> = {
  [K in keyof QueryValue<T>]: T[K]
};
