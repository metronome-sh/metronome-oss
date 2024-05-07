/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

import { type TypedDeferredData } from '@remix-run/node';
import { JsonifyObject } from 'type-fest/source/jsonify';

type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type UnwrapPromiseObject<T> = {
  [K in keyof T]: UnwrapPromise<T[K]>;
};

declare global {
  type UnwrapDeferred<LoaderFunction> = LoaderFunction extends (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<TypedDeferredData<infer U>>
    ? UnwrapPromiseObject<U>
    : never;

  type UnwrapJsonifyObject<T> = T extends JsonifyObject<infer U>[] ? U[] : never;
}
