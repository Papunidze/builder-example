import type { CSSProperties } from "react";

interface BaseControl {
  label: string;
  defaultValue: any;
}

interface SelectControl extends BaseControl {
  type: "select";
  options: string[] | number[] | boolean[];
  defaultValue: string;
}

interface TextControl extends BaseControl {
  type: "text";
  defaultValue: string;
}

export type ControlDefinition = SelectControl | TextControl;

export type Settings<T extends ReadonlyArray<keyof CSSProperties>> = {
  allowedStyles: T;
  defaultStyles: { [K in T[number]]: string };
  javascript?: {
    controls?: {
      [key: string]: ControlDefinition;
    };
  };
};
