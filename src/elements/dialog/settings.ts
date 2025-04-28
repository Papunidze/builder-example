import type { Settings } from "../../interfaces/settings.interfaces";

const elementSpecificStyles = ["color", "backgroundColor", "fontSize"] as const;

export const settings: Settings<typeof elementSpecificStyles> = {
  allowedStyles: elementSpecificStyles,
  defaultStyles: {
    color: "#000000",
    backgroundColor: "#ffffff",
    fontSize: "1rem",
  },
  javascript: {
    controls: {
      dialogState: {
        label: "Dialog Visibility",
        type: "select",
        options: ["visible", "hidden"],
        defaultValue: "hidden",
      },
      titleText: {
        label: "Dialog Title",
        type: "text",
        defaultValue: "My Dialog",
      },
      messageText: {
        label: "Dialog Message",
        type: "text",
        defaultValue: "This is a dialog message",
      },
    },
  },
};

export default settings;
