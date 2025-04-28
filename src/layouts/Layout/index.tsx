import React, { useState, CSSProperties, Suspense, lazy } from "react";
import styles from "./Layout.module.scss";
import { LeftBar } from "../LeftBar";
import { RightBar } from "../RightBar";
import { v4 as uuidv4 } from "uuid";
import { COMPONENT_MANIFEST } from "../../utils/elementManifest";

interface ElementInstance {
  id: string;
  type: string;
  styles: CSSProperties;
  jsSettings?: { [key: string]: any };
}

const elementComponentMap: { [key: string]: React.LazyExoticComponent<any> } =
  COMPONENT_MANIFEST.reduce((acc, element) => {
    acc[element.name] = lazy(() => import(`../../elements/${element.name}`));
    return acc;
  }, {} as { [key: string]: React.LazyExoticComponent<any> });

export const Layout: React.FC = () => {
  const [addedElements, setAddedElements] = useState<ElementInstance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(
    null
  );

  const handleAddElement = async (elementType: string) => {
    let defaultStyles: CSSProperties = {};
    let initialJsSettings: { [key: string]: any } = {};
    try {
      const settingsModule = await import(
        `../../elements/${elementType}/settings.ts`
      );
      defaultStyles = settingsModule.settings.defaultStyles || {};

      const jsControls = settingsModule.settings.javascript?.controls;
      if (jsControls) {
        initialJsSettings = {};
        for (const key in jsControls) {
          if (Object.prototype.hasOwnProperty.call(jsControls, key)) {
            const control = jsControls[key];
            initialJsSettings[key] = control.defaultValue;
          }
        }
      }
    } catch (error) {
      console.error(`Error loading settings for ${elementType}:`, error);
    }

    const newInstance: ElementInstance = {
      id: uuidv4(),
      type: elementType,
      styles: defaultStyles,
      jsSettings: initialJsSettings,
    };
    setAddedElements((prevElements) => [...prevElements, newInstance]);
  };

  const handleInstanceSelect = (instanceId: string) => {
    setSelectedInstanceId(instanceId);
  };

  const handleStyleChange = (
    instanceId: string,
    newStyles: Partial<CSSProperties>
  ) => {
    setAddedElements((prevElements) =>
      prevElements.map((el) =>
        el.id === instanceId
          ? { ...el, styles: { ...el.styles, ...newStyles } }
          : el
      )
    );
  };

  const handleJsSettingChange = (
    instanceId: string,
    newJsSettings: { [key: string]: any }
  ) => {
    setAddedElements((prevElements) =>
      prevElements.map((el) =>
        el.id === instanceId
          ? { ...el, jsSettings: { ...el.jsSettings, ...newJsSettings } }
          : el
      )
    );
  };

  const selectedElement =
    addedElements.find((el) => el.id === selectedInstanceId) || null;

  return (
    <div className={styles.layoutContainer}>
      <LeftBar onElementAdd={handleAddElement} />
      <main className={styles.mainContent}>
        {addedElements.length === 0 &&
          "Click an element on the left to add it."}
        {addedElements.map((element) => {
          const Component = elementComponentMap[element.type];
          if (!Component) {
            return (
              <div key={element.id} style={{ color: "red" }}>
                Error: Component type '{element.type}' not found.
              </div>
            );
          }
          return (
            <div
              key={element.id}
              onClick={() => handleInstanceSelect(element.id)}
              style={{
                ...element.styles,
                border:
                  selectedInstanceId === element.id
                    ? "2px solid blue"
                    : "1px solid grey",
                cursor: "pointer",
              }}
            >
              <Suspense fallback={<div>Loading {element.type}...</div>}>
                {element.jsSettings ? (
                  <Component {...element.jsSettings} />
                ) : (
                  <Component />
                )}
              </Suspense>
            </div>
          );
        })}
      </main>

      <RightBar
        selectedElement={selectedElement}
        onStyleChange={handleStyleChange}
        onJsSettingChange={handleJsSettingChange}
      />
    </div>
  );
};
