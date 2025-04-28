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
  "fontWeight",
] as const;

export const settings: Settings<typeof elementSpecificStyles> = {
  allowedStyles: elementSpecificStyles,
  defaultStyles: {
    color: "#333333",
    backgroundColor: "#f8f8f8",
    fontSize: "1rem",
    margin: "1rem 0",
    padding: "0.5rem",
    borderRadius: "4px",
    width: "100%",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    fontWeight: "500",
  },
  javascript: {
    controls: {
      isOpen: {
        type: "select",
        label: "Is Open",
        options: ["true", "false"],
        defaultValue: "false",
      },
    },
  },
};

export default settings;
