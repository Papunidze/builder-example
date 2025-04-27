import React, { CSSProperties, useEffect, useState } from "react";
import styles from "./RightBar.module.scss";

interface ElementInstance {
  id: string;
  type: string;
  styles: CSSProperties;
}

export interface RightBarProps {
  selectedElement: ElementInstance | null;
  onStyleChange: (
    instanceId: string,
    newStyles: Partial<CSSProperties>
  ) => void;
}

export const RightBar: React.FC<RightBarProps> = ({
  selectedElement,
  onStyleChange,
}) => {
  const [allowedStyles, setAllowedStyles] = useState<
    ReadonlyArray<keyof CSSProperties>
  >([]);

  useEffect(() => {
    if (selectedElement) {
      setAllowedStyles([]);
      import(`../../elements/${selectedElement.type}/settings.ts`)
        .then((settingsModule) => {
          if (
            settingsModule &&
            settingsModule.settings &&
            settingsModule.settings.allowedStyles
          ) {
            setAllowedStyles(settingsModule.settings.allowedStyles);
          }
        })
        .catch((error) => {
          console.error(
            `Error loading settings for ${selectedElement.type}:`,
            error
          );
          setAllowedStyles([]);
        });
    } else {
      setAllowedStyles([]);
    }
  }, [selectedElement]);

  const renderInputForStyle = (styleKey: keyof CSSProperties) => {
    if (!selectedElement) return null;

    const value = selectedElement.styles[styleKey] || "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onStyleChange(selectedElement.id, { [styleKey]: e.target.value });
    };

    let inputType = "text";
    if (styleKey.toLowerCase().includes("color")) {
      inputType = "color";
    }

    return (
      <div key={styleKey} className={styles.settingItem}>
        <label style={{ textTransform: "capitalize" }}>
          {styleKey.replace(/([A-Z])/g, " $1")}
        </label>
        <input type={inputType} value={value} onChange={handleChange} />
      </div>
    );
  };

  return (
    <aside className={styles.rightBar}>
      {selectedElement ? (
        <div className={styles.settingsGroup}>
          <h3>Settings for: {selectedElement.type}</h3>
          <p>Instance ID: {selectedElement.id.substring(0, 4)}</p>
          {allowedStyles.length > 0 ? (
            allowedStyles.map(renderInputForStyle)
          ) : (
            <p>Loading settings...</p>
          )}
        </div>
      ) : (
        <div className={styles.settingsGroup}>
          <h3>Element Inspector</h3>
          <p>
            Select an element instance in the main area to see its settings.
          </p>
        </div>
      )}
    </aside>
  );
};
