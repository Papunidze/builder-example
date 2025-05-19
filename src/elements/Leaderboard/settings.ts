import { CSSProperties } from "react";
import type { Settings } from "../../interfaces/settings.interfaces";

const elementSpecificStyles = [
  "color",
  "backgroundColor",
  "fontSize",
  "margin",
  "padding",
  "borderRadius",
  "width",
  "boxShadow",
  "borderColor",
  "maxHeight",
] as const;

export const settings: Settings<typeof elementSpecificStyles> = {
  allowedStyles: elementSpecificStyles,
  defaultStyles: {
    color: "#333333",
    backgroundColor: "#0F542A",
    fontSize: "0.9rem",
    margin: "1rem 0",
    padding: "0",
    borderRadius: "8px",
    width: "820px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    borderColor: "#e0e0e0",
    maxHeight: "880px",
  },
};

export default settings;
