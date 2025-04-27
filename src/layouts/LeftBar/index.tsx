import React from "react";
import styles from "./LeftBar.module.scss";
import { COMPONENT_MANIFEST } from "../../utils/elementManifest";

export interface LeftBarProps {
  onElementAdd: (elementName: string) => void;
}

export const LeftBar: React.FC<LeftBarProps> = ({ onElementAdd }) => {
  const elementNames = COMPONENT_MANIFEST.map((element) => element.name);

  return (
    <aside className={styles.leftBar}>
      <h2>Elements</h2>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {elementNames.map((name) => (
          <li
            key={name}
            onClick={() => onElementAdd(name)}
            className={styles.elementItem}
          >
            {name}
          </li>
        ))}
      </ul>
    </aside>
  );
};
