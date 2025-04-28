import React, { CSSProperties, useEffect, useState } from "react";
import styles from "./RightBar.module.scss";
import type { ControlDefinition } from "../../interfaces/settings.interfaces";

interface ElementInstance {
  id: string;
  type: string;
  styles: CSSProperties;
  jsSettings?: { [key: string]: any };
}

export interface RightBarProps {
  selectedElement: ElementInstance | null;
  onStyleChange: (
    instanceId: string,
    newStyles: Partial<CSSProperties>
  ) => void;
  onJsSettingChange: (
    instanceId: string,
    newJsSettings: { [key: string]: any }
  ) => void;
}

export const RightBar: React.FC<RightBarProps> = ({
  selectedElement,
  onStyleChange,
  onJsSettingChange,
}) => {
  const [allowedStyles, setAllowedStyles] = useState<
    ReadonlyArray<keyof CSSProperties>
  >([]);
  const [elementJsControls, setElementJsControls] = useState<{
    [key: string]: ControlDefinition;
  } | null>(null);

  useEffect(() => {
    if (selectedElement) {
      setAllowedStyles([]);
      setElementJsControls(null);
      import(`../../elements/${selectedElement.type}/settings.ts`)
        .then((settingsModule) => {
          if (settingsModule && settingsModule.settings) {
            if (settingsModule.settings.allowedStyles) {
              setAllowedStyles(settingsModule.settings.allowedStyles);
            }
            if (settingsModule.settings.javascript?.controls) {
              setElementJsControls(settingsModule.settings.javascript.controls);
            }
          }
        })
        .catch((error) => {
          console.error(
            `Error loading settings for ${selectedElement.type}:`,
            error
          );
          setAllowedStyles([]);
          setElementJsControls(null);
        });
    } else {
      setAllowedStyles([]);
      setElementJsControls(null);
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

  const handleJsSettingChange = (settingKey: string, value: any) => {
    if (selectedElement) {
      onJsSettingChange(selectedElement.id, { [settingKey]: value });
    }
  };

  const renderJsSettingControls = () => {
    if (!selectedElement || !elementJsControls) return null;

    return Object.entries(elementJsControls).map(([key, control]) => {
      const currentValue =
        selectedElement.jsSettings?.[key] ?? control.defaultValue;

      if (control.type === "select") {
        return (
          <div key={key} className={styles.settingItem}>
            <label htmlFor={`js-control-${key}`}>{control.label}</label>
            <select
              id={`js-control-${key}`}
              value={currentValue}
              onChange={(e) => handleJsSettingChange(key, e.target.value)}
            >
              {control.options.map((option: string | number | boolean) => (
                <option key={String(option)} value={String(option)}>
                  {String(option)}
                </option>
              ))}
            </select>
          </div>
        );
      } else if (control.type === "text") {
        return (
          <div key={key} className={styles.settingItem}>
            <label htmlFor={`js-control-${key}`}>{control.label}</label>
            <input
              type="text"
              id={`js-control-${key}`}
              value={currentValue}
              onChange={(e) => handleJsSettingChange(key, e.target.value)}
            />
          </div>
        );
      } else {
        console.warn(`Unsupported JS control type encountered: ${key}`);
        return null;
      }
    });
  };

  return (
    <aside className={styles.rightBar}>
      {selectedElement ? (
        <>
          <div className={styles.settingsGroup}>
            <h3>CSS Settings: {selectedElement.type}</h3>
            <p>ID: {selectedElement.id.substring(0, 4)}</p>
            {allowedStyles.length > 0 ? (
              allowedStyles.map(renderInputForStyle)
            ) : (
              <p>No CSS settings available.</p>
            )}
          </div>

          {elementJsControls && Object.keys(elementJsControls).length > 0 && (
            <div className={styles.settingsGroup}>
              <h3>JS Settings: {selectedElement.type}</h3>
              {renderJsSettingControls()}
            </div>
          )}

          {!elementJsControls && !allowedStyles.length && (
            <p>Loading settings...</p>
          )}
        </>
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
