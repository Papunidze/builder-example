import React from "react";
import styles from "./dialog.module.scss";

export interface dialogProps {
  message?: string;
  dialogState?: "visible" | "hidden";
  titleText?: string;
  messageText?: string;
}

export const dialog: React.FC<dialogProps> = ({
  message = "Default Message",
  dialogState = "hidden",
  titleText = "Default Title",
  messageText = "Default Message",
}) => {
  if (dialogState !== "visible") {
    return null;
  }

  return (
    <div className={styles.dialog}>
      <h2>{titleText}</h2>
      <p>{message}</p>
      <p>{messageText}</p>
    </div>
  );
};

export default dialog;
