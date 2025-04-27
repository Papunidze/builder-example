import React from "react";
import styles from "./rules.module.scss";

export interface RulesProps {
  message?: string;
}

export const Rules: React.FC<RulesProps> = ({
  message = "Hello from Rules",
}) => {
  return <div className={styles.rules}>{message}</div>;
};

export default Rules;
