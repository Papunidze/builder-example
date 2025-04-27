import type { CSSProperties } from "react";

export type Settings<T extends ReadonlyArray<keyof CSSProperties>> = {
  allowedStyles: T;
  defaultStyles: { [K in T[number]]: string };
};
